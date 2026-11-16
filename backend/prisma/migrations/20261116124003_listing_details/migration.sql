-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "countryOfOrigin" TEXT,
ADD COLUMN     "importerDetails" TEXT,
ADD COLUMN     "manufacturerDetails" TEXT,
ADD COLUMN     "modelName" TEXT,
ADD COLUMN     "packageBreadthCm" DOUBLE PRECISION,
ADD COLUMN     "packageHeightCm" DOUBLE PRECISION,
ADD COLUMN     "packageLengthCm" DOUBLE PRECISION,
ADD COLUMN     "packageWeightKg" DOUBLE PRECISION,
ADD COLUMN     "packerDetails" TEXT,
ADD COLUMN     "titleAuto" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "variant" TEXT,
ADD COLUMN     "videoUrl" TEXT,
ADD COLUMN     "warrantyCovered" TEXT,
ADD COLUMN     "warrantyPeriod" TEXT,
ADD COLUMN     "warrantyServiceType" TEXT;

-- CreateTable
CREATE TABLE "TitleFormat" (
    "id" TEXT NOT NULL,
    "brandKey" TEXT NOT NULL,
    "categorySlug" TEXT NOT NULL,
    "pattern" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TitleFormat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TitleFormat_brandKey_categorySlug_key" ON "TitleFormat"("brandKey", "categorySlug");
