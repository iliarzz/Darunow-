-- CreateEnum
CREATE TYPE "LabOrderStatus" AS ENUM ('created', 'received', 'processing', 'ready', 'delivered', 'cancelled');

-- CreateEnum
CREATE TYPE "LabUserRole" AS ENUM ('tech', 'admin');

-- CreateEnum
CREATE TYPE "LabPriority" AS ENUM ('routine', 'stat');

-- CreateEnum
CREATE TYPE "LabResultType" AS ENUM ('pdf', 'structured');

-- CreateEnum
CREATE TYPE "ObservationFlag" AS ENUM ('high', 'low', 'normal', 'unknown');

-- CreateEnum
CREATE TYPE "LabResultShareGrantee" AS ENUM ('provider', 'pharmacy');

-- CreateEnum
CREATE TYPE "OrgType" AS ENUM ('provider', 'clinic', 'lab');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('requested', 'confirmed', 'cancelled', 'completed', 'no_show');

-- CreateEnum
CREATE TYPE "AppointmentReminderChannel" AS ENUM ('in_app', 'push');

-- CreateTable
CREATE TABLE "LabOrg" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LabOrg_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabUser" (
    "id" TEXT NOT NULL,
    "labOrgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "role" "LabUserRole" NOT NULL,
    "authHash" TEXT,
    "otpCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LabUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabOrder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "labOrgId" TEXT,
    "createdByProviderId" TEXT,
    "createdByOpsId" TEXT,
    "status" "LabOrderStatus" NOT NULL DEFAULT 'created',
    "scheduledAt" TIMESTAMP(3),
    "collectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabTest" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nameFa" TEXT NOT NULL,
    "nameEn" TEXT,
    "category" TEXT,
    "sampleType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LabTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabOrderItem" (
    "id" TEXT NOT NULL,
    "labOrderId" TEXT NOT NULL,
    "labTestId" TEXT,
    "nameText" TEXT NOT NULL,
    "priority" "LabPriority",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LabOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabResult" (
    "id" TEXT NOT NULL,
    "labOrderId" TEXT NOT NULL,
    "type" "LabResultType" NOT NULL,
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LabResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Observation" (
    "id" TEXT NOT NULL,
    "labResultId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nameText" TEXT NOT NULL,
    "valueText" TEXT,
    "valueNumber" DOUBLE PRECISION,
    "unit" TEXT,
    "refRangeText" TEXT,
    "flagged" "ObservationFlag",
    "observedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Observation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabResultShare" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "granteeType" "LabResultShareGrantee" NOT NULL,
    "granteeId" TEXT NOT NULL,
    "consentGrantId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LabResultShare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "orgType" "OrgType" NOT NULL,
    "orgId" TEXT NOT NULL,
    "nameFa" TEXT NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "price" INTEGER,
    "requiresRx" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilityRule" (
    "id" TEXT NOT NULL,
    "orgType" "OrgType" NOT NULL,
    "orgId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "slotMin" INTEGER NOT NULL,
    "timezone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AvailabilityRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SlotException" (
    "id" TEXT NOT NULL,
    "orgType" "OrgType" NOT NULL,
    "orgId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "isClosed" BOOLEAN NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SlotException_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orgType" "OrgType" NOT NULL,
    "orgId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'requested',
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppointmentReminder" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "channel" "AppointmentReminderChannel" NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppointmentReminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LabUser_labOrgId_idx" ON "LabUser"("labOrgId");

-- CreateIndex
CREATE INDEX "LabUser_email_idx" ON "LabUser"("email");

-- CreateIndex
CREATE INDEX "LabUser_phone_idx" ON "LabUser"("phone");

-- CreateIndex
CREATE INDEX "LabOrder_userId_createdAt_idx" ON "LabOrder"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "LabOrder_status_createdAt_idx" ON "LabOrder"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "LabTest_code_key" ON "LabTest"("code");

-- CreateIndex
CREATE INDEX "LabOrderItem_labOrderId_idx" ON "LabOrderItem"("labOrderId");

-- CreateIndex
CREATE INDEX "LabResult_labOrderId_idx" ON "LabResult"("labOrderId");

-- CreateIndex
CREATE INDEX "Observation_labResultId_idx" ON "Observation"("labResultId");

-- CreateIndex
CREATE INDEX "LabResultShare_userId_idx" ON "LabResultShare"("userId");

-- CreateIndex
CREATE INDEX "LabResultShare_granteeType_granteeId_idx" ON "LabResultShare"("granteeType", "granteeId");

-- CreateIndex
CREATE INDEX "Service_orgType_orgId_idx" ON "Service"("orgType", "orgId");

-- CreateIndex
CREATE INDEX "AvailabilityRule_orgType_orgId_dayOfWeek_idx" ON "AvailabilityRule"("orgType", "orgId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "SlotException_orgType_orgId_date_idx" ON "SlotException"("orgType", "orgId", "date");

-- CreateIndex
CREATE INDEX "Appointment_userId_startAt_idx" ON "Appointment"("userId", "startAt");

-- CreateIndex
CREATE INDEX "Appointment_orgType_orgId_startAt_idx" ON "Appointment"("orgType", "orgId", "startAt");

-- CreateIndex
CREATE INDEX "AppointmentReminder_appointmentId_idx" ON "AppointmentReminder"("appointmentId");

-- AddForeignKey
ALTER TABLE "LabUser" ADD CONSTRAINT "LabUser_labOrgId_fkey" FOREIGN KEY ("labOrgId") REFERENCES "LabOrg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabOrder" ADD CONSTRAINT "LabOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabOrder" ADD CONSTRAINT "LabOrder_labOrgId_fkey" FOREIGN KEY ("labOrgId") REFERENCES "LabOrg"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabOrder" ADD CONSTRAINT "LabOrder_createdByProviderId_fkey" FOREIGN KEY ("createdByProviderId") REFERENCES "ProviderUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabOrder" ADD CONSTRAINT "LabOrder_createdByOpsId_fkey" FOREIGN KEY ("createdByOpsId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabOrderItem" ADD CONSTRAINT "LabOrderItem_labOrderId_fkey" FOREIGN KEY ("labOrderId") REFERENCES "LabOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabOrderItem" ADD CONSTRAINT "LabOrderItem_labTestId_fkey" FOREIGN KEY ("labTestId") REFERENCES "LabTest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabResult" ADD CONSTRAINT "LabResult_labOrderId_fkey" FOREIGN KEY ("labOrderId") REFERENCES "LabOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "Observation_labResultId_fkey" FOREIGN KEY ("labResultId") REFERENCES "LabResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabResultShare" ADD CONSTRAINT "LabResultShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabResultShare" ADD CONSTRAINT "LabResultShare_consentGrantId_fkey" FOREIGN KEY ("consentGrantId") REFERENCES "ConsentGrant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentReminder" ADD CONSTRAINT "AppointmentReminder_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
