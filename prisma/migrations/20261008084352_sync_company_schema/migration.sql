/*
  Warnings:

  - You are about to alter the column `cloudKey` on the `backup_history` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to drop the column `address` on the `branch` table. All the data in the column will be lost.
  - You are about to drop the column `addressLine1` on the `branch` table. All the data in the column will be lost.
  - You are about to drop the column `addressLine2` on the `branch` table. All the data in the column will be lost.
  - You are about to alter the column `cloudKey` on the `cloud_backup` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `cloudUrl` on the `cloud_backup` table. The data in that column could be lost. The data in that column will be cast from `VarChar(500)` to `VarChar(191)`.
  - You are about to alter the column `expenseNumber` on the `expense` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `description` on the `expense` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `vendorInvoiceNo` on the `expense` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `comments` on the `expense` table. The data in that column could be lost. The data in that column will be cast from `VarChar(500)` to `VarChar(191)`.
  - You are about to alter the column `categoryName` on the `expense_category` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `type` on the `wa_balance_transaction` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(25))`.
  - You are about to alter the column `status` on the `wa_campaign` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(26))`.
  - You are about to alter the column `status` on the `wa_message` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(24))`.

*/
-- DropForeignKey
ALTER TABLE `advance_order` DROP FOREIGN KEY `AdvanceOrder_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `advance_order` DROP FOREIGN KEY `AdvanceOrder_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `advance_order` DROP FOREIGN KEY `AdvanceOrder_createdByUserId_fkey`;

-- DropForeignKey
ALTER TABLE `advance_order` DROP FOREIGN KEY `AdvanceOrder_updatedByUserId_fkey`;

-- DropForeignKey
ALTER TABLE `advance_order_item` DROP FOREIGN KEY `AdvanceOrderItem_advanceOrderId_fkey`;

-- DropForeignKey
ALTER TABLE `advance_order_item` DROP FOREIGN KEY `AdvanceOrderItem_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `advance_order_item` DROP FOREIGN KEY `AdvanceOrderItem_productId_fkey`;

-- DropForeignKey
ALTER TABLE `company` DROP FOREIGN KEY `fk_company_created_by`;

-- DropForeignKey
ALTER TABLE `company` DROP FOREIGN KEY `fk_company_updated_by`;

-- DropForeignKey
ALTER TABLE `day_closing` DROP FOREIGN KEY `DayClosing_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `day_closing` DROP FOREIGN KEY `DayClosing_closedByUserId_fkey`;

-- DropForeignKey
ALTER TABLE `day_closing` DROP FOREIGN KEY `DayClosing_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `day_closing` DROP FOREIGN KEY `DayClosing_createdByUserId_fkey`;

-- DropForeignKey
ALTER TABLE `day_closing` DROP FOREIGN KEY `DayClosing_updatedByUserId_fkey`;

-- DropForeignKey
ALTER TABLE `estimate` DROP FOREIGN KEY `estimate_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `expense` DROP FOREIGN KEY `expense_updatedByUserId_fkey`;

-- DropForeignKey
ALTER TABLE `expense` DROP FOREIGN KEY `expense_vendorId_fkey`;

-- DropForeignKey
ALTER TABLE `goods_receipt` DROP FOREIGN KEY `GoodsReceipt_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `goods_receipt` DROP FOREIGN KEY `GoodsReceipt_createdByUserId_fkey`;

-- DropForeignKey
ALTER TABLE `goods_receipt` DROP FOREIGN KEY `GoodsReceipt_purchaseOrderId_fkey`;

-- DropForeignKey
ALTER TABLE `goods_receipt` DROP FOREIGN KEY `GoodsReceipt_vendorId_fkey`;

-- DropForeignKey
ALTER TABLE `goods_receipt_item` DROP FOREIGN KEY `GoodsReceiptItem_goodsReceiptId_fkey`;

-- DropForeignKey
ALTER TABLE `goods_receipt_item` DROP FOREIGN KEY `GoodsReceiptItem_productId_fkey`;

-- DropForeignKey
ALTER TABLE `hsn_sac` DROP FOREIGN KEY `HSNSac_createdByUserId_fkey`;

-- DropForeignKey
ALTER TABLE `hsn_sac` DROP FOREIGN KEY `HSNSac_defaultGstRateId_fkey`;

-- DropForeignKey
ALTER TABLE `hsn_sac` DROP FOREIGN KEY `HSNSac_updatedByUserId_fkey`;

-- DropForeignKey
ALTER TABLE `inventory_ledger` DROP FOREIGN KEY `InventoryLedger_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `inventory_ledger` DROP FOREIGN KEY `InventoryLedger_createdByUserId_fkey`;

