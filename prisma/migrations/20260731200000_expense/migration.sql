-- CreateTable
CREATE TABLE `expense_category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `categoryName` VARCHAR(255) NOT NULL,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdByUserId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`),
    UNIQUE INDEX `expense_category_companyId_categoryName_key`(`companyId`, `categoryName`),
    INDEX `expense_category_companyId_fkey`(`companyId`),
    INDEX `expense_category_createdByUserId_fkey`(`createdByUserId`),
    CONSTRAINT `expense_category_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `expense_category_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `expense` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `expenseNumber` VARCHAR(255) NOT NULL,
    `expenseCategoryId` INTEGER NOT NULL,
    `expenseDate` DATETIME NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `vendorId` INTEGER NULL,
    `vendorInvoiceNo` VARCHAR(255) NULL,
    `comments` VARCHAR(500) NULL,
    `createdByUserId` INTEGER NOT NULL,
    `updatedByUserId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`),
    UNIQUE INDEX `expense_companyId_expenseNumber_key`(`companyId`, `expenseNumber`),
    INDEX `expense_expenseCategoryId_fkey`(`expenseCategoryId`),
    INDEX `expense_vendorId_fkey`(`vendorId`),
    INDEX `expense_createdByUserId_fkey`(`createdByUserId`),
    INDEX `expense_updatedByUserId_fkey`(`updatedByUserId`),
    CONSTRAINT `expense_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `expense_expenseCategoryId_fkey` FOREIGN KEY (`expenseCategoryId`) REFERENCES `expense_category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `expense_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `vendor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `expense_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `expense_updatedByUserId_fkey` FOREIGN KEY (`updatedByUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
