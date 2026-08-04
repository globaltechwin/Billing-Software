import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCompanyContext, isAdmin } from "@/lib/company-context";
import { getBackupFilePath, deleteBackupFile } from "@/lib/backup/backup-utils";
import { readFileSync, existsSync } from "fs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getCompanyContext();

    if (!(await isAdmin(ctx))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const backupId = parseInt(id, 10);

    if (isNaN(backupId)) {
      return NextResponse.json({ error: "Invalid backup ID" }, { status: 400 });
    }

    const backup = await prisma.backupHistory.findFirst({
      where: { id: backupId, companyId: ctx.companyId },
    });

    if (!backup) {
      return NextResponse.json({ error: "Backup not found" }, { status: 404 });
    }

    if (backup.status !== "COMPLETED") {
      return NextResponse.json({ error: "Backup is not completed" }, { status: 400 });
    }

    const filePath = getBackupFilePath(ctx.companyId, backup.fileName);

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "Backup file not found on disk" }, { status: 404 });
    }

    const fileData = readFileSync(filePath);

    const contentType = backup.fileName.endsWith(".gz")
      ? "application/gzip"
      : backup.fileName.endsWith(".enc")
        ? "application/octet-stream"
        : "text/sql";

    return new NextResponse(fileData, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${backup.fileName}"`,
        "Content-Length": String(fileData.length),
      },
    });
  } catch (error) {
    console.error("Backup download error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getCompanyContext();

    if (!(await isAdmin(ctx))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const backupId = parseInt(id, 10);

    if (isNaN(backupId)) {
      return NextResponse.json({ error: "Invalid backup ID" }, { status: 400 });
    }

    const backup = await prisma.backupHistory.findFirst({
      where: { id: backupId, companyId: ctx.companyId },
    });

    if (!backup) {
      return NextResponse.json({ error: "Backup not found" }, { status: 404 });
    }

    deleteBackupFile(ctx.companyId, backup.fileName);

    await prisma.cloudBackup.deleteMany({ where: { backupId: backup.id } });
    await prisma.backupLog.deleteMany({ where: { backupId: backup.id } });
    await prisma.backupHistory.delete({ where: { id: backup.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Backup delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
