-- CreateEnum
CREATE TYPE "EligibilityStatus" AS ENUM ('eligible', 'ineligible', 'unknown');

-- CreateEnum
CREATE TYPE "ProviderOrgType" AS ENUM ('clinic', 'hospital', 'practice');

-- CreateEnum
CREATE TYPE "ProviderRole" AS ENUM ('doctor', 'staff', 'admin');

-- CreateEnum
CREATE TYPE "SeverityLevel" AS ENUM ('mild', 'moderate', 'severe');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('draft', 'submitted', 'approved', 'rejected', 'paid');

-- AlterEnum
ALTER TYPE "PrescriptionStatus" ADD VALUE IF NOT EXISTS 'draft';
ALTER TYPE "PrescriptionStatus" ADD VALUE IF NOT EXISTS 'signed';
ALTER TYPE "PrescriptionStatus" ADD VALUE IF NOT EXISTS 'sent';
ALTER TYPE "PrescriptionStatus" ADD VALUE IF NOT EXISTS 'dispensed';
ALTER TYPE "PrescriptionStatus" ADD VALUE IF NOT EXISTS 'closed';
ALTER TYPE "PrescriptionStatus" ADD VALUE IF NOT EXISTS 'void';
ALTER TYPE "AuditActor" ADD VALUE IF NOT EXISTS 'provider';

