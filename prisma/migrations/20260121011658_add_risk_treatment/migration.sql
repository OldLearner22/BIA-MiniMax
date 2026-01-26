-- CreateTable
CREATE TABLE "RiskTreatment" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "strategy" TEXT NOT NULL,
    "actionPlan" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "owner" TEXT,
    "targetDate" TIMESTAMP(3),
    "residualRisk" TEXT,
    "riskId" TEXT,
    "threatId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',

    CONSTRAINT "RiskTreatment_pkey" PRIMARY KEY ("id")
);
