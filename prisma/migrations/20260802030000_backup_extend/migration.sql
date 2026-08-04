-- Backup & Restore schema extensions
-- Adds: maxBackupCount to backup_setting
-- Adds: cloudKey, uploadStatus, remarks, retryCount to backup_history
-- Creates: backup_job, cloud_backup tables

ALTER TABLE `backup_setting`
  ADD COLUMN `maxBackupCount` INT NOT NULL DEFAULT 50;

ALTER TABLE `backup_history`
  ADD COLUMN `cloudKey` VARCHAR(255) NULL,
  ADD COLUMN `uploadStatus` VARCHAR(20) NOT NULL DEFAULT 'NOT_UPLOADED',
  ADD COLUMN `remarks` TEXT NULL,
  ADD COLUMN `retryCount` INT NOT NULL DEFAULT 0,
  ADD INDEX `backup_history_uploadStatus_idx` (`uploadStatus`);

CREATE TABLE `backup_job` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `companyId` INT NOT NULL,
  `scheduledAt` DATETIME(3) NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  `backupId` INT NULL,
  `error` TEXT NULL,
  `attempts` INT NOT NULL DEFAULT 0,
  `maxAttempts` INT NOT NULL DEFAULT 3,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `backup_job_companyId_idx` (`companyId`),
  INDEX `backup_job_status_idx` (`status`),
  INDEX `backup_job_scheduledAt_idx` (`scheduledAt`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `cloud_backup` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `companyId` INT NOT NULL,
  `backupId` INT NOT NULL,
  `cloudKey` VARCHAR(255) NOT NULL,
  `cloudUrl` VARCHAR(500) NULL,
  `fileSize` INT NOT NULL DEFAULT 0,
  `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  `error` TEXT NULL,
  `verified` BOOLEAN NOT NULL DEFAULT false,
  `uploadedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `cloud_backup_companyId_idx` (`companyId`),
  INDEX `cloud_backup_backupId_idx` (`backupId`),
  INDEX `cloud_backup_status_idx` (`status`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
