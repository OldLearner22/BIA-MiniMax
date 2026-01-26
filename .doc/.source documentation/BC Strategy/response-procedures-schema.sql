-- =====================================================
-- Response Procedures Module - Database Schema
-- Part of Nexus BCMS Framework
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- CORE RESPONSE TABLES
-- =====================================================

-- Crisis Levels and Response Framework
CREATE TABLE response_crisis_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    level_code VARCHAR(20) NOT NULL, -- 'alpha', 'beta', 'gamma', 'delta'
    level_name VARCHAR(100) NOT NULL,
    level_description TEXT,
    severity_order INTEGER NOT NULL, -- 1=highest, 4=lowest
    auto_escalation_minutes INTEGER, -- Minutes before auto-escalation
    notification_templates JSONB, -- Template IDs for different notification types
    required_teams TEXT[], -- Array of required team types
    authority_level VARCHAR(50), -- 'executive', 'senior', 'operational'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(organization_id, level_code),
    CONSTRAINT fk_crisis_levels_org FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Response Incidents (Active Crisis Events)
CREATE TABLE response_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    incident_number VARCHAR(50) NOT NULL, -- INC-2024-001
    title VARCHAR(255) NOT NULL,
    description TEXT,
    crisis_level_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'declared', 'active', 'recovery', 'closed'
    severity VARCHAR(50) NOT NULL, -- 'critical', 'high', 'medium', 'low'
    category VARCHAR(100), -- 'cyber', 'natural_disaster', 'operational', 'pandemic'
    
    -- Incident Leadership
    incident_commander_id UUID, -- Person responsible for overall response
    deputy_commander_id UUID,
    communications_lead_id UUID,
    
    -- Timing Information
    declared_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    activated_at TIMESTAMP WITH TIME ZONE,
    escalated_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    
    -- Impact Assessment
    affected_processes JSONB, -- Array of process IDs from BIA
    estimated_impact_financial DECIMAL(15,2),
    estimated_impact_operational TEXT,
    affected_locations TEXT[],
    external_agencies_involved TEXT[],
    
    -- Recovery Targets
    target_recovery_time INTERVAL,
    actual_recovery_time INTERVAL,
    
    -- Documentation
    situation_report JSONB, -- Current situation summary
    lessons_learned TEXT,
    post_incident_review_completed BOOLEAN DEFAULT false,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(organization_id, incident_number),
    CONSTRAINT fk_incidents_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_incidents_crisis_level FOREIGN KEY (crisis_level_id) REFERENCES response_crisis_levels(id),
    CONSTRAINT fk_incidents_commander FOREIGN KEY (incident_commander_id) REFERENCES bc_people(id),
    CONSTRAINT fk_incidents_deputy FOREIGN KEY (deputy_commander_id) REFERENCES bc_people(id),
    CONSTRAINT fk_incidents_comms_lead FOREIGN KEY (communications_lead_id) REFERENCES bc_people(id)
);

-- =====================================================
-- RESPONSE PROCEDURES AND PLAYBOOKS
-- =====================================================

-- Response Procedure Categories
CREATE TABLE response_procedure_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    category_description TEXT,
    category_icon VARCHAR(20), -- Emoji or icon reference
    display_order INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(organization_id, category_name),
    CONSTRAINT fk_proc_categories_org FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Master Response Procedures (Templates)
CREATE TABLE response_procedures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    procedure_id VARCHAR(50) NOT NULL, -- RP-001
    procedure_name VARCHAR(255) NOT NULL,
    procedure_description TEXT,
    category_id UUID NOT NULL,
    
    -- Classification
    procedure_type VARCHAR(50) NOT NULL, -- 'critical', 'urgent', 'active', 'command'
    crisis_levels TEXT[] NOT NULL, -- Which crisis levels this applies to
    response_phase VARCHAR(50), -- 'immediate', 'short_term', 'long_term'
    
    -- Team and Resource Requirements
    responsible_team VARCHAR(100) NOT NULL, -- 'crisis', 'response', 'recovery', 'support'
    required_roles JSONB, -- Array of role requirements with counts
    estimated_duration INTERVAL, -- Expected completion time
    resource_requirements JSONB, -- Equipment, facilities, etc.
    
    -- Procedure Content
    procedure_objective TEXT,
    success_criteria TEXT[],
    prerequisite_procedures UUID[], -- Array of procedure IDs that must complete first
    
    -- Activation Criteria
    auto_activation_triggers JSONB, -- Conditions for automatic activation
    manual_activation_authority VARCHAR(100), -- Who can manually activate
    
    -- Integration Points
    related_processes JSONB, -- BIA process IDs this procedure supports
    related_risks JSONB, -- Risk register IDs this procedure addresses
    related_recovery_options JSONB, -- Recovery option IDs this procedure enables
    
    -- Documentation and Training
    training_required BOOLEAN DEFAULT false,
    competency_requirements JSONB,
    last_tested_date DATE,
    test_frequency_months INTEGER DEFAULT 12,
    procedure_documents JSONB, -- Array of document references
    
    -- Approval and Version Control
    version VARCHAR(20) DEFAULT '1.0',
    approved_by UUID,
    approved_date DATE,
    review_date DATE,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(organization_id, procedure_id),
    CONSTRAINT fk_procedures_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_procedures_category FOREIGN KEY (category_id) REFERENCES response_procedure_categories(id),
    CONSTRAINT fk_procedures_approved_by FOREIGN KEY (approved_by) REFERENCES bc_people(id)
);

