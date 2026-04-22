-- Drop foreign key constraint from contract_items to product_price_plans
ALTER TABLE "contract_items" DROP CONSTRAINT IF EXISTS "contract_items_price_plan_id_fkey";

-- Drop columns from contract_items that reference price plans
ALTER TABLE "contract_items"
DROP COLUMN IF EXISTS "price_plan_id",
DROP COLUMN IF EXISTS "interest_rate",
DROP COLUMN IF EXISTS "monthly_price",
DROP COLUMN IF EXISTS "base_price";

-- Rename unit_price column if it doesn't exist (it will be added by Prisma)
ALTER TABLE "contract_items"
ADD COLUMN IF NOT EXISTS "unit_price" DECIMAL(15,2) NOT NULL DEFAULT 0;

-- Drop product_price_plans table completely
DROP TABLE IF EXISTS "product_price_plans";
