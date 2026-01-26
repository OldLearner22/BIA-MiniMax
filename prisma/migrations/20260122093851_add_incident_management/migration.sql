-- CreateEnum
CREATE TYPE "IncidentCategory" AS ENUM ('TECHNICAL_FAILURE', 'HUMAN_ERROR', 'NATURAL_DISASTER', 'MALICIOUS_ACTIVITY', 'SUPPLY_CHAIN_DISRUPTION', 'UTILITY_OUTAGE', 'HEALTH_EMERGENCY', 'OTHER');

-- CreateEnum
CREATE TYPE "IncidentSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('REPORTED', 'ASSESSED', 'RESPONDING', 'ESCALATED', 'RESOLVED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ImpactArea" AS ENUM ('FINANCIAL', 'OPERATIONAL', 'REPUTATIONAL', 'LEGAL', 'SAFETY', 'ENVIRONMENTAL');

-- CreateEnum
CREATE TYPE "IncidentUpdateType" AS ENUM ('STATUS_CHANGE', 'ACTION_TAKEN', 'INFORMATION_UPDATE', 'ESCALATION');

-- CreateEnum
CREATE TYPE "RecoveryTaskStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- CreateTable
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL,
    "incidentNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "IncidentCategory" NOT NULL,
    "severity" "IncidentSeverity" NOT NULL,
    "status" "IncidentStatus" NOT NULL DEFAULT 'REPORTED',
    "impactAreas" "ImpactArea"[],
    "businessImpact" TEXT NOT NULL,
    "estimatedFinancialImpact" DOUBLE PRECISION,
    "affectedProcessIds" TEXT[],
    "affectedLocations" TEXT[],
    "affectedSystems" TEXT[],
    "detectionTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reportTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responseStartTime" TIMESTAMP(3),
    "resolutionTime" TIMESTAMP(3),
    "closureTime" TIMESTAMP(3),
    "initialResponseActions" TEXT NOT NULL,
    "escalationDetails" TEXT,
    "rootCause" TEXT,
    "correctiveActions" TEXT,
    "preventiveActions" TEXT,
    "reportedBy" TEXT NOT NULL,
    "assignedTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncidentUpdate" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "updateType" "IncidentUpdateType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "previousStatus" "IncidentStatus",
    "newStatus" "IncidentStatus",
    "actionsTaken" TEXT[],
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IncidentUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncidentDecision" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "decisionNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "decisionMaker" TEXT NOT NULL,
    "decisionRationale" TEXT NOT NULL,
    "optionsConsidered" TEXT[],
    "implementationPlan" TEXT,
    "decisionTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IncidentDecision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncidentCommunication" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "communicationType" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "recipients" TEXT[],
    "sentBy" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IncidentCommunication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecoveryTask" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "taskNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "RecoveryTaskStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "priority" "TaskPriority" NOT NULL,
    "assignedTo" TEXT,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecoveryTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Incident_incidentNumber_key" ON "Incident"("incidentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "IncidentDecision_incidentId_decisionNumber_key" ON "IncidentDecision"("incidentId", "decisionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "RecoveryTask_incidentId_taskNumber_key" ON "RecoveryTask"("incidentId", "taskNumber");

-- AddForeignKey
ALTER TABLE "IncidentUpdate" ADD CONSTRAINT "IncidentUpdate_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentDecision" ADD CONSTRAINT "IncidentDecision_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentCommunication" ADD CONSTRAINT "IncidentCommunication_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecoveryTask" ADD CONSTRAINT "RecoveryTask_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;
