-- =====================================================
-- Incident Management Log Module - Database Schema
-- Part of Nexus BCMS Framework
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- INCIDENT LIFECYCLE MANAGEMENT
-- =====================================================

-- Incident Classifications and Types
CREATE TABLE incident_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    type_code VARCHAR(20) NOT NULL, -- 'CYBER', 'NATURAL', 'OPERATIONAL', 'PANDEMIC'
    type_name VARCHAR(100) NOT NULL,
    type_description TEXT,
    default_severity VARCHAR(20) DEFAULT 'medium', -- 'critical', 'high', 'medium', 'low'
    
    -- Response Configuration
    default_procedures JSONB, -- Array of procedure IDs that auto-activate
    required_teams JSONB, -- Array of required team roles
    escalation_thresholds JSONB, -- Conditions for automatic escalation
    
    -- Integration Points
    related_risks JSONB, -- Risk register scenarios this type addresses
    related_processes JSONB, -- BIA processes typically affected
    
    -- Compliance and Reporting
    regulatory_reporting_required BOOLEAN DEFAULT false,
    reporting_timeframe_hours INTEGER, -- Time to report to authorities
    notification_requirements JSONB, -- Who must be notified and when
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(organization_id, type_code),
    CONSTRAINT fk_incident_types_org FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Core Incidents Table
CREATE TABLE incident_management_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    
    -- Reference to Response Procedures incident if exists
    response_incident_id UUID,
    
    -- Incident Identification
    incident_number VARCHAR(50) NOT NULL, -- INC-2024-001
    incident_title VARCHAR(500) NOT NULL,
    incident_description TEXT,
    incident_type_id UUID NOT NULL,
    
    -- Classification and Severity
    initial_severity VARCHAR(20) NOT NULL, -- 'critical', 'high', 'medium', 'low'
    current_severity VARCHAR(20) NOT NULL,
    severity_justification TEXT,
    
    -- Status and Lifecycle
    status VARCHAR(50) NOT NULL DEFAULT 'declared', -- 'declared', 'active', 'contained', 'recovering', 'resolved', 'closed'
    lifecycle_stage VARCHAR(50), -- 'detection', 'response', 'containment', 'recovery', 'post_incident'
    
    -- Command Structure
    incident_commander_id UUID NOT NULL,
    deputy_commander_id UUID,
    scribe_id UUID, -- Person responsible for maintaining the log
    
    -- Timing Information
    detected_at TIMESTAMP WITH TIME ZONE,
    declared_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    first_response_at TIMESTAMP WITH TIME ZONE,
    contained_at TIMESTAMP WITH TIME ZONE,
    recovery_started_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    
    -- Impact Assessment
    affected_locations JSONB, -- Array of location identifiers
    affected_systems JSONB, -- Array of system/process identifiers
    affected_stakeholders JSONB, -- Internal and external stakeholder groups
    estimated_financial_impact DECIMAL(15,2),
    actual_financial_impact DECIMAL(15,2),
    
    -- Recovery Objectives
    recovery_time_objective INTERVAL, -- Target recovery time
    recovery_point_objective INTERVAL, -- Acceptable data loss window
    actual_recovery_time INTERVAL,
    actual_data_loss INTERVAL,
    
    -- External Coordination
    external_agencies_involved JSONB, -- Emergency services, regulators, vendors
    media_attention BOOLEAN DEFAULT false,
    public_communications_required BOOLEAN DEFAULT false,
    
    -- Lessons and Outcomes
    root_cause_analysis_complete BOOLEAN DEFAULT false,
    lessons_learned TEXT,
    improvement_actions JSONB, -- Array of follow-up actions
    
    -- Integration with BCMS Modules
    triggered_risk_scenarios JSONB, -- Risk register IDs that materialized
    activated_recovery_options JSONB, -- Recovery option IDs that were used
    executed_procedures JSONB, -- Response procedure IDs that were executed
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(organization_id, incident_number),
    CONSTRAINT fk_incident_mgmt_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_incident_mgmt_type FOREIGN KEY (incident_type_id) REFERENCES incident_types(id),
    CONSTRAINT fk_incident_mgmt_commander FOREIGN KEY (incident_commander_id) REFERENCES bc_people(id),
    CONSTRAINT fk_incident_mgmt_deputy FOREIGN KEY (deputy_commander_id) REFERENCES bc_people(id),
    CONSTRAINT fk_incident_mgmt_scribe FOREIGN KEY (scribe_id) REFERENCES bc_people(id)
);

