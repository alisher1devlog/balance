/*
  Warnings:

  - You are about to drop the column `market_name` on the `markets` table. All the data in the column will be lost.
  - You are about to drop the column `max_markets` on the `subscription_plans` table. All the data in the column will be lost.
  - You are about to drop the column `subscription_name` on the `subscription_plans` table. All the data in the column will be lost.
  - The `status` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `markets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `subscription_plans` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "markets" DROP COLUMN "market_name",
ADD COLUMN     "name" VARCHAR(100) NOT NULL,
ALTER COLUMN "address" DROP NOT NULL;

-- AlterTable
ALTER TABLE "subscription_plans" DROP COLUMN "max_markets",
DROP COLUMN "subscription_name",
ADD COLUMN     "name" VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email" TEXT,
ALTER COLUMN "phone" DROP NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

-- DropEnum
DROP TYPE "StaffStatus";

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
