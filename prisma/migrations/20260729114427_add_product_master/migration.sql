-- CreateTable
CREATE TABLE `product` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productName` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `productCode` VARCHAR(191) NULL,
    `barcode` VARCHAR(191) NULL,
    `hsnCode` VARCHAR(191) NULL,
    `category` VARCHAR(191) NULL,
    `unit` VARCHAR(191) NOT NULL,
    `purchasePrice` DECIMAL(10, 2) NOT NULL,
    `sellingPrice` DECIMAL(10, 2) NOT NULL,
    `gstMasterId` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `product` ADD CONSTRAINT `product_gstMasterId_fkey` FOREIGN KEY (`gstMasterId`) REFERENCES `gst_master`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