-- Log Entry Categories
CREATE TABLE log_entry_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    category_code VARCHAR(20) NOT NULL, -- 'UPDATE', 'DECISION', 'COMMUNICATION', 'ACTION'
    category_name VARCHAR(100) NOT NULL,
    category_description TEXT,
    category_icon VARCHAR(10), -- Emoji or icon reference
    default_severity VARCHAR(20) DEFAULT 'info', -- 'critical', 'high', 'medium', 'low', 'info'
    requires_approval BOOLEAN DEFAULT false,
    auto_notify_roles JSONB, -- Roles to auto-notify when entries of this type are created
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(organization_id, category_code),
    CONSTRAINT fk_log_categories_org FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Main Incident Log Entries
CREATE TABLE incident_log_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    incident_id UUID NOT NULL,
    entry_number VARCHAR(20) NOT NULL, -- LOG-001, LOG-002
    
    -- Entry Classification
    category_id UUID NOT NULL,
    entry_type VARCHAR(50) NOT NULL, -- 'status_update', 'decision_log', 'communication', 'action_taken', 'milestone'
    severity VARCHAR(20) DEFAULT 'info', -- 'critical', 'high', 'medium', 'low', 'info'
    
    -- Entry Content
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    content_structured JSONB, -- Structured data specific to entry type
    
    -- Timing and Context
    event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL, -- When the actual event occurred
    logged_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- When it was logged
    
    -- Authoring
    logged_by UUID NOT NULL,
    on_behalf_of UUID, -- If logged by someone other than the person who took the action
    source VARCHAR(100), -- 'manual', 'system', 'automated', 'integration'
    
    -- Relationships and References
    parent_entry_id UUID, -- For threaded/related entries
    related_entries JSONB, -- Array of related log entry IDs
    
    -- Integration References
    related_procedure_execution_id UUID, -- Link to response procedure execution
    related_recovery_option_id UUID, -- Link to recovery option activation
    related_decision_id UUID, -- Link to formal decision if applicable
    related_communication_id UUID, -- Link to communication record
    
    -- Impact and Outcomes
    immediate_impact TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_assigned_to UUID,
    follow_up_deadline TIMESTAMP WITH TIME ZONE,
    follow_up_completed BOOLEAN DEFAULT false,
    
    -- Evidence and Attachments
    evidence_references JSONB, -- References to documents, screenshots, etc.
    witness_references JSONB, -- People who can verify the information
    
    -- Approval and Verification
    requires_verification BOOLEAN DEFAULT false,
    verified_by UUID,
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_notes TEXT,
    
    -- Search and Tags
    tags TEXT[], -- Array of tags for categorization and search
    keywords TEXT[], -- Keywords for search indexing
    search_vector TSVECTOR, -- Full-text search vector
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(incident_id, entry_number),
    CONSTRAINT fk_log_entries_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_log_entries_incident FOREIGN KEY (incident_id) REFERENCES incident_management_log(id) ON DELETE CASCADE,
    CONSTRAINT fk_log_entries_category FOREIGN KEY (category_id) REFERENCES log_entry_categories(id),
    CONSTRAINT fk_log_entries_logged_by FOREIGN KEY (logged_by) REFERENCES bc_people(id),
    CONSTRAINT fk_log_entries_behalf_of FOREIGN KEY (on_behalf_of) REFERENCES bc_people(id),
    CONSTRAINT fk_log_entries_parent FOREIGN KEY (parent_entry_id) REFERENCES incident_log_entries(id),
    CONSTRAINT fk_log_entries_follow_up FOREIGN KEY (follow_up_assigned_to) REFERENCES bc_people(id),
    CONSTRAINT fk_log_entries_verified_by FOREIGN KEY (verified_by) REFERENCES bc_people(id)
);

