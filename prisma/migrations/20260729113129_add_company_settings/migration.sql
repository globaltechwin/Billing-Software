-- CreateTable
CREATE TABLE `company` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyName` VARCHAR(191) NOT NULL,
    `logo` VARCHAR(191) NULL,
    `address` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `gstNumber` VARCHAR(191) NULL,
    `gstStateCode` VARCHAR(191) NULL,
    `stateName` VARCHAR(191) NOT NULL,
    `gstEnabled` BOOLEAN NOT NULL DEFAULT true,
    `gstMode` ENUM('GST_VISIBLE', 'GST_INCLUDED_HIDDEN', 'NO_GST') NOT NULL DEFAULT 'GST_VISIBLE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
