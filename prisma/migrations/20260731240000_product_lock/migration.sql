-- AlterTable
ALTER TABLE `product` ADD COLUMN `billLock` TINYINT(1) NOT NULL DEFAULT 0 AFTER `isActive`,
  ADD COLUMN `billLockedAt` DATETIME(3) NULL AFTER `billLock`,
  ADD COLUMN `billLockedByUserId` INT NULL AFTER `billLockedAt`,
  ADD COLUMN `onlineLock` TINYINT(1) NOT NULL DEFAULT 0 AFTER `billLockedByUserId`,
  ADD COLUMN `onlineLockedAt` DATETIME(3) NULL AFTER `onlineLock`,
  ADD COLUMN `onlineLockedByUserId` INT NULL AFTER `onlineLockedAt`;

-- CreateIndex
CREATE INDEX `Product_billLockedByUserId_fkey` ON `product`(`billLockedByUserId`);

-- CreateIndex
CREATE INDEX `Product_onlineLockedByUserId_fkey` ON `product`(`onlineLockedByUserId`);

-- AddForeignKey
ALTER TABLE `product` ADD CONSTRAINT `Product_billLockedByUserId_fkey` FOREIGN KEY (`billLockedByUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product` ADD CONSTRAINT `Product_onlineLockedByUserId_fkey` FOREIGN KEY (`onlineLockedByUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
