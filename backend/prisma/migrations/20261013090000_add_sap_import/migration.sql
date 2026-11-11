-- CreateEnum
CREATE TYPE "SapImportMode" AS ENUM ('PARTIAL', 'FULL');

-- CreateTable
CREATE TABLE "SapItem" (
    "id" TEXT NOT NULL,
    "sapCode" TEXT NOT NULL,
    "sapName" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "brand" TEXT,
    "partNumber" TEXT,
    "ean" TEXT,
    "itemGroup" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "mrpInPaise" INTEGER NOT NULL,
    "mopInPaise" INTEGER NOT NULL,
    "inLatestFeed" BOOLEAN NOT NULL DEFAULT true,
    "lastImportId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SapItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SapImport" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mode" "SapImportMode" NOT NULL,
    "uploadedById" TEXT,
    "totalRows" INTEGER NOT NULL,
    "createdCount" INTEGER NOT NULL,
    "updatedCount" INTEGER NOT NULL,
    "unchangedCount" INTEGER NOT NULL,
    "rejectedCount" INTEGER NOT NULL,
    "missingCount" INTEGER NOT NULL,
    "issues" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SapImport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SapItem_sapCode_key" ON "SapItem"("sapCode");

-- CreateIndex
CREATE INDEX "SapItem_brand_idx" ON "SapItem"("brand");

-- CreateIndex
CREATE INDEX "SapItem_itemGroup_idx" ON "SapItem"("itemGroup");

-- CreateIndex
CREATE INDEX "SapItem_lastImportId_idx" ON "SapItem"("lastImportId");

-- CreateIndex
CREATE INDEX "SapImport_createdAt_idx" ON "SapImport"("createdAt");

-- AddForeignKey
ALTER TABLE "SapItem" ADD CONSTRAINT "SapItem_lastImportId_fkey" FOREIGN KEY ("lastImportId") REFERENCES "SapImport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

