-- AlterTable: Company
ALTER TABLE `Company` ADD COLUMN `tableTypes` JSON NULL,
                      ADD COLUMN `orderTypes` JSON NULL,
                      ADD COLUMN `productCategories` JSON NULL;

-- AlterTable: UserCompany
ALTER TABLE `UserCompany` ADD COLUMN `tableTypes` JSON NULL,
                          ADD COLUMN `productCategories` JSON NULL,
                          ADD COLUMN `orderTypes` JSON NULL;
