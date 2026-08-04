-- Drop old tables (empty)
DROP TABLE IF EXISTS `production_mapping_item`;
DROP TABLE IF EXISTS `production_mapping`;

-- CreateTable
CREATE TABLE `production_mapping` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `companyId` INT NOT NULL,
    `mappingType` VARCHAR(191) NOT NULL DEFAULT 'Production',
    `itemId` INT NOT NULL,
    `productId` INT NOT NULL,
    `quantity` DECIMAL(12,3) NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `purchasePrice` DECIMAL(12,2) NOT NULL DEFAULT 0,
    `cost` DECIMAL(12,2) NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdByUserId` INT NULL,
    `updatedByUserId` INT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `production_mapping_companyId_itemId_productId_key` ON `production_mapping`(`companyId`, `itemId`, `productId`);

-- CreateIndex
CREATE INDEX `production_mapping_productId_idx` ON `production_mapping`(`productId`);

-- CreateIndex
CREATE INDEX `production_mapping_itemId_idx` ON `production_mapping`(`itemId`);

-- CreateIndex
CREATE INDEX `production_mapping_createdByUserId_idx` ON `production_mapping`(`createdByUserId`);

-- CreateIndex
CREATE INDEX `production_mapping_updatedByUserId_idx` ON `production_mapping`(`updatedByUserId`);

-- AddForeignKey
ALTER TABLE `production_mapping` ADD CONSTRAINT `production_mapping_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_mapping` ADD CONSTRAINT `production_mapping_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_mapping` ADD CONSTRAINT `production_mapping_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_mapping` ADD CONSTRAINT `production_mapping_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_mapping` ADD CONSTRAINT `production_mapping_updatedByUserId_fkey` FOREIGN KEY (`updatedByUserId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE `production_conversion` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `companyId` INT NOT NULL,
    `productId` INT NOT NULL,
    `baseQty` DECIMAL(12,3) NOT NULL,
    `baseUnit` VARCHAR(191) NOT NULL,
    `portionQty` DECIMAL(12,3) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdByUserId` INT NULL,
    `updatedByUserId` INT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `production_conversion_companyId_productId_key` ON `production_conversion`(`companyId`, `productId`);

-- CreateIndex
CREATE INDEX `production_conversion_createdByUserId_idx` ON `production_conversion`(`createdByUserId`);

-- CreateIndex
CREATE INDEX `production_conversion_updatedByUserId_idx` ON `production_conversion`(`updatedByUserId`);

-- AddForeignKey
ALTER TABLE `production_conversion` ADD CONSTRAINT `production_conversion_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_conversion` ADD CONSTRAINT `production_conversion_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_conversion` ADD CONSTRAINT `production_conversion_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_conversion` ADD CONSTRAINT `production_conversion_updatedByUserId_fkey` FOREIGN KEY (`updatedByUserId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
