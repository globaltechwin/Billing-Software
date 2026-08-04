-- AlterEnum for PaymentMethod
ALTER TABLE `vendor_payment` MODIFY COLUMN `paymentMethod` ENUM('CASH','BANK','UPI','CARD','CHEQUE','WALLET') NOT NULL;
ALTER TABLE `invoice_payment` MODIFY COLUMN `paymentMethod` ENUM('CASH','BANK','UPI','CARD','CHEQUE','WALLET') NOT NULL;

-- AlterTable
ALTER TABLE `vendor_payment`
    ADD COLUMN `transactionType` ENUM('CREDIT','PAYMENT') NOT NULL DEFAULT 'CREDIT',
    ADD COLUMN `updatedByUserId` INT NULL,
    ADD INDEX `VendorPayment_updatedByUserId_fkey`(`updatedByUserId`),
    ADD CONSTRAINT `VendorPayment_updatedByUserId_fkey` FOREIGN KEY (`updatedByUserId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