-- Detailed Procedure Steps
CREATE TABLE response_procedure_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    procedure_id UUID NOT NULL,
    step_number INTEGER NOT NULL,
    step_title VARCHAR(255) NOT NULL,
    step_description TEXT,
    step_instructions TEXT, -- Detailed how-to instructions
    
    -- Step Classification
    step_type VARCHAR(50), -- 'action', 'decision', 'verification', 'notification'
    is_critical BOOLEAN DEFAULT false,
    is_parallel BOOLEAN DEFAULT false, -- Can be executed in parallel with other steps
    
    -- Time and Resource Requirements
    estimated_duration INTERVAL,
    required_role VARCHAR(100), -- Specific role that must perform this step
    required_resources JSONB, -- Specific resources needed for this step
    
    -- Dependencies and Conditions
    prerequisite_steps INTEGER[], -- Step numbers that must complete first
    conditional_logic JSONB, -- Conditions for step execution
    
    -- Verification and Quality Control
    verification_required BOOLEAN DEFAULT false,
    verification_criteria TEXT,
    verification_role VARCHAR(100), -- Who verifies completion
    
    -- Documentation Requirements
    documentation_required BOOLEAN DEFAULT false,
    evidence_requirements TEXT,
    
    -- Communication Requirements
    notification_required BOOLEAN DEFAULT false,
    notification_recipients JSONB, -- Who to notify when step completes
    notification_template_id UUID,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_proc_steps_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_proc_steps_procedure FOREIGN KEY (procedure_id) REFERENCES response_procedures(id) ON DELETE CASCADE,
    CONSTRAINT fk_proc_steps_role FOREIGN KEY (required_role) REFERENCES bc_roles(role_name),
    UNIQUE(procedure_id, step_number)
);

-- =====================================================
-- INCIDENT EXECUTION AND TRACKING
-- =====================================================

-- Active Procedure Executions (Instance of procedures for specific incidents)
CREATE TABLE response_procedure_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    incident_id UUID NOT NULL,
    procedure_id UUID NOT NULL,
    execution_number VARCHAR(50), -- RPE-001 (Response Procedure Execution)
    
    -- Execution Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'activated', 'executing', 'paused', 'completed', 'cancelled'
    priority VARCHAR(20) DEFAULT 'normal', -- 'critical', 'high', 'normal', 'low'
    
    -- Assignment and Responsibility
    assigned_team_leader_id UUID,
    assigned_team_members JSONB, -- Array of person IDs
    execution_location VARCHAR(255),
    
    -- Timing
    scheduled_start TIMESTAMP WITH TIME ZONE,
    actual_start TIMESTAMP WITH TIME ZONE,
    estimated_completion TIMESTAMP WITH TIME ZONE,
    actual_completion TIMESTAMP WITH TIME ZONE,
    total_duration INTERVAL,
    
    -- Progress Tracking
    steps_total INTEGER DEFAULT 0,
    steps_completed INTEGER DEFAULT 0,
    completion_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Issues and Barriers
    execution_issues JSONB, -- Array of issues encountered
    barriers_encountered TEXT[],
    escalations_required BOOLEAN DEFAULT false,
    
    -- Resource Utilization
    resources_allocated JSONB,
    resources_consumed JSONB,
    cost_estimate DECIMAL(12,2),
    actual_cost DECIMAL(12,2),
    
    -- Quality and Outcomes
    success_achieved BOOLEAN,
    objectives_met JSONB, -- Which objectives were achieved
    lessons_learned TEXT,
    improvement_recommendations TEXT,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_proc_exec_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_proc_exec_incident FOREIGN KEY (incident_id) REFERENCES response_incidents(id),
    CONSTRAINT fk_proc_exec_procedure FOREIGN KEY (procedure_id) REFERENCES response_procedures(id),
    CONSTRAINT fk_proc_exec_leader FOREIGN KEY (assigned_team_leader_id) REFERENCES bc_people(id)
);