-- DropForeignKey
ALTER TABLE `inventory_ledger` DROP FOREIGN KEY `InventoryLedger_productId_fkey`;

-- DropForeignKey
ALTER TABLE `invoice` DROP FOREIGN KEY `invoice_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `invoice_payment` DROP FOREIGN KEY `invoice_payment_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `payment_settings` DROP FOREIGN KEY `PaymentSettings_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `payment_settings` DROP FOREIGN KEY `PaymentSettings_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `payment_settings` DROP FOREIGN KEY `PaymentSettings_createdByUserId_fkey`;

-- DropForeignKey
ALTER TABLE `payment_settings` DROP FOREIGN KEY `PaymentSettings_updatedByUserId_fkey`;

-- DropForeignKey
ALTER TABLE `product` DROP FOREIGN KEY `Product_billLockedByUserId_fkey`;

-- DropForeignKey
ALTER TABLE `product` DROP FOREIGN KEY `Product_hsnSacId_fkey`;

-- DropForeignKey
ALTER TABLE `product` DROP FOREIGN KEY `Product_onlineLockedByUserId_fkey`;

-- DropForeignKey
ALTER TABLE `purchase_invoice` DROP FOREIGN KEY `PurchaseInvoice_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `purchase_invoice` DROP FOREIGN KEY `PurchaseInvoice_createdByUserId_fkey`;

-- DropForeignKey
ALTER TABLE `purchase_invoice` DROP FOREIGN KEY `PurchaseInvoice_grnId_fkey`;

-- DropForeignKey
ALTER TABLE `purchase_invoice` DROP FOREIGN KEY `PurchaseInvoice_purchaseOrderId_fkey`;

-- DropForeignKey
ALTER TABLE `purchase_invoice` DROP FOREIGN KEY `PurchaseInvoice_vendorId_fkey`;

-- DropForeignKey
ALTER TABLE `purchase_order` DROP FOREIGN KEY `PurchaseOrder_approvedByUserId_fkey`;

-- DropForeignKey
ALTER TABLE `purchase_order` DROP FOREIGN KEY `PurchaseOrder_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `purchase_order` DROP FOREIGN KEY `PurchaseOrder_createdByUserId_fkey`;

-- DropForeignKey
ALTER TABLE `purchase_order` DROP FOREIGN KEY `PurchaseOrder_vendorId_fkey`;

-- DropForeignKey
ALTER TABLE `purchase_order_item` DROP FOREIGN KEY `PurchaseOrderItem_productId_fkey`;

-- DropForeignKey
ALTER TABLE `purchase_order_item` DROP FOREIGN KEY `PurchaseOrderItem_purchaseOrderId_fkey`;

