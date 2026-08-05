-- CreateTable
CREATE TABLE `held_bill` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `holdNumber` VARCHAR(191) NOT NULL,
    `customerId` INTEGER NULL,
    `customerName` VARCHAR(191) NULL,
    `items` JSON NOT NULL,
    `subtotal` DECIMAL(12, 2) NOT NULL,
    `taxAmount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `discountAmount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `grandTotal` DECIMAL(12, 2) NOT NULL,
    `gstMode` VARCHAR(191) NULL,
    `gstRate` DECIMAL(5, 2) NULL,
    `paymentMode` VARCHAR(191) NULL,
    `remarks` VARCHAR(191) NULL,
    `salesPerson` VARCHAR(191) NULL,
    `createdByUserId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `held_bill_companyId_holdNumber_key`(`companyId`, `holdNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `held_bill` ADD CONSTRAINT `held_bill_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `held_bill` ADD CONSTRAINT `held_bill_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