-- Step Execution Tracking
CREATE TABLE response_step_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    execution_id UUID NOT NULL,
    procedure_step_id UUID NOT NULL,
    step_number INTEGER NOT NULL,
    
    -- Execution Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed', 'skipped'
    
    -- Assignment
    assigned_person_id UUID,
    assigned_role VARCHAR(100),
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration INTERVAL,
    
    -- Execution Details
    execution_notes TEXT,
    issues_encountered TEXT,
    resolution_notes TEXT,
    
    -- Verification
    verification_status VARCHAR(50), -- 'not_required', 'pending', 'verified', 'failed'
    verified_by_id UUID,
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_notes TEXT,
    
    -- Evidence and Documentation
    evidence_collected JSONB, -- References to documents, photos, etc.
    compliance_verified BOOLEAN DEFAULT false,
    
    -- Quality Metrics
    effectiveness_rating INTEGER CHECK (effectiveness_rating BETWEEN 1 AND 5),
    efficiency_rating INTEGER CHECK (efficiency_rating BETWEEN 1 AND 5),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_step_exec_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_step_exec_execution FOREIGN KEY (execution_id) REFERENCES response_procedure_executions(id) ON DELETE CASCADE,
    CONSTRAINT fk_step_exec_step FOREIGN KEY (procedure_step_id) REFERENCES response_procedure_steps(id),
    CONSTRAINT fk_step_exec_person FOREIGN KEY (assigned_person_id) REFERENCES bc_people(id),
    CONSTRAINT fk_step_exec_verified_by FOREIGN KEY (verified_by_id) REFERENCES bc_people(id),
    UNIQUE(execution_id, step_number)
);

-- =====================================================
-- COMMUNICATION AND COORDINATION
-- =====================================================

-- Response Communication Log
CREATE TABLE response_communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    incident_id UUID NOT NULL,
    communication_id VARCHAR(50), -- RC-001
    
    -- Communication Details
    communication_type VARCHAR(50) NOT NULL, -- 'internal', 'external', 'regulatory', 'media', 'customer'
    recipient_type VARCHAR(50), -- 'individual', 'team', 'department', 'external_agency', 'media', 'customers'
    recipients JSONB, -- Array of recipient identifiers
    
    -- Message Content
    subject VARCHAR(500),
    message_content TEXT NOT NULL,
    message_template_id UUID,
    urgency_level VARCHAR(20) DEFAULT 'normal', -- 'critical', 'high', 'normal', 'low'
    
    -- Delivery Information
    delivery_method VARCHAR(50), -- 'email', 'sms', 'voice', 'radio', 'app_notification', 'public_announcement'
    sent_by_id UUID NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Response Tracking
    delivery_confirmed BOOLEAN DEFAULT false,
    delivery_confirmation_at TIMESTAMP WITH TIME ZONE,
    response_required BOOLEAN DEFAULT false,
    response_deadline TIMESTAMP WITH TIME ZONE,
    response_received BOOLEAN DEFAULT false,
    response_content TEXT,
    response_received_at TIMESTAMP WITH TIME ZONE,
    
    -- Integration
    related_procedure_execution_id UUID,
    related_step_execution_id UUID,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_response_comm_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_response_comm_incident FOREIGN KEY (incident_id) REFERENCES response_incidents(id),
    CONSTRAINT fk_response_comm_sent_by FOREIGN KEY (sent_by_id) REFERENCES bc_people(id),
    CONSTRAINT fk_response_comm_proc_exec FOREIGN KEY (related_procedure_execution_id) REFERENCES response_procedure_executions(id),
    CONSTRAINT fk_response_comm_step_exec FOREIGN KEY (related_step_execution_id) REFERENCES response_step_executions(id)
);

-- =====================================================
-- RESOURCE MANAGEMENT
-- =====================================================