-- CreateTable
CREATE TABLE "InsuranceProvider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InsuranceProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsurancePolicy" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "planName" TEXT,
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InsurancePolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EligibilityCheck" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "status" "EligibilityStatus" NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rawMetaJsonRedacted" JSONB,

    CONSTRAINT "EligibilityCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderOrg" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ProviderOrgType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderOrg_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderUser" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "role" "ProviderRole" NOT NULL,
    "authHash" TEXT,
    "otpCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderProfile" (
    "id" TEXT NOT NULL,
    "providerUserId" TEXT NOT NULL,
    "specialty" TEXT,
    "licenseNumber" TEXT,
    "city" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProviderProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrescriptionItem" (
    "id" TEXT NOT NULL,
    "prescriptionId" TEXT NOT NULL,
    "drugId" TEXT,
    "nameText" TEXT NOT NULL,
    "dosageText" TEXT,
    "qty" INTEGER NOT NULL,
    "refills" INTEGER,
    "instructionsText" TEXT,

    CONSTRAINT "PrescriptionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrescriptionSignature" (
    "id" TEXT NOT NULL,
    "prescriptionId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "signatureHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrescriptionSignature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatientRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Allergy" (
    "id" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "nameText" TEXT NOT NULL,
    "severity" "SeverityLevel",
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Allergy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChronicMedication" (
    "id" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "nameText" TEXT NOT NULL,
    "dosageText" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChronicMedication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Condition" (
    "id" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "nameText" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Condition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsentGrant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "granteeType" TEXT NOT NULL,
    "granteeId" TEXT NOT NULL,
    "scopeJson" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "ConsentGrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessToken" (
    "id" TEXT NOT NULL,
    "consentGrantId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccessToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimCase" (
    "id" TEXT NOT NULL,
    "orderId" TEXT,
    "prescriptionId" TEXT,
    "userId" TEXT NOT NULL,
    "policyId" TEXT,
    "status" "ClaimStatus" NOT NULL DEFAULT 'draft',
    "patientShare" INTEGER,
    "insurerShare" INTEGER,
    "metaJsonRedacted" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClaimCase_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Prescription" ADD COLUMN     "closedAt" TIMESTAMP(3),
ADD COLUMN     "createdByProviderId" TEXT,
ADD COLUMN     "dispensedAt" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "signedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "InsurancePolicy_userId_idx" ON "InsurancePolicy"("userId");

-- CreateIndex
CREATE INDEX "InsurancePolicy_providerId_idx" ON "InsurancePolicy"("providerId");

-- CreateIndex
CREATE INDEX "EligibilityCheck_policyId_checkedAt_idx" ON "EligibilityCheck"("policyId", "checkedAt");

-- CreateIndex
CREATE INDEX "ProviderUser_orgId_idx" ON "ProviderUser"("orgId");

-- CreateIndex
CREATE INDEX "ProviderUser_email_idx" ON "ProviderUser"("email");

-- CreateIndex
CREATE INDEX "ProviderUser_phone_idx" ON "ProviderUser"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderProfile_providerUserId_key" ON "ProviderProfile"("providerUserId");

-- CreateIndex
CREATE INDEX "PrescriptionItem_prescriptionId_idx" ON "PrescriptionItem"("prescriptionId");

-- CreateIndex
CREATE INDEX "PrescriptionSignature_prescriptionId_idx" ON "PrescriptionSignature"("prescriptionId");

-- CreateIndex
CREATE INDEX "PrescriptionSignature_providerId_idx" ON "PrescriptionSignature"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "PatientRecord_userId_key" ON "PatientRecord"("userId");

-- CreateIndex
CREATE INDEX "Allergy_recordId_idx" ON "Allergy"("recordId");

-- CreateIndex
CREATE INDEX "ChronicMedication_recordId_idx" ON "ChronicMedication"("recordId");

-- CreateIndex
CREATE INDEX "Condition_recordId_idx" ON "Condition"("recordId");

-- CreateIndex
CREATE INDEX "ConsentGrant_userId_idx" ON "ConsentGrant"("userId");

-- CreateIndex
CREATE INDEX "ConsentGrant_granteeType_granteeId_idx" ON "ConsentGrant"("granteeType", "granteeId");

-- CreateIndex
CREATE INDEX "AccessToken_consentGrantId_idx" ON "AccessToken"("consentGrantId");

-- CreateIndex
CREATE INDEX "AccessToken_expiresAt_idx" ON "AccessToken"("expiresAt");

-- CreateIndex
CREATE INDEX "ClaimCase_orderId_idx" ON "ClaimCase"("orderId");

-- CreateIndex
CREATE INDEX "ClaimCase_prescriptionId_idx" ON "ClaimCase"("prescriptionId");

-- CreateIndex
CREATE INDEX "ClaimCase_userId_idx" ON "ClaimCase"("userId");

-- CreateIndex
CREATE INDEX "ClaimCase_policyId_idx" ON "ClaimCase"("policyId");

-- CreateIndex
CREATE INDEX "Prescription_createdByProviderId_idx" ON "Prescription"("createdByProviderId");

-- AddForeignKey
ALTER TABLE "InsurancePolicy" ADD CONSTRAINT "InsurancePolicy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsurancePolicy" ADD CONSTRAINT "InsurancePolicy_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "InsuranceProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EligibilityCheck" ADD CONSTRAINT "EligibilityCheck_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "InsurancePolicy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderUser" ADD CONSTRAINT "ProviderUser_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "ProviderOrg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderProfile" ADD CONSTRAINT "ProviderProfile_providerUserId_fkey" FOREIGN KEY ("providerUserId") REFERENCES "ProviderUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_createdByProviderId_fkey" FOREIGN KEY ("createdByProviderId") REFERENCES "ProviderUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionItem" ADD CONSTRAINT "PrescriptionItem_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionSignature" ADD CONSTRAINT "PrescriptionSignature_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionSignature" ADD CONSTRAINT "PrescriptionSignature_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "ProviderUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientRecord" ADD CONSTRAINT "PatientRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Allergy" ADD CONSTRAINT "Allergy_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "PatientRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChronicMedication" ADD CONSTRAINT "ChronicMedication_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "PatientRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Condition" ADD CONSTRAINT "Condition_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "PatientRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentGrant" ADD CONSTRAINT "ConsentGrant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessToken" ADD CONSTRAINT "AccessToken_consentGrantId_fkey" FOREIGN KEY ("consentGrantId") REFERENCES "ConsentGrant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimCase" ADD CONSTRAINT "ClaimCase_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimCase" ADD CONSTRAINT "ClaimCase_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimCase" ADD CONSTRAINT "ClaimCase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimCase" ADD CONSTRAINT "ClaimCase_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "InsurancePolicy"("id") ON DELETE SET NULL ON UPDATE CASCADE;