-- Formal Decision Log
CREATE TABLE incident_decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    incident_id UUID NOT NULL,
    decision_number VARCHAR(20) NOT NULL, -- DEC-001, DEC-002
    log_entry_id UUID, -- Link to the log entry that documents this decision
    
    -- Decision Context
    decision_title VARCHAR(500) NOT NULL,
    decision_description TEXT,
    decision_category VARCHAR(100), -- 'strategic', 'tactical', 'operational', 'communication', 'resource_allocation'
    urgency_level VARCHAR(20), -- 'immediate', 'urgent', 'normal', 'low'
    
    -- Decision Making Process
    decision_maker_id UUID NOT NULL,
    decision_maker_role VARCHAR(100), -- Role at time of decision
    decision_authority VARCHAR(100), -- Source of authority for this decision
    
    -- Consultation and Input
    consultation_required BOOLEAN DEFAULT false,
    consulted_parties JSONB, -- Array of people/teams consulted
    consultation_summary TEXT,
    stakeholder_input JSONB, -- Structured stakeholder feedback
    
    -- Options Analysis
    options_considered JSONB, -- Array of options with details
    decision_criteria TEXT, -- Factors considered in making the decision
    risk_assessment TEXT, -- Risks associated with the decision
    cost_benefit_analysis TEXT,
    
    -- Final Decision
    decision_made TEXT NOT NULL,
    decision_rationale TEXT NOT NULL,
    decision_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    decision_effective_from TIMESTAMP WITH TIME ZONE,
    decision_valid_until TIMESTAMP WITH TIME ZONE,
    
    -- Implementation
    implementation_required BOOLEAN DEFAULT true,
    implementation_plan TEXT,
    implementation_owner_id UUID,
    implementation_deadline TIMESTAMP WITH TIME ZONE,
    implementation_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled', 'failed'
    implementation_notes TEXT,
    
    -- Resources and Dependencies
    required_resources JSONB, -- Resources needed to implement decision
    dependencies JSONB, -- Other decisions or actions this depends on
    impacts_on_recovery BOOLEAN DEFAULT false,
    affects_stakeholder_communications BOOLEAN DEFAULT false,
    
    -- Review and Validation
    review_required BOOLEAN DEFAULT false,
    review_scheduled_for TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_outcome TEXT,
    decision_effectiveness VARCHAR(50), -- 'highly_effective', 'effective', 'partially_effective', 'ineffective', 'too_early'
    
    -- Learning and Improvement
    lessons_learned TEXT,
    would_decide_differently BOOLEAN,
    improvement_recommendations TEXT,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(incident_id, decision_number),
    CONSTRAINT fk_incident_decisions_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_incident_decisions_incident FOREIGN KEY (incident_id) REFERENCES incident_management_log(id) ON DELETE CASCADE,
    CONSTRAINT fk_incident_decisions_log_entry FOREIGN KEY (log_entry_id) REFERENCES incident_log_entries(id),
    CONSTRAINT fk_incident_decisions_maker FOREIGN KEY (decision_maker_id) REFERENCES bc_people(id),
    CONSTRAINT fk_incident_decisions_impl_owner FOREIGN KEY (implementation_owner_id) REFERENCES bc_people(id),
    CONSTRAINT fk_incident_decisions_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES bc_people(id)
);