-- Response Resource Allocations
CREATE TABLE response_resource_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    incident_id UUID NOT NULL,
    resource_type VARCHAR(100) NOT NULL, -- 'personnel', 'equipment', 'facility', 'vehicle', 'technology'
    resource_identifier VARCHAR(255), -- ID or name of specific resource
    resource_description TEXT,
    
    -- Allocation Details
    allocated_to_procedure_id UUID,
    allocated_to_person_id UUID,
    allocated_quantity DECIMAL(10,2),
    allocated_unit VARCHAR(50), -- 'hours', 'days', 'units', 'licenses'
    
    -- Timing
    allocation_start TIMESTAMP WITH TIME ZONE,
    allocation_end TIMESTAMP WITH TIME ZONE,
    actual_usage_start TIMESTAMP WITH TIME ZONE,
    actual_usage_end TIMESTAMP WITH TIME ZONE,
    
    -- Cost and Availability
    estimated_cost DECIMAL(12,2),
    actual_cost DECIMAL(12,2),
    cost_center VARCHAR(100),
    availability_status VARCHAR(50), -- 'available', 'allocated', 'in_use', 'maintenance', 'unavailable'
    
    -- Location and Contact
    resource_location VARCHAR(255),
    resource_contact_person_id UUID,
    resource_contact_details JSONB,
    
    -- Performance and Issues
    utilization_percentage DECIMAL(5,2),
    performance_rating INTEGER CHECK (performance_rating BETWEEN 1 AND 5),
    issues_encountered TEXT,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_resource_alloc_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_resource_alloc_incident FOREIGN KEY (incident_id) REFERENCES response_incidents(id),
    CONSTRAINT fk_resource_alloc_procedure FOREIGN KEY (allocated_to_procedure_id) REFERENCES response_procedure_executions(id),
    CONSTRAINT fk_resource_alloc_person FOREIGN KEY (allocated_to_person_id) REFERENCES bc_people(id),
    CONSTRAINT fk_resource_contact FOREIGN KEY (resource_contact_person_id) REFERENCES bc_people(id)
);

-- =====================================================
-- DECISION TRACKING AND AUDIT
-- =====================================================

-- Response Decision Log
CREATE TABLE response_decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    incident_id UUID NOT NULL,
    decision_id VARCHAR(50), -- RD-001
    
    -- Decision Context
    decision_title VARCHAR(500) NOT NULL,
    decision_description TEXT,
    decision_category VARCHAR(100), -- 'strategic', 'tactical', 'operational', 'resource', 'communication'
    
    -- Decision Making Process
    decision_maker_id UUID NOT NULL,
    decision_authority_level VARCHAR(50), -- 'incident_commander', 'executive', 'operational'
    consultation_required BOOLEAN DEFAULT false,
    consulted_parties JSONB, -- Array of person IDs or teams consulted
    
    -- Decision Options and Analysis
    options_considered JSONB, -- Array of options with pros/cons
    decision_criteria TEXT,
    risk_considerations TEXT,
    resource_implications TEXT,
    
    -- Final Decision
    decision_made TEXT NOT NULL,
    decision_rationale TEXT,
    decision_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Implementation
    implementation_required BOOLEAN DEFAULT true,
    implementation_deadline TIMESTAMP WITH TIME ZONE,
    implementation_owner_id UUID,
    implementation_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
    implementation_notes TEXT,
    
    -- Review and Validation
    review_required BOOLEAN DEFAULT false,
    review_date TIMESTAMP WITH TIME ZONE,
    review_outcome TEXT,
    decision_effectiveness VARCHAR(50), -- 'highly_effective', 'effective', 'partially_effective', 'ineffective'
    
    -- Related Items
    related_procedure_execution_id UUID,
    related_communications JSONB, -- Array of communication IDs
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_decisions_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_decisions_incident FOREIGN KEY (incident_id) REFERENCES response_incidents(id),
    CONSTRAINT fk_decisions_maker FOREIGN KEY (decision_maker_id) REFERENCES bc_people(id),
    CONSTRAINT fk_decisions_impl_owner FOREIGN KEY (implementation_owner_id) REFERENCES bc_people(id),
    CONSTRAINT fk_decisions_proc_exec FOREIGN KEY (related_procedure_execution_id) REFERENCES response_procedure_executions(id)
);

-- =====================================================
-- INTEGRATION VIEWS AND ANALYTICS
-- =====================================================

