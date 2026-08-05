-- CreateTable
CREATE TABLE `estimate` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `estimateNumber` VARCHAR(191) NOT NULL,
  `companyId` INT NOT NULL,
  `customerId` INT NULL,
  `createdByUserId` INT NOT NULL,
  `estimateDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `expiryDate` DATETIME(3) NULL,
  `gstMode` ENUM('GST_VISIBLE','GST_INCLUDED_HIDDEN','GST_IGST','NO_GST','GST_ITEM_WISE') NOT NULL DEFAULT 'GST_VISIBLE',
  `subtotal` DECIMAL(12,2) NOT NULL,
  `discountAmount` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `taxAmount` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `grandTotal` DECIMAL(12,2) NOT NULL,
  `status` ENUM('PENDING','ACCEPTED','REJECTED','EXPIRED','CONVERTED') NOT NULL DEFAULT 'PENDING',
  `remarks` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  UNIQUE INDEX `estimate_estimateNumber_key`(`estimateNumber`),
  UNIQUE INDEX `estimate_companyId_estimateNumber_key`(`companyId`, `estimateNumber`),
  INDEX `estimate_companyId_fkey`(`companyId`),
  INDEX `estimate_customerId_fkey`(`customerId`),
  INDEX `estimate_createdByUserId_fkey`(`createdByUserId`),
  CONSTRAINT `estimate_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `estimate_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `estimate_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `estimate_item` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `estimateId` INT NOT NULL,
  `productId` INT NOT NULL,
  `productNameSnapshot` VARCHAR(191) NOT NULL,
  `quantity` DECIMAL(10,2) NOT NULL,
  `unitPrice` DECIMAL(10,2) NOT NULL,
  `subtotal` DECIMAL(12,2) NOT NULL,
  `gstPercentage` DECIMAL(5,2) NOT NULL,
  `cgstPercentage` DECIMAL(5,2) NOT NULL,
  `sgstPercentage` DECIMAL(5,2) NOT NULL,
  `igstPercentage` DECIMAL(5,2) NOT NULL,
  `cgstAmount` DECIMAL(12,2) NOT NULL,
  `sgstAmount` DECIMAL(12,2) NOT NULL,
  `igstAmount` DECIMAL(12,2) NOT NULL,
  `taxAmount` DECIMAL(12,2) NOT NULL,
  `totalAmount` DECIMAL(12,2) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  INDEX `estimate_item_estimateId_fkey`(`estimateId`),
  INDEX `estimate_item_productId_fkey`(`productId`),
  CONSTRAINT `estimate_item_estimateId_fkey` FOREIGN KEY (`estimateId`) REFERENCES `estimate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `estimate_item_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterEnum: Add GST_ITEM_WISE to GSTMode enum on company, invoice tables
ALTER TABLE `company` MODIFY COLUMN `gstMode` ENUM('GST_VISIBLE','GST_INCLUDED_HIDDEN','GST_IGST','NO_GST','GST_ITEM_WISE') NOT NULL DEFAULT 'GST_VISIBLE';
ALTER TABLE `invoice` MODIFY COLUMN `gstMode` ENUM('GST_VISIBLE','GST_INCLUDED_HIDDEN','GST_IGST','NO_GST','GST_ITEM_WISE') NOT NULL DEFAULT 'GST_VISIBLE';
