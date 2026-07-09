-- AlterTable
ALTER TABLE `CompanySettings` ADD COLUMN `bankAccountHolder` VARCHAR(191) NULL,
    ADD COLUMN `bankIban` VARCHAR(191) NULL,
    ADD COLUMN `bankName` VARCHAR(191) NULL;
