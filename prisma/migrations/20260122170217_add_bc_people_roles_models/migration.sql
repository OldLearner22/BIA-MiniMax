-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('active', 'inactive', 'on_leave', 'terminated');

-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('executive', 'strategic', 'operational', 'support', 'specialist');

-- CreateEnum
CREATE TYPE "CriticalityLevel" AS ENUM ('critical', 'high', 'medium', 'low');

-- CreateEnum
CREATE TYPE "TeamStructureType" AS ENUM ('crisis_team', 'recovery_team', 'emergency_response', 'communication_team', 'business_unit');

-- CreateEnum
CREATE TYPE "AssignmentType" AS ENUM ('primary', 'backup', 'alternate', 'deputy');

-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('available', 'on_leave', 'unavailable', 'limited');

-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('email', 'phone', 'mobile', 'satellite_phone', 'radio', 'pager', 'teams', 'slack', 'whatsapp');

-- CreateEnum
CREATE TYPE "TrainingStatus" AS ENUM ('completed', 'in_progress', 'expired', 'failed');

-- CreateEnum
CREATE TYPE "CompetencyCategory" AS ENUM ('technical', 'leadership', 'communication', 'crisis_management', 'regulatory', 'business_specific');

-- CreateEnum
CREATE TYPE "AssessmentMethod" AS ENUM ('self_assessment', 'manager_assessment', 'peer_review', 'formal_test', 'observation');

