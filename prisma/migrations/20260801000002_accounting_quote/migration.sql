--CreateTable
CREATE TABLE `quote` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `quoteNumber` VARCHAR(191) NOT NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `quoteDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiryDate` DATETIME(3) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Draft',
    `discount` DECIMAL(12,2) NOT NULL DEFAULT 0,
    `taxRate` DECIMAL(5,2) NOT NULL DEFAULT 0,
    `notes` TEXT NULL,
    `terms` TEXT NULL,
    `createdByUserId` INTEGER NULL,
    `updatedByUserId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `quote_quoteNumber_key`(`quoteNumber`),
    INDEX `quote_companyId_idx`(`companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

--CreateTable
CREATE TABLE `quote_item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quoteId` INTEGER NOT NULL,
    `item` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `hsn` VARCHAR(191) NULL,
    `quantity` DECIMAL(10,2) NOT NULL,
    `unitPrice` DECIMAL(12,2) NOT NULL,
    `amount` DECIMAL(12,2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `quote_item_quoteId_idx`(`quoteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

--AddForeignKey
ALTER TABLE `quote` ADD CONSTRAINT `quote_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--AddForeignKey
ALTER TABLE `quote` ADD CONSTRAINT `quote_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--AddForeignKey
ALTER TABLE `quote` ADD CONSTRAINT `quote_updatedByUserId_fkey` FOREIGN KEY (`updatedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--AddForeignKey
ALTER TABLE `quote_item` ADD CONSTRAINT `quote_item_quoteId_fkey` FOREIGN KEY (`quoteId`) REFERENCES `quote`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;