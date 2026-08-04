-- GST Management Module Migration

-- 1. Add effectiveFrom to GSTMaster
ALTER TABLE `gst_master` ADD COLUMN `effectiveFrom` DATETIME(3) NULL;

-- 2. Create HSN/SAC table
CREATE TABLE `hsn_sac` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(191) NOT NULL,
  `description` VARCHAR(191) NOT NULL,
  `type` VARCHAR(191) NOT NULL DEFAULT 'HSN',
  `defaultGstRateId` INT NULL,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `HSNSac_code_key` (`code`),
  INDEX `HSNSac_defaultGstRateId_idx` (`defaultGstRateId`),
  CONSTRAINT `HSNSac_defaultGstRateId_fkey` FOREIGN KEY (`defaultGstRateId`) REFERENCES `gst_master`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Add Company GST settings columns
ALTER TABLE `company` ADD COLUMN `roundOffEnabled` TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE `company` ADD COLUMN `allowInvoiceGstOverride` TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE `company` ADD COLUMN `defaultHsnRequired` TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE `company` ADD COLUMN `allowCustomGstRate` TINYINT(1) NOT NULL DEFAULT 0;

-- 4. Add Product GST columns
ALTER TABLE `product` ADD COLUMN `hsnSacId` INT NULL;
ALTER TABLE `product` ADD COLUMN `gstApplicable` TINYINT(1) NOT NULL DEFAULT 1;
ALTER TABLE `product` ADD INDEX `Product_hsnSacId_idx` (`hsnSacId`);
ALTER TABLE `product` ADD CONSTRAINT `Product_hsnSacId_fkey` FOREIGN KEY (`hsnSacId`) REFERENCES `hsn_sac`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
