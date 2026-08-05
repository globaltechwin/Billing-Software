-- Vendor & Purchase Management Module Migration

-- 1. Add stock fields to Product
ALTER TABLE `product` ADD COLUMN `currentStock` DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE `product` ADD COLUMN `minimumStock` DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE `product` ADD COLUMN `maximumStock` DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE `product` ADD COLUMN `reorderLevel` DECIMAL(10,2) NOT NULL DEFAULT 0;

-- 2. Vendor table

CREATE TABLE `vendor` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `companyId` INT NOT NULL,
  `vendorCode` VARCHAR(191) NOT NULL,
  `vendorName` VARCHAR(191) NOT NULL,
  `contactPerson` VARCHAR(191) NULL,
  `mobileNumber` VARCHAR(191) NOT NULL,
  `alternateMobile` VARCHAR(191) NULL,
  `email` VARCHAR(191) NULL,
  `gstNumber` VARCHAR(191) NULL,
  `panNumber` VARCHAR(191) NULL,
  `address` VARCHAR(191) NULL,
  `city` VARCHAR(191) NULL,
  `state` VARCHAR(191) NULL,
  `stateCode` VARCHAR(191) NULL,
  `country` VARCHAR(191) NOT NULL DEFAULT 'India',
  `postalCode` VARCHAR(191) NULL,
  `paymentTerms` VARCHAR(191) NULL,
  `creditLimit` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `openingBalance` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `currentBalance` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Vendor_companyId_vendorCode_key` (`companyId`, `vendorCode`),
  INDEX `Vendor_companyId_idx` (`companyId`),
  CONSTRAINT `Vendor_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- (GST unique handled at application level for nullable columns)

-- 3. Purchase Order
CREATE TABLE `purchase_order` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `poNumber` VARCHAR(191) NOT NULL,
  `companyId` INT NOT NULL,
  `vendorId` INT NOT NULL,
  `branchId` INT NULL,
  `orderDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `expectedDelivery` DATETIME(3) NULL,
  `status` ENUM('DRAFT','PENDING','APPROVED','PARTIALLY_RECEIVED','COMPLETED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
  `subtotal` DECIMAL(12,2) NOT NULL,
  `discountAmount` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `taxAmount` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `grandTotal` DECIMAL(12,2) NOT NULL,
  `notes` VARCHAR(191) NULL,
  `createdByUserId` INT NOT NULL,
  `approvedByUserId` INT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `PurchaseOrder_companyId_poNumber_key` (`companyId`, `poNumber`),
  INDEX `PurchaseOrder_companyId_idx` (`companyId`),
  INDEX `PurchaseOrder_vendorId_idx` (`vendorId`),
  INDEX `PurchaseOrder_status_idx` (`status`),
  CONSTRAINT `PurchaseOrder_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `PurchaseOrder_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `vendor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `PurchaseOrder_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `PurchaseOrder_approvedByUserId_fkey` FOREIGN KEY (`approvedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Purchase Order Items
CREATE TABLE `purchase_order_item` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `purchaseOrderId` INT NOT NULL,
  `productId` INT NOT NULL,
  `quantity` DECIMAL(10,2) NOT NULL,
  `receivedQty` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `unit` VARCHAR(191) NOT NULL,
  `purchasePrice` DECIMAL(10,2) NOT NULL,
  `discount` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `gstPercentage` DECIMAL(5,2) NOT NULL,
  `cgstAmount` DECIMAL(12,2) NOT NULL,
  `sgstAmount` DECIMAL(12,2) NOT NULL,
  `igstAmount` DECIMAL(12,2) NOT NULL,
  `taxAmount` DECIMAL(12,2) NOT NULL,
  `lineTotal` DECIMAL(12,2) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `PurchaseOrderItem_purchaseOrderId_idx` (`purchaseOrderId`),
  INDEX `PurchaseOrderItem_productId_idx` (`productId`),
  CONSTRAINT `PurchaseOrderItem_purchaseOrderId_fkey` FOREIGN KEY (`purchaseOrderId`) REFERENCES `purchase_order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `PurchaseOrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Goods Receipt
CREATE TABLE `goods_receipt` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `grnNumber` VARCHAR(191) NOT NULL,
  `companyId` INT NOT NULL,
  `purchaseOrderId` INT NOT NULL,
  `vendorId` INT NOT NULL,
  `branchId` INT NULL,
  `receiptDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `status` ENUM('PENDING','PARTIAL','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `notes` VARCHAR(191) NULL,
  `createdByUserId` INT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `GoodsReceipt_companyId_grnNumber_key` (`companyId`, `grnNumber`),
  INDEX `GoodsReceipt_companyId_idx` (`companyId`),
  INDEX `GoodsReceipt_purchaseOrderId_idx` (`purchaseOrderId`),
  CONSTRAINT `GoodsReceipt_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `GoodsReceipt_purchaseOrderId_fkey` FOREIGN KEY (`purchaseOrderId`) REFERENCES `purchase_order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `GoodsReceipt_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `vendor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `GoodsReceipt_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Goods Receipt Items
