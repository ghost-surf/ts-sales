-- AlterTable
ALTER TABLE `StockMovement` ADD COLUMN `operatorId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `StockMovement_operatorId_idx` ON `StockMovement`(`operatorId`);

-- AddForeignKey
ALTER TABLE `StockMovement` ADD CONSTRAINT `StockMovement_operatorId_fkey` FOREIGN KEY (`operatorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
