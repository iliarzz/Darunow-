-- CreateEnum
CREATE TYPE "CareProgramCreator" AS ENUM ('ops', 'provider');

-- CreateEnum
CREATE TYPE "CareMetricValueType" AS ENUM ('number', 'text', 'enum');

-- CreateEnum
CREATE TYPE "CareQuestionCadence" AS ENUM ('daily', 'weekly', 'custom');

-- CreateEnum
CREATE TYPE "CareQuestionType" AS ENUM ('scale', 'yesno', 'text', 'number', 'enum');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('active', 'paused', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "CareTaskType" AS ENUM ('med', 'lab', 'visit', 'lifestyle', 'other');

-- CreateEnum
CREATE TYPE "CareTaskCadence" AS ENUM ('once', 'daily', 'weekly');

-- CreateEnum
CREATE TYPE "CareTaskStatus" AS ENUM ('open', 'done', 'skipped');

-- CreateEnum
CREATE TYPE "CareTaskCreator" AS ENUM ('provider', 'ops', 'user');

-- CreateEnum
CREATE TYPE "CareObservationSource" AS ENUM ('manual', 'device', 'import');

-- CreateEnum
CREATE TYPE "CareAlertSeverity" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "CareAlertType" AS ENUM ('threshold', 'missing_checkin', 'free_text_flag', 'manual');

-- CreateEnum
CREATE TYPE "CareAlertStatus" AS ENUM ('open', 'acknowledged', 'closed');

-- CreateEnum
CREATE TYPE "AlertAssigneeType" AS ENUM ('provider', 'support', 'ops');

-- CreateEnum
CREATE TYPE "CareTeamMemberType" AS ENUM ('provider', 'support');

-- CreateEnum
CREATE TYPE "CareTeamRole" AS ENUM ('lead', 'assistant', 'coach');

-- CreateEnum
CREATE TYPE "CareTaskEventType" AS ENUM ('created', 'done', 'skipped', 'edited');

-- CreateTable
CREATE TABLE "CareProgram" (
    "id" TEXT NOT NULL,
    "nameFa" TEXT NOT NULL,
    "descriptionLite" TEXT,
    "createdByType" "CareProgramCreator" NOT NULL,
    "createdById" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CareProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareMetricType" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nameFa" TEXT NOT NULL,
    "unit" TEXT,
    "valueType" "CareMetricValueType" NOT NULL,
    "minSafe" DOUBLE PRECISION,
    "maxSafe" DOUBLE PRECISION,
    "displayOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CareMetricType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareQuestionnaire" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "nameFa" TEXT NOT NULL,
    "cadence" "CareQuestionCadence" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CareQuestionnaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareQuestion" (
    "id" TEXT NOT NULL,
    "questionnaireId" TEXT NOT NULL,
    "promptFa" TEXT NOT NULL,
    "type" "CareQuestionType" NOT NULL,
    "enumJson" JSONB,
    "min" DOUBLE PRECISION,
    "max" DOUBLE PRECISION,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CareQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'active',
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pausedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnrollmentGoal" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "titleFa" TEXT NOT NULL,
    "targetText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnrollmentGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Checkin" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "questionnaireId" TEXT NOT NULL,
    "periodStartAt" TIMESTAMP(3) NOT NULL,
    "periodEndAt" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Checkin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckinAnswer" (
    "id" TEXT NOT NULL,
    "checkinId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "valueText" TEXT,
    "valueNumber" DOUBLE PRECISION,
    "valueEnum" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CheckinAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareObservation" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "metricTypeId" TEXT NOT NULL,
    "valueText" TEXT,
    "valueNumber" DOUBLE PRECISION,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "source" "CareObservationSource" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CareObservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareTask" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "titleFa" TEXT NOT NULL,
    "type" "CareTaskType" NOT NULL,
    "dueAt" TIMESTAMP(3),
    "cadence" "CareTaskCadence" NOT NULL DEFAULT 'once',
    "status" "CareTaskStatus" NOT NULL DEFAULT 'open',
    "createdByType" "CareTaskCreator" NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CareTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareTaskEvent" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "type" "CareTaskEventType" NOT NULL,
    "metaJsonRedacted" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CareTaskEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareAlert" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "severity" "CareAlertSeverity" NOT NULL,
    "type" "CareAlertType" NOT NULL,
    "titleFa" TEXT NOT NULL,
    "bodyFa" TEXT NOT NULL,
    "status" "CareAlertStatus" NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledgedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "CareAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertAssignment" (
    "id" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "assigneeType" "AlertAssigneeType" NOT NULL,
    "assigneeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlertAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareTeamMember" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "memberType" "CareTeamMemberType" NOT NULL,
    "memberId" TEXT NOT NULL,
    "role" "CareTeamRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CareTeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CareMetricType_programId_code_key" ON "CareMetricType"("programId", "code");

-- CreateIndex
CREATE INDEX "CareMetricType_programId_idx" ON "CareMetricType"("programId");

-- CreateIndex
CREATE INDEX "CareQuestionnaire_programId_idx" ON "CareQuestionnaire"("programId");

-- CreateIndex
CREATE INDEX "CareQuestion_questionnaireId_idx" ON "CareQuestion"("questionnaireId");

-- CreateIndex
CREATE INDEX "Enrollment_userId_status_idx" ON "Enrollment"("userId", "status");

-- CreateIndex
CREATE INDEX "Enrollment_programId_idx" ON "Enrollment"("programId");

-- CreateIndex
CREATE INDEX "EnrollmentGoal_enrollmentId_idx" ON "EnrollmentGoal"("enrollmentId");

-- CreateIndex
CREATE INDEX "Checkin_enrollmentId_submittedAt_idx" ON "Checkin"("enrollmentId", "submittedAt");

-- CreateIndex
CREATE INDEX "CheckinAnswer_checkinId_idx" ON "CheckinAnswer"("checkinId");

-- CreateIndex
CREATE INDEX "CheckinAnswer_questionId_idx" ON "CheckinAnswer"("questionId");

-- CreateIndex
CREATE INDEX "CareObservation_enrollmentId_recordedAt_idx" ON "CareObservation"("enrollmentId", "recordedAt");

-- CreateIndex
CREATE INDEX "CareTask_enrollmentId_idx" ON "CareTask"("enrollmentId");

-- CreateIndex
CREATE INDEX "CareTask_status_idx" ON "CareTask"("status");

-- CreateIndex
CREATE INDEX "CareTaskEvent_taskId_idx" ON "CareTaskEvent"("taskId");

-- CreateIndex
CREATE INDEX "CareAlert_enrollmentId_status_createdAt_idx" ON "CareAlert"("enrollmentId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "AlertAssignment_alertId_idx" ON "AlertAssignment"("alertId");

-- CreateIndex
CREATE INDEX "CareTeamMember_enrollmentId_idx" ON "CareTeamMember"("enrollmentId");

-- AddForeignKey
ALTER TABLE "CareMetricType" ADD CONSTRAINT "CareMetricType_programId_fkey" FOREIGN KEY ("programId") REFERENCES "CareProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareQuestionnaire" ADD CONSTRAINT "CareQuestionnaire_programId_fkey" FOREIGN KEY ("programId") REFERENCES "CareProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareQuestion" ADD CONSTRAINT "CareQuestion_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES "CareQuestionnaire"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_programId_fkey" FOREIGN KEY ("programId") REFERENCES "CareProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnrollmentGoal" ADD CONSTRAINT "EnrollmentGoal_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checkin" ADD CONSTRAINT "Checkin_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checkin" ADD CONSTRAINT "Checkin_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES "CareQuestionnaire"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckinAnswer" ADD CONSTRAINT "CheckinAnswer_checkinId_fkey" FOREIGN KEY ("checkinId") REFERENCES "Checkin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckinAnswer" ADD CONSTRAINT "CheckinAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "CareQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareObservation" ADD CONSTRAINT "CareObservation_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareObservation" ADD CONSTRAINT "CareObservation_metricTypeId_fkey" FOREIGN KEY ("metricTypeId") REFERENCES "CareMetricType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareTask" ADD CONSTRAINT "CareTask_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareTaskEvent" ADD CONSTRAINT "CareTaskEvent_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "CareTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareAlert" ADD CONSTRAINT "CareAlert_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertAssignment" ADD CONSTRAINT "AlertAssignment_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "CareAlert"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareTeamMember" ADD CONSTRAINT "CareTeamMember_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