CREATE TABLE `goods_receipt_item` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `goodsReceiptId` INT NOT NULL,
  `productId` INT NOT NULL,
  `orderedQty` DECIMAL(10,2) NOT NULL,
  `receivedQty` DECIMAL(10,2) NOT NULL,
  `pendingQty` DECIMAL(10,2) NOT NULL,
  `batchNumber` VARCHAR(191) NULL,
  `expiryDate` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `GoodsReceiptItem_goodsReceiptId_idx` (`goodsReceiptId`),
  INDEX `GoodsReceiptItem_productId_idx` (`productId`),
  CONSTRAINT `GoodsReceiptItem_goodsReceiptId_fkey` FOREIGN KEY (`goodsReceiptId`) REFERENCES `goods_receipt`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `GoodsReceiptItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Inventory Ledger
CREATE TABLE `inventory_ledger` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `companyId` INT NOT NULL,
  `productId` INT NOT NULL,
  `branchId` INT NULL,
  `quantityIn` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `quantityOut` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `balance` DECIMAL(10,2) NOT NULL,
  `referenceType` ENUM('OPENING_STOCK','PURCHASE','SALE','SALES_RETURN','PURCHASE_RETURN','DAMAGE','ADJUSTMENT','PRODUCTION_IN','PRODUCTION_OUT') NOT NULL,
  `referenceId` INT NOT NULL,
  `referenceNumber` VARCHAR(191) NULL,
  `notes` VARCHAR(191) NULL,
  `createdByUserId` INT NOT NULL,
  `movementDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `InventoryLedger_companyId_idx` (`companyId`),
  INDEX `InventoryLedger_productId_idx` (`productId`),
  INDEX `InventoryLedger_referenceType_referenceId_idx` (`referenceType`, `referenceId`),
  CONSTRAINT `InventoryLedger_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `InventoryLedger_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `InventoryLedger_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Purchase Invoice
CREATE TABLE `purchase_invoice` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `invoiceNumber` VARCHAR(191) NOT NULL,
  `vendorInvoiceNo` VARCHAR(191) NULL,
  `companyId` INT NOT NULL,
  `vendorId` INT NOT NULL,
  `branchId` INT NULL,
  `purchaseOrderId` INT NULL,
  `grnId` INT NULL,
  `invoiceDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `subtotal` DECIMAL(12,2) NOT NULL,
  `taxAmount` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `grandTotal` DECIMAL(12,2) NOT NULL,
  `paymentStatus` ENUM('PENDING','PARTIALLY_PAID','PAID') NOT NULL DEFAULT 'PENDING',
  `notes` VARCHAR(191) NULL,
  `createdByUserId` INT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `PurchaseInvoice_companyId_invoiceNumber_key` (`companyId`, `invoiceNumber`),
  INDEX `PurchaseInvoice_companyId_idx` (`companyId`),
  INDEX `PurchaseInvoice_vendorId_idx` (`vendorId`),
  CONSTRAINT `PurchaseInvoice_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `PurchaseInvoice_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `vendor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `PurchaseInvoice_purchaseOrderId_fkey` FOREIGN KEY (`purchaseOrderId`) REFERENCES `purchase_order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `PurchaseInvoice_grnId_fkey` FOREIGN KEY (`grnId`) REFERENCES `goods_receipt`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `PurchaseInvoice_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Vendor Payment
CREATE TABLE `vendor_payment` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `paymentNumber` VARCHAR(191) NOT NULL,
  `companyId` INT NOT NULL,
  `vendorId` INT NOT NULL,
  `purchaseInvoiceId` INT NULL,
  `paymentDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `amount` DECIMAL(12,2) NOT NULL,
  `paymentMethod` ENUM('CASH','BANK','UPI','CARD','CHEQUE') NOT NULL,
  `referenceNumber` VARCHAR(191) NULL,
  `notes` VARCHAR(191) NULL,
  `createdByUserId` INT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `VendorPayment_companyId_paymentNumber_key` (`companyId`, `paymentNumber`),
  INDEX `VendorPayment_companyId_idx` (`companyId`),
  INDEX `VendorPayment_vendorId_idx` (`vendorId`),
  CONSTRAINT `VendorPayment_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `VendorPayment_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `vendor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `VendorPayment_purchaseInvoiceId_fkey` FOREIGN KEY (`purchaseInvoiceId`) REFERENCES `purchase_invoice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `VendorPayment_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
