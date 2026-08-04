import { prisma } from "@/lib/prisma";
import { runBackup, uploadToCloud } from "@/lib/backup/backup-utils";
import { createBackupLog } from "@/lib/backup/backup-utils";

let schedulerInterval: ReturnType<typeof setInterval> | null = null;

export async function processScheduledBackups(): Promise<void> {
  try {
    const now = new Date();

    const pendingJobs = await prisma.backupJob.findMany({
      where: {
        status: "PENDING",
        scheduledAt: { lte: now },
        attempts: { lt: 3 },
      },
      include: { company: true },
    });

    for (const job of pendingJobs) {
      await prisma.backupJob.update({
        where: { id: job.id },
        data: { status: "RUNNING", attempts: { increment: 1 } },
      });

      try {
        const setting = await prisma.backupSetting.findUnique({
          where: { companyId: job.companyId },
        });

        if (!setting) {
          await prisma.backupJob.update({
            where: { id: job.id },
            data: { status: "FAILED", error: "No backup settings found" },
          });
          continue;
        }

        const result = await runBackup({
          companyId: job.companyId,
          userId: 0,
          compression: setting.compression,
          encryption: setting.encryption,
          encryptionKey: setting.encryptionKey || undefined,
          remarks: "Scheduled backup",
        });

        await prisma.backupJob.update({
          where: { id: job.id },
          data: { status: "COMPLETED", backupId: result.backupId },
        });

        if (setting.cloudBackupEnabled) {
          try {
            await uploadToCloud(job.companyId, result.backupId);
          } catch (uploadErr) {
            await createBackupLog(
              job.companyId,
              "SCHEDULED_CLOUD_UPLOAD",
              `Cloud upload failed after scheduled backup: ${uploadErr instanceof Error ? uploadErr.message : "Unknown"}`,
              "ERROR",
              result.backupId,
            );
          }
        }

        await cleanupOldJobs(job.companyId);
      } catch (backupErr) {
        const errorMsg = backupErr instanceof Error ? backupErr.message : "Backup failed";
        await prisma.backupJob.update({
          where: { id: job.id },
          data: {
            status: job.attempts >= job.maxAttempts - 1 ? "FAILED" : "PENDING",
            error: errorMsg,
          },
        });

        await createBackupLog(
          job.companyId,
          "SCHEDULED_BACKUP",
          `Scheduled backup failed (attempt ${job.attempts}/${job.maxAttempts}): ${errorMsg}`,
          "ERROR",
          undefined,
        );
      }
    }
  } catch (error) {
    console.error("Scheduler error:", error);
  }
}

export async function processRetryUploads(): Promise<void> {
  try {
    const failedCloudBackups = await prisma.cloudBackup.findMany({
      where: { status: "FAILED" },
      take: 10,
    });

    for (const cb of failedCloudBackups) {
      try {
        const backup = await prisma.backupHistory.findUnique({
          where: { id: cb.backupId },
        });

        if (!backup || backup.status !== "COMPLETED") continue;

        await prisma.cloudBackup.update({
          where: { id: cb.id },
          data: { status: "RETRYING" },
        });

        await uploadToCloud(cb.companyId, cb.backupId);
      } catch (retryErr) {
        await prisma.cloudBackup.update({
          where: { id: cb.id },
          data: {
            status: "FAILED",
            error: retryErr instanceof Error ? retryErr.message : "Retry failed",
          },
        });
      }
    }
  } catch (error) {
    console.error("Retry upload error:", error);
  }
}

async function cleanupOldJobs(companyId: number): Promise<void> {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);

    await prisma.backupJob.deleteMany({
      where: {
        companyId,
        status: { in: ["COMPLETED", "FAILED"] },
        createdAt: { lt: cutoff },
      },
    });
  } catch { /* ignore */ }
}

export async function scheduleBackupJob(companyId: number, scheduledAt: Date): Promise<void> {
  const todayStr = scheduledAt.toISOString().split("T")[0];
  const existingJob = await prisma.backupJob.findFirst({
    where: {
      companyId,
      scheduledAt: {
        gte: new Date(todayStr),
        lt: new Date(new Date(todayStr).getTime() + 86400000),
      },
      status: { notIn: ["FAILED"] },
    },
  });

  if (!existingJob) {
    await prisma.backupJob.create({
      data: {
        companyId,
        scheduledAt,
        status: "PENDING",
      },
    });
  }
}

export async function createDailyScheduleJobs(): Promise<void> {
  try {
    const settings = await prisma.backupSetting.findMany({
      where: { autoBackupEnabled: true },
    });

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    for (const setting of settings) {
      const scheduledAt = new Date(`${todayStr}T${setting.backupTime}:00.000Z`);

      if (scheduledAt <= now) {
        scheduledAt.setDate(scheduledAt.getDate() + 1);
      }

      await scheduleBackupJob(setting.companyId, scheduledAt);
    }
  } catch (error) {
    console.error("Create daily schedule error:", error);
  }
}

export function startScheduler(): void {
  if (schedulerInterval) return;

  schedulerInterval = setInterval(async () => {
    await processScheduledBackups();
    await processRetryUploads();
  }, 60000);

  createDailyScheduleJobs().catch(() => {});
  processScheduledBackups().catch(() => {});
  processRetryUploads().catch(() => {});
}

export function stopScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
}
