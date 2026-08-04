-- CreateTable
CREATE TABLE `production_plan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `planNo` VARCHAR(191) NOT NULL,
    `productionCategory` VARCHAR(191) NOT NULL,
    `requestDate` DATETIME(3) NOT NULL,
    `remarks` VARCHAR(191) NULL,
    `numberOfProducts` INTEGER NOT NULL DEFAULT 0,
    `createdByUserId` INTEGER NULL,
    `updatedByUserId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `production_plan_companyId_planNo_key`(`companyId`, `planNo`),
    INDEX `production_plan_requestDate_idx`(`requestDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `production_plan_item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productionPlanId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `quantity` DECIMAL(12,3) NOT NULL,
    `price` DECIMAL(12,2) NOT NULL,
    `totalPrice` DECIMAL(12,2) NOT NULL,
    `companyId` INTEGER NOT NULL,

    INDEX `production_plan_item_productId_idx`(`productId`),
    INDEX `production_plan_item_companyId_idx`(`companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `production_plan` ADD CONSTRAINT `production_plan_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_plan` ADD CONSTRAINT `production_plan_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_plan` ADD CONSTRAINT `production_plan_updatedByUserId_fkey` FOREIGN KEY (`updatedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_plan_item` ADD CONSTRAINT `production_plan_item_productionPlanId_fkey` FOREIGN KEY (`productionPlanId`) REFERENCES `production_plan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_plan_item` ADD CONSTRAINT `production_plan_item_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_plan_item` ADD CONSTRAINT `production_plan_item_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
