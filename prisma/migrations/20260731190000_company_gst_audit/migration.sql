-- AlterTable
ALTER TABLE `company` ADD COLUMN `createdByUserId` INTEGER NULL;
ALTER TABLE `company` ADD COLUMN `updatedByUserId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `company` ADD CONSTRAINT `fk_company_created_by` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `company` ADD CONSTRAINT `fk_company_updated_by` FOREIGN KEY (`updatedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
