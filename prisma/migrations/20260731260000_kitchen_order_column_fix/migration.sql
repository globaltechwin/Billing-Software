-- Fix kitchen_order / kitchen_order_item columns to match Prisma schema (camelCase).
-- Tables were previously created with hand-written snake_case DDL that did not match the schema.

ALTER TABLE `kitchen_order`
  RENAME COLUMN `kot_number` TO `kotNumber`,
  RENAME COLUMN `company_id` TO `companyId`,
  RENAME COLUMN `invoice_id` TO `invoiceId`,
  RENAME COLUMN `invoice_number` TO `invoiceNumber`,
  RENAME COLUMN `customer_id` TO `customerId`,
  RENAME COLUMN `customer_name` TO `customerName`,
  RENAME COLUMN `order_type` TO `orderType`,
  RENAME COLUMN `order_status` TO `orderStatus`,
  RENAME COLUMN `table_number` TO `tableNumber`,
  RENAME COLUMN `token_number` TO `tokenNumber`,
  RENAME COLUMN `order_time` TO `orderTime`,
  RENAME COLUMN `accepted_time` TO `acceptedTime`,
  RENAME COLUMN `preparing_time` TO `preparingTime`,
  RENAME COLUMN `ready_time` TO `readyTime`,
  RENAME COLUMN `served_time` TO `servedTime`,
  RENAME COLUMN `created_by_user_id` TO `createdByUserId`,
  RENAME COLUMN `created_at` TO `createdAt`,
  RENAME COLUMN `updated_at` TO `updatedAt`;

ALTER TABLE `kitchen_order_item`
  RENAME COLUMN `kitchen_order_id` TO `kitchenOrderId`,
  RENAME COLUMN `product_id` TO `productId`,
  RENAME COLUMN `product_name_snapshot` TO `productNameSnapshot`,
  RENAME COLUMN `item_status` TO `itemStatus`,
  RENAME COLUMN `special_instructions` TO `specialInstructions`,
  RENAME COLUMN `created_at` TO `createdAt`,
  RENAME COLUMN `updated_at` TO `updatedAt`;
