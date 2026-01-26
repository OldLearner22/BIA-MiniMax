-- database/schema/incident.sql
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'REPORTED',
    
    -- Impact assessment
    impact_areas JSONB,
    business_impact TEXT,
    
    -- Timestamps (ISO 22301 requirements)
    detection_time TIMESTAMPTZ NOT NULL,
    report_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    response_start_time TIMESTAMPTZ,
    resolution_time TIMESTAMPTZ,
    closure_time TIMESTAMPTZ,
    
    -- Affected items
    affected_processes JSONB,
    affected_locations JSONB,
    affected_systems JSONB,
    
    -- Response information
    initial_response_actions TEXT,
    escalation_details TEXT,
    root_cause TEXT,
    corrective_actions TEXT,
    preventive_actions TEXT,
    
    -- Relationships
    reported_by VARCHAR(100) NOT NULL,
    assigned_to VARCHAR(100),
    bia_reference VARCHAR(100),
    bcp_reference VARCHAR(100),
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    updated_by VARCHAR(100) NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Indexes for performance
    INDEX idx_incidents_status (status),
    INDEX idx_incidents_severity (severity),
    INDEX idx_incidents_category (category),
    INDEX idx_incidents_created_at (created_at),
    INDEX idx_incidents_reported_by (reported_by)
);

CREATE TABLE incident_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    update_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    previous_status VARCHAR(20),
    new_status VARCHAR(20),
    actions_taken JSONB,
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_incident_updates_incident_id (incident_id),
    INDEX idx_incident_updates_created_at (created_at)
);

-- Audit trail table for compliance
CREATE TABLE incident_audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    user_role VARCHAR(50),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    details JSONB,
    
    INDEX idx_incident_audit_trail_incident_id (incident_id),
    INDEX idx_incident_audit_trail_timestamp (timestamp),
    INDEX idx_incident_audit_trail_action (action)
);

-- View for incident statistics
CREATE VIEW incident_statistics AS
SELECT
    COUNT(*) as total_incidents,
    COUNT(CASE WHEN status NOT IN ('CLOSED', 'CANCELLED') THEN 1 END) as unresolved_incidents,
    COUNT(CASE WHEN status = 'ESCALATED' THEN 1 END) as escalated_incidents,
    AVG(EXTRACT(EPOCH FROM (resolution_time - detection_time))/3600) as avg_resolution_hours,
    severity,
    status,
    category
FROM incidents
WHERE is_active = TRUE
GROUP BY severity, status, category;