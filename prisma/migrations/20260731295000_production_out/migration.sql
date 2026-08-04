-- CreateTable
CREATE TABLE `production_out` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `outNo` VARCHAR(191) NOT NULL,
    `productionCategory` VARCHAR(191) NOT NULL,
    `indentNo` VARCHAR(191) NULL,
    `branchId` INTEGER NULL,
    `remarks` VARCHAR(191) NULL,
    `numberOfProducts` INTEGER NOT NULL DEFAULT 0,
    `grandTotal` DECIMAL(12,2) NOT NULL,
    `createdByUserId` INTEGER NULL,
    `updatedByUserId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `production_out_companyId_outNo_key`(`companyId`, `outNo`),
    INDEX `production_out_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `production_out_item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productionOutId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `quantity` DECIMAL(12,3) NOT NULL,
    `price` DECIMAL(12,2) NOT NULL,
    `totalPrice` DECIMAL(12,2) NOT NULL,
    `companyId` INTEGER NOT NULL,

    INDEX `production_out_item_productId_idx`(`productId`),
    INDEX `production_out_item_companyId_idx`(`companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `production_out` ADD CONSTRAINT `production_out_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_out` ADD CONSTRAINT `production_out_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_out` ADD CONSTRAINT `production_out_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_out` ADD CONSTRAINT `production_out_updatedByUserId_fkey` FOREIGN KEY (`updatedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_out_item` ADD CONSTRAINT `production_out_item_productionOutId_fkey` FOREIGN KEY (`productionOutId`) REFERENCES `production_out`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_out_item` ADD CONSTRAINT `production_out_item_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_out_item` ADD CONSTRAINT `production_out_item_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
