-- AlterTable: Make purchaseOrderId nullable on GoodsReceipt
ALTER TABLE `goods_receipt` MODIFY COLUMN `purchaseOrderId` INT NULL;

-- AlterTable: Make orderedQty and pendingQty nullable on GoodsReceiptItem
ALTER TABLE `goods_receipt_item` MODIFY COLUMN `orderedQty` DECIMAL(10,2) NULL;
ALTER TABLE `goods_receipt_item` MODIFY COLUMN `pendingQty` DECIMAL(10,2) NULL;
