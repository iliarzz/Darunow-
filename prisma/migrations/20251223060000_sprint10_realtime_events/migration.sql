-- CreateTable
CREATE TABLE "RealtimeEvent" (
    "id" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payloadJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RealtimeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RealtimeEvent_channel_createdAt_idx" ON "RealtimeEvent"("channel", "createdAt");
