-- ============================================================================
-- REMOVE EXTRA TABLES NOT IN PRISMA SCHEMA
-- ============================================================================
-- This migration removes tables that exist in the database but are not
-- defined in the current Prisma schema. These tables were created by
-- previous migrations or manual operations.
-- ============================================================================

-- Drop Incident Management tables (in reverse dependency order)
DROP TABLE IF EXISTS "IncidentUpdate" CASCADE;
DROP TABLE IF EXISTS "IncidentDecision" CASCADE;
DROP TABLE IF EXISTS "IncidentCommunication" CASCADE;
DROP TABLE IF EXISTS "IncidentTeamAssignment" CASCADE;
DROP TABLE IF EXISTS "RecoveryTask" CASCADE;
DROP TABLE IF EXISTS "Incident" CASCADE;

-- Drop BC People/Roles tables (in reverse dependency order)
DROP TABLE IF EXISTS bc_cascade_steps CASCADE;
DROP TABLE IF EXISTS bc_communication_cascades CASCADE;
DROP TABLE IF EXISTS bc_succession_plans CASCADE;
DROP TABLE IF EXISTS bc_person_competencies CASCADE;
DROP TABLE IF EXISTS bc_competencies CASCADE;
DROP TABLE IF EXISTS bc_training_records CASCADE;
DROP TABLE IF EXISTS bc_contact_methods CASCADE;
DROP TABLE IF EXISTS bc_role_assignments CASCADE;
DROP TABLE IF EXISTS bc_team_structure CASCADE;
DROP TABLE IF EXISTS bc_roles CASCADE;
DROP TABLE IF EXISTS bc_people CASCADE;

-- Drop any related indexes (if they weren't dropped with CASCADE)
DROP INDEX IF EXISTS idx_bc_people_org_id;
DROP INDEX IF EXISTS idx_bc_people_manager;
DROP INDEX IF EXISTS idx_bc_people_status;
DROP INDEX IF EXISTS idx_bc_roles_org_id;
DROP INDEX IF EXISTS idx_bc_team_structure_parent;
DROP INDEX IF EXISTS idx_bc_team_structure_org_id;
DROP INDEX IF EXISTS idx_bc_role_assignments_person;
DROP INDEX IF EXISTS idx_bc_role_assignments_active;
DROP INDEX IF EXISTS idx_bc_training_expiry;
DROP INDEX IF EXISTS idx_bc_competencies_org_id;