-- Incident Team Structure
CREATE TABLE incident_team_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    incident_id UUID NOT NULL,
    person_id UUID NOT NULL,
    
    -- Role and Responsibilities
    assigned_role VARCHAR(100) NOT NULL, -- 'incident_commander', 'operations_lead', 'communications', 'scribe', 'subject_matter_expert'
    role_description TEXT,
    primary_responsibilities JSONB, -- Array of specific responsibilities
    
    -- Assignment Details
    assigned_by UUID NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    assignment_reason TEXT,
    expected_duration INTERVAL, -- How long this assignment is expected to last
    
    -- Status and Availability
    status VARCHAR(50) DEFAULT 'assigned', -- 'assigned', 'active', 'unavailable', 'relieved', 'escalated'
    availability VARCHAR(50) DEFAULT 'available', -- 'available', 'busy', 'unavailable', 'offline'
    current_location VARCHAR(255), -- Where the person is physically located
    contact_preference VARCHAR(50) DEFAULT 'mobile', -- 'mobile', 'email', 'radio', 'in_person'
    
    -- Performance and Workload
    active_tasks_count INTEGER DEFAULT 0,
    decisions_made_count INTEGER DEFAULT 0,
    communications_sent_count INTEGER DEFAULT 0,
    last_activity_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Check-in and Wellness
    last_checkin_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    wellness_status VARCHAR(50) DEFAULT 'good', -- 'good', 'tired', 'stressed', 'needs_relief'
    shift_start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    break_times JSONB, -- Array of break periods taken
    
    -- Relief and Handover
    relief_requested BOOLEAN DEFAULT false,
    relief_reason TEXT,
    relief_scheduled_for TIMESTAMP WITH TIME ZONE,
    relieved_by UUID,
    relieved_at TIMESTAMP WITH TIME ZONE,
    handover_notes TEXT,
    
    -- Integration Points
    competencies_required JSONB, -- Required competencies from bc_people
    certifications_needed JSONB, -- Specific certifications required
    security_clearance_required VARCHAR(50), -- Security clearance level needed
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_incident_team_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_incident_team_incident FOREIGN KEY (incident_id) REFERENCES incident_management_log(id) ON DELETE CASCADE,
    CONSTRAINT fk_incident_team_person FOREIGN KEY (person_id) REFERENCES bc_people(id),
    CONSTRAINT fk_incident_team_assigned_by FOREIGN KEY (assigned_by) REFERENCES bc_people(id),
    CONSTRAINT fk_incident_team_relieved_by FOREIGN KEY (relieved_by) REFERENCES bc_people(id),
    UNIQUE(incident_id, person_id, assigned_role) -- Person can only have one instance of each role per incident
);

