-- CreateTable
CREATE TABLE "StrategicPlanning" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "actionPlan" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "owner" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',

    CONSTRAINT "StrategicPlanning_pkey" PRIMARY KEY ("id")
);
