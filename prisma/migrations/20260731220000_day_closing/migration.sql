-- CreateTable
CREATE TABLE `day_closing` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `companyId` INT NOT NULL,
  `branchId` INT NOT NULL,
  `businessDate` DATE NOT NULL,
  `closedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `closedByUserId` INT NOT NULL,
  `createdByUserId` INT NOT NULL,
  `updatedByUserId` INT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  UNIQUE INDEX `DayClosing_companyId_branchId_businessDate_key`(`companyId`, `branchId`, `businessDate`),
  INDEX `DayClosing_branchId_fkey`(`branchId`),
  INDEX `DayClosing_closedByUserId_fkey`(`closedByUserId`),
  INDEX `DayClosing_createdByUserId_fkey`(`createdByUserId`),
  INDEX `DayClosing_updatedByUserId_fkey`(`updatedByUserId`),

  CONSTRAINT `DayClosing_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `DayClosing_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `DayClosing_closedByUserId_fkey` FOREIGN KEY (`closedByUserId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `DayClosing_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `DayClosing_updatedByUserId_fkey` FOREIGN KEY (`updatedByUserId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
