CREATE TABLE `ProductCategory` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `companyId` INTEGER NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `ProductCategory_companyId_name_key` (`companyId`, `name`),
  INDEX `ProductCategory_companyId_isActive_idx` (`companyId`, `isActive`),
  PRIMARY KEY (`id`),
  CONSTRAINT `ProductCategory_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
