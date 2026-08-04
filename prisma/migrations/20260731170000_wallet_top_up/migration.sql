-- AlterTable: Add wallet to Customer
ALTER TABLE `customer` ADD COLUMN `wallet` DECIMAL(10,2) NOT NULL DEFAULT 0;

-- CreateTable: WalletTransaction
CREATE TABLE `wallet_transaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `customerId` INTEGER NOT NULL,
    `cardNumber` VARCHAR(191),
    `employeeId` VARCHAR(191),
    `customerName` VARCHAR(191),
    `mobile` VARCHAR(191),
    `amount` DECIMAL(10,2) NOT NULL,
    `paymentMode` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Completed',
    `transactionType` VARCHAR(191) NOT NULL DEFAULT 'TOP_UP',
    `remarks` VARCHAR(191),
    `createdByUserId` INTEGER,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `wallet_transaction_companyId_fkey` ON `wallet_transaction`(`companyId`);
CREATE INDEX `wallet_transaction_customerId_fkey` ON `wallet_transaction`(`customerId`);
CREATE INDEX `wallet_transaction_createdByUserId_fkey` ON `wallet_transaction`(`createdByUserId`);

-- AddForeignKey
ALTER TABLE `wallet_transaction` ADD CONSTRAINT `wallet_transaction_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `wallet_transaction` ADD CONSTRAINT `wallet_transaction_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `wallet_transaction` ADD CONSTRAINT `wallet_transaction_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
