-- CreateTable
CREATE TABLE `accounting_invoice` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `invoiceNumber` VARCHAR(191) NOT NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Unpaid',
    `invoiceDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dueDate` DATETIME(3) NULL,
    `subtotal` DECIMAL(12,2) NOT NULL DEFAULT 0,
    `discountAmount` DECIMAL(12,2) NOT NULL DEFAULT 0,
    `discountType` VARCHAR(191) NOT NULL DEFAULT '%',
    `taxRate` DECIMAL(5,2) NOT NULL DEFAULT 0,
    `taxAmount` DECIMAL(12,2) NOT NULL DEFAULT 0,
    `total` DECIMAL(12,2) NOT NULL DEFAULT 0,
    `paidAmount` DECIMAL(12,2) NOT NULL DEFAULT 0,
    `notes` TEXT NULL,
    `terms` TEXT NULL,
    `createdByUserId` INTEGER NULL,
    `updatedByUserId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `accounting_invoice_invoiceNumber_key`(`invoiceNumber`),
    INDEX `accounting_invoice_companyId_idx`(`companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounting_invoice_item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `accountingInvoiceId` INTEGER NOT NULL,
    `item` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `quantity` DECIMAL(10,2) NOT NULL,
    `unitPrice` DECIMAL(12,2) NOT NULL,
    `amount` DECIMAL(12,2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `accounting_invoice_item_accountingInvoiceId_idx`(`accountingInvoiceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `accounting_invoice` ADD CONSTRAINT `accounting_invoice_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_invoice` ADD CONSTRAINT `accounting_invoice_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_invoice` ADD CONSTRAINT `accounting_invoice_updatedByUserId_fkey` FOREIGN KEY (`updatedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounting_invoice_item` ADD CONSTRAINT `accounting_invoice_item_accountingInvoiceId_fkey` FOREIGN KEY (`accountingInvoiceId`) REFERENCES `accounting_invoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
