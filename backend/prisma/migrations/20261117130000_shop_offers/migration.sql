-- CreateEnum
CREATE TYPE "OfferKind" AS ENUM ('BANK', 'EMI', 'EXCHANGE', 'PROTECTION');

-- CreateTable
CREATE TABLE "ShopOffer" (
    "id" TEXT NOT NULL,
    "kind" "OfferKind" NOT NULL,
    "provider" TEXT NOT NULL DEFAULT '',
    "paymentType" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL DEFAULT '',
    "terms" TEXT NOT NULL DEFAULT '',
    "flatOffInPaise" INTEGER,
    "percentOff" DOUBLE PRECISION,
    "maxOffInPaise" INTEGER,
    "minPriceInPaise" INTEGER,
    "emiMonths" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "interestPercent" DOUBLE PRECISION,
    "planPriceInPaise" INTEGER,
    "planPricePercent" DOUBLE PRECISION,
    "coverMonths" INTEGER,
    "categories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "brands" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "endsAt" TIMESTAMP(3),
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopOffer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShopOffer_kind_active_idx" ON "ShopOffer"("kind", "active");

