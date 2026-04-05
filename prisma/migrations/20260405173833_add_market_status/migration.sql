/*
  Warnings:

  - The values [STAFF] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - The values [DEBT] on the enum `TransactionType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `customer_id` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `market_id` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the `balances` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[market_id,phone]` on the table `customers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contract_id` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `staff_id` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "InstallmentStatus" AS ENUM ('PENDING', 'DUE', 'PAID', 'OVERDUE', 'PARTIAL');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('SMS', 'TELEGRAM', 'PUSH');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "NotificationReason" AS ENUM ('INSTALLMENT_REMINDER', 'INSTALLMENT_DUE', 'INSTALLMENT_OVERDUE', 'CONTRACT_SIGNED', 'CONTRACT_CREATED', 'SUBSCRIPTION_EXPIRING');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('PASSPORT', 'SELFIE', 'INCOME_PROOF', 'OTHER');

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('OWNER', 'ADMIN', 'MANAGER', 'SELLER');
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TransactionType_new" AS ENUM ('PAYMENT', 'DOWNPAYMENT', 'PENALTY', 'REFUND');
ALTER TABLE "transactions" ALTER COLUMN "type" TYPE "TransactionType_new" USING ("type"::text::"TransactionType_new");
ALTER TYPE "TransactionType" RENAME TO "TransactionType_old";
ALTER TYPE "TransactionType_new" RENAME TO "TransactionType";
DROP TYPE "TransactionType_old";
COMMIT;

-- AlterEnum
ALTER TYPE "UserStatus" ADD VALUE 'INACTIVE';

-- DropForeignKey
ALTER TABLE "balances" DROP CONSTRAINT "balances_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_market_id_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_user_id_fkey";

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "address" VARCHAR(255),
ADD COLUMN     "birth_date" TIMESTAMP(3),
ADD COLUMN     "note" TEXT,
ADD COLUMN     "passport_seria" VARCHAR(20);

-- AlterTable
ALTER TABLE "subscription_plans" ADD COLUMN     "description" TEXT,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "customer_id",
DROP COLUMN "description",
DROP COLUMN "market_id",
DROP COLUMN "user_id",
ADD COLUMN     "contract_id" UUID NOT NULL,
ADD COLUMN     "installment_id" UUID,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "staff_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;

-- DropTable
DROP TABLE "balances";

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "market_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "market_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "base_price" DECIMAL(15,2) NOT NULL,
    "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_price_plans" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "term_months" INTEGER NOT NULL,
    "interest_rate" DECIMAL(5,2) NOT NULL,
    "total_price" DECIMAL(15,2) NOT NULL,
    "monthly_price" DECIMAL(15,2) NOT NULL,

    CONSTRAINT "product_price_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" UUID NOT NULL,
    "contract_number" TEXT NOT NULL,
    "market_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "staff_id" UUID NOT NULL,
    "term_months" INTEGER NOT NULL,
    "down_payment" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(15,2) NOT NULL,
    "monthly_amount" DECIMAL(15,2) NOT NULL,
    "paid_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "remain_amount" DECIMAL(15,2) NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" "ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "note" TEXT,
    "sign_token" VARCHAR(100),
    "sign_token_expiry" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_items" (
    "id" UUID NOT NULL,
    "contract_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "price_plan_id" UUID NOT NULL,
    "product_name" VARCHAR(200) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "base_price" DECIMAL(15,2) NOT NULL,
    "interest_rate" DECIMAL(5,2) NOT NULL,
    "total_price" DECIMAL(15,2) NOT NULL,
    "monthly_price" DECIMAL(15,2) NOT NULL,

    CONSTRAINT "contract_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "installments" (
    "id" UUID NOT NULL,
    "contract_id" UUID NOT NULL,
    "order_index" INTEGER NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "paid_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "status" "InstallmentStatus" NOT NULL DEFAULT 'PENDING',
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "installments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signatures" (
    "id" UUID NOT NULL,
    "contract_id" UUID NOT NULL,
    "signature_url" TEXT NOT NULL,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "signed_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "signatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "contract_id" UUID,
    "installment_id" UUID,
    "channel" "NotificationChannel" NOT NULL,
    "reason" "NotificationReason" NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3),
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "type" "DocumentType" NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size" INTEGER,
    "mime_type" VARCHAR(100),
    "uploaded_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_market_id_name_key" ON "categories"("market_id", "name");

-- CreateIndex
CREATE INDEX "products_market_id_idx" ON "products"("market_id");

-- CreateIndex
CREATE INDEX "products_category_id_idx" ON "products"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_price_plans_product_id_term_months_key" ON "product_price_plans"("product_id", "term_months");

-- CreateIndex
CREATE UNIQUE INDEX "contracts_contract_number_key" ON "contracts"("contract_number");

-- CreateIndex
CREATE UNIQUE INDEX "contracts_sign_token_key" ON "contracts"("sign_token");

-- CreateIndex
CREATE INDEX "contracts_market_id_idx" ON "contracts"("market_id");

-- CreateIndex
CREATE INDEX "contracts_customer_id_idx" ON "contracts"("customer_id");

-- CreateIndex
CREATE INDEX "contracts_status_idx" ON "contracts"("status");

-- CreateIndex
CREATE INDEX "installments_contract_id_idx" ON "installments"("contract_id");

-- CreateIndex
CREATE INDEX "installments_due_date_idx" ON "installments"("due_date");

-- CreateIndex
CREATE INDEX "installments_status_idx" ON "installments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "signatures_contract_id_key" ON "signatures"("contract_id");

-- CreateIndex
CREATE INDEX "notifications_customer_id_idx" ON "notifications"("customer_id");

-- CreateIndex
CREATE INDEX "notifications_contract_id_idx" ON "notifications"("contract_id");

-- CreateIndex
CREATE INDEX "notifications_installment_id_idx" ON "notifications"("installment_id");

-- CreateIndex
CREATE INDEX "notifications_status_idx" ON "notifications"("status");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateIndex
CREATE INDEX "documents_customer_id_idx" ON "documents"("customer_id");

-- CreateIndex
CREATE INDEX "customers_market_id_idx" ON "customers"("market_id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_market_id_phone_key" ON "customers"("market_id", "phone");

-- CreateIndex
CREATE INDEX "transactions_contract_id_idx" ON "transactions"("contract_id");

-- CreateIndex
CREATE INDEX "transactions_created_at_idx" ON "transactions"("created_at");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_market_id_fkey" FOREIGN KEY ("market_id") REFERENCES "markets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_market_id_fkey" FOREIGN KEY ("market_id") REFERENCES "markets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_price_plans" ADD CONSTRAINT "product_price_plans_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_market_id_fkey" FOREIGN KEY ("market_id") REFERENCES "markets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_items" ADD CONSTRAINT "contract_items_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_items" ADD CONSTRAINT "contract_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_items" ADD CONSTRAINT "contract_items_price_plan_id_fkey" FOREIGN KEY ("price_plan_id") REFERENCES "product_price_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "installments" ADD CONSTRAINT "installments_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_installment_id_fkey" FOREIGN KEY ("installment_id") REFERENCES "installments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signatures" ADD CONSTRAINT "signatures_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_installment_id_fkey" FOREIGN KEY ("installment_id") REFERENCES "installments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
