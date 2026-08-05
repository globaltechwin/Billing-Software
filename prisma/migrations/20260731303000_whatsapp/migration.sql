-- CreateTable (idempotent — tables may already exist from manual application)
CREATE TABLE IF NOT EXISTS `wa_message` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `billNo` VARCHAR(191) NULL,
    `mobile` VARCHAR(191) NULL,
    `customer` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `cost` DECIMAL(12,4) NOT NULL DEFAULT 0,
    `sentAt` DATETIME(3) NULL,
    `error` TEXT NULL,
    `templateName` VARCHAR(191) NULL,
    `createdByUserId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `wa_message_companyId_idx`(`companyId`),
    INDEX `wa_message_sentAt_idx`(`sentAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `wa_balance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `currentBalance` DECIMAL(12,2) NOT NULL DEFAULT 0,
    `totalSpent` DECIMAL(12,2) NOT NULL DEFAULT 0,
    `totalRecharged` DECIMAL(12,2) NOT NULL DEFAULT 0,
    `costPerMessage` DECIMAL(12,4) NOT NULL DEFAULT 0.5000,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `wa_balance_companyId_unique`(`companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `wa_balance_transaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'RECHARGE',
    `amount` DECIMAL(12,2) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `wa_balance_transaction_companyId_idx`(`companyId`),
    INDEX `wa_balance_transaction_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey (conditional to avoid duplicate key errors)
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'wa_message_companyId_fkey');
SET @sql = IF(@fk_exists = 0, 'ALTER TABLE `wa_message` ADD CONSTRAINT `wa_message_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk_exists = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'wa_message_createdByUserId_fkey');
SET @sql = IF(@fk_exists = 0, 'ALTER TABLE `wa_message` ADD CONSTRAINT `wa_message_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk_exists = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'wa_balance_companyId_fkey');
SET @sql = IF(@fk_exists = 0, 'ALTER TABLE `wa_balance` ADD CONSTRAINT `wa_balance_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk_exists = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'wa_balance_transaction_companyId_fkey');
SET @sql = IF(@fk_exists = 0, 'ALTER TABLE `wa_balance_transaction` ADD CONSTRAINT `wa_balance_transaction_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
