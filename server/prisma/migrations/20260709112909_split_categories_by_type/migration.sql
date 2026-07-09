-- AlterTable
ALTER TABLE `Category`
    ADD COLUMN `type` ENUM('product', 'service') NOT NULL DEFAULT 'product',
    MODIFY `unit` ENUM('metros', 'pcs') NULL;

-- CreateIndex
CREATE INDEX `Category_type_idx` ON `Category`(`type`);

-- Heuristic for existing data: a category used exclusively by services (never by products)
-- becomes a service category; its unit (irrelevant for services) is cleared. Everything else
-- (product-only or empty/unused categories) keeps the 'product' default.
UPDATE `Category` c
SET c.type = 'service', c.unit = NULL
WHERE EXISTS (SELECT 1 FROM `Service` s WHERE s.categoryId = c.id)
  AND NOT EXISTS (SELECT 1 FROM `Product` p WHERE p.categoryId = c.id);
