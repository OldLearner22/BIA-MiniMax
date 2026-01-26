-- CreateEnum
CREATE TYPE "Criticality" AS ENUM ('critical', 'high', 'medium', 'low', 'minimal');

-- CreateEnum
CREATE TYPE "ProcessStatus" AS ENUM ('draft', 'in-review', 'approved');

-- CreateEnum
CREATE TYPE "RecoveryStrategy" AS ENUM ('high-availability', 'warm-standby', 'cold-backup', 'manual', 'cloud-based');

-- CreateEnum
CREATE TYPE "DependencyType" AS ENUM ('technical', 'operational', 'resource');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('personnel', 'systems', 'equipment', 'facilities', 'vendors', 'data');

-- CreateEnum
CREATE TYPE "RedundancyLevel" AS ENUM ('none', 'partial', 'full');

-- CreateEnum
CREATE TYPE "ResourceCriticality" AS ENUM ('essential', 'important', 'supporting');

-- CreateEnum
CREATE TYPE "ExerciseStatus" AS ENUM ('planned', 'scheduled', 'in-progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "ExerciseType" AS ENUM ('tabletop', 'walkthrough', 'simulation', 'full-scale');

-- CreateTable
CREATE TABLE "Process" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "criticality" "Criticality" NOT NULL,
    "status" "ProcessStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Process_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImpactAssessment" (
    "id" TEXT NOT NULL,
    "processId" TEXT NOT NULL,
    "financial" INTEGER NOT NULL,
    "operational" INTEGER NOT NULL,
    "reputational" INTEGER NOT NULL,
    "legal" INTEGER NOT NULL,
    "health" INTEGER NOT NULL,
    "environmental" INTEGER NOT NULL,

    CONSTRAINT "ImpactAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecoveryObjective" (
    "id" TEXT NOT NULL,
    "processId" TEXT NOT NULL,
    "mtpd" DOUBLE PRECISION NOT NULL,
    "rto" DOUBLE PRECISION NOT NULL,
    "rpo" DOUBLE PRECISION NOT NULL,
    "mbco" BOOLEAN NOT NULL,
    "recoveryStrategy" "RecoveryStrategy" NOT NULL,
    "strategyNotes" TEXT NOT NULL,

    CONSTRAINT "RecoveryObjective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dependency" (
    "id" TEXT NOT NULL,
    "sourceProcessId" TEXT NOT NULL,
    "targetProcessId" TEXT NOT NULL,
    "type" "DependencyType" NOT NULL,
    "criticality" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "sourceHandle" TEXT,
    "targetHandle" TEXT,

    CONSTRAINT "Dependency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessResource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ResourceType" NOT NULL,
    "description" TEXT NOT NULL,
    "rtoValue" DOUBLE PRECISION NOT NULL,
    "rtoUnit" TEXT NOT NULL,
    "rpoValue" DOUBLE PRECISION,
    "rpoUnit" TEXT,
    "redundancy" "RedundancyLevel" NOT NULL,
    "recoveryProcedure" TEXT,

    CONSTRAINT "BusinessResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorDetails" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contractReference" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "guaranteedRto" DOUBLE PRECISION NOT NULL,
    "availability" DOUBLE PRECISION NOT NULL,
    "supportHours" TEXT NOT NULL,
    "penaltyClause" TEXT,

    CONSTRAINT "VendorDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkaroundProcedure" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rtoImpact" DOUBLE PRECISION NOT NULL,
    "activationTime" DOUBLE PRECISION NOT NULL,
    "steps" TEXT[],

    CONSTRAINT "WorkaroundProcedure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceDependency" (
    "id" TEXT NOT NULL,
    "sourceResourceId" TEXT NOT NULL,
    "targetResourceId" TEXT NOT NULL,
    "type" "DependencyType" NOT NULL,
    "isBlocking" BOOLEAN NOT NULL,
    "description" TEXT NOT NULL,
    "sourceHandle" TEXT,
    "targetHandle" TEXT,

    CONSTRAINT "ResourceDependency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessResourceLink" (
    "id" TEXT NOT NULL,
    "processId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "criticality" "ResourceCriticality" NOT NULL,
    "quantityRequired" INTEGER NOT NULL,
    "notes" TEXT NOT NULL,
    "processHandle" TEXT,
    "resourceHandle" TEXT,

    CONSTRAINT "ProcessResourceLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TieredResourceRequirement" (
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "timeLabel" TEXT NOT NULL,
    "timeOffset" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "TieredResourceRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseRecord" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "ExerciseType" NOT NULL,
    "status" "ExerciseStatus" NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "completedDate" TIMESTAMP(3),
    "description" TEXT NOT NULL,
    "scope" JSONB NOT NULL,
    "participants" TEXT[],
    "findings" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExerciseRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FollowUpAction" (
    "id" TEXT NOT NULL,
    "exerciseRecordId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "completedDate" TIMESTAMP(3),

    CONSTRAINT "FollowUpAction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ImpactAssessment_processId_key" ON "ImpactAssessment"("processId");

-- CreateIndex
CREATE UNIQUE INDEX "RecoveryObjective_processId_key" ON "RecoveryObjective"("processId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorDetails_resourceId_key" ON "VendorDetails"("resourceId");

-- AddForeignKey
ALTER TABLE "ImpactAssessment" ADD CONSTRAINT "ImpactAssessment_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecoveryObjective" ADD CONSTRAINT "RecoveryObjective_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dependency" ADD CONSTRAINT "Dependency_sourceProcessId_fkey" FOREIGN KEY ("sourceProcessId") REFERENCES "Process"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dependency" ADD CONSTRAINT "Dependency_targetProcessId_fkey" FOREIGN KEY ("targetProcessId") REFERENCES "Process"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorDetails" ADD CONSTRAINT "VendorDetails_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "BusinessResource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkaroundProcedure" ADD CONSTRAINT "WorkaroundProcedure_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "BusinessResource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceDependency" ADD CONSTRAINT "ResourceDependency_sourceResourceId_fkey" FOREIGN KEY ("sourceResourceId") REFERENCES "BusinessResource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceDependency" ADD CONSTRAINT "ResourceDependency_targetResourceId_fkey" FOREIGN KEY ("targetResourceId") REFERENCES "BusinessResource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessResourceLink" ADD CONSTRAINT "ProcessResourceLink_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessResourceLink" ADD CONSTRAINT "ProcessResourceLink_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "BusinessResource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TieredResourceRequirement" ADD CONSTRAINT "TieredResourceRequirement_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "ProcessResourceLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUpAction" ADD CONSTRAINT "FollowUpAction_exerciseRecordId_fkey" FOREIGN KEY ("exerciseRecordId") REFERENCES "ExerciseRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
