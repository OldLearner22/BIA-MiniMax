-- SQLite Database Schema for BIA Tool
-- Business Impact Analysis Tool - ISO 22301:2019 Compliant

-- ========================================
-- Main Tables
-- ========================================

-- Assessments: represents a complete business impact analysis session
CREATE TABLE IF NOT EXISTS assessments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    organization TEXT,
    created_date TEXT NOT NULL,
    modified_date TEXT NOT NULL,
    status TEXT DEFAULT 'draft',
    current_step INTEGER DEFAULT 1,
    description TEXT,
    settings TEXT, -- JSON storage for assessment-specific settings
    metadata TEXT  -- JSON storage for additional metadata
);

-- Processes: business functions being analyzed
CREATE TABLE IF NOT EXISTS processes (
    id TEXT PRIMARY KEY,
    assessment_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    department TEXT,
    owner TEXT,
    criticality_score INTEGER DEFAULT 3,
    criticality TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'draft',
    dependencies TEXT, -- JSON array of dependency IDs
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
);

-- Impact Assessments: severity of various impact types for a process
CREATE TABLE IF NOT EXISTS impact_assessments (
    id TEXT PRIMARY KEY,
    process_id TEXT NOT NULL,
    financial INTEGER DEFAULT 0,
    operational INTEGER DEFAULT 0,
    reputational INTEGER DEFAULT 0,
    legal INTEGER DEFAULT 0,
    health INTEGER DEFAULT 0,
    environmental INTEGER DEFAULT 0,
    customer INTEGER DEFAULT 0,
    strategic INTEGER DEFAULT 0,
    composite_score REAL DEFAULT 0,
    assessed_at TEXT NOT NULL,
    assessed_by TEXT,
    notes TEXT,
    FOREIGN KEY (process_id) REFERENCES processes(id) ON DELETE CASCADE
);

-- Timeline Points: how impacts evolve over time
CREATE TABLE IF NOT EXISTS timeline_points (
    id TEXT PRIMARY KEY,
    process_id TEXT NOT NULL,
    time_offset INTEGER NOT NULL, -- hours from disruption
    time_label TEXT,
    financial INTEGER DEFAULT 0,
    operational INTEGER DEFAULT 0,
    reputational INTEGER DEFAULT 0,
    legal INTEGER DEFAULT 0,
    health INTEGER DEFAULT 0,
    customer INTEGER DEFAULT 0,
    strategic INTEGER DEFAULT 0,
    cumulative_score REAL DEFAULT 0,
    FOREIGN KEY (process_id) REFERENCES processes(id) ON DELETE CASCADE
);

-- Recovery Objectives: recovery targets (MTPD, RTO, RPO)
CREATE TABLE IF NOT EXISTS recovery_objectives (
    id TEXT PRIMARY KEY,
    process_id TEXT NOT NULL,
    mtpd INTEGER DEFAULT 168, -- Maximum Tolerable Period of Disruption (hours)
    rto INTEGER DEFAULT 72,   -- Recovery Time Objective (hours)
    rpo INTEGER DEFAULT 24,   -- Recovery Point Objective (hours)
    mbco INTEGER DEFAULT 0,   -- Minimum Business Continuity Objective (boolean)
    recovery_strategy TEXT,
    strategy_notes TEXT,
    FOREIGN KEY (process_id) REFERENCES processes(id) ON DELETE CASCADE
);

-- Dependencies: relationships between processes
CREATE TABLE IF NOT EXISTS dependencies (
    id TEXT PRIMARY KEY,
    assessment_id TEXT NOT NULL,
    process_id TEXT NOT NULL,
    dependent_process_id TEXT,
    dependency_type TEXT, -- 'technical', 'operational', 'resource'
    criticality INTEGER DEFAULT 3,
    strength REAL DEFAULT 1.0,
    description TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
    FOREIGN KEY (process_id) REFERENCES processes(id) ON DELETE CASCADE,
    FOREIGN KEY (dependent_process_id) REFERENCES processes(id) ON DELETE SET NULL
);

