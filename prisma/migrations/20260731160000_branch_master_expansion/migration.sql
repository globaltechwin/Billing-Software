-- AlterTable: Branch Master expansion
ALTER TABLE `branch`
  ADD COLUMN `branchCode` VARCHAR(191),
  ADD COLUMN `branchType` VARCHAR(191) NOT NULL DEFAULT 'Branch',
  ADD COLUMN `contactPerson` VARCHAR(191),
  ADD COLUMN `alternateMobile` VARCHAR(191),
  ADD COLUMN `addressLine1` VARCHAR(191),
  ADD COLUMN `addressLine2` VARCHAR(191),
  ADD COLUMN `city` VARCHAR(191),
  ADD COLUMN `state` VARCHAR(191),
  ADD COLUMN `country` VARCHAR(191) DEFAULT 'India',
  ADD COLUMN `pincode` VARCHAR(191),
  ADD COLUMN `gstin` VARCHAR(191),
  ADD COLUMN `pan` VARCHAR(191),
  ADD COLUMN `isDefault` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `remarks` VARCHAR(191),
  ADD COLUMN `createdByUserId` INT,
  ADD COLUMN `updatedByUserId` INT;

-- CreateIndex
CREATE UNIQUE INDEX `branch_companyId_branchName_key` ON `branch`(`companyId`, `branchName`);
CREATE UNIQUE INDEX `branch_companyId_branchCode_key` ON `branch`(`companyId`, `branchCode`);

-- AddForeignKey
ALTER TABLE `branch` ADD CONSTRAINT `branch_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `branch` ADD CONSTRAINT `branch_updatedByUserId_fkey` FOREIGN KEY (`updatedByUserId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
