-- AlterTable
ALTER TABLE `company` ADD COLUMN `bankAccountHolder` VARCHAR(191) NULL,
    ADD COLUMN `bankAccountNumber` VARCHAR(191) NULL,
    ADD COLUMN `bankIfsc` VARCHAR(191) NULL,
    ADD COLUMN `bankName` VARCHAR(191) NULL,
    ADD COLUMN `bankBranch` VARCHAR(191) NULL;
