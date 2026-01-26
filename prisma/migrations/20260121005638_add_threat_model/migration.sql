-- CreateTable
CREATE TABLE "Threat" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "likelihood" INTEGER NOT NULL,
    "impact" INTEGER NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "owner" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',

    CONSTRAINT "Threat_pkey" PRIMARY KEY ("id")
);
