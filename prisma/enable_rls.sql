-- Enable RLS on Core Tables
ALTER TABLE "Process" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ImpactAssessment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RecoveryObjective" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Dependency" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BusinessResource" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VendorDetails" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkaroundProcedure" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ResourceDependency" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProcessResourceLink" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TieredResourceRequirement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ExerciseRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FollowUpAction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Diagram" ENABLE ROW LEVEL SECURITY;

-- Note: Incident, Risk, Threat, etc. were already multi-tenant capability wise, but might not have RLS enabled yet.
ALTER TABLE "Incident" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Risk" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Threat" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StrategicPlanning" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RiskTreatment" ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- We use a single policy for ALL operations (SELECT, INSERT, UPDATE, DELETE) for simplicity
-- The rule is: You can see/mod rows where organizationId matches session variable 'app.current_tenant'

-- Process
DROP POLICY IF EXISTS "tenant_isolation_process" ON "Process";
CREATE POLICY "tenant_isolation_process" ON "Process"
    USING ("organizationId" = current_setting('app.current_tenant', true)::text)
    WITH CHECK ("organizationId" = current_setting('app.current_tenant', true)::text);

-- ImpactAssessment
DROP POLICY IF EXISTS "tenant_isolation_impact_assessment" ON "ImpactAssessment";
CREATE POLICY "tenant_isolation_impact_assessment" ON "ImpactAssessment"
    USING ("organizationId" = current_setting('app.current_tenant', true)::text)
    WITH CHECK ("organizationId" = current_setting('app.current_tenant', true)::text);

-- RecoveryObjective
DROP POLICY IF EXISTS "tenant_isolation_recovery_objective" ON "RecoveryObjective";
CREATE POLICY "tenant_isolation_recovery_objective" ON "RecoveryObjective"
    USING ("organizationId" = current_setting('app.current_tenant', true)::text)
    WITH CHECK ("organizationId" = current_setting('app.current_tenant', true)::text);

-- BusinessResource
DROP POLICY IF EXISTS "tenant_isolation_business_resource" ON "BusinessResource";
CREATE POLICY "tenant_isolation_business_resource" ON "BusinessResource"
    USING ("organizationId" = current_setting('app.current_tenant', true)::text)
    WITH CHECK ("organizationId" = current_setting('app.current_tenant', true)::text);

-- Dependency
DROP POLICY IF EXISTS "tenant_isolation_dependency" ON "Dependency";
CREATE POLICY "tenant_isolation_dependency" ON "Dependency"
    USING ("organizationId" = current_setting('app.current_tenant', true)::text)
    WITH CHECK ("organizationId" = current_setting('app.current_tenant', true)::text);

-- ResourceDependency
DROP POLICY IF EXISTS "tenant_isolation_resource_dependency" ON "ResourceDependency";
CREATE POLICY "tenant_isolation_resource_dependency" ON "ResourceDependency"
    USING ("organizationId" = current_setting('app.current_tenant', true)::text)
    WITH CHECK ("organizationId" = current_setting('app.current_tenant', true)::text);

-- ProcessResourceLink
DROP POLICY IF EXISTS "tenant_isolation_process_resource_link" ON "ProcessResourceLink";
CREATE POLICY "tenant_isolation_process_resource_link" ON "ProcessResourceLink"
    USING ("organizationId" = current_setting('app.current_tenant', true)::text)
    WITH CHECK ("organizationId" = current_setting('app.current_tenant', true)::text);

-- Diagram
DROP POLICY IF EXISTS "tenant_isolation_diagram" ON "Diagram";
CREATE POLICY "tenant_isolation_diagram" ON "Diagram"
    USING ("organizationId" = current_setting('app.current_tenant', true)::text)
    WITH CHECK ("organizationId" = current_setting('app.current_tenant', true)::text);

-- Incident
DROP POLICY IF EXISTS "tenant_isolation_incident" ON "Incident";
CREATE POLICY "tenant_isolation_incident" ON "Incident"
    USING ("organizationId" = current_setting('app.current_tenant', true)::text)
    WITH CHECK ("organizationId" = current_setting('app.current_tenant', true)::text);

-- Risk
DROP POLICY IF EXISTS "tenant_isolation_risk" ON "Risk";
CREATE POLICY "tenant_isolation_risk" ON "Risk"
    USING ("organizationId" = current_setting('app.current_tenant', true)::text)
    WITH CHECK ("organizationId" = current_setting('app.current_tenant', true)::text);

-- Bypass RLS for Seed/Migration (Optional, but usually we just set the variable in the seed script)
-- For now, we rely on the app setting the variable.
