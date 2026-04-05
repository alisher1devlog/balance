-- AlterTable
ALTER TABLE "markets" ADD COLUMN "phone" VARCHAR(20),
ADD COLUMN "status" "MarketStatus" NOT NULL DEFAULT 'PENDING';