-- Team Communications and Coordination
CREATE TABLE incident_team_communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    incident_id UUID NOT NULL,
    communication_id VARCHAR(50), -- COMM-001
    
    -- Communication Details
    communication_type VARCHAR(50) NOT NULL, -- 'internal', 'external', 'stakeholder', 'media', 'regulatory'
    message_type VARCHAR(50), -- 'status_update', 'request', 'instruction', 'alert', 'notification'
    urgency_level VARCHAR(20) DEFAULT 'normal', -- 'critical', 'high', 'normal', 'low'
    
    -- Sender and Recipients
    sent_by UUID NOT NULL,
    sent_by_role VARCHAR(100),
    recipients JSONB NOT NULL, -- Array of recipient identifiers
    recipient_groups JSONB, -- Array of group identifiers (teams, departments, etc.)
    
    -- Content
    subject VARCHAR(500),
    message_content TEXT NOT NULL,
    message_template_id UUID, -- Reference to template if used
    attachments JSONB, -- Array of attachment references
    
    -- Delivery Method and Status
    delivery_method VARCHAR(50), -- 'email', 'sms', 'voice', 'radio', 'messenger', 'broadcast'
    delivery_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'read', 'failed'
    sent_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    delivery_timestamp TIMESTAMP WITH TIME ZONE,
    read_timestamp TIMESTAMP WITH TIME ZONE,
    
    -- Response and Follow-up
    response_required BOOLEAN DEFAULT false,
    response_deadline TIMESTAMP WITH TIME ZONE,
    responses_received JSONB, -- Array of response records
    follow_up_required BOOLEAN DEFAULT false,
    
    -- Integration and Context
    related_log_entry_id UUID, -- Link to incident log entry
    related_decision_id UUID, -- Link to decision that triggered this communication
    related_procedure_id UUID, -- Link to procedure being executed
    triggered_by_system BOOLEAN DEFAULT false, -- Whether this was system-generated
    
    -- Compliance and Audit
    retention_period INTERVAL DEFAULT '7 years', -- How long to keep this communication
    compliance_relevant BOOLEAN DEFAULT false, -- Whether this is relevant for regulatory compliance
    privacy_classification VARCHAR(50) DEFAULT 'internal', -- 'public', 'internal', 'confidential', 'restricted'
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_incident_comms_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_incident_comms_incident FOREIGN KEY (incident_id) REFERENCES incident_management_log(id) ON DELETE CASCADE,
    CONSTRAINT fk_incident_comms_sent_by FOREIGN KEY (sent_by) REFERENCES bc_people(id),
    CONSTRAINT fk_incident_comms_log_entry FOREIGN KEY (related_log_entry_id) REFERENCES incident_log_entries(id),
    CONSTRAINT fk_incident_comms_decision FOREIGN KEY (related_decision_id) REFERENCES incident_decisions(id)
);

-- Recovery Milestone Tracking
CREATE TABLE incident_recovery_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    incident_id UUID NOT NULL,
    milestone_id VARCHAR(20) NOT NULL, -- MIL-001, MIL-002
    
    -- Milestone Definition
    milestone_name VARCHAR(255) NOT NULL,
    milestone_description TEXT,
    milestone_type VARCHAR(50), -- 'containment', 'system_recovery', 'service_restoration', 'full_operations'
    milestone_category VARCHAR(50), -- 'technical', 'operational', 'communication', 'compliance'
    
    -- Planning and Targets
    planned_start_time TIMESTAMP WITH TIME ZONE,
    planned_completion_time TIMESTAMP WITH TIME ZONE,
    estimated_duration INTERVAL,
    success_criteria TEXT,
    
    -- Dependencies and Prerequisites
    prerequisite_milestones JSONB, -- Array of milestone IDs that must complete first
    required_resources JSONB, -- Resources needed to achieve this milestone
    responsible_team_id UUID, -- Team/person responsible
    
    -- Actual Progress
    status VARCHAR(50) DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed', 'failed', 'cancelled'
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_completion_time TIMESTAMP WITH TIME ZONE,
    actual_duration INTERVAL,
    completion_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Issues and Challenges
    issues_encountered TEXT,
    delays_reason TEXT,
    additional_resources_needed JSONB,
    escalation_required BOOLEAN DEFAULT false,
    escalated_to UUID,
    escalated_at TIMESTAMP WITH TIME ZONE,
    
    -- Quality and Validation
    validation_required BOOLEAN DEFAULT false,
    validated_by UUID,
    validated_at TIMESTAMP WITH TIME ZONE,
    validation_notes TEXT,
    quality_score INTEGER CHECK (quality_score BETWEEN 1 AND 10),
    
    -- Integration Points
    related_recovery_option_id UUID, -- Link to recovery option from Recovery Options module
    related_procedure_executions JSONB, -- Array of procedure execution IDs
    related_log_entries JSONB, -- Array of log entry IDs
    
    -- Impact and Benefits
    impact_on_rto INTERVAL, -- How this affects overall recovery time
    impact_on_rpo INTERVAL, -- How this affects recovery point objective
    business_value_restored DECIMAL(10,2), -- Percentage of business value restored
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(incident_id, milestone_id),
    CONSTRAINT fk_recovery_milestones_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_recovery_milestones_incident FOREIGN KEY (incident_id) REFERENCES incident_management_log(id) ON DELETE CASCADE,
    CONSTRAINT fk_recovery_milestones_team FOREIGN KEY (responsible_team_id) REFERENCES bc_people(id),
    CONSTRAINT fk_recovery_milestones_escalated FOREIGN KEY (escalated_to) REFERENCES bc_people(id),
    CONSTRAINT fk_recovery_milestones_validated FOREIGN KEY (validated_by) REFERENCES bc_people(id)
);