-- CreateTable
CREATE TABLE "BCPerson" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "mobile" TEXT,
    "department" TEXT,
    "job_title" TEXT,
    "location" TEXT,
    "manager_id" TEXT,
    "hire_date" TIMESTAMP(3),
    "employment_status" "EmploymentStatus" NOT NULL DEFAULT 'active',
    "emergency_contact_name" TEXT,
    "emergency_contact_phone" TEXT,
    "profile_photo_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "organization_id" TEXT NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',

    CONSTRAINT "BCPerson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BCRole" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "role_type" "RoleType" NOT NULL,
    "criticality_level" "CriticalityLevel" NOT NULL DEFAULT 'medium',
    "min_experience_years" INTEGER NOT NULL DEFAULT 0,
    "required_certifications" TEXT[],
    "key_responsibilities" TEXT[],
    "authority_level" TEXT,
    "reporting_line" TEXT,
    "activation_criteria" TEXT,
    "escalation_authority" BOOLEAN NOT NULL DEFAULT false,
    "budget_authority_limit" DOUBLE PRECISION,
    "geographic_scope" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "organization_id" TEXT NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',

    CONSTRAINT "BCRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BCTeamStructure" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "structure_type" "TeamStructureType" NOT NULL,
    "parent_id" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "activation_triggers" TEXT[],
    "deactivation_criteria" TEXT,
    "meeting_frequency" TEXT,
    "reporting_schedule" TEXT,
    "position_x" DOUBLE PRECISION,
    "position_y" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "organization_id" TEXT NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',

    CONSTRAINT "BCTeamStructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BCRoleAssignment" (
    "id" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "team_structure_id" TEXT NOT NULL,
    "assignment_type" "AssignmentType" NOT NULL DEFAULT 'primary',
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notification_preferences" JSONB,
    "availability_status" "AvailabilityStatus" NOT NULL DEFAULT 'available',
    "last_training_date" TIMESTAMP(3),
    "next_training_due" TIMESTAMP(3),
    "competency_score" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BCRoleAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BCContactMethod" (
    "id" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,
    "contact_type" "ContactType" NOT NULL,
    "contact_value" TEXT NOT NULL,
    "priority_order" INTEGER NOT NULL DEFAULT 1,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "is_24_7_available" BOOLEAN NOT NULL DEFAULT false,
    "preferred_for_alerts" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BCContactMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BCTrainingRecord" (
    "id" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,
    "training_type" TEXT NOT NULL,
    "training_title" TEXT NOT NULL,
    "provider" TEXT,
    "completion_date" TIMESTAMP(3) NOT NULL,
    "expiry_date" TIMESTAMP(3),
    "certificate_number" TEXT,
    "certificate_url" TEXT,
    "score" INTEGER,
    "status" "TrainingStatus" NOT NULL,
    "renewal_required" BOOLEAN NOT NULL DEFAULT false,
    "renewal_reminder_days" INTEGER NOT NULL DEFAULT 30,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BCTrainingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BCCompetency" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "competency_category" "CompetencyCategory" NOT NULL,
    "required_for_roles" TEXT[],
    "assessment_criteria" TEXT,
    "proficiency_levels" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "organization_id" TEXT NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',

    CONSTRAINT "BCCompetency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BCPersonCompetency" (
    "id" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,
    "competency_id" TEXT NOT NULL,
    "proficiency_level" INTEGER NOT NULL,
    "assessment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assessor_id" TEXT,
    "assessment_method" "AssessmentMethod" NOT NULL,
    "evidence" TEXT,
    "next_assessment_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BCPersonCompetency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BCPerson_employee_id_key" ON "BCPerson"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "BCPerson_email_key" ON "BCPerson"("email");

-- CreateIndex
CREATE INDEX "BCPerson_organization_id_idx" ON "BCPerson"("organization_id");

-- CreateIndex
CREATE INDEX "BCPerson_employment_status_idx" ON "BCPerson"("employment_status");

-- CreateIndex
CREATE INDEX "BCPerson_manager_id_idx" ON "BCPerson"("manager_id");

-- CreateIndex
CREATE INDEX "BCRole_organization_id_idx" ON "BCRole"("organization_id");

-- CreateIndex
CREATE INDEX "BCRole_role_type_idx" ON "BCRole"("role_type");

-- CreateIndex
CREATE INDEX "BCTeamStructure_organization_id_idx" ON "BCTeamStructure"("organization_id");

-- CreateIndex
CREATE INDEX "BCTeamStructure_parent_id_idx" ON "BCTeamStructure"("parent_id");

-- CreateIndex
CREATE INDEX "BCTeamStructure_is_active_idx" ON "BCTeamStructure"("is_active");

-- CreateIndex
CREATE INDEX "BCRoleAssignment_person_id_idx" ON "BCRoleAssignment"("person_id");

-- CreateIndex
CREATE INDEX "BCRoleAssignment_role_id_idx" ON "BCRoleAssignment"("role_id");

-- CreateIndex
CREATE INDEX "BCRoleAssignment_team_structure_id_idx" ON "BCRoleAssignment"("team_structure_id");

-- CreateIndex
CREATE INDEX "BCRoleAssignment_is_active_idx" ON "BCRoleAssignment"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "BCRoleAssignment_person_id_role_id_team_structure_id_assign_key" ON "BCRoleAssignment"("person_id", "role_id", "team_structure_id", "assignment_type");

-- CreateIndex
CREATE INDEX "BCContactMethod_person_id_idx" ON "BCContactMethod"("person_id");

-- CreateIndex
CREATE INDEX "BCContactMethod_is_primary_idx" ON "BCContactMethod"("is_primary");

-- CreateIndex
CREATE INDEX "BCTrainingRecord_person_id_idx" ON "BCTrainingRecord"("person_id");

-- CreateIndex
CREATE INDEX "BCTrainingRecord_expiry_date_idx" ON "BCTrainingRecord"("expiry_date");

-- CreateIndex
CREATE INDEX "BCTrainingRecord_status_idx" ON "BCTrainingRecord"("status");

-- CreateIndex
CREATE INDEX "BCCompetency_organization_id_idx" ON "BCCompetency"("organization_id");

-- CreateIndex
CREATE INDEX "BCCompetency_competency_category_idx" ON "BCCompetency"("competency_category");

-- CreateIndex
CREATE INDEX "BCPersonCompetency_person_id_idx" ON "BCPersonCompetency"("person_id");

-- CreateIndex
CREATE INDEX "BCPersonCompetency_competency_id_idx" ON "BCPersonCompetency"("competency_id");

-- CreateIndex
CREATE UNIQUE INDEX "BCPersonCompetency_person_id_competency_id_key" ON "BCPersonCompetency"("person_id", "competency_id");

-- AddForeignKey
ALTER TABLE "BCPerson" ADD CONSTRAINT "BCPerson_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "BCPerson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BCTeamStructure" ADD CONSTRAINT "BCTeamStructure_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "BCTeamStructure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BCRoleAssignment" ADD CONSTRAINT "BCRoleAssignment_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "BCPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BCRoleAssignment" ADD CONSTRAINT "BCRoleAssignment_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "BCRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BCRoleAssignment" ADD CONSTRAINT "BCRoleAssignment_team_structure_id_fkey" FOREIGN KEY ("team_structure_id") REFERENCES "BCTeamStructure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BCContactMethod" ADD CONSTRAINT "BCContactMethod_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "BCPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BCTrainingRecord" ADD CONSTRAINT "BCTrainingRecord_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "BCPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BCPersonCompetency" ADD CONSTRAINT "BCPersonCompetency_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "BCPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BCPersonCompetency" ADD CONSTRAINT "BCPersonCompetency_competency_id_fkey" FOREIGN KEY ("competency_id") REFERENCES "BCCompetency"("id") ON DELETE CASCADE ON UPDATE CASCADE;
