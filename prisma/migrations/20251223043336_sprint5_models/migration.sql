-- CreateEnum
CREATE TYPE "PrescriptionStatus" AS ENUM ('received', 'review', 'needs_fix', 'approved');

-- CreateEnum
CREATE TYPE "SubstitutionStatus" AS ENUM ('pending', 'accepted', 'rejected');

-- CreateEnum
CREATE TYPE "AuditActor" AS ENUM ('user', 'pharmacy');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrderStatus" ADD VALUE 'approved';
ALTER TYPE "OrderStatus" ADD VALUE 'refund_requested';

-- AlterEnum
ALTER TYPE "ReplyFrom" ADD VALUE 'pharmacy';

-- CreateTable
CREATE TABLE "PharmacyUser" (
    "id" TEXT NOT NULL,
    "pharmacyId" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "passwordHash" TEXT,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PharmacyUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prescription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT,
    "pharmacyId" TEXT,
    "fileUrl" TEXT,
    "fileType" TEXT,
    "status" "PrescriptionStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubstitutionProposal" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "pharmacyId" TEXT NOT NULL,
    "status" "SubstitutionStatus" NOT NULL DEFAULT 'pending',
    "items" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "SubstitutionProposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubstitutionProposalItem" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "proposedName" TEXT NOT NULL,
    "priceDelta" INTEGER NOT NULL,
    "note" TEXT,

    CONSTRAINT "SubstitutionProposalItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorType" "AuditActor" NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "beforeJson" JSONB,
    "afterJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "metaJson" JSONB,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PharmacyUser_pharmacyId_idx" ON "PharmacyUser"("pharmacyId");

-- CreateIndex
CREATE INDEX "Prescription_orderId_idx" ON "Prescription"("orderId");

-- CreateIndex
CREATE INDEX "Prescription_pharmacyId_idx" ON "Prescription"("pharmacyId");

-- CreateIndex
CREATE INDEX "SubstitutionProposal_orderId_idx" ON "SubstitutionProposal"("orderId");

-- CreateIndex
CREATE INDEX "SubstitutionProposal_pharmacyId_idx" ON "SubstitutionProposal"("pharmacyId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- AddForeignKey
ALTER TABLE "PharmacyUser" ADD CONSTRAINT "PharmacyUser_pharmacyId_fkey" FOREIGN KEY ("pharmacyId") REFERENCES "Pharmacy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_pharmacyId_fkey" FOREIGN KEY ("pharmacyId") REFERENCES "Pharmacy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubstitutionProposal" ADD CONSTRAINT "SubstitutionProposal_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubstitutionProposal" ADD CONSTRAINT "SubstitutionProposal_pharmacyId_fkey" FOREIGN KEY ("pharmacyId") REFERENCES "Pharmacy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubstitutionProposalItem" ADD CONSTRAINT "SubstitutionProposalItem_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "SubstitutionProposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubstitutionProposalItem" ADD CONSTRAINT "SubstitutionProposalItem_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
