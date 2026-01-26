-- CreateTable
CREATE TABLE "StrategyAssessment" (
    "id" TEXT NOT NULL,
    "dimension" TEXT NOT NULL,
    "currentScore" DOUBLE PRECISION NOT NULL,
    "targetScore" DOUBLE PRECISION NOT NULL,
    "assessmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StrategyAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrategyObjective" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "kpi" TEXT NOT NULL,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "currentValue" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StrategyObjective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrategyInitiative" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "owner" TEXT,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "organizationId" TEXT NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StrategyInitiative_pkey" PRIMARY KEY ("id")
);