-- =====================================================
-- ANALYTICS AND PERFORMANCE VIEWS
-- =====================================================

-- Incident Command Dashboard View
CREATE VIEW incident_command_dashboard AS
SELECT 
    iml.organization_id,
    iml.id as incident_id,
    iml.incident_number,
    iml.incident_title,
    iml.current_severity,
    iml.status,
    iml.declared_at,
    
    -- Duration Calculations
    CASE 
        WHEN iml.resolved_at IS NOT NULL THEN 
            EXTRACT(EPOCH FROM (iml.resolved_at - iml.declared_at)) / 3600
        ELSE 
            EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - iml.declared_at)) / 3600
    END as duration_hours,
    
    -- Team Metrics
    COUNT(DISTINCT ita.person_id) as team_size,
    COUNT(CASE WHEN ita.status = 'active' THEN 1 END) as active_team_members,
    COUNT(CASE WHEN ita.availability = 'available' THEN 1 END) as available_team_members,
    
    -- Log Activity
    COUNT(DISTINCT ile.id) as total_log_entries,
    COUNT(CASE WHEN ile.severity = 'critical' THEN 1 END) as critical_entries,
    COUNT(CASE WHEN ile.created_at >= CURRENT_TIMESTAMP - INTERVAL '1 hour' THEN 1 END) as entries_last_hour,
    
    -- Decisions and Communications
    COUNT(DISTINCT id_dec.id) as total_decisions,
    COUNT(CASE WHEN id_dec.implementation_status = 'pending' THEN 1 END) as pending_decisions,
    COUNT(DISTINCT itc.id) as total_communications,
    COUNT(CASE WHEN itc.delivery_status = 'failed' THEN 1 END) as failed_communications,
    
    -- Recovery Progress
    AVG(irm.completion_percentage) as avg_recovery_progress,
    COUNT(CASE WHEN irm.status = 'completed' THEN 1 END) as completed_milestones,
    COUNT(irm.id) as total_milestones
    
FROM incident_management_log iml
LEFT JOIN incident_team_assignments ita ON iml.id = ita.incident_id AND ita.is_active = true
LEFT JOIN incident_log_entries ile ON iml.id = ile.incident_id AND ile.is_active = true
LEFT JOIN incident_decisions id_dec ON iml.id = id_dec.incident_id AND id_dec.is_active = true
LEFT JOIN incident_team_communications itc ON iml.id = itc.incident_id
LEFT JOIN incident_recovery_milestones irm ON iml.id = irm.incident_id
WHERE iml.is_active = true
  AND iml.status IN ('declared', 'active', 'contained', 'recovering')
GROUP BY iml.organization_id, iml.id, iml.incident_number, iml.incident_title, 
         iml.current_severity, iml.status, iml.declared_at, iml.resolved_at;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Core Incident Indexes
CREATE INDEX idx_incident_mgmt_log_org_status ON incident_management_log(organization_id, status) WHERE is_active = true;
CREATE INDEX idx_incident_mgmt_log_declared_at ON incident_management_log(declared_at);
CREATE INDEX idx_incident_mgmt_log_type ON incident_management_log(incident_type_id);
CREATE INDEX idx_incident_mgmt_log_commander ON incident_management_log(incident_commander_id);

