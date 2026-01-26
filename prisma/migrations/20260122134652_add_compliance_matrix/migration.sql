-- CreateEnum
CREATE TYPE "RequirementPriority" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "ComplianceStatus" AS ENUM ('NOT_ASSESSED', 'NON_COMPLIANT', 'PARTIAL', 'COMPLIANT', 'NOT_APPLICABLE');

-- CreateTable
CREATE TABLE "ComplianceFramework" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceFramework_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceRequirement" (
    "id" TEXT NOT NULL,
    "frameworkId" TEXT NOT NULL,
    "clause" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requiredDocument" TEXT NOT NULL,
    "priority" "RequirementPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "ComplianceStatus" NOT NULL DEFAULT 'NOT_ASSESSED',
    "documentId" TEXT,
    "lastReviewed" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,
    "nextReviewDate" TIMESTAMP(3),
    "evidenceNotes" TEXT,
    "implementationNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',

    CONSTRAINT "ComplianceRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ComplianceFramework_code_key" ON "ComplianceFramework"("code");

-- CreateIndex
CREATE INDEX "ComplianceRequirement_frameworkId_idx" ON "ComplianceRequirement"("frameworkId");

-- CreateIndex
CREATE INDEX "ComplianceRequirement_status_idx" ON "ComplianceRequirement"("status");

-- CreateIndex
CREATE INDEX "ComplianceRequirement_documentId_idx" ON "ComplianceRequirement"("documentId");

-- CreateIndex
CREATE INDEX "ComplianceRequirement_nextReviewDate_idx" ON "ComplianceRequirement"("nextReviewDate");

-- AddForeignKey
ALTER TABLE "ComplianceRequirement" ADD CONSTRAINT "ComplianceRequirement_frameworkId_fkey" FOREIGN KEY ("frameworkId") REFERENCES "ComplianceFramework"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceRequirement" ADD CONSTRAINT "ComplianceRequirement_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;
