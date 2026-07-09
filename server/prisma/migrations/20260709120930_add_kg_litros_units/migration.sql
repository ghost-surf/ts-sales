-- AlterTable
ALTER TABLE `Category` MODIFY `unit` ENUM('metros', 'pcs', 'kg', 'litros') NULL;

-- AlterTable
ALTER TABLE `Product` MODIFY `unit` ENUM('metros', 'pcs', 'kg', 'litros') NOT NULL;

-- AlterTable
ALTER TABLE `DocumentItem` MODIFY `unit` ENUM('metros', 'pcs', 'kg', 'litros') NULL;

-- AlterTable
ALTER TABLE `StockMovement` MODIFY `unit` ENUM('metros', 'pcs', 'kg', 'litros') NOT NULL;
