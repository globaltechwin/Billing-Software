-- CreateTable BackupSetting
CREATE TABLE `backup_setting` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `autoBackupEnabled` BOOLEAN NOT NULL DEFAULT false,
    `backupTime` VARCHAR(191) NOT NULL DEFAULT '02:00',
    `retentionDays` INTEGER NOT NULL DEFAULT 30,
    `cloudBackupEnabled` BOOLEAN NOT NULL DEFAULT false,
    `compression` BOOLEAN NOT NULL DEFAULT true,
    `encryption` BOOLEAN NOT NULL DEFAULT false,
    `encryptionKey` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `backup_setting_companyId_key`(`companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable BackupHistory
CREATE TABLE `backup_history` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `backupName` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `fileSize` INTEGER NOT NULL DEFAULT 0,
    `storageType` VARCHAR(191) NOT NULL DEFAULT 'local',
    `cloudPath` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `compression` BOOLEAN NOT NULL DEFAULT true,
    `encrypted` BOOLEAN NOT NULL DEFAULT false,
    `tableCount` INTEGER NOT NULL DEFAULT 0,
    `recordCount` INTEGER NOT NULL DEFAULT 0,
    `error` TEXT NULL,
    `createdByUserId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `backup_history_companyId_idx`(`companyId`),
    INDEX `backup_history_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable RestoreHistory
CREATE TABLE `restore_history` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `backupId` INTEGER NULL,
    `restoreName` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `fileSize` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `tablesRestored` INTEGER NOT NULL DEFAULT 0,
    `recordsRestored` INTEGER NOT NULL DEFAULT 0,
    `error` TEXT NULL,
    `logs` TEXT NULL,
    `createdByUserId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `restore_history_companyId_idx`(`companyId`),
    INDEX `restore_history_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable BackupLog
CREATE TABLE `backup_log` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `backupId` INTEGER NULL,
    `restoreId` INTEGER NULL,
    `companyId` INTEGER NOT NULL,
    `step` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'INFO',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `backup_log_companyId_idx`(`companyId`),
    INDEX `backup_log_backupId_idx`(`backupId`),
    INDEX `backup_log_restoreId_idx`(`restoreId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `backup_setting` ADD CONSTRAINT `backup_setting_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `backup_history` ADD CONSTRAINT `backup_history_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `backup_history` ADD CONSTRAINT `backup_history_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `restore_history` ADD CONSTRAINT `restore_history_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `restore_history` ADD CONSTRAINT `restore_history_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `backup_log` ADD CONSTRAINT `backup_log_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