-- Resources: personnel, technology, equipment, facilities, suppliers
CREATE TABLE IF NOT EXISTS resources (
    id TEXT PRIMARY KEY,
    assessment_id TEXT NOT NULL,
    process_id TEXT,
    resource_type TEXT NOT NULL, -- 'personnel', 'technology', 'equipment', 'facilities', 'suppliers'
    name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER DEFAULT 1,
    criticality INTEGER DEFAULT 3,
    backup_available INTEGER DEFAULT 0,
    backup_details TEXT,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
    FOREIGN KEY (process_id) REFERENCES processes(id) ON DELETE SET NULL
);

-- ========================================
-- Supporting Tables
-- ========================================

-- Audit Trail: tracks changes for compliance
CREATE TABLE IF NOT EXISTS audit_trail (
    id TEXT PRIMARY KEY,
    assessment_id TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL, -- 'create', 'update', 'delete'
    old_values TEXT,      -- JSON
    new_values TEXT,      -- JSON
    user_id TEXT,
    user_name TEXT,
    timestamp TEXT NOT NULL,
    ip_address TEXT,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
);

-- Reports: saved report configurations
CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    assessment_id TEXT NOT NULL,
    name TEXT NOT NULL,
    report_type TEXT NOT NULL, -- 'executive', 'detailed', 'presentation'
    config TEXT, -- JSON configuration
    created_at TEXT NOT NULL,
    generated_at TEXT,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
);

-- Notifications: application notifications
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    assessment_id TEXT,
    user_id TEXT,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    severity TEXT DEFAULT 'info', -- 'info', 'warning', 'error', 'success'
    is_read INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    expires_at TEXT,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
);

-- ========================================
-- Indexes for Performance
-- ========================================

CREATE INDEX IF NOT EXISTS idx_processes_assessment ON processes(assessment_id);
CREATE INDEX IF NOT EXISTS idx_processes_department ON processes(department);
CREATE INDEX IF NOT EXISTS idx_processes_owner ON processes(owner);
CREATE INDEX IF NOT EXISTS idx_impact_assessments_process ON impact_assessments(process_id);
CREATE INDEX IF NOT EXISTS idx_timeline_points_process ON timeline_points(process_id);
CREATE INDEX IF NOT EXISTS idx_timeline_points_time ON timeline_points(process_id, time_offset);
CREATE INDEX IF NOT EXISTS idx_recovery_objectives_process ON recovery_objectives(process_id);
CREATE INDEX IF NOT EXISTS idx_dependencies_assessment ON dependencies(assessment_id);
CREATE INDEX IF NOT EXISTS idx_dependencies_process ON dependencies(process_id);
CREATE INDEX IF NOT EXISTS idx_resources_assessment ON resources(assessment_id);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_trail_assessment ON audit_trail(assessment_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_timestamp ON audit_trail(timestamp);
CREATE INDEX IF NOT EXISTS idx_reports_assessment ON reports(assessment_id);
CREATE INDEX IF NOT EXISTS idx_notifications_assessment ON notifications(assessment_id);

-- ========================================
-- Views for Common Queries
-- ========================================

-- View: Process summary with impact scores
CREATE VIEW IF NOT EXISTS process_summary AS
SELECT 
    p.id as process_id,
    p.name as process_name,
    p.department,
    p.owner,
    p.criticality,
    p.status,
    ia.financial,
    ia.operational,
    ia.reputational,
    ia.composite_score,
    ro.mtpd,
    ro.rto,
    ro.rpo
FROM processes p
LEFT JOIN impact_assessments ia ON p.id = ia.process_id
LEFT JOIN recovery_objectives ro ON p.id = ro.process_id;

-- View: High-risk processes (composite score >= 4)
CREATE VIEW IF NOT EXISTS high_risk_processes AS
SELECT 
    p.id,
    p.name,
    p.department,
    p.owner,
    p.criticality,
    ia.composite_score,
    ro.mtpd,
    ro.rto
FROM processes p
JOIN impact_assessments ia ON p.id = ia.process_id
JOIN recovery_objectives ro ON p.id = ro.process_id
WHERE ia.composite_score >= 4.0
ORDER BY ia.composite_score DESC;

-- View: Dependency summary
CREATE VIEW IF NOT EXISTS dependency_summary AS
SELECT 
    d.id,
    d.assessment_id,
    d.dependency_type,
    d.criticality,
    p.name as process_name,
    dp.name as dependent_process_name
FROM dependencies d
JOIN processes p ON d.process_id = p.id
LEFT JOIN processes dp ON d.dependent_process_id = dp.id;
