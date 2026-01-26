-- CreateEnum
CREATE TYPE "RecoveryTier" AS ENUM ('immediate', 'rapid', 'standard', 'extended');

-- CreateEnum
CREATE TYPE "TestingStatus" AS ENUM ('pass', 'fail', 'pending', 'not_tested');

-- CreateEnum
CREATE TYPE "StrategyStatus" AS ENUM ('draft', 'submitted', 'approved', 'rejected', 'active', 'retired');

-- CreateEnum
CREATE TYPE "ApprovalStrategyType" AS ENUM ('recovery_option', 'cost_benefit', 'comprehensive_plan');

-- CreateTable
CREATE TABLE "RecoveryOption" (
    "id" TEXT NOT NULL,
    "processId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tier" "RecoveryTier" NOT NULL,
    "rtoValue" DOUBLE PRECISION NOT NULL,
    "rtoUnit" TEXT NOT NULL,
    "rpoValue" DOUBLE PRECISION NOT NULL,
    "rpoUnit" TEXT NOT NULL,
    "peopleRequired" INTEGER NOT NULL,
    "technologyType" TEXT NOT NULL,
    "facilityType" TEXT NOT NULL,
    "implementationCost" DOUBLE PRECISION NOT NULL,
    "operationalCost" DOUBLE PRECISION NOT NULL,
    "readinessScore" INTEGER NOT NULL,
    "lastTestedDate" TIMESTAMP(3),
    "testingStatus" "TestingStatus" NOT NULL,
    "testingNotes" TEXT,
    "dependsOn" TEXT[],
    "activationTriggers" TEXT[],
    "activationProcedure" TEXT,
    "status" "StrategyStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',

    CONSTRAINT "RecoveryOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostBenefitAnalysis" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "analysisDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "implementationPersonnel" DOUBLE PRECISION NOT NULL,
    "implementationTech" DOUBLE PRECISION NOT NULL,
    "implementationInfra" DOUBLE PRECISION NOT NULL,
    "implementationTraining" DOUBLE PRECISION NOT NULL,
    "implementationExternal" DOUBLE PRECISION NOT NULL,
    "implementationOther" DOUBLE PRECISION NOT NULL,
    "operationalPersonnel" DOUBLE PRECISION NOT NULL,
    "operationalTech" DOUBLE PRECISION NOT NULL,
    "operationalInfra" DOUBLE PRECISION NOT NULL,
    "operationalTraining" DOUBLE PRECISION NOT NULL,
    "operationalExternal" DOUBLE PRECISION NOT NULL,
    "operationalOther" DOUBLE PRECISION NOT NULL,
    "maintenancePersonnel" DOUBLE PRECISION NOT NULL,
    "maintenanceTech" DOUBLE PRECISION NOT NULL,
    "maintenanceInfra" DOUBLE PRECISION NOT NULL,
    "maintenanceTraining" DOUBLE PRECISION NOT NULL,
    "maintenanceExternal" DOUBLE PRECISION NOT NULL,
    "maintenanceOther" DOUBLE PRECISION NOT NULL,
    "avoidedFinancial" DOUBLE PRECISION NOT NULL,
    "avoidedOperational" DOUBLE PRECISION NOT NULL,
    "avoidedReputational" DOUBLE PRECISION NOT NULL,
    "avoidedLegal" DOUBLE PRECISION NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "totalBenefit" DOUBLE PRECISION NOT NULL,
    "netBenefit" DOUBLE PRECISION NOT NULL,
    "roi" DOUBLE PRECISION NOT NULL,
    "paybackPeriod" DOUBLE PRECISION NOT NULL,
    "bcRatio" DOUBLE PRECISION NOT NULL,
    "bestCaseRoi" DOUBLE PRECISION NOT NULL,
    "bestCaseNetBenefit" DOUBLE PRECISION NOT NULL,
    "worstCaseRoi" DOUBLE PRECISION NOT NULL,
    "worstCaseNetBenefit" DOUBLE PRECISION NOT NULL,
    "intangibleBenefits" TEXT[],
    "recommendation" TEXT NOT NULL,
    "recommendationNotes" TEXT NOT NULL,
    "riskReduction" DOUBLE PRECISION NOT NULL,
    "status" "StrategyStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',

    CONSTRAINT "CostBenefitAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostBenefitRecoveryOption" (
    "id" TEXT NOT NULL,
    "costBenefitAnalysisId" TEXT NOT NULL,
    "recoveryOptionId" TEXT NOT NULL,

    CONSTRAINT "CostBenefitRecoveryOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrategyApproval" (
    "id" TEXT NOT NULL,
    "strategyType" "ApprovalStrategyType" NOT NULL,
    "strategyId" TEXT NOT NULL,
    "strategyTitle" TEXT NOT NULL,
    "status" "ApprovalWorkflowStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "submittedBy" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submissionNotes" TEXT,
    "finalDecision" TEXT,
    "finalDecisionDate" TIMESTAMP(3),
    "finalDecisionBy" TEXT,
    "finalDecisionNotes" TEXT,
    "approvalConditions" TEXT[],
    "auditLog" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',

    CONSTRAINT "StrategyApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrategyApprovalStep" (
    "id" TEXT NOT NULL,
    "approvalId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "requiredRole" TEXT,
    "approvers" TEXT[],
    "status" "ApprovalStepStatus" NOT NULL DEFAULT 'PENDING',
    "assignedTo" TEXT,
    "comments" TEXT,
    "decision" TEXT,
    "decidedBy" TEXT,
    "decidedAt" TIMESTAMP(3),

    CONSTRAINT "StrategyApprovalStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecoveryOption_processId_idx" ON "RecoveryOption"("processId");

-- CreateIndex
CREATE INDEX "RecoveryOption_tier_idx" ON "RecoveryOption"("tier");

-- CreateIndex
CREATE INDEX "RecoveryOption_status_idx" ON "RecoveryOption"("status");

-- CreateIndex
CREATE INDEX "RecoveryOption_organizationId_idx" ON "RecoveryOption"("organizationId");

-- CreateIndex
CREATE INDEX "CostBenefitAnalysis_status_idx" ON "CostBenefitAnalysis"("status");

-- CreateIndex
CREATE INDEX "CostBenefitAnalysis_organizationId_idx" ON "CostBenefitAnalysis"("organizationId");

-- CreateIndex
CREATE INDEX "CostBenefitRecoveryOption_costBenefitAnalysisId_idx" ON "CostBenefitRecoveryOption"("costBenefitAnalysisId");

-- CreateIndex
CREATE INDEX "CostBenefitRecoveryOption_recoveryOptionId_idx" ON "CostBenefitRecoveryOption"("recoveryOptionId");

-- CreateIndex
CREATE UNIQUE INDEX "CostBenefitRecoveryOption_costBenefitAnalysisId_recoveryOpt_key" ON "CostBenefitRecoveryOption"("costBenefitAnalysisId", "recoveryOptionId");

-- CreateIndex
CREATE INDEX "StrategyApproval_strategyType_idx" ON "StrategyApproval"("strategyType");

-- CreateIndex
CREATE INDEX "StrategyApproval_status_idx" ON "StrategyApproval"("status");

-- CreateIndex
CREATE INDEX "StrategyApproval_organizationId_idx" ON "StrategyApproval"("organizationId");

-- CreateIndex
CREATE INDEX "StrategyApproval_strategyId_idx" ON "StrategyApproval"("strategyId");

-- CreateIndex
CREATE INDEX "StrategyApprovalStep_approvalId_idx" ON "StrategyApprovalStep"("approvalId");

-- CreateIndex
CREATE INDEX "StrategyApprovalStep_status_idx" ON "StrategyApprovalStep"("status");

-- CreateIndex
CREATE UNIQUE INDEX "StrategyApprovalStep_approvalId_stepNumber_key" ON "StrategyApprovalStep"("approvalId", "stepNumber");

-- AddForeignKey
ALTER TABLE "CostBenefitRecoveryOption" ADD CONSTRAINT "CostBenefitRecoveryOption_costBenefitAnalysisId_fkey" FOREIGN KEY ("costBenefitAnalysisId") REFERENCES "CostBenefitAnalysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostBenefitRecoveryOption" ADD CONSTRAINT "CostBenefitRecoveryOption_recoveryOptionId_fkey" FOREIGN KEY ("recoveryOptionId") REFERENCES "RecoveryOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategyApprovalStep" ADD CONSTRAINT "StrategyApprovalStep_approvalId_fkey" FOREIGN KEY ("approvalId") REFERENCES "StrategyApproval"("id") ON DELETE CASCADE ON UPDATE CASCADE;
