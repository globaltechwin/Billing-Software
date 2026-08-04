-- Migration: Multi-Company SaaS Architecture
-- Adds: email to User, UserCompany junction, Branch, Company.isActive

-- 1. User table changes
ALTER TABLE `User` ADD COLUMN `email` VARCHAR(191) NOT NULL DEFAULT '';
ALTER TABLE `User` ADD COLUMN `mobileNumber` VARCHAR(191) NULL;
ALTER TABLE `User` ADD COLUMN `defaultCompanyId` INT NOT NULL DEFAULT 1;

-- Backfill email from username for existing users
UPDATE `User` SET `email` = CONCAT(`username`, '@billora.local') WHERE `email` = '';
CREATE UNIQUE INDEX `User_email_key` ON `User`(`email`);

-- Drop old companyId FK and rename column
ALTER TABLE `User` DROP FOREIGN KEY `User_companyId_fkey`;
ALTER TABLE `User` DROP INDEX `User_companyId_idx`;
ALTER TABLE `User` DROP COLUMN `companyId`;

-- Add FK for defaultCompanyId
ALTER TABLE `User` ADD INDEX `User_defaultCompanyId_idx` (`defaultCompanyId`);
ALTER TABLE `User` ADD CONSTRAINT `User_defaultCompanyId_fkey` FOREIGN KEY (`defaultCompanyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- 2. Company table changes
ALTER TABLE `company` ADD COLUMN `isActive` TINYINT(1) NOT NULL DEFAULT 1;

-- 3. UserCompany junction table
CREATE TABLE `UserCompany` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userId` INT NOT NULL,
  `companyId` INT NOT NULL,
  `roleId` INT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UserCompany_userId_companyId_key` (`userId`, `companyId`),
  INDEX `UserCompany_companyId_idx` (`companyId`),
  INDEX `UserCompany_roleId_idx` (`roleId`),
  CONSTRAINT `UserCompany_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `UserCompany_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `UserCompany_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Branch table
CREATE TABLE `branch` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `companyId` INT NOT NULL,
  `branchName` VARCHAR(191) NOT NULL,
  `address` VARCHAR(191) NULL,
  `phone` VARCHAR(191) NULL,
  `email` VARCHAR(191) NULL,
  `isHeadOffice` TINYINT(1) NOT NULL DEFAULT 0,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `branch_companyId_idx` (`companyId`),
  CONSTRAINT `branch_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Seed UserCompany for existing users (all have defaultCompanyId=1, use Owner role id=1)
INSERT INTO `UserCompany` (`userId`, `companyId`, `roleId`, `createdAt`)
SELECT `id`, `defaultCompanyId`, `roleId`, NOW(3) FROM `User`
ON DUPLICATE KEY UPDATE `roleId` = VALUES(`roleId`);

-- 6. Seed Head Office branch for existing company
INSERT INTO `branch` (`companyId`, `branchName`, `address`, `isHeadOffice`, `isActive`, `createdAt`, `updatedAt`)
SELECT `id`, 'Head Office', `address`, 1, 1, NOW(3), NOW(3) FROM `company`
WHERE NOT EXISTS (SELECT 1 FROM `branch` WHERE `companyId` = `company`.`id` AND `isHeadOffice` = 1);
