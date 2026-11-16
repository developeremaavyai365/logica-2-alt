/*
  Warnings:

  - You are about to drop the column `isActive` on the `Product` table. All the data in the column will be lost.
  - Added the required column `imageUrl` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceInPaise` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "isActive",
ADD COLUMN     "attrs" JSONB,
ADD COLUMN     "ean" TEXT,
ADD COLUMN     "gallery" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "gstRatePercent" INTEGER,
ADD COLUMN     "highlights" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "hsnCode" TEXT,
ADD COLUMN     "imageUrl" TEXT NOT NULL,
ADD COLUMN     "inStock" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "inTheBox" TEXT,
ADD COLUMN     "modelNumber" TEXT,
ADD COLUMN     "mrpInPaise" INTEGER,
ADD COLUMN     "partNumber" TEXT,
ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "priceInPaise" INTEGER NOT NULL,
ADD COLUMN     "rating" DOUBLE PRECISION,
ADD COLUMN     "reviewCount" INTEGER,
ADD COLUMN     "sharedImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "specs" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "warranty" TEXT,
ALTER COLUMN "description" SET DEFAULT '';

-- CreateTable
CREATE TABLE "ProductColour" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hex" TEXT NOT NULL,
    "family" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "inStock" BOOLEAN,
    "ean" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductColour_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductColour_productId_key_key" ON "ProductColour"("productId", "key");

-- CreateIndex
CREATE INDEX "Product_status_position_idx" ON "Product"("status", "position");

-- AddForeignKey
ALTER TABLE "ProductColour" ADD CONSTRAINT "ProductColour_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