-- Log Entries Indexes
CREATE INDEX idx_incident_log_entries_incident_time ON incident_log_entries(incident_id, event_timestamp);
CREATE INDEX idx_incident_log_entries_category ON incident_log_entries(category_id, severity);
CREATE INDEX idx_incident_log_entries_search ON incident_log_entries USING gin(search_vector);
CREATE INDEX idx_incident_log_entries_tags ON incident_log_entries USING gin(tags);

-- Team Assignment Indexes
CREATE INDEX idx_incident_team_assignments_incident ON incident_team_assignments(incident_id) WHERE is_active = true;
CREATE INDEX idx_incident_team_assignments_person ON incident_team_assignments(person_id, status);

-- Communications Indexes
CREATE INDEX idx_incident_team_comms_incident ON incident_team_communications(incident_id, sent_timestamp);

-- Recovery Milestones Indexes
CREATE INDEX idx_incident_recovery_milestones_incident ON incident_recovery_milestones(incident_id, status);

-- =====================================================
-- TRIGGERS FOR AUTOMATION
-- =====================================================

-- Auto-generate entry numbers
CREATE OR REPLACE FUNCTION generate_log_entry_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.entry_number := 'LOG-' || LPAD((
        SELECT COALESCE(MAX(CAST(SUBSTRING(entry_number FROM 5) AS INTEGER)), 0) + 1
        FROM incident_log_entries
        WHERE incident_id = NEW.incident_id
    )::TEXT, 3, '0');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_log_entry_number
    BEFORE INSERT ON incident_log_entries
    FOR EACH ROW
    WHEN (NEW.entry_number IS NULL)
    EXECUTE FUNCTION generate_log_entry_number();

-- Update search vectors
CREATE OR REPLACE FUNCTION update_log_entry_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_log_entry_search_vector
    BEFORE INSERT OR UPDATE OF title, content, tags ON incident_log_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_log_entry_search_vector();

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Sample Incident Types
INSERT INTO incident_types (organization_id, type_code, type_name, type_description, default_severity) VALUES
(gen_random_uuid(), 'CYBER', 'Cyber Security Incident', 'Security breaches, malware, unauthorized access', 'high'),
(gen_random_uuid(), 'NATURAL', 'Natural Disaster', 'Floods, earthquakes, storms, extreme weather', 'medium'),
(gen_random_uuid(), 'OPERATIONAL', 'Operational Failure', 'System failures, process breakdowns, human error', 'medium'),
(gen_random_uuid(), 'PANDEMIC', 'Pandemic Response', 'Health emergencies, workforce disruption', 'high'),
(gen_random_uuid(), 'SUPPLIER', 'Supplier Disruption', 'Supply chain interruptions, vendor failures', 'medium');

-- Sample Log Entry Categories
INSERT INTO log_entry_categories (organization_id, category_code, category_name, category_description, category_icon) VALUES
(gen_random_uuid(), 'UPDATE', 'Status Update', 'General status updates and progress reports', '📊'),
(gen_random_uuid(), 'DECISION', 'Decision Log', 'Formal decisions and their rationale', '⚖️'),
(gen_random_uuid(), 'COMMUNICATION', 'Communication', 'Stakeholder communications and notifications', '📢'),
(gen_random_uuid(), 'ACTION', 'Action Taken', 'Specific actions and their outcomes', '⚡'),
(gen_random_uuid(), 'MILESTONE', 'Milestone', 'Recovery milestones and achievements', '🎯');

COMMENT ON TABLE incident_management_log IS 'Central incident management log for crisis coordination';
COMMENT ON TABLE incident_log_entries IS 'Chronological log of all incident activities and decisions';
COMMENT ON TABLE incident_decisions IS 'Formal decision tracking with rationale and implementation';
COMMENT ON TABLE incident_team_assignments IS 'Crisis team coordination and role management';
COMMENT ON TABLE incident_recovery_milestones IS 'Recovery progress tracking and milestone management';