import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCompanyContext, isOwner, isAdmin } from "@/lib/company-context";
import { uploadToCloud, formatFileSize } from "@/lib/backup/backup-utils";
import { getStorageProvider } from "@/lib/backup/storage-provider";

export async function GET() {
  try {
    const ctx = await getCompanyContext();

    if (!(await isOwner(ctx))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const setting = await prisma.backupSetting.findUnique({
      where: { companyId: ctx.companyId },
    });

    const cloudBackups = await prisma.backupHistory.findMany({
      where: { companyId: ctx.companyId, storageType: "cloud" },
      orderBy: { createdAt: "desc" },
    });

    let usage = { used: 0, total: 10 * 1024 * 1024 * 1024 };
    try {
      if (setting?.cloudBackupEnabled) {
        const provider = getStorageProvider();
        usage = await provider.getUsage();
      }
    } catch { /* ignore */ }

    return NextResponse.json({
      success: true,
      cloud: {
        enabled: setting?.cloudBackupEnabled ?? false,
        totalBackups: cloudBackups.length,
        storageUsed: usage.used,
        storageUsedFormatted: formatFileSize(usage.used),
        storageTotal: usage.total,
        storageTotalFormatted: formatFileSize(usage.total),
        backups: cloudBackups.map((b) => ({
          id: b.id,
          backupName: b.backupName,
          fileName: b.fileName,
          cloudPath: b.cloudPath,
          fileSize: b.fileSize,
          fileSizeFormatted: formatFileSize(b.fileSize),
          createdAt: b.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error("Cloud status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await getCompanyContext();

    if (!(await isAdmin(ctx))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const setting = await prisma.backupSetting.findUnique({
      where: { companyId: ctx.companyId },
    });

    if (!setting?.cloudBackupEnabled) {
      return NextResponse.json({ error: "Cloud backup is not enabled" }, { status: 400 });
    }

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

    await uploadToCloud(ctx.companyId, backup.id);

    const updated = await prisma.backupHistory.findUnique({ where: { id: backup.id } });

    return NextResponse.json({
      success: true,
      cloud: {
        url: updated?.cloudPath || "",
        size: updated?.fileSize || 0,
        sizeFormatted: formatFileSize(updated?.fileSize || 0),
      },
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Cloud upload failed";
    console.error("Cloud backup error:", errMsg);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
