-- AlterTable: Add companyId as nullable first
ALTER TABLE `User` ADD COLUMN `companyId` INTEGER NOT NULL DEFAULT 1;
ALTER TABLE `customer` ADD COLUMN `companyId` INTEGER NOT NULL DEFAULT 1;
ALTER TABLE `product` ADD COLUMN `companyId` INTEGER NOT NULL DEFAULT 1;

-- AddIndex: Performance indexes for multi-tenant queries
CREATE INDEX `User_companyId_idx` ON `User`(`companyId`);
CREATE INDEX `customer_companyId_idx` ON `customer`(`companyId`);
CREATE INDEX `product_companyId_idx` ON `product`(`companyId`);

-- AddForeignKey: companyId references Company
ALTER TABLE `User` ADD CONSTRAINT `User_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `customer` ADD CONSTRAINT `customer_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `product` ADD CONSTRAINT `product_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
