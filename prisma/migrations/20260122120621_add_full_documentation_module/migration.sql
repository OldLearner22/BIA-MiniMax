-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('MANUAL', 'AUTO_GENERATED', 'TEMPLATE_BASED', 'POLICY', 'PROCEDURE', 'PLAYBOOK', 'CHECKLIST', 'REPORT');

-- CreateEnum
CREATE TYPE "ApprovalWorkflowStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ApprovalStepStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "CollaborationType" AS ENUM ('COMMENT', 'SUGGESTION', 'REVIEW', 'QUESTION');

-- CreateEnum
CREATE TYPE "ShareType" AS ENUM ('DIRECT_LINK', 'USER', 'GROUP', 'PUBLIC');

-- CreateEnum
CREATE TYPE "SharePermission" AS ENUM ('VIEW', 'COMMENT', 'EDIT', 'FULL_ACCESS');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AccessAction" ADD VALUE 'APPROVE';
ALTER TYPE "AccessAction" ADD VALUE 'REJECT';

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "approvalStatus" "ApprovalWorkflowStatus" NOT NULL DEFAULT 'NOT_STARTED',
ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedBy" TEXT,
ADD COLUMN     "templateId" TEXT,
ADD COLUMN     "type" "DocumentType" DEFAULT 'MANUAL';

-- AlterTable
ALTER TABLE "DocumentAccessLog" ADD COLUMN     "duration" INTEGER;

-- AlterTable
ALTER TABLE "DocumentVersion" ADD COLUMN     "changeSummary" JSONB;

-- CreateTable
CREATE TABLE "DocumentChange" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "field" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "changedBy" TEXT NOT NULL,
    "changeReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT,
    "type" "DocumentType" NOT NULL,
    "content" TEXT NOT NULL,
    "placeholders" JSONB,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentApprovalWorkflow" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "status" "ApprovalWorkflowStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "initiatedBy" TEXT NOT NULL,
    "initiatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,

    CONSTRAINT "DocumentApprovalWorkflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalStep" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "requiredRole" TEXT,
    "approvers" TEXT[],
    "status" "ApprovalStepStatus" NOT NULL DEFAULT 'PENDING',
    "assignedTo" TEXT,
    "comments" TEXT,
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "ApprovalStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalAction" (
    "id" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "comments" TEXT,
    "takenBy" TEXT NOT NULL,
    "takenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApprovalAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentCollaboration" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "type" "CollaborationType" NOT NULL,
    "content" TEXT NOT NULL,
    "position" JSONB,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentCollaboration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentShare" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "sharedBy" TEXT NOT NULL,
    "sharedWith" TEXT,
    "shareType" "ShareType" NOT NULL,
    "permission" "SharePermission" NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "accessCount" INTEGER NOT NULL DEFAULT 0,
    "lastAccessed" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentChange_documentId_idx" ON "DocumentChange"("documentId");

-- CreateIndex
CREATE INDEX "DocumentChange_createdAt_idx" ON "DocumentChange"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentTemplate_name_key" ON "DocumentTemplate"("name");

-- CreateIndex
CREATE INDEX "DocumentTemplate_type_idx" ON "DocumentTemplate"("type");

-- CreateIndex
CREATE INDEX "DocumentTemplate_categoryId_idx" ON "DocumentTemplate"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentApprovalWorkflow_documentId_key" ON "DocumentApprovalWorkflow"("documentId");

-- CreateIndex
CREATE INDEX "DocumentApprovalWorkflow_status_idx" ON "DocumentApprovalWorkflow"("status");

-- CreateIndex
CREATE INDEX "DocumentApprovalWorkflow_initiatedAt_idx" ON "DocumentApprovalWorkflow"("initiatedAt");

-- CreateIndex
CREATE INDEX "ApprovalStep_workflowId_idx" ON "ApprovalStep"("workflowId");

-- CreateIndex
CREATE INDEX "ApprovalStep_status_idx" ON "ApprovalStep"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ApprovalStep_workflowId_stepNumber_key" ON "ApprovalStep"("workflowId", "stepNumber");

-- CreateIndex
CREATE INDEX "ApprovalAction_stepId_idx" ON "ApprovalAction"("stepId");

-- CreateIndex
CREATE INDEX "DocumentCollaboration_documentId_idx" ON "DocumentCollaboration"("documentId");

-- CreateIndex
CREATE INDEX "DocumentCollaboration_type_idx" ON "DocumentCollaboration"("type");

-- CreateIndex
CREATE INDEX "DocumentCollaboration_resolved_idx" ON "DocumentCollaboration"("resolved");

-- CreateIndex
CREATE INDEX "DocumentCollaboration_createdAt_idx" ON "DocumentCollaboration"("createdAt");

-- CreateIndex
CREATE INDEX "DocumentShare_documentId_idx" ON "DocumentShare"("documentId");

-- CreateIndex
CREATE INDEX "DocumentShare_sharedWith_idx" ON "DocumentShare"("sharedWith");

-- CreateIndex
CREATE INDEX "DocumentShare_expiresAt_idx" ON "DocumentShare"("expiresAt");

-- CreateIndex
CREATE INDEX "Document_approvalStatus_idx" ON "Document"("approvalStatus");

-- CreateIndex
CREATE INDEX "Document_type_idx" ON "Document"("type");

-- CreateIndex
CREATE INDEX "Document_publishedAt_idx" ON "Document"("publishedAt");

-- CreateIndex
CREATE INDEX "DocumentAccessLog_userId_idx" ON "DocumentAccessLog"("userId");

-- CreateIndex
CREATE INDEX "DocumentVersion_createdAt_idx" ON "DocumentVersion"("createdAt");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentChange" ADD CONSTRAINT "DocumentChange_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentTemplate" ADD CONSTRAINT "DocumentTemplate_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "DocumentCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentApprovalWorkflow" ADD CONSTRAINT "DocumentApprovalWorkflow_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalStep" ADD CONSTRAINT "ApprovalStep_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "DocumentApprovalWorkflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalAction" ADD CONSTRAINT "ApprovalAction_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "ApprovalStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentCollaboration" ADD CONSTRAINT "DocumentCollaboration_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentShare" ADD CONSTRAINT "DocumentShare_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
