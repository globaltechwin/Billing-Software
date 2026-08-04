import { exec } from "child_process";
import { promisify } from "util";
import { createReadStream, createWriteStream, existsSync, mkdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from "fs";
import { join } from "path";
import { createGzip, createGunzip } from "zlib";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { pipeline } from "stream/promises";
import { prisma } from "@/lib/prisma";
import { getStorageProvider } from "./storage-provider";

const execAsync = promisify(exec);

const BACKUP_ROOT = join(process.cwd(), "storage", "backups");
const ALGORITHM = "aes-256-cbc";

export interface BackupOptions {
  companyId: number;
  userId: number;
  compression: boolean;
  encryption: boolean;
  encryptionKey?: string;
  remarks?: string;
}

export interface BackupResult {
  backupId: number;
  fileName: string;
  fileSize: number;
  tableCount: number;
  recordCount: number;
}

export interface RestoreResult {
  restoreId: number;
  tablesRestored: number;
  recordsRestored: number;
}

export async function createBackupLog(
  companyId: number,
  step: string,
  message: string,
  status: string = "INFO",
  backupId?: number,
  restoreId?: number
) {
  return prisma.backupLog.create({
    data: { companyId, step, message, status, backupId, restoreId },
  });
}

export function getBackupFilePath(companyId: number, fileName: string): string {
  return join(BACKUP_ROOT, String(companyId), fileName);
}

export function ensureBackupDir(companyId: number): string {
  const dir = join(BACKUP_ROOT, String(companyId));
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function deleteBackupFile(companyId: number, fileName: string): boolean {
  const filePath = getBackupFilePath(companyId, fileName);
  if (existsSync(filePath)) {
    unlinkSync(filePath);
    return true;
  }
  return false;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export async function enforceRetention(companyId: number) {
  const setting = await prisma.backupSetting.findUnique({ where: { companyId } });
  if (!setting) return;

  const backups = await prisma.backupHistory.findMany({
    where: { companyId, status: "COMPLETED" },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();

  for (const backup of backups) {
    const ageMs = now.getTime() - backup.createdAt.getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);

    const beyondRetention = ageDays > setting.retentionDays;
    const beyondMaxCount = backups.indexOf(backup) >= setting.maxBackupCount;

    if (beyondRetention || beyondMaxCount) {
      deleteBackupFile(companyId, backup.fileName);
      await prisma.backupHistory.delete({ where: { id: backup.id } });
      await createBackupLog(companyId, "RETENTION", `Deleted old backup: ${backup.fileName}`, "INFO");
    }
  }
}

export async function cleanupExpiredBackups() {
  const companies = await prisma.company.findMany({ select: { id: true } });
  for (const company of companies) {
    await enforceRetention(company.id);
  }
}

export async function runBackup(options: BackupOptions): Promise<BackupResult> {
  const { companyId, userId, compression, encryption, encryptionKey, remarks } = options;

  ensureBackupDir(companyId);

  await prisma.backupSetting.upsert({
    where: { companyId },
    update: {},
    create: { companyId },
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupName = `Backup ${new Date().toLocaleDateString("en-IN")} ${new Date().toLocaleTimeString("en-IN")}`;
  let fileName = `backup_company_${companyId}_${timestamp}.sql`;

  const record = await prisma.backupHistory.create({
    data: {
      companyId,
      backupName,
      fileName,
      storageType: "local",
      status: "RUNNING",
      compression,
      encrypted: encryption,
      remarks,
      createdByUserId: userId,
    },
  });

  try {
    await createBackupLog(companyId, "START", "Backup started", "INFO", record.id);

    await createBackupLog(companyId, "DUMP", "Generating MySQL dump", "INFO", record.id);

    const filePath = getBackupFilePath(companyId, fileName);
    const cmd = `mysqldump -h localhost -P 3306 -u root -p'Root@12345!' billora --single-transaction --routines --triggers --events --set-gtid-purged=OFF > "${filePath}"`;
    await execAsync(cmd, { timeout: 300000 });

    if (!existsSync(filePath)) {
      throw new Error("Failed to generate MySQL dump");
    }

    await createBackupLog(companyId, "DUMP", `Dump generated: ${fileName}`, "SUCCESS", record.id);

    let tableCount = 0;
    let recordCount = 0;
    try {
      const sqlContent = readFileSync(filePath, "utf-8");
      const tableMatches = sqlContent.match(/INSERT INTO `[^`]+`/g);
      if (tableMatches) {
        tableCount = new Set(tableMatches.map((m: string) => m.replace("INSERT INTO `", "").replace("`", ""))).size;
        recordCount = (sqlContent.match(/\((\d+),/g) || []).length;
      }
    } catch { /* ignore */ }

    let currentPath = filePath;

    if (compression) {
      await createBackupLog(companyId, "COMPRESS", "Compressing backup (.gz)", "INFO", record.id);
      const gzPath = `${currentPath}.gz`;
      const input = createReadStream(currentPath);
      const output = createWriteStream(gzPath);
      const gzip = createGzip({ level: 6 });
      await pipeline(input, gzip, output);
      unlinkSync(currentPath);
      currentPath = gzPath;
      fileName = `${fileName}.gz`;
      await createBackupLog(companyId, "COMPRESS", "Compression complete", "SUCCESS", record.id);
    }

    if (encryption && encryptionKey) {
      await createBackupLog(companyId, "ENCRYPT", "Encrypting backup (AES-256-CBC)", "INFO", record.id);
      const encPath = `${currentPath}.enc`;
      const iv = randomBytes(16);
      const keyBuffer = Buffer.from(encryptionKey.padEnd(32, "0").slice(0, 32), "utf-8");
      const cipher = createCipheriv(ALGORITHM, keyBuffer, iv);
      const input = createReadStream(currentPath);
      const output = createWriteStream(encPath);
      await pipeline(input, cipher, output);
      const ivAndData = Buffer.concat([iv, readFileSync(encPath)]);
      writeFileSync(encPath, ivAndData);
      unlinkSync(currentPath);
      currentPath = encPath;
      fileName = `${fileName}.enc`;
      await createBackupLog(companyId, "ENCRYPT", "Encryption complete", "SUCCESS", record.id);
    }

    const stats = statSync(currentPath);

    await prisma.backupHistory.update({
      where: { id: record.id },
      data: {
        fileName,
        fileSize: stats.size,
        status: "COMPLETED",
        tableCount,
        recordCount,
      },
    });

    await createBackupLog(companyId, "COMPLETE", `Backup completed: ${fileName} (${formatFileSize(stats.size)})`, "SUCCESS", record.id);

    await enforceRetention(companyId);

    return {
      backupId: record.id,
      fileName,
      fileSize: stats.size,
      tableCount,
      recordCount,
    };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";

    await prisma.backupHistory.update({
      where: { id: record.id },
      data: { status: "FAILED", error: errMsg },
    });

    await createBackupLog(companyId, "ERROR", errMsg, "ERROR", record.id);

    throw error;
  }
}

export async function runRestore(
  companyId: number,
  userId: number,
  filePath: string,
  originalFileName: string
): Promise<RestoreResult> {
  const fileSize = existsSync(filePath) ? statSync(filePath).size : 0;

  const restoreRecord = await prisma.restoreHistory.create({
    data: {
      companyId,
      restoreName: `Restore ${new Date().toLocaleDateString("en-IN")} ${new Date().toLocaleTimeString("en-IN")}`,
      fileName: originalFileName,
      fileSize,
      status: "RUNNING",
      createdByUserId: userId,
    },
  });

  let sqlFile = filePath;

  try {
    await createBackupLog(companyId, "START", "Restore started", "INFO", undefined, restoreRecord.id);

    if (filePath.endsWith(".enc")) {
      const setting = await prisma.backupSetting.findUnique({ where: { companyId } });
      if (!setting?.encryptionKey) throw new Error("Encryption key not configured");
      await createBackupLog(companyId, "DECRYPT", "Decrypting backup", "INFO", undefined, restoreRecord.id);
      const outPath = filePath.replace(/\.enc$/, "");
      const keyBuffer = Buffer.from(setting.encryptionKey.padEnd(32, "0").slice(0, 32), "utf-8");
      const fileData = readFileSync(filePath);
      const iv = fileData.subarray(0, 16);
      const encrypted = fileData.subarray(16);
      const decipher = createDecipheriv(ALGORITHM, keyBuffer, iv);
      const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
      writeFileSync(outPath, decrypted);
      sqlFile = outPath;
      await createBackupLog(companyId, "DECRYPT", "Decryption complete", "SUCCESS", undefined, restoreRecord.id);
    }

    if (sqlFile.endsWith(".gz")) {
      await createBackupLog(companyId, "DECOMPRESS", "Decompressing backup", "INFO", undefined, restoreRecord.id);
      const outPath = sqlFile.replace(/\.gz$/, "");
      const input = createReadStream(sqlFile);
      const output = createWriteStream(outPath);
      const gunzip = createGunzip();
      await pipeline(input, gunzip, output);
      sqlFile = outPath;
      await createBackupLog(companyId, "DECOMPRESS", "Decompression complete", "SUCCESS", undefined, restoreRecord.id);
    }

    await createBackupLog(companyId, "RESTORE", "Restoring database from dump", "INFO", undefined, restoreRecord.id);

    const cmd = `mysql -h localhost -P 3306 -u root -p'Root@12345!' billora < "${sqlFile}"`;
    await execAsync(cmd, { timeout: 300000 });

    let tablesRestored = 0;
    let recordsRestored = 0;
    try {
      const sqlContent = readFileSync(sqlFile, "utf-8");
      const tableMatches = sqlContent.match(/CREATE TABLE.*?`([^`]+)`/g);
      if (tableMatches) tablesRestored = tableMatches.length;
      const insertMatches = sqlContent.match(/INSERT INTO/g);
      if (insertMatches) recordsRestored = insertMatches.length;
    } catch { /* ignore */ }

    if (sqlFile !== filePath) {
      try { unlinkSync(sqlFile); } catch { /* ignore cleanup errors */ }
    }

    try {
      await prisma.restoreHistory.update({
        where: { id: restoreRecord.id },
        data: { status: "COMPLETED", tablesRestored, recordsRestored },
      });
    } catch {
      await prisma.restoreHistory.create({
        data: {
          companyId,
          restoreName: restoreRecord.restoreName,
          fileName: restoreRecord.fileName,
          fileSize: restoreRecord.fileSize,
          status: "COMPLETED",
          tablesRestored,
          recordsRestored,
          createdByUserId: userId,
        },
      });
    }

    return { restoreId: restoreRecord.id, tablesRestored, recordsRestored };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";

    try {
      await prisma.restoreHistory.update({
        where: { id: restoreRecord.id },
        data: { status: "FAILED", error: errMsg },
      });
    } catch {
      await prisma.restoreHistory.create({
        data: {
          companyId,
          restoreName: restoreRecord.restoreName,
          fileName: restoreRecord.fileName,
          fileSize: restoreRecord.fileSize,
          status: "FAILED",
          error: errMsg,
          createdByUserId: userId,
        },
      });
    }

    if (sqlFile !== filePath) {
      try { unlinkSync(sqlFile); } catch { /* ignore cleanup errors */ }
    }

    throw error;
  }
}

export async function uploadToCloud(companyId: number, backupId: number): Promise<void> {
  const setting = await prisma.backupSetting.findUnique({ where: { companyId } });
  if (!setting?.cloudBackupEnabled) {
    throw new Error("Cloud backup is not enabled for this company");
  }

  const backup = await prisma.backupHistory.findUnique({ where: { id: backupId } });
  if (!backup || backup.companyId !== companyId) {
    throw new Error("Backup not found");
  }

  await createBackupLog(companyId, "CLOUD_UPLOAD", "Starting cloud upload", "INFO", backupId);

  const provider = getStorageProvider();
  const filePath = getBackupFilePath(companyId, backup.fileName);

  if (!existsSync(filePath)) {
    throw new Error("Backup file not found on disk");
  }

  const key = `companies/${companyId}/backups/${backup.fileName}`;
  const { url, size } = await provider.upload(key, filePath);

  await prisma.cloudBackup.create({
    data: {
      companyId,
      backupId,
      cloudKey: key,
      cloudUrl: url,
      fileSize: size,
      status: "UPLOADED",
      verified: false,
      uploadedAt: new Date(),
    },
  });

  await prisma.backupHistory.update({
    where: { id: backupId },
    data: {
      storageType: "cloud",
      cloudPath: url,
      cloudKey: key,
      uploadStatus: "UPLOADED",
    },
  });

  await createBackupLog(companyId, "CLOUD_UPLOAD", `Cloud upload complete: ${key}`, "SUCCESS", backupId);

  const exists = await provider.list(key);
  const verified = exists.some((item) => item.key === key);

  if (verified) {
    await prisma.cloudBackup.updateMany({
      where: { companyId, backupId },
      data: { verified: true },
    });
    await createBackupLog(companyId, "CLOUD_VERIFY", "Cloud upload verified", "SUCCESS", backupId);
  } else {
    await prisma.cloudBackup.updateMany({
      where: { companyId, backupId },
      data: { verified: false },
    });
    await createBackupLog(companyId, "CLOUD_VERIFY", "Cloud upload verification failed", "WARNING", backupId);
  }
}

export async function retryCloudUpload(companyId: number): Promise<void> {
  const failedBackups = await prisma.cloudBackup.findMany({
    where: { companyId, status: "FAILED" },
    include: { company: true },
  });

  await createBackupLog(companyId, "CLOUD_RETRY", `Retrying ${failedBackups.length} failed cloud uploads`, "INFO");

  for (const cloudBackup of failedBackups) {
    try {
      const backup = await prisma.backupHistory.findUnique({ where: { id: cloudBackup.backupId } });
      if (!backup) continue;

      const provider = getStorageProvider();
      const filePath = getBackupFilePath(companyId, backup.fileName);

      if (!existsSync(filePath)) {
        await prisma.cloudBackup.update({
          where: { id: cloudBackup.id },
          data: { status: "FAILED", error: "Local file not found" },
        });
        continue;
      }

      const { url, size } = await provider.upload(cloudBackup.cloudKey, filePath);

      await prisma.cloudBackup.update({
        where: { id: cloudBackup.id },
        data: {
          status: "UPLOADED",
          cloudUrl: url,
          fileSize: size,
          error: null,
          uploadedAt: new Date(),
        },
      });

      await prisma.backupHistory.update({
        where: { id: backup.id },
        data: { uploadStatus: "UPLOADED" },
      });

      await createBackupLog(companyId, "CLOUD_RETRY", `Retry successful: ${cloudBackup.cloudKey}`, "SUCCESS", backup.id);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Unknown error";
      await prisma.cloudBackup.update({
        where: { id: cloudBackup.id },
        data: { status: "FAILED", error: errMsg },
      });
      await createBackupLog(companyId, "CLOUD_RETRY", `Retry failed: ${errMsg}`, "ERROR", cloudBackup.backupId);
    }
  }
}
