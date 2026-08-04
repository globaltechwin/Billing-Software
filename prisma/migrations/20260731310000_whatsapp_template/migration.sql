-- CreateTable
CREATE TABLE `wa_template` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `language` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `header` VARCHAR(191) NULL,
    `body` TEXT NOT NULL,
    `footer` VARCHAR(191) NULL,
    `params` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'DRAFT',
    `lastSyncAt` DATETIME(3) NULL,
    `sampleValues` TEXT NOT NULL CHECK (`sampleValues` IS NOT NULL),
    `paramLabels` TEXT NOT NULL CHECK (`paramLabels` IS NOT NULL),
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `createdByUserId` INTEGER NULL,
    `updatedByUserId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `wa_template_companyId_name_key`(`companyId`, `name`),
    INDEX `wa_template_companyId_idx`(`companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `wa_template` ADD CONSTRAINT `wa_template_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wa_template` ADD CONSTRAINT `wa_template_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wa_template` ADD CONSTRAINT `wa_template_updatedByUserId_fkey` FOREIGN KEY (`updatedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
