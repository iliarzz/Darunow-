-- CreateEnum
CREATE TYPE "CourierStatus" AS ENUM ('offline', 'online', 'busy');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('unassigned', 'offered', 'accepted', 'picked_up', 'enroute', 'arrived', 'delivered', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "DeliveryEventType" AS ENUM ('assigned', 'accepted', 'picked_up', 'location', 'arrived', 'delivered', 'failed', 'note');

-- CreateEnum
CREATE TYPE "ProofMethod" AS ENUM ('otp', 'qr', 'signature', 'photo');

-- CreateTable
CREATE TABLE "Courier" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT,
    "status" "CourierStatus" NOT NULL DEFAULT 'offline',
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Courier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourierUser" (
    "id" TEXT NOT NULL,
    "courierId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT,
    "otpHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourierUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourierToken" (
    "id" TEXT NOT NULL,
    "courierId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourierToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Delivery" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "courierId" TEXT,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'unassigned',
    "pickupPharmacyId" TEXT NOT NULL,
    "dropoffAddressId" TEXT NOT NULL,
    "etaMin" INTEGER,
    "etaMax" INTEGER,
    "distanceKm" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Delivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryEvent" (
    "id" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "type" "DeliveryEventType" NOT NULL,
    "metaJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeliveryEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocationPing" (
    "id" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "courierId" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "speed" DOUBLE PRECISION,
    "heading" DOUBLE PRECISION,
    "accuracy" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LocationPing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProofOfDelivery" (
    "id" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "method" "ProofMethod" NOT NULL,
    "otpLast4" TEXT,
    "photoUrl" TEXT,
    "signedName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProofOfDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DispatchAssignment" (
    "id" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "assignedByAdminId" TEXT,
    "assignedBySystem" BOOLEAN NOT NULL DEFAULT false,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DispatchAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Courier_phone_key" ON "Courier"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "CourierUser_phone_key" ON "CourierUser"("phone");

-- CreateIndex
CREATE INDEX "CourierToken_courierId_idx" ON "CourierToken"("courierId");

-- CreateIndex
CREATE INDEX "CourierToken_expiresAt_idx" ON "CourierToken"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Delivery_orderId_key" ON "Delivery"("orderId");

-- CreateIndex
CREATE INDEX "Delivery_courierId_status_idx" ON "Delivery"("courierId", "status");

-- CreateIndex
CREATE INDEX "Delivery_status_idx" ON "Delivery"("status");

-- CreateIndex
CREATE INDEX "DeliveryEvent_deliveryId_idx" ON "DeliveryEvent"("deliveryId");

-- CreateIndex
CREATE INDEX "DeliveryEvent_createdAt_idx" ON "DeliveryEvent"("createdAt");

-- CreateIndex
CREATE INDEX "LocationPing_deliveryId_createdAt_idx" ON "LocationPing"("deliveryId", "createdAt");

-- CreateIndex
CREATE INDEX "LocationPing_courierId_createdAt_idx" ON "LocationPing"("courierId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProofOfDelivery_deliveryId_key" ON "ProofOfDelivery"("deliveryId");

-- CreateIndex
CREATE INDEX "DispatchAssignment_deliveryId_idx" ON "DispatchAssignment"("deliveryId");

-- AddForeignKey
ALTER TABLE "CourierUser" ADD CONSTRAINT "CourierUser_courierId_fkey" FOREIGN KEY ("courierId") REFERENCES "Courier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourierToken" ADD CONSTRAINT "CourierToken_courierId_fkey" FOREIGN KEY ("courierId") REFERENCES "Courier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_courierId_fkey" FOREIGN KEY ("courierId") REFERENCES "Courier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_pickupPharmacyId_fkey" FOREIGN KEY ("pickupPharmacyId") REFERENCES "Pharmacy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_dropoffAddressId_fkey" FOREIGN KEY ("dropoffAddressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryEvent" ADD CONSTRAINT "DeliveryEvent_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "Delivery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationPing" ADD CONSTRAINT "LocationPing_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "Delivery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationPing" ADD CONSTRAINT "LocationPing_courierId_fkey" FOREIGN KEY ("courierId") REFERENCES "Courier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProofOfDelivery" ADD CONSTRAINT "ProofOfDelivery_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "Delivery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DispatchAssignment" ADD CONSTRAINT "DispatchAssignment_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "Delivery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DispatchAssignment" ADD CONSTRAINT "DispatchAssignment_assignedByAdminId_fkey" FOREIGN KEY ("assignedByAdminId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
