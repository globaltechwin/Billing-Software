-- AlterTable
ALTER TABLE `accounting_invoice` ADD COLUMN `gstType` VARCHAR(191) NOT NULL DEFAULT 'CGST_SGST';
