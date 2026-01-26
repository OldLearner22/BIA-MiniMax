/*
  Warnings:

  - You are about to drop the `bc_cascade_steps` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bc_communication_cascades` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bc_competencies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bc_contact_methods` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bc_people` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bc_person_competencies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bc_role_assignments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bc_roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bc_succession_plans` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bc_team_structure` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bc_training_records` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "bc_cascade_steps" DROP CONSTRAINT "bc_cascade_steps_cascade_id_fkey";

-- DropForeignKey
ALTER TABLE "bc_cascade_steps" DROP CONSTRAINT "bc_cascade_steps_person_id_fkey";

-- DropForeignKey
ALTER TABLE "bc_cascade_steps" DROP CONSTRAINT "bc_cascade_steps_role_id_fkey";

-- DropForeignKey
ALTER TABLE "bc_communication_cascades" DROP CONSTRAINT "bc_communication_cascades_team_structure_id_fkey";

-- DropForeignKey
ALTER TABLE "bc_contact_methods" DROP CONSTRAINT "bc_contact_methods_person_id_fkey";

-- DropForeignKey
ALTER TABLE "bc_people" DROP CONSTRAINT "bc_people_manager_id_fkey";

-- DropForeignKey
ALTER TABLE "bc_person_competencies" DROP CONSTRAINT "bc_person_competencies_assessor_id_fkey";

-- DropForeignKey
ALTER TABLE "bc_person_competencies" DROP CONSTRAINT "bc_person_competencies_competency_id_fkey";

-- DropForeignKey
ALTER TABLE "bc_person_competencies" DROP CONSTRAINT "bc_person_competencies_person_id_fkey";

-- DropForeignKey
ALTER TABLE "bc_role_assignments" DROP CONSTRAINT "bc_role_assignments_person_id_fkey";

-- DropForeignKey
ALTER TABLE "bc_role_assignments" DROP CONSTRAINT "bc_role_assignments_role_id_fkey";

-- DropForeignKey
ALTER TABLE "bc_role_assignments" DROP CONSTRAINT "bc_role_assignments_team_structure_id_fkey";

-- DropForeignKey
ALTER TABLE "bc_succession_plans" DROP CONSTRAINT "bc_succession_plans_backup_person_id_fkey";

-- DropForeignKey
ALTER TABLE "bc_succession_plans" DROP CONSTRAINT "bc_succession_plans_primary_role_assignment_id_fkey";

-- DropForeignKey
ALTER TABLE "bc_team_structure" DROP CONSTRAINT "bc_team_structure_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "bc_training_records" DROP CONSTRAINT "bc_training_records_person_id_fkey";

-- DropTable
DROP TABLE "bc_cascade_steps";

-- DropTable
DROP TABLE "bc_communication_cascades";

-- DropTable
DROP TABLE "bc_competencies";

-- DropTable
DROP TABLE "bc_contact_methods";

-- DropTable
DROP TABLE "bc_people";

-- DropTable
DROP TABLE "bc_person_competencies";

-- DropTable
DROP TABLE "bc_role_assignments";

-- DropTable
DROP TABLE "bc_roles";

-- DropTable
DROP TABLE "bc_succession_plans";

-- DropTable
DROP TABLE "bc_team_structure";

-- DropTable
DROP TABLE "bc_training_records";

-- CreateTable
CREATE TABLE "Diagram" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "processId" TEXT,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Diagram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Risk" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "criticality" TEXT NOT NULL,
    "probability" DOUBLE PRECISION NOT NULL,
    "impact" DOUBLE PRECISION NOT NULL,
    "exposure" DOUBLE PRECISION NOT NULL,
    "minProbability" DOUBLE PRECISION,
    "maxProbability" DOUBLE PRECISION,
    "mostLikelyProbability" DOUBLE PRECISION,
    "minImpact" DOUBLE PRECISION,
    "maxImpact" DOUBLE PRECISION,
    "mostLikelyImpact" DOUBLE PRECISION,
    "owner" TEXT,
    "mitigationStrategy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',

    CONSTRAINT "Risk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Diagram_processId_key" ON "Diagram"("processId");

-- AddForeignKey
ALTER TABLE "Diagram" ADD CONSTRAINT "Diagram_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process"("id") ON DELETE SET NULL ON UPDATE CASCADE;
