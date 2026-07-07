-- CreateTable
CREATE TABLE `CompanySettings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'company',
    `name` VARCHAR(191) NOT NULL DEFAULT 'HydroStock Pro',
    `address` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `nuit` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `logo` LONGTEXT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
