import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCompanyContext, isAdmin } from "@/lib/company-context";
import { runRestore, getBackupFilePath, formatFileSize, ensureBackupDir } from "@/lib/backup/backup-utils";
import { writeFileSync } from "fs";
import { join } from "path";

export async function GET() {
  try {
    const ctx = await getCompanyContext();

    const history = await prisma.restoreHistory.findMany({
      where: { companyId: ctx.companyId },
      orderBy: { createdAt: "desc" },
      include: { createdByUser: { select: { name: true, username: true } } },
    });

    return NextResponse.json({
      success: true,
      history: history.map((h) => ({
        id: h.id,
        backupName: h.restoreName,
        fileName: h.fileName,
        fileSize: h.fileSize,
        fileSizeFormatted: formatFileSize(h.fileSize),
        status: h.status,
        tablesRestored: h.tablesRestored,
        recordsRestored: h.recordsRestored,
        error: h.error,
        createdBy: h.createdByUser?.name || h.createdByUser?.username || "System",
        createdAt: h.createdAt.toISOString(),
        restoredAt: h.createdAt.toISOString(),
        restoredBy: h.createdByUser?.name || h.createdByUser?.username || "System",
      })),
    });
  } catch (error) {
    console.error("Restore history error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await getCompanyContext();

    if (!(await isAdmin(ctx))) {
      return NextResponse.json({ error: "Only Owner or Admin can restore backups" }, { status: 403 });
    }

    const contentType = request.headers.get("content-type") || "";

    let filePath: string;
    let fileName: string;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
      }

      fileName = file.name;
      const buffer = Buffer.from(await file.arrayBuffer());

      const backupDir = ensureBackupDir(ctx.companyId);
      filePath = join(backupDir, `restore_upload_${Date.now()}_${fileName}`);
      writeFileSync(filePath, buffer);
    } else {
      const body = await request.json();
      const { backupId } = body;

      if (!backupId) {
        return NextResponse.json({ error: "backupId is required" }, { status: 400 });
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

      filePath = getBackupFilePath(ctx.companyId, backup.fileName);
      fileName = backup.fileName;
    }

    const result = await runRestore(ctx.companyId, ctx.userId, filePath, fileName);

    return NextResponse.json({
      success: true,
      restore: {
        id: result.restoreId,
        tablesRestored: result.tablesRestored,
        recordsRestored: result.recordsRestored,
      },
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Restore failed";
    console.error("Restore error:", errMsg);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
