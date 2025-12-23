-- CreateEnum
CREATE TYPE "InventoryStatus" AS ENUM ('in_stock', 'low', 'out');

-- CreateEnum
CREATE TYPE "PromoType" AS ENUM ('percent', 'fixed');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "orderGroupId" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "drugId" TEXT;

-- CreateTable
CREATE TABLE "Drug" (
    "id" TEXT NOT NULL,
    "nameFa" TEXT NOT NULL,
    "nameEn" TEXT,
    "genericName" TEXT,
    "brandName" TEXT,
    "atcCode" TEXT,
    "isRxRequired" BOOLEAN NOT NULL DEFAULT false,
    "descriptionLite" TEXT,
    "warningsLite" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Drug_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrugSynonym" (
    "id" TEXT NOT NULL,
    "drugId" TEXT NOT NULL,
    "term" TEXT NOT NULL,

    CONSTRAINT "DrugSynonym_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "pharmacyId" TEXT NOT NULL,
    "drugId" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "stockQty" INTEGER NOT NULL,
    "status" "InventoryStatus" NOT NULL DEFAULT 'in_stock',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PharmacyCoverage" (
    "id" TEXT NOT NULL,
    "pharmacyId" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "polygonJson" JSONB,
    "radiusKm" DOUBLE PRECISION,
    "centerLat" DOUBLE PRECISION,
    "centerLng" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PharmacyCoverage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PharmacyHours" (
    "id" TEXT NOT NULL,
    "pharmacyId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "openTime" TEXT NOT NULL,
    "closeTime" TEXT NOT NULL,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PharmacyHours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromoRule" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "PromoType" NOT NULL,
    "value" INTEGER NOT NULL,
    "minBasket" INTEGER NOT NULL,
    "maxDiscount" INTEGER,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromoRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeConfig" (
    "id" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "baseDeliveryFee" INTEGER NOT NULL,
    "perKmFee" INTEGER NOT NULL,
    "serviceFee" INTEGER NOT NULL,
    "freeDeliveryMinBasket" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeeConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderGroup" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DrugSynonym_term_idx" ON "DrugSynonym"("term");

-- CreateIndex
CREATE UNIQUE INDEX "DrugSynonym_drugId_term_key" ON "DrugSynonym"("drugId", "term");

-- CreateIndex
CREATE INDEX "InventoryItem_drugId_idx" ON "InventoryItem"("drugId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_pharmacyId_drugId_key" ON "InventoryItem"("pharmacyId", "drugId");

-- CreateIndex
CREATE INDEX "PharmacyCoverage_pharmacyId_idx" ON "PharmacyCoverage"("pharmacyId");

-- CreateIndex
CREATE INDEX "PharmacyCoverage_city_idx" ON "PharmacyCoverage"("city");

-- CreateIndex
CREATE INDEX "PharmacyHours_pharmacyId_dayOfWeek_idx" ON "PharmacyHours"("pharmacyId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "PromoRule_isActive_expiresAt_idx" ON "PromoRule"("isActive", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "PromoRule_code_key" ON "PromoRule"("code");

-- CreateIndex
CREATE UNIQUE INDEX "FeeConfig_city_key" ON "FeeConfig"("city");

-- CreateIndex
CREATE INDEX "Order_orderGroupId_idx" ON "Order"("orderGroupId");

-- CreateIndex
CREATE INDEX "Product_drugId_idx" ON "Product"("drugId");

-- AddForeignKey
ALTER TABLE "DrugSynonym" ADD CONSTRAINT "DrugSynonym_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES "Drug"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES "Drug"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_pharmacyId_fkey" FOREIGN KEY ("pharmacyId") REFERENCES "Pharmacy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES "Drug"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacyCoverage" ADD CONSTRAINT "PharmacyCoverage_pharmacyId_fkey" FOREIGN KEY ("pharmacyId") REFERENCES "Pharmacy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacyHours" ADD CONSTRAINT "PharmacyHours_pharmacyId_fkey" FOREIGN KEY ("pharmacyId") REFERENCES "Pharmacy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderGroup" ADD CONSTRAINT "OrderGroup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_orderGroupId_fkey" FOREIGN KEY ("orderGroupId") REFERENCES "OrderGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