-- Response Dashboard Summary View
CREATE VIEW response_dashboard_summary AS
SELECT 
    ri.organization_id,
    ri.id as incident_id,
    ri.incident_number,
    ri.title as incident_title,
    ri.status as incident_status,
    rcl.level_name as crisis_level,
    ri.declared_at,
    ri.activated_at,
    
    -- Procedure Execution Summary
    COUNT(rpe.id) as total_procedures,
    COUNT(CASE WHEN rpe.status = 'completed' THEN 1 END) as completed_procedures,
    COUNT(CASE WHEN rpe.status = 'executing' THEN 1 END) as executing_procedures,
    COUNT(CASE WHEN rpe.status = 'pending' THEN 1 END) as pending_procedures,
    
    -- Step Execution Summary
    SUM(rpe.steps_total) as total_steps,
    SUM(rpe.steps_completed) as completed_steps,
    ROUND(AVG(rpe.completion_percentage), 2) as overall_completion_percentage,
    
    -- Resource Summary
    COUNT(DISTINCT rra.id) as allocated_resources,
    SUM(rra.estimated_cost) as estimated_total_cost,
    
    -- Team Summary
    COUNT(DISTINCT rpe.assigned_team_leader_id) as team_leaders_deployed,
    
    -- Communication Summary
    COUNT(DISTINCT rc.id) as total_communications,
    COUNT(CASE WHEN rc.delivery_confirmed = true THEN 1 END) as confirmed_communications
    
FROM response_incidents ri
LEFT JOIN response_crisis_levels rcl ON ri.crisis_level_id = rcl.id
LEFT JOIN response_procedure_executions rpe ON ri.id = rpe.incident_id AND rpe.is_active = true
LEFT JOIN response_resource_allocations rra ON ri.id = rra.incident_id AND rra.is_active = true
LEFT JOIN response_communications rc ON ri.id = rc.incident_id AND rc.is_active = true
WHERE ri.is_active = true
GROUP BY ri.organization_id, ri.id, ri.incident_number, ri.title, ri.status, 
         rcl.level_name, ri.declared_at, ri.activated_at;