-- DropForeignKey
ALTER TABLE `usermenuaccess` DROP FOREIGN KEY `UserMenuAccess_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `usermenuaccess` DROP FOREIGN KEY `UserMenuAccess_userId_fkey`;

-- DropForeignKey
ALTER TABLE `vendor` DROP FOREIGN KEY `Vendor_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `vendor_payment` DROP FOREIGN KEY `VendorPayment_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `vendor_payment` DROP FOREIGN KEY `VendorPayment_createdByUserId_fkey`;

-- DropForeignKey
ALTER TABLE `vendor_payment` DROP FOREIGN KEY `VendorPayment_purchaseInvoiceId_fkey`;

-- DropForeignKey
ALTER TABLE `vendor_payment` DROP FOREIGN KEY `VendorPayment_updatedByUserId_fkey`;

-- DropForeignKey
ALTER TABLE `vendor_payment` DROP FOREIGN KEY `VendorPayment_vendorId_fkey`;

-- DropIndex
DROP INDEX `AdvanceOrder_branchId_fkey` ON `advance_order`;

-- DropIndex
DROP INDEX `AdvanceOrder_updatedByUserId_fkey` ON `advance_order`;

-- DropIndex
DROP INDEX `AdvanceOrderItem_productId_fkey` ON `advance_order_item`;

-- DropIndex
DROP INDEX `DayClosing_updatedByUserId_fkey` ON `day_closing`;

-- DropIndex
DROP INDEX `estimate_customerId_fkey` ON `estimate`;

-- DropIndex
DROP INDEX `expense_updatedByUserId_fkey` ON `expense`;

-- DropIndex
DROP INDEX `expense_vendorId_fkey` ON `expense`;

-- DropIndex
DROP INDEX `GoodsReceipt_purchaseOrderId_idx` ON `goods_receipt`;

-- DropIndex
DROP INDEX `InventoryLedger_createdByUserId_fkey` ON `inventory_ledger`;

-- DropIndex
DROP INDEX `InventoryLedger_referenceType_referenceId_idx` ON `inventory_ledger`;

-- DropIndex
DROP INDEX `invoice_customerId_fkey` ON `invoice`;

-- DropIndex
DROP INDEX `invoice_payment_customerId_fkey` ON `invoice_payment`;

-- DropIndex
DROP INDEX `invoice_payment_paymentNumber_key` ON `invoice_payment`;

-- DropIndex
DROP INDEX `kitchen_order_kotNumber_key` ON `kitchen_order`;

-- DropIndex
DROP INDEX `PaymentSettings_branchId_fkey` ON `payment_settings`;

-- DropIndex
DROP INDEX `PaymentSettings_createdByUserId_fkey` ON `payment_settings`;

-- DropIndex
DROP INDEX `PaymentSettings_updatedByUserId_fkey` ON `payment_settings`;

-- DropIndex
DROP INDEX `Product_billLockedByUserId_fkey` ON `product`;

-- DropIndex
DROP INDEX `Product_onlineLockedByUserId_fkey` ON `product`;

-- DropIndex
DROP INDEX `PurchaseOrder_status_idx` ON `purchase_order`;

-- DropIndex
DROP INDEX `UserMenuAccess_companyId_fkey` ON `usermenuaccess`;

-- DropIndex
DROP INDEX `VendorPayment_updatedByUserId_fkey` ON `vendor_payment`;

-- AlterTable
ALTER TABLE `accounting_invoice` MODIFY `notes` VARCHAR(191) NULL,
    MODIFY `terms` VARCHAR(191) NULL,
    MODIFY `dateOfSupply` DATETIME(3) NULL,
    MODIFY `billedToAddress` VARCHAR(191) NULL,
    MODIFY `shippedToAddress` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `advance_order` MODIFY `deliveryDate` DATETIME(3) NOT NULL,
    MODIFY `invoiceDate` DATETIME(3) NOT NULL,
    MODIFY `address` VARCHAR(191) NULL,
    MODIFY `remarks` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `backup_history` MODIFY `error` VARCHAR(191) NULL,
    MODIFY `cloudKey` VARCHAR(191) NULL,
    MODIFY `uploadStatus` VARCHAR(191) NOT NULL DEFAULT 'NOT_UPLOADED',
    MODIFY `remarks` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `backup_job` MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    MODIFY `error` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `branch` DROP COLUMN `address`,
    DROP COLUMN `addressLine1`,
    DROP COLUMN `addressLine2`,
    ADD COLUMN `addr1` VARCHAR(191) NULL,
    ADD COLUMN `addr2` VARCHAR(191) NULL,
    ADD COLUMN `billCopy` VARCHAR(191) NULL,
    ADD COLUMN `billNoReset` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `branchDisplayName` VARCHAR(191) NULL,
    ADD COLUMN `closingTime` VARCHAR(191) NULL,
    ADD COLUMN `cloudLogo` VARCHAR(191) NULL,
    ADD COLUMN `connectionString` VARCHAR(191) NULL,
    ADD COLUMN `couponPercent` VARCHAR(191) NULL,
    ADD COLUMN `couponValidity` VARCHAR(191) NULL,
    ADD COLUMN `couponVisible` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `customField1` VARCHAR(191) NULL,
    ADD COLUMN `customField2` VARCHAR(191) NULL,
    ADD COLUMN `dayEndAutoClosing` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `footerMsg` VARCHAR(191) NULL,
    ADD COLUMN `fssai` VARCHAR(191) NULL,
    ADD COLUMN `graceHours` VARCHAR(191) NULL,
    ADD COLUMN `gstSummary` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `indentApproval` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `industryID` VARCHAR(191) NULL,
    ADD COLUMN `isBarCodeBill` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `isDeptKOT` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `isSwiggy` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `isZomato` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `logo` VARCHAR(191) NULL,
    ADD COLUMN `openingTime` VARCHAR(191) NULL,
    ADD COLUMN `orderTypeBill` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `rewardPoint` VARCHAR(191) NULL,
    ADD COLUMN `textileGST` VARCHAR(191) NULL,
    ADD COLUMN `unitPriceEdit` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `website` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `cash_transaction` MODIFY `remarks` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `cloud_backup` MODIFY `cloudKey` VARCHAR(191) NOT NULL,
    MODIFY `cloudUrl` VARCHAR(191) NULL,
    MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    MODIFY `error` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `company` ADD COLUMN `autoNumberGeneration` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `barcodeSettings` VARCHAR(191) NULL,
    ADD COLUMN `city` VARCHAR(191) NULL,
    ADD COLUMN `country` VARCHAR(191) NULL DEFAULT 'India',
    ADD COLUMN `creditBillPrefix` VARCHAR(191) NULL DEFAULT 'CR',
    ADD COLUMN `currency` VARCHAR(191) NULL DEFAULT 'INR',
    ADD COLUMN `currencySymbol` VARCHAR(191) NULL DEFAULT '₹',
    ADD COLUMN `dateFormat` VARCHAR(191) NULL DEFAULT 'DD/MM/YYYY',
    ADD COLUMN `decimalPrecision` INTEGER NULL DEFAULT 2,
    ADD COLUMN `defaultBillingMode` VARCHAR(191) NULL DEFAULT 'WITH_GST',
    ADD COLUMN `defaultGstPercentage` DECIMAL(5, 2) NULL,
    ADD COLUMN `defaultPaymentMode` VARCHAR(191) NULL DEFAULT 'CASH',
    ADD COLUMN `defaultPrintTemplateId` INTEGER NULL,
    ADD COLUMN `defaultWarehouseId` INTEGER NULL,
    ADD COLUMN `estimatePrefix` VARCHAR(191) NULL DEFAULT 'EST',
    ADD COLUMN `financialYear` VARCHAR(191) NULL,
    ADD COLUMN `igstEnabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `invoicePrefix` VARCHAR(191) NULL DEFAULT 'INV',
    ADD COLUMN `language` VARCHAR(191) NULL DEFAULT 'en',
    ADD COLUMN `lowStockAlert` DECIMAL(10, 2) NULL,
    ADD COLUMN `negativeStockAllowed` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `panNumber` VARCHAR(191) NULL,
    ADD COLUMN `paperSize` VARCHAR(191) NULL DEFAULT 'A4',
    ADD COLUMN `pincode` VARCHAR(191) NULL,
    ADD COLUMN `printPreviewEnabled` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `timeZone` VARCHAR(191) NULL DEFAULT 'Asia/Kolkata',
    ADD COLUMN `website` VARCHAR(191) NULL,
    MODIFY `shortCode` VARCHAR(191) NULL,
    MODIFY `themePrimary` VARCHAR(191) NULL,
    MODIFY `themePrimaryDark` VARCHAR(191) NULL,
    MODIFY `themeAccent` VARCHAR(191) NULL,
    MODIFY `themeWarm` VARCHAR(191) NULL,
    MODIFY `themeBgDark` VARCHAR(191) NULL,
    MODIFY `themeBgDarker` VARCHAR(191) NULL,
    MODIFY `themeCardDark` VARCHAR(191) NULL,
    MODIFY `themeNavBg` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `customer` ADD COLUMN `addressLine2` VARCHAR(191) NULL,
    ADD COLUMN `alternatePhone` VARCHAR(191) NULL,
    ADD COLUMN `createdByUserId` INTEGER NULL,
    ADD COLUMN `creditDays` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `creditLimit` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `customerCode` VARCHAR(191) NULL,
    ADD COLUMN `panNumber` VARCHAR(191) NULL,
    ADD COLUMN `pincode` VARCHAR(191) NULL,
    ADD COLUMN `priceList` VARCHAR(191) NULL,
    ADD COLUMN `remarks` VARCHAR(191) NULL,
    ADD COLUMN `updatedByUserId` INTEGER NULL,
    ALTER COLUMN `companyId` DROP DEFAULT;

