-- CreateTable
CREATE TABLE `production_mapping` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `companyId` INT NOT NULL,
    `productId` INT NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdByUserId` INT NULL,
    `updatedByUserId` INT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `production_mapping_item` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `mappingId` INT NOT NULL,
    `companyId` INT NOT NULL,
    `productId` INT NOT NULL,
    `quantity` DECIMAL(12,3) NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `wastagePercentage` DECIMAL(5,2) NOT NULL DEFAULT 0,
    `remarks` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `production_mapping_companyId_productId_key` ON `production_mapping`(`companyId`, `productId`);

-- CreateIndex
CREATE INDEX `production_mapping_productId_idx` ON `production_mapping`(`productId`);

-- CreateIndex
CREATE INDEX `production_mapping_companyId_idx` ON `production_mapping`(`companyId`);

-- CreateIndex
CREATE INDEX `production_mapping_createdByUserId_idx` ON `production_mapping`(`createdByUserId`);

-- CreateIndex
CREATE INDEX `production_mapping_updatedByUserId_idx` ON `production_mapping`(`updatedByUserId`);

-- CreateIndex
CREATE UNIQUE INDEX `production_mapping_item_mappingId_productId_key` ON `production_mapping_item`(`mappingId`, `productId`);

-- CreateIndex
CREATE INDEX `production_mapping_item_mappingId_idx` ON `production_mapping_item`(`mappingId`);

-- CreateIndex
CREATE INDEX `production_mapping_item_companyId_productId_idx` ON `production_mapping_item`(`companyId`, `productId`);

-- CreateIndex
CREATE INDEX `production_mapping_item_productId_idx` ON `production_mapping_item`(`productId`);

-- AddForeignKey
ALTER TABLE `production_mapping` ADD CONSTRAINT `production_mapping_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_mapping` ADD CONSTRAINT `production_mapping_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_mapping` ADD CONSTRAINT `production_mapping_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_mapping` ADD CONSTRAINT `production_mapping_updatedByUserId_fkey` FOREIGN KEY (`updatedByUserId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_mapping_item` ADD CONSTRAINT `production_mapping_item_mappingId_fkey` FOREIGN KEY (`mappingId`) REFERENCES `production_mapping`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_mapping_item` ADD CONSTRAINT `production_mapping_item_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_mapping_item` ADD CONSTRAINT `production_mapping_item_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
