-- AlterTable
ALTER TABLE `counter` MODIFY `type` ENUM('FACT', 'COT', 'REC', 'NC', 'EST') NOT NULL;

-- AlterTable
ALTER TABLE `payment` ADD COLUMN `kind` ENUM('payment', 'reversal') NOT NULL DEFAULT 'payment',
    MODIFY `method` ENUM('numerario', 'cheque', 'transferencia') NOT NULL;

-- CreateTable
CREATE TABLE `CreditNote` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `documentId` VARCHAR(191) NOT NULL,
    `operatorId` VARCHAR(191) NOT NULL,
    `total` DECIMAL(10, 2) NOT NULL,
    `reason` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `CreditNote_code_key`(`code`),
    UNIQUE INDEX `CreditNote_documentId_key`(`documentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CreditNote` ADD CONSTRAINT `CreditNote_documentId_fkey` FOREIGN KEY (`documentId`) REFERENCES `Document`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreditNote` ADD CONSTRAINT `CreditNote_operatorId_fkey` FOREIGN KEY (`operatorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
