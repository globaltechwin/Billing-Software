-- CreateTable
CREATE TABLE `kitchen_order` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `kotNumber` VARCHAR(191) NOT NULL,
  `companyId` INT NOT NULL,
  `invoiceId` INT NOT NULL,
  `invoiceNumber` VARCHAR(191) NOT NULL,
  `customerId` INT NULL,
  `customerName` VARCHAR(191) NULL,
  `orderType` ENUM('DINE_IN','TAKE_AWAY','DELIVERY') NOT NULL DEFAULT 'DINE_IN',
  `orderStatus` ENUM('NEW','ACCEPTED','PREPARING','READY','SERVED') NOT NULL DEFAULT 'NEW',
  `priority` ENUM('LOW','NORMAL','HIGH','URGENT') NOT NULL DEFAULT 'NORMAL',
  `tableNumber` VARCHAR(191) NULL,
  `tokenNumber` VARCHAR(191) NULL,
  `orderTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `acceptedTime` DATETIME(3) NULL,
  `preparingTime` DATETIME(3) NULL,
  `readyTime` DATETIME(3) NULL,
  `servedTime` DATETIME(3) NULL,
  `notes` VARCHAR(191) NULL,
  `createdByUserId` INT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  UNIQUE INDEX `kitchen_order_kotNumber_key`(`kotNumber`),
  UNIQUE INDEX `kitchen_order_companyId_kotNumber_key`(`companyId`, `kotNumber`),
  INDEX `kitchen_order_companyId_fkey`(`companyId`),
  INDEX `kitchen_order_invoiceId_fkey`(`invoiceId`),
  INDEX `kitchen_order_createdByUserId_fkey`(`createdByUserId`),
  CONSTRAINT `kitchen_order_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `kitchen_order_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `invoice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `kitchen_order_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kitchen_order_item` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `kitchenOrderId` INT NOT NULL,
  `productId` INT NOT NULL,
  `productNameSnapshot` VARCHAR(191) NOT NULL,
  `quantity` DECIMAL(10, 2) NOT NULL,
  `unit` VARCHAR(191) NULL,
  `specialInstructions` VARCHAR(191) NULL,
  `itemStatus` ENUM('NEW','ACCEPTED','PREPARING','READY','SERVED') NOT NULL DEFAULT 'NEW',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  INDEX `kitchen_order_item_kitchenOrderId_fkey`(`kitchenOrderId`),
  INDEX `kitchen_order_item_productId_fkey`(`productId`),
  CONSTRAINT `kitchen_order_item_kitchenOrderId_fkey` FOREIGN KEY (`kitchenOrderId`) REFERENCES `kitchen_order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `kitchen_order_item_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