-- AlterTable
ALTER TABLE `expense` MODIFY `expenseNumber` VARCHAR(191) NOT NULL,
    MODIFY `expenseDate` DATETIME(3) NOT NULL,
    MODIFY `description` VARCHAR(191) NOT NULL,
    MODIFY `vendorInvoiceNo` VARCHAR(191) NULL,
    MODIFY `comments` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `expense_category` MODIFY `categoryName` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `invoice` ADD COLUMN `branchId` INTEGER NULL,
    ADD COLUMN `cashReceived` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `deleteReason` VARCHAR(191) NULL,
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `deletedByUserId` INTEGER NULL,
    ADD COLUMN `estimateId` INTEGER NULL,
    ADD COLUMN `paymentMode` VARCHAR(191) NULL,
    ADD COLUMN `remarks` VARCHAR(191) NULL,
    ADD COLUMN `salesPerson` VARCHAR(191) NULL,
    MODIFY `customerId` INTEGER NULL;

-- AlterTable
ALTER TABLE `product` ALTER COLUMN `companyId` DROP DEFAULT;

-- AlterTable
ALTER TABLE `quote` MODIFY `notes` VARCHAR(191) NULL,
    MODIFY `terms` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `restore_history` MODIFY `error` VARCHAR(191) NULL,
    MODIFY `logs` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` ALTER COLUMN `email` DROP DEFAULT,
    ALTER COLUMN `defaultCompanyId` DROP DEFAULT;

-- AlterTable
ALTER TABLE `vendor` ADD COLUMN `createdByUserId` INTEGER NULL,
    ADD COLUMN `updatedByUserId` INTEGER NULL;

-- AlterTable
ALTER TABLE `wa_balance_transaction` MODIFY `type` ENUM('RECHARGE', 'DEDUCT') NOT NULL DEFAULT 'RECHARGE';

-- AlterTable
ALTER TABLE `wa_campaign` MODIFY `status` ENUM('DRAFT', 'SCHEDULED', 'SENT', 'FAILED') NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE `wa_message` MODIFY `status` ENUM('DRAFT', 'PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED') NOT NULL DEFAULT 'PENDING',
    MODIFY `error` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `wa_template` MODIFY `body` VARCHAR(191) NOT NULL,
    MODIFY `sampleValues` VARCHAR(191) NOT NULL DEFAULT '[]',
    MODIFY `paramLabels` VARCHAR(191) NOT NULL DEFAULT '[]';

-- CreateTable
CREATE TABLE `stock_out` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stockOutNumber` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NOT NULL,
    `branchId` INTEGER NULL,
    `stockOutType` ENUM('PRODUCTION', 'DAMAGE', 'ADJUSTMENT', 'BRANCH_TRANSFER', 'OTHER') NOT NULL DEFAULT 'PRODUCTION',
    `referenceNumber` VARCHAR(191) NULL,
    `stockOutDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('PENDING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `notes` VARCHAR(191) NULL,
    `createdByUserId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `stock_out_companyId_stockOutNumber_key`(`companyId`, `stockOutNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_out_item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stockOutId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `quantity` DECIMAL(10, 2) NOT NULL,
    `rate` DECIMAL(10, 2) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_audit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `auditNumber` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NOT NULL,
    `branchId` INTEGER NULL,
    `auditType` ENUM('FULL', 'PARTIAL') NOT NULL DEFAULT 'FULL',
    `auditDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `auditor` VARCHAR(191) NOT NULL,
    `remarks` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `createdByUserId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `stock_audit_companyId_auditNumber_key`(`companyId`, `auditNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_audit_item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stockAuditId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `systemStock` DECIMAL(10, 2) NOT NULL,
    `physicalStock` DECIMAL(10, 2) NOT NULL,
    `difference` DECIMAL(10, 2) NOT NULL,
    `adjustmentType` VARCHAR(191) NOT NULL,
    `remarks` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `indent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `indentNumber` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NOT NULL,
    `branchId` INTEGER NULL,
    `indentDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `requestedBy` VARCHAR(191) NOT NULL,
    `department` VARCHAR(191) NOT NULL,
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM',
    `requiredDate` DATETIME(3) NULL,
    `remarks` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `createdByUserId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `indent_companyId_indentNumber_key`(`companyId`, `indentNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `indent_item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `indentId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `currentStock` DECIMAL(10, 2) NOT NULL,
    `requiredQty` DECIMAL(10, 2) NOT NULL,
    `remarks` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `print_template` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `templateName` VARCHAR(191) NOT NULL,
    `templateType` VARCHAR(191) NOT NULL DEFAULT 'BILL',
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `useDynamicPrint` BOOLEAN NOT NULL DEFAULT true,
    `showLogo` BOOLEAN NOT NULL DEFAULT false,
    `logoUrl` VARCHAR(191) NULL,
    `logoSize` VARCHAR(191) NOT NULL DEFAULT 'MEDIUM',
    `logoAlignment` VARCHAR(191) NOT NULL DEFAULT 'CENTER',
    `footerMessage` VARCHAR(191) NULL DEFAULT 'Thank you. Visit again.',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `print_template_field` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `templateId` INTEGER NOT NULL,
    `fieldKey` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `visible` BOOLEAN NOT NULL DEFAULT true,
    `bold` BOOLEAN NOT NULL DEFAULT false,
    `fontSize` INTEGER NOT NULL DEFAULT 10,
    `alignment` VARCHAR(191) NOT NULL DEFAULT 'LEFT',
    `displayOrder` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vendor_branch_mapping` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `vendorId` INTEGER NOT NULL,
    `branchId` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
    `effectiveFrom` DATETIME(3) NULL,
    `effectiveTo` DATETIME(3) NULL,
    `remarks` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdByUserId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `vendor_branch_mapping_companyId_vendorId_branchId_key`(`companyId`, `vendorId`, `branchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `admissionNumber` VARCHAR(191) NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NULL,
    `gender` VARCHAR(191) NULL,
    `dateOfBirth` DATETIME(3) NULL,
    `mobileNumber` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `course` VARCHAR(191) NULL,
    `department` VARCHAR(191) NULL,
    `class` VARCHAR(191) NULL,
    `section` VARCHAR(191) NULL,
    `academicYear` VARCHAR(191) NULL,
    `rollNumber` VARCHAR(191) NULL,
    `parentName` VARCHAR(191) NULL,
    `parentMobile` VARCHAR(191) NULL,
    `parentEmail` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `country` VARCHAR(191) NOT NULL DEFAULT 'India',
    `pincode` VARCHAR(191) NULL,
    `remarks` VARCHAR(191) NULL,
    `block` VARCHAR(191) NULL,
    `roomNo` VARCHAR(191) NULL,
    `wallet` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `fingerPrint` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdByUserId` INTEGER NOT NULL,
    `updatedByUserId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `student_companyId_rollNumber_key`(`companyId`, `rollNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `unit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `unitName` VARCHAR(191) NOT NULL,
    `shortName` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdByUserId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `unit_companyId_unitName_key`(`companyId`, `unitName`),
    UNIQUE INDEX `unit_companyId_shortName_key`(`companyId`, `shortName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `backup_setting_companyId_idx` ON `backup_setting`(`companyId`);

-- CreateIndex
CREATE INDEX `UserMenuAccess_userId_companyId_idx` ON `UserMenuAccess`(`userId`, `companyId`);

-- AddForeignKey
ALTER TABLE `hsn_sac` ADD CONSTRAINT `hsn_sac_defaultGstRateId_fkey` FOREIGN KEY (`defaultGstRateId`) REFERENCES `gst_master`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hsn_sac` ADD CONSTRAINT `hsn_sac_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hsn_sac` ADD CONSTRAINT `hsn_sac_updatedByUserId_fkey` FOREIGN KEY (`updatedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `company` ADD CONSTRAINT `company_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `company` ADD CONSTRAINT `company_updatedByUserId_fkey` FOREIGN KEY (`updatedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer` ADD CONSTRAINT `customer_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer` ADD CONSTRAINT `customer_updatedByUserId_fkey` FOREIGN KEY (`updatedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product` ADD CONSTRAINT `product_hsnSacId_fkey` FOREIGN KEY (`hsnSacId`) REFERENCES `hsn_sac`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product` ADD CONSTRAINT `product_billLockedByUserId_fkey` FOREIGN KEY (`billLockedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product` ADD CONSTRAINT `product_onlineLockedByUserId_fkey` FOREIGN KEY (`onlineLockedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice` ADD CONSTRAINT `invoice_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice` ADD CONSTRAINT `invoice_deletedByUserId_fkey` FOREIGN KEY (`deletedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice` ADD CONSTRAINT `invoice_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice` ADD CONSTRAINT `invoice_estimateId_fkey` FOREIGN KEY (`estimateId`) REFERENCES `estimate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice_payment` ADD CONSTRAINT `invoice_payment_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vendor` ADD CONSTRAINT `vendor_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vendor` ADD CONSTRAINT `vendor_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vendor` ADD CONSTRAINT `vendor_updatedByUserId_fkey` FOREIGN KEY (`updatedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_order` ADD CONSTRAINT `purchase_order_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_order` ADD CONSTRAINT `purchase_order_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `vendor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_order` ADD CONSTRAINT `purchase_order_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_order` ADD CONSTRAINT `purchase_order_approvedByUserId_fkey` FOREIGN KEY (`approvedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_order_item` ADD CONSTRAINT `purchase_order_item_purchaseOrderId_fkey` FOREIGN KEY (`purchaseOrderId`) REFERENCES `purchase_order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_order_item` ADD CONSTRAINT `purchase_order_item_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `goods_receipt` ADD CONSTRAINT `goods_receipt_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `goods_receipt` ADD CONSTRAINT `goods_receipt_purchaseOrderId_fkey` FOREIGN KEY (`purchaseOrderId`) REFERENCES `purchase_order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `goods_receipt` ADD CONSTRAINT `goods_receipt_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `vendor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `goods_receipt` ADD CONSTRAINT `goods_receipt_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `goods_receipt_item` ADD CONSTRAINT `goods_receipt_item_goodsReceiptId_fkey` FOREIGN KEY (`goodsReceiptId`) REFERENCES `goods_receipt`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `goods_receipt_item` ADD CONSTRAINT `goods_receipt_item_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_out` ADD CONSTRAINT `stock_out_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_out` ADD CONSTRAINT `stock_out_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_out_item` ADD CONSTRAINT `stock_out_item_stockOutId_fkey` FOREIGN KEY (`stockOutId`) REFERENCES `stock_out`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_out_item` ADD CONSTRAINT `stock_out_item_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_audit` ADD CONSTRAINT `stock_audit_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_audit` ADD CONSTRAINT `stock_audit_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_audit_item` ADD CONSTRAINT `stock_audit_item_stockAuditId_fkey` FOREIGN KEY (`stockAuditId`) REFERENCES `stock_audit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_audit_item` ADD CONSTRAINT `stock_audit_item_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `indent` ADD CONSTRAINT `indent_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `indent` ADD CONSTRAINT `indent_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `indent_item` ADD CONSTRAINT `indent_item_indentId_fkey` FOREIGN KEY (`indentId`) REFERENCES `indent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `indent_item` ADD CONSTRAINT `indent_item_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_ledger` ADD CONSTRAINT `inventory_ledger_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_ledger` ADD CONSTRAINT `inventory_ledger_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_invoice` ADD CONSTRAINT `purchase_invoice_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_invoice` ADD CONSTRAINT `purchase_invoice_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `vendor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_invoice` ADD CONSTRAINT `purchase_invoice_purchaseOrderId_fkey` FOREIGN KEY (`purchaseOrderId`) REFERENCES `purchase_order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_invoice` ADD CONSTRAINT `purchase_invoice_grnId_fkey` FOREIGN KEY (`grnId`) REFERENCES `goods_receipt`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_invoice` ADD CONSTRAINT `purchase_invoice_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vendor_payment` ADD CONSTRAINT `vendor_payment_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vendor_payment` ADD CONSTRAINT `vendor_payment_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `vendor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vendor_payment` ADD CONSTRAINT `vendor_payment_purchaseInvoiceId_fkey` FOREIGN KEY (`purchaseInvoiceId`) REFERENCES `purchase_invoice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vendor_payment` ADD CONSTRAINT `vendor_payment_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vendor_payment` ADD CONSTRAINT `vendor_payment_updatedByUserId_fkey` FOREIGN KEY (`updatedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `print_template` ADD CONSTRAINT `print_template_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `print_template_field` ADD CONSTRAINT `print_template_field_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `print_template`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `estimate` ADD CONSTRAINT `estimate_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vendor_branch_mapping` ADD CONSTRAINT `vendor_branch_mapping_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vendor_branch_mapping` ADD CONSTRAINT `vendor_branch_mapping_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `vendor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vendor_branch_mapping` ADD CONSTRAINT `vendor_branch_mapping_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vendor_branch_mapping` ADD CONSTRAINT `vendor_branch_mapping_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student` ADD CONSTRAINT `student_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student` ADD CONSTRAINT `student_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student` ADD CONSTRAINT `student_updatedByUserId_fkey` FOREIGN KEY (`updatedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expense` ADD CONSTRAINT `expense_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `vendor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expense` ADD CONSTRAINT `expense_updatedByUserId_fkey` FOREIGN KEY (`updatedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `day_closing` ADD CONSTRAINT `day_closing_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `day_closing` ADD CONSTRAINT `day_closing_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `day_closing` ADD CONSTRAINT `day_closing_closedByUserId_fkey` FOREIGN KEY (`closedByUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `day_closing` ADD CONSTRAINT `day_closing_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `day_closing` ADD CONSTRAINT `day_closing_updatedByUserId_fkey` FOREIGN KEY (`updatedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `advance_order` ADD CONSTRAINT `advance_order_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `advance_order` ADD CONSTRAINT `advance_order_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `advance_order` ADD CONSTRAINT `advance_order_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `advance_order` ADD CONSTRAINT `advance_order_updatedByUserId_fkey` FOREIGN KEY (`updatedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `advance_order_item` ADD CONSTRAINT `advance_order_item_advanceOrderId_fkey` FOREIGN KEY (`advanceOrderId`) REFERENCES `advance_order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `advance_order_item` ADD CONSTRAINT `advance_order_item_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `advance_order_item` ADD CONSTRAINT `advance_order_item_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_settings` ADD CONSTRAINT `payment_settings_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_settings` ADD CONSTRAINT `payment_settings_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_settings` ADD CONSTRAINT `payment_settings_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_settings` ADD CONSTRAINT `payment_settings_updatedByUserId_fkey` FOREIGN KEY (`updatedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `unit` ADD CONSTRAINT `unit_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `unit` ADD CONSTRAINT `unit_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserMenuAccess` ADD CONSTRAINT `UserMenuAccess_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserMenuAccess` ADD CONSTRAINT `UserMenuAccess_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `advance_order` RENAME INDEX `AdvanceOrder_companyId_orderNumber_key` TO `advance_order_companyId_orderNumber_key`;

-- RenameIndex
ALTER TABLE `day_closing` RENAME INDEX `DayClosing_companyId_branchId_businessDate_key` TO `day_closing_companyId_branchId_businessDate_key`;

-- RenameIndex
ALTER TABLE `goods_receipt` RENAME INDEX `GoodsReceipt_companyId_grnNumber_key` TO `goods_receipt_companyId_grnNumber_key`;

-- RenameIndex
ALTER TABLE `hsn_sac` RENAME INDEX `HSNSac_code_key` TO `hsn_sac_code_key`;

-- RenameIndex
ALTER TABLE `payment_settings` RENAME INDEX `PaymentSettings_companyId_branchId_key` TO `payment_settings_companyId_branchId_key`;

-- RenameIndex
ALTER TABLE `purchase_invoice` RENAME INDEX `PurchaseInvoice_companyId_invoiceNumber_key` TO `purchase_invoice_companyId_invoiceNumber_key`;

-- RenameIndex
ALTER TABLE `purchase_order` RENAME INDEX `PurchaseOrder_companyId_poNumber_key` TO `purchase_order_companyId_poNumber_key`;

-- RenameIndex
ALTER TABLE `vendor` RENAME INDEX `Vendor_companyId_vendorCode_key` TO `vendor_companyId_vendorCode_key`;

-- RenameIndex
ALTER TABLE `vendor_payment` RENAME INDEX `VendorPayment_companyId_paymentNumber_key` TO `vendor_payment_companyId_paymentNumber_key`;

-- RenameIndex
ALTER TABLE `wa_balance` RENAME INDEX `wa_balance_companyId_unique` TO `wa_balance_companyId_key`;
