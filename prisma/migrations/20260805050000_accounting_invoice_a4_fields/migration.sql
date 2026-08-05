-- AlterTable
ALTER TABLE `accounting_invoice`
  ADD COLUMN `challanNo` VARCHAR(191) NULL,
  ADD COLUMN `transportationMode` VARCHAR(191) NULL,
  ADD COLUMN `vehicleNo` VARCHAR(191) NULL,
  ADD COLUMN `dateOfSupply` DATETIME NULL,
  ADD COLUMN `placeOfSupply` VARCHAR(191) NULL,
  ADD COLUMN `billedToName` VARCHAR(191) NULL,
  ADD COLUMN `billedToAddress` TEXT NULL,
  ADD COLUMN `billedToGstin` VARCHAR(191) NULL,
  ADD COLUMN `billedToState` VARCHAR(191) NULL,
  ADD COLUMN `billedToStateCode` VARCHAR(191) NULL,
  ADD COLUMN `shippedToName` VARCHAR(191) NULL,
  ADD COLUMN `shippedToAddress` TEXT NULL,
  ADD COLUMN `shippedToState` VARCHAR(191) NULL,
  ADD COLUMN `shippedToStateCode` VARCHAR(191) NULL,
  ADD COLUMN `bankAccountHolder` VARCHAR(191) NULL,
  ADD COLUMN `bankAccountNumber` VARCHAR(191) NULL,
  ADD COLUMN `bankIfsc` VARCHAR(191) NULL,
  ADD COLUMN `bankName` VARCHAR(191) NULL,
  ADD COLUMN `bankBranch` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `accounting_invoice_item` ADD COLUMN `unit` VARCHAR(191) NULL;
