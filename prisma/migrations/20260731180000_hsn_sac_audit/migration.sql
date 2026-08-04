-- Add audit fields to hsn_sac
ALTER TABLE `hsn_sac` ADD COLUMN `createdByUserId` INT NULL;
ALTER TABLE `hsn_sac` ADD COLUMN `updatedByUserId` INT NULL;

-- Add foreign keys
ALTER TABLE `hsn_sac` ADD CONSTRAINT `HSNSac_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `hsn_sac` ADD CONSTRAINT `HSNSac_updatedByUserId_fkey` FOREIGN KEY (`updatedByUserId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
