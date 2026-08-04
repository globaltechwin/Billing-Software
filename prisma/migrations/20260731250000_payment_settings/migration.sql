-- CreateTable
CREATE TABLE `payment_settings` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `companyId` INT NOT NULL,
  `branchId` INT NULL,
  `merchantName` VARCHAR(191) NOT NULL,
  `upiId` VARCHAR(191) NOT NULL,
  `qrEnabled` TINYINT(1) NOT NULL DEFAULT 1,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `createdByUserId` INT NULL,
  `updatedByUserId` INT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  UNIQUE INDEX `PaymentSettings_companyId_branchId_key`(`companyId`, `branchId`),
  INDEX `PaymentSettings_branchId_fkey`(`branchId`),
  INDEX `PaymentSettings_createdByUserId_fkey`(`createdByUserId`),
  INDEX `PaymentSettings_updatedByUserId_fkey`(`updatedByUserId`),

  CONSTRAINT `PaymentSettings_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `PaymentSettings_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `PaymentSettings_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `PaymentSettings_updatedByUserId_fkey` FOREIGN KEY (`updatedByUserId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
