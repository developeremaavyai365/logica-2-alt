-- Checkout: orders made from SAP codes, with their own copy of the
-- delivery address, the payment method, and a key that stops a double
-- click placing the same order twice. Columns that must be filled get a
-- temporary default for any rows already there, then lose it.

CREATE TYPE "PaymentMethod" AS ENUM ('COD', 'ONLINE');

ALTER TYPE "OrderStatus" ADD VALUE 'PAYMENT_PENDING';

ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_variantId_fkey";

ALTER TABLE "Order" ADD COLUMN "idempotencyKey" TEXT,
ADD COLUMN "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'COD',
ADD COLUMN "shippingAddress" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Order" ALTER COLUMN "paymentMethod" DROP DEFAULT,
ALTER COLUMN "shippingAddress" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

ALTER TABLE "OrderItem" ADD COLUMN "colour" TEXT,
ADD COLUMN "mrpPaise" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "name" TEXT NOT NULL DEFAULT '',
ADD COLUMN "productId" TEXT NOT NULL DEFAULT '',
ADD COLUMN "sapCode" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "variantId" DROP NOT NULL;
ALTER TABLE "OrderItem" ALTER COLUMN "mrpPaise" DROP DEFAULT,
ALTER COLUMN "name" DROP DEFAULT,
ALTER COLUMN "productId" DROP DEFAULT,
ALTER COLUMN "sapCode" DROP DEFAULT;

-- When the sheet last changed each code's stock (see schema.prisma).
ALTER TABLE "SapItem" ADD COLUMN "stockUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE UNIQUE INDEX "Order_idempotencyKey_key" ON "Order"("idempotencyKey");
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");
CREATE INDEX "OrderItem_sapCode_idx" ON "OrderItem"("sapCode");

ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
