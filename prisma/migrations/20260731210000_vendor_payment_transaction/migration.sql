-- CreateTable
CREATE TABLE `invoice_payment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `paymentNumber` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NOT NULL,
    `invoiceId` INTEGER NOT NULL,
    `customerId` INTEGER NULL,
    `paymentDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `amount` DECIMAL(12, 2) NOT NULL,
    `paymentMethod` ENUM('CASH','BANK','UPI','CARD','CHEQUE') NOT NULL,
    `referenceNumber` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `createdByUserId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `invoice_payment_paymentNumber_key`(`paymentNumber`),
    UNIQUE INDEX `invoice_payment_companyId_paymentNumber_key`(`companyId`, `paymentNumber`),
    INDEX `invoice_payment_companyId_fkey`(`companyId`),
    INDEX `invoice_payment_invoiceId_fkey`(`invoiceId`),
    INDEX `invoice_payment_customerId_fkey`(`customerId`),
    INDEX `invoice_payment_createdByUserId_fkey`(`createdByUserId`),
    PRIMARY KEY (`id`),
    CONSTRAINT `invoice_payment_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `invoice_payment_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `invoice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `invoice_payment_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `invoice_payment_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterEnum for PaymentMethod
ALTER TABLE `vendor_payment` MODIFY COLUMN `paymentMethod` ENUM('CASH','BANK','UPI','CARD','CHEQUE','WALLET') NOT NULL;
ALTER TABLE `invoice_payment` MODIFY COLUMN `paymentMethod` ENUM('CASH','BANK','UPI','CARD','CHEQUE','WALLET') NOT NULL;

-- AlterTable
ALTER TABLE `vendor_payment`
    ADD COLUMN `transactionType` ENUM('CREDIT','PAYMENT') NOT NULL DEFAULT 'CREDIT',
    ADD COLUMN `updatedByUserId` INT NULL,
    ADD INDEX `VendorPayment_updatedByUserId_fkey`(`updatedByUserId`),
    ADD CONSTRAINT `VendorPayment_updatedByUserId_fkey` FOREIGN KEY (`updatedByUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
