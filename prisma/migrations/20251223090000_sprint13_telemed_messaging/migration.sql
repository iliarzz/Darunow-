-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('open', 'closed');

-- CreateEnum
CREATE TYPE "MessageSenderType" AS ENUM ('user', 'provider');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('text', 'file', 'system');

-- CreateEnum
CREATE TYPE "ReaderType" AS ENUM ('user', 'provider');

-- CreateEnum
CREATE TYPE "AttachmentOwnerType" AS ENUM ('user', 'provider');

-- CreateEnum
CREATE TYPE "TeleVisitStatus" AS ENUM ('scheduled', 'waiting', 'in_call', 'ended', 'no_show', 'cancelled');

-- CreateEnum
CREATE TYPE "TeleVisitEventType" AS ENUM ('created', 'user_joined', 'provider_joined', 'ended', 'failed', 'note');

-- CreateEnum
CREATE TYPE "RoomProvider" AS ENUM ('daily', 'twilio', 'webrtc_stub');

-- CreateEnum
CREATE TYPE "InvoiceCurrency" AS ENUM ('IRR', 'USD');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('draft', 'pending', 'paid', 'failed', 'refunded');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('mock', 'zarinpal', 'stripe_like');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('created', 'authorized', 'captured', 'failed');

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerOrgId" TEXT NOT NULL,
    "providerUserId" TEXT,
    "appointmentId" TEXT,
    "status" "ConversationStatus" NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderType" "MessageSenderType" NOT NULL,
    "senderId" TEXT NOT NULL,
    "type" "MessageType" NOT NULL,
    "text" TEXT,
    "fileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageRead" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "readerType" "ReaderType" NOT NULL,
    "readerId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageRead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageAttachment" (
    "id" TEXT NOT NULL,
    "ownerType" "AttachmentOwnerType" NOT NULL,
    "ownerId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeleVisit" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerOrgId" TEXT NOT NULL,
    "providerUserId" TEXT NOT NULL,
    "status" "TeleVisitStatus" NOT NULL DEFAULT 'scheduled',
    "roomProvider" "RoomProvider" NOT NULL,
    "roomId" TEXT NOT NULL,
    "roomTokenHash" TEXT,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeleVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeleVisitEvent" (
    "id" TEXT NOT NULL,
    "teleVisitId" TEXT NOT NULL,
    "type" "TeleVisitEventType" NOT NULL,
    "metaJsonRedacted" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeleVisitEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderNote" (
    "id" TEXT NOT NULL,
    "teleVisitId" TEXT NOT NULL,
    "providerUserId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisitSummary" (
    "id" TEXT NOT NULL,
    "teleVisitId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisitSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "teleVisitId" TEXT,
    "providerOrgId" TEXT,
    "currency" "InvoiceCurrency" NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "discount" INTEGER NOT NULL,
    "tax" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentAttempt" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'created',
    "providerRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Receipt" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "pdfStorageKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Conversation_userId_updatedAt_idx" ON "Conversation"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TeleVisit_appointmentId_key" ON "TeleVisit"("appointmentId");

-- CreateIndex
CREATE INDEX "TeleVisit_userId_idx" ON "TeleVisit"("userId");

-- CreateIndex
CREATE INDEX "TeleVisit_providerOrgId_idx" ON "TeleVisit"("providerOrgId");

-- CreateIndex
CREATE INDEX "TeleVisit_providerUserId_idx" ON "TeleVisit"("providerUserId");

-- CreateIndex
CREATE INDEX "TeleVisitEvent_teleVisitId_idx" ON "TeleVisitEvent"("teleVisitId");

-- CreateIndex
CREATE INDEX "ProviderNote_teleVisitId_idx" ON "ProviderNote"("teleVisitId");

-- CreateIndex
CREATE INDEX "ProviderNote_providerUserId_idx" ON "ProviderNote"("providerUserId");

-- CreateIndex
CREATE INDEX "VisitSummary_teleVisitId_idx" ON "VisitSummary"("teleVisitId");

-- CreateIndex
CREATE INDEX "VisitSummary_userId_idx" ON "VisitSummary"("userId");

-- CreateIndex
CREATE INDEX "Invoice_userId_idx" ON "Invoice"("userId");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX "PaymentAttempt_invoiceId_idx" ON "PaymentAttempt"("invoiceId");

-- CreateIndex
CREATE INDEX "Receipt_invoiceId_idx" ON "Receipt"("invoiceId");

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_providerOrgId_fkey" FOREIGN KEY ("providerOrgId") REFERENCES "ProviderOrg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_providerUserId_fkey" FOREIGN KEY ("providerUserId") REFERENCES "ProviderUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "MessageAttachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageRead" ADD CONSTRAINT "MessageRead_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeleVisit" ADD CONSTRAINT "TeleVisit_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeleVisit" ADD CONSTRAINT "TeleVisit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeleVisit" ADD CONSTRAINT "TeleVisit_providerOrgId_fkey" FOREIGN KEY ("providerOrgId") REFERENCES "ProviderOrg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeleVisit" ADD CONSTRAINT "TeleVisit_providerUserId_fkey" FOREIGN KEY ("providerUserId") REFERENCES "ProviderUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeleVisitEvent" ADD CONSTRAINT "TeleVisitEvent_teleVisitId_fkey" FOREIGN KEY ("teleVisitId") REFERENCES "TeleVisit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderNote" ADD CONSTRAINT "ProviderNote_teleVisitId_fkey" FOREIGN KEY ("teleVisitId") REFERENCES "TeleVisit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderNote" ADD CONSTRAINT "ProviderNote_providerUserId_fkey" FOREIGN KEY ("providerUserId") REFERENCES "ProviderUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitSummary" ADD CONSTRAINT "VisitSummary_teleVisitId_fkey" FOREIGN KEY ("teleVisitId") REFERENCES "TeleVisit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitSummary" ADD CONSTRAINT "VisitSummary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_teleVisitId_fkey" FOREIGN KEY ("teleVisitId") REFERENCES "TeleVisit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_providerOrgId_fkey" FOREIGN KEY ("providerOrgId") REFERENCES "ProviderOrg"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAttempt" ADD CONSTRAINT "PaymentAttempt_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
