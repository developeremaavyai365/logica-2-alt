-- AlterTable
ALTER TABLE "SapItem" ADD COLUMN     "websiteColour" TEXT,
ADD COLUMN     "websiteProductId" TEXT;

-- CreateIndex
CREATE INDEX "SapItem_websiteProductId_idx" ON "SapItem"("websiteProductId");
