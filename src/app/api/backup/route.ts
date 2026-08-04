import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCompanyContext, isAdmin } from "@/lib/company-context";
import { runBackup, formatFileSize } from "@/lib/backup/backup-utils";
import { scheduleBackupJob } from "@/lib/backup/scheduler";

export async function GET(request: NextRequest) {
  try {
    const ctx = await getCompanyContext();
    if (!(await isAdmin(ctx))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "dashboard";

    if (type === "dashboard") {
      const setting = await prisma.backupSetting.findUnique({
        where: { companyId: ctx.companyId },
      });

      const totalBackups = await prisma.backupHistory.count({
        where: { companyId: ctx.companyId },
      });

      const completedBackups = await prisma.backupHistory.count({
        where: { companyId: ctx.companyId, status: "COMPLETED" },
      });

      const failedBackups = await prisma.backupHistory.count({
        where: { companyId: ctx.companyId, status: "FAILED" },
      });

      const lastBackup = await prisma.backupHistory.findFirst({
        where: { companyId: ctx.companyId, status: "COMPLETED" },
        orderBy: { createdAt: "desc" },
      });

      const totalSize = await prisma.backupHistory.aggregate({
        where: { companyId: ctx.companyId, status: "COMPLETED" },
        _sum: { fileSize: true },
      });

      const recentLogs = await prisma.backupLog.findMany({
        where: { companyId: ctx.companyId },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      return NextResponse.json({
        success: true,
        dashboard: {
          setting: setting
            ? {
                autoBackupEnabled: setting.autoBackupEnabled,
                backupTime: setting.backupTime,
                retentionDays: setting.retentionDays,
                cloudBackupEnabled: setting.cloudBackupEnabled,
                compression: setting.compression,
                encryption: setting.encryption,
                encryptionKey: setting.encryptionKey,
              }
            : {
                autoBackupEnabled: false,
                backupTime: "02:00",
                retentionDays: 30,
                cloudBackupEnabled: false,
                compression: true,
                encryption: false,
                encryptionKey: null,
              },
          totalBackups,
          completedBackups,
          failedBackups,
          lastBackup: lastBackup
            ? {
                id: lastBackup.id,
                backupName: lastBackup.backupName,
                createdAt: lastBackup.createdAt.toISOString(),
                fileSize: lastBackup.fileSize,
                fileSizeFormatted: formatFileSize(lastBackup.fileSize),
              }
            : null,
          totalSize: totalSize._sum.fileSize || 0,
          totalSizeFormatted: formatFileSize(totalSize._sum.fileSize || 0),
          recentLogs: recentLogs.map((log) => ({
            id: log.id,
            step: log.step,
            message: log.message,
            status: log.status,
            createdAt: log.createdAt.toISOString(),
          })),
        },
      });
    }

    const history = await prisma.backupHistory.findMany({
      where: { companyId: ctx.companyId },
      orderBy: { createdAt: "desc" },
      include: { createdByUser: { select: { name: true, username: true } } },
    });

    return NextResponse.json({
      success: true,
      history: history.map((h) => ({
        id: h.id,
        backupName: h.backupName,
        fileName: h.fileName,
        fileSize: h.fileSize,
        fileSizeFormatted: formatFileSize(h.fileSize),
        storageType: h.storageType,
        cloudPath: h.cloudPath,
        status: h.status,
        compression: h.compression,
        encrypted: h.encrypted,
        tableCount: h.tableCount,
        recordCount: h.recordCount,
        error: h.error,
        createdBy:
          h.createdByUser?.name || h.createdByUser?.username || "System",
        createdAt: h.createdAt.toISOString(),
        uploadStatus: h.uploadStatus,
        remarks: h.remarks,
        retryCount: h.retryCount,
      })),
    });
  } catch (error) {
    console.error("Backup API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await getCompanyContext();
    if (!(await isAdmin(ctx))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    let remarks: string | undefined;
    try {
      const body = await request.json();
      remarks = body.remarks || undefined;
    } catch {
      // body may be empty
    }

    const setting = await prisma.backupSetting.findUnique({
      where: { companyId: ctx.companyId },
    });

    const result = await runBackup({
      companyId: ctx.companyId,
      userId: ctx.userId,
      compression: setting?.compression ?? true,
      encryption: setting?.encryption ?? false,
      encryptionKey: setting?.encryptionKey || undefined,
      remarks,
    });

    return NextResponse.json({
      success: true,
      backup: {
        id: result.backupId,
        fileName: result.fileName,
        fileSize: result.fileSize,
        fileSizeFormatted: formatFileSize(result.fileSize),
        tableCount: result.tableCount,
        recordCount: result.recordCount,
      },
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Backup failed";
    console.error("Backup create error:", errMsg);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const ctx = await getCompanyContext();
    if (!(await isAdmin(ctx))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const raw = await request.json();
    const body = raw.settings || raw;

    const {
      autoBackupEnabled,
      backupTime,
      retentionDays,
      maxBackupCount,
      cloudBackupEnabled,
      compression,
      encryption,
      encryptionKey,
    } = body;

    const setting = await prisma.backupSetting.upsert({
      where: { companyId: ctx.companyId },
      update: {
        ...(autoBackupEnabled !== undefined && { autoBackupEnabled }),
        ...(backupTime !== undefined && { backupTime }),
        ...(retentionDays !== undefined && { retentionDays }),
        ...(maxBackupCount !== undefined && { maxBackupCount }),
        ...(cloudBackupEnabled !== undefined && { cloudBackupEnabled }),
        ...(compression !== undefined && { compression }),
        ...(encryption !== undefined && { encryption }),
        ...(encryptionKey !== undefined && { encryptionKey }),
      },
      create: {
        companyId: ctx.companyId,
        autoBackupEnabled: autoBackupEnabled ?? false,
        backupTime: backupTime ?? "02:00",
        retentionDays: retentionDays ?? 30,
        maxBackupCount: maxBackupCount ?? 50,
        cloudBackupEnabled: cloudBackupEnabled ?? false,
        compression: compression ?? true,
        encryption: encryption ?? false,
        encryptionKey: encryptionKey || null,
      },
    });

    if (autoBackupEnabled === true) {
      const [h, m] = (setting.backupTime || "02:00").split(":").map(Number);
      const now = new Date();
      const sched = new Date(now);
      sched.setHours(h, m, 0, 0);
      if (sched <= now) sched.setDate(sched.getDate() + 1);
      await scheduleBackupJob(ctx.companyId, sched);
    }

    return NextResponse.json({
      success: true,
      setting: {
        id: setting.id,
        companyId: setting.companyId,
        autoBackupEnabled: setting.autoBackupEnabled,
        backupTime: setting.backupTime,
        retentionDays: setting.retentionDays,
        maxBackupCount: setting.maxBackupCount,
        cloudBackupEnabled: setting.cloudBackupEnabled,
        compression: setting.compression,
        encryption: setting.encryption,
        encryptionKey: setting.encryptionKey,
      },
    });
  } catch (error) {
    console.error("Backup settings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