-- Response Procedure Performance View
CREATE VIEW response_procedure_performance AS
SELECT 
    rp.organization_id,
    rp.id as procedure_id,
    rp.procedure_id as procedure_code,
    rp.procedure_name,
    rp.procedure_type,
    rp.responsible_team,
    rp.estimated_duration,
    
    -- Execution Statistics
    COUNT(rpe.id) as total_executions,
    COUNT(CASE WHEN rpe.status = 'completed' THEN 1 END) as successful_executions,
    COUNT(CASE WHEN rpe.status = 'cancelled' THEN 1 END) as cancelled_executions,
    
    -- Performance Metrics
    AVG(EXTRACT(EPOCH FROM rpe.total_duration)) as avg_duration_seconds,
    AVG(rpe.completion_percentage) as avg_completion_percentage,
    AVG(CASE WHEN rpe.success_achieved = true THEN 100.0 ELSE 0.0 END) as success_rate,
    
    -- Resource Efficiency
    AVG(rpe.actual_cost) as avg_cost_per_execution,
    SUM(rpe.actual_cost) as total_cost_all_executions,
    
    -- Recent Performance
    MAX(rpe.actual_completion) as last_execution_date,
    COUNT(CASE WHEN rpe.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as executions_last_30_days
    
FROM response_procedures rp
LEFT JOIN response_procedure_executions rpe ON rp.id = rpe.procedure_id
WHERE rp.is_active = true
GROUP BY rp.organization_id, rp.id, rp.procedure_id, rp.procedure_name, 
         rp.procedure_type, rp.responsible_team, rp.estimated_duration;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Incident Management Indexes
CREATE INDEX idx_response_incidents_org_status ON response_incidents(organization_id, status) WHERE is_active = true;
CREATE INDEX idx_response_incidents_declared_at ON response_incidents(declared_at);
CREATE INDEX idx_response_incidents_crisis_level ON response_incidents(crisis_level_id);

-- Procedure Execution Indexes
CREATE INDEX idx_procedure_executions_incident ON response_procedure_executions(incident_id) WHERE is_active = true;
CREATE INDEX idx_procedure_executions_status ON response_procedure_executions(status);
CREATE INDEX idx_procedure_executions_team_leader ON response_procedure_executions(assigned_team_leader_id);

-- Step Execution Indexes
CREATE INDEX idx_step_executions_execution_status ON response_step_executions(execution_id, status);
CREATE INDEX idx_step_executions_assigned_person ON response_step_executions(assigned_person_id);

-- Communication Indexes
CREATE INDEX idx_response_communications_incident ON response_communications(incident_id) WHERE is_active = true;
CREATE INDEX idx_response_communications_sent_at ON response_communications(sent_at);
CREATE INDEX idx_response_communications_type ON response_communications(communication_type, recipient_type);

-- Resource Allocation Indexes
CREATE INDEX idx_resource_allocations_incident ON response_resource_allocations(incident_id) WHERE is_active = true;
CREATE INDEX idx_resource_allocations_type ON response_resource_allocations(resource_type, availability_status);

-- Decision Log Indexes
CREATE INDEX idx_response_decisions_incident ON response_decisions(incident_id) WHERE is_active = true;
CREATE INDEX idx_response_decisions_maker ON response_decisions(decision_maker_id);
CREATE INDEX idx_response_decisions_date ON response_decisions(decision_date);

-- =====================================================
-- TRIGGERS FOR AUTOMATION
-- =====================================================

-- Update procedure execution progress when steps complete
CREATE OR REPLACE FUNCTION update_procedure_execution_progress()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE response_procedure_executions 
    SET 
        steps_completed = (
            SELECT COUNT(*) 
            FROM response_step_executions 
            WHERE execution_id = NEW.execution_id 
            AND status = 'completed'
        ),
        completion_percentage = (
            SELECT ROUND(
                (COUNT(CASE WHEN status = 'completed' THEN 1 END)::decimal / COUNT(*)::decimal) * 100, 2
            )
            FROM response_step_executions 
            WHERE execution_id = NEW.execution_id
        ),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.execution_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_procedure_progress
    AFTER UPDATE OF status ON response_step_executions
    FOR EACH ROW
    WHEN (NEW.status = 'completed' OR NEW.status = 'failed')
    EXECUTE FUNCTION update_procedure_execution_progress();

-- Auto-complete procedure execution when all steps are done
CREATE OR REPLACE FUNCTION check_procedure_completion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.completion_percentage = 100 THEN
        UPDATE response_procedure_executions 
        SET 
            status = 'completed',
            actual_completion = CURRENT_TIMESTAMP,
            total_duration = CURRENT_TIMESTAMP - actual_start,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.id AND status != 'completed';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_complete_procedure
    AFTER UPDATE OF completion_percentage ON response_procedure_executions
    FOR EACH ROW
    WHEN (NEW.completion_percentage = 100)
    EXECUTE FUNCTION check_procedure_completion();

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Sample Crisis Levels
INSERT INTO response_crisis_levels (organization_id, level_code, level_name, level_description, severity_order, auto_escalation_minutes, required_teams, authority_level) VALUES
(gen_random_uuid(), 'alpha', 'Crisis Level Alpha', 'Maximum crisis level requiring immediate executive response', 1, 60, ARRAY['crisis', 'response', 'recovery', 'support'], 'executive'),
(gen_random_uuid(), 'beta', 'Crisis Level Beta', 'High-impact crisis requiring senior management coordination', 2, 120, ARRAY['response', 'recovery', 'support'], 'senior'),
(gen_random_uuid(), 'gamma', 'Crisis Level Gamma', 'Moderate crisis requiring operational team response', 3, 240, ARRAY['response', 'support'], 'operational'),
(gen_random_uuid(), 'delta', 'Crisis Level Delta', 'Minor incident requiring standard response procedures', 4, NULL, ARRAY['support'], 'operational');

-- Sample Procedure Categories
INSERT INTO response_procedure_categories (organization_id, category_name, category_description, category_icon, display_order) VALUES
(gen_random_uuid(), 'Crisis Management', 'Core crisis management and command procedures', '🚨', 1),
(gen_random_uuid(), 'Communications', 'Stakeholder communication and notification procedures', '📢', 2),
(gen_random_uuid(), 'IT Recovery', 'Technology and system recovery procedures', '💻', 3),
(gen_random_uuid(), 'Facility Management', 'Physical facility and security procedures', '🏢', 4),
(gen_random_uuid(), 'Business Operations', 'Core business process continuity procedures', '⚙️', 5);

COMMENT ON TABLE response_incidents IS 'Active crisis incidents requiring coordinated response';
COMMENT ON TABLE response_procedures IS 'Master templates for response procedures';
COMMENT ON TABLE response_procedure_executions IS 'Active instances of procedures being executed for specific incidents';
COMMENT ON TABLE response_step_executions IS 'Individual step tracking within procedure executions';
COMMENT ON TABLE response_communications IS 'All communications sent during incident response';
COMMENT ON TABLE response_resource_allocations IS 'Resource allocation and utilization tracking';
COMMENT ON TABLE response_decisions IS 'Decision audit trail during incident response';
