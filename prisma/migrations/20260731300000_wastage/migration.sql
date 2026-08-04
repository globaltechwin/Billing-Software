-- CreateTable
CREATE TABLE `wastage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `wastageNo` VARCHAR(191) NOT NULL,
    `productionCategory` VARCHAR(191) NOT NULL,
    `remarks` VARCHAR(191) NULL,
    `numberOfProducts` INTEGER NOT NULL DEFAULT 0,
    `createdByUserId` INTEGER NULL,
    `updatedByUserId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `wastage_companyId_wastageNo_key`(`companyId`, `wastageNo`),
    INDEX `wastage_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wastage_item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `wastageId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `quantity` DECIMAL(12,3) NOT NULL,
    `companyId` INTEGER NOT NULL,

    INDEX `wastage_item_productId_idx`(`productId`),
    INDEX `wastage_item_companyId_idx`(`companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `wastage` ADD CONSTRAINT `wastage_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wastage` ADD CONSTRAINT `wastage_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wastage` ADD CONSTRAINT `wastage_updatedByUserId_fkey` FOREIGN KEY (`updatedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wastage_item` ADD CONSTRAINT `wastage_item_wastageId_fkey` FOREIGN KEY (`wastageId`) REFERENCES `wastage`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wastage_item` ADD CONSTRAINT `wastage_item_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wastage_item` ADD CONSTRAINT `wastage_item_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
