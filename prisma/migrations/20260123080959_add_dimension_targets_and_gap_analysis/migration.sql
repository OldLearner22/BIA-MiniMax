-- CreateTable
CREATE TABLE "dimension_targets" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "dimension" TEXT NOT NULL,
    "targetLevel" INTEGER NOT NULL,
    "businessContext" TEXT NOT NULL,
    "successCriteria" TEXT NOT NULL,
    "timeline" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 0.2,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "dimension_targets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dimension_gap_analysis" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "dimension" TEXT NOT NULL,
    "currentLevel" INTEGER NOT NULL,
    "targetLevel" INTEGER NOT NULL,
    "currentScore" DOUBLE PRECISION NOT NULL,
    "gapPercentage" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'at-risk',
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dimension_gap_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dimension_targets_organizationId_idx" ON "dimension_targets"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "dimension_targets_organizationId_dimension_key" ON "dimension_targets"("organizationId", "dimension");

-- CreateIndex
CREATE INDEX "dimension_gap_analysis_organizationId_idx" ON "dimension_gap_analysis"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "dimension_gap_analysis_organizationId_dimension_key" ON "dimension_gap_analysis"("organizationId", "dimension");
