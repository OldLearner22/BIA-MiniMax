-- ============================================================================
-- PEOPLE & ROLES MODULE - DATABASE SCHEMA
-- ISO 22301 Business Continuity Management System
-- ============================================================================

-- Core people table
CREATE TABLE bc_people (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(50) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    mobile VARCHAR(50),
    department VARCHAR(100),
    job_title VARCHAR(150),
    location VARCHAR(255),
    manager_id UUID REFERENCES bc_people(id),
    hire_date DATE,
    employment_status VARCHAR(20) DEFAULT 'active' CHECK (employment_status IN ('active', 'inactive', 'on_leave', 'terminated')),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    profile_photo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    organization_id UUID NOT NULL -- Multi-tenant support
);

-- BC Team roles and responsibilities
CREATE TABLE bc_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    role_type VARCHAR(20) NOT NULL CHECK (role_type IN ('executive', 'strategic', 'operational', 'support', 'specialist')),
    criticality_level VARCHAR(20) DEFAULT 'medium' CHECK (criticality_level IN ('critical', 'high', 'medium', 'low')),
    min_experience_years INTEGER DEFAULT 0,
    required_certifications TEXT[], -- Array of required certifications
    key_responsibilities TEXT[],
    authority_level VARCHAR(100),
    reporting_line VARCHAR(100),
    activation_criteria TEXT,
    escalation_authority BOOLEAN DEFAULT FALSE,
    budget_authority_limit DECIMAL(15,2),
    geographic_scope VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    organization_id UUID NOT NULL
);

-- BC Team structure (organigram data)
CREATE TABLE bc_team_structure (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    structure_type VARCHAR(30) NOT NULL CHECK (structure_type IN ('crisis_team', 'recovery_team', 'emergency_response', 'communication_team', 'business_unit')),
    parent_id UUID REFERENCES bc_team_structure(id), -- Hierarchical structure
    level INTEGER NOT NULL DEFAULT 1, -- Depth in hierarchy
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    activation_triggers TEXT[],
    deactivation_criteria TEXT,
    meeting_frequency VARCHAR(50),
    reporting_schedule VARCHAR(50),
    position_x DECIMAL(10,2), -- For organigram positioning
    position_y DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    organization_id UUID NOT NULL
);

-- Assignment of people to roles within team structure
CREATE TABLE bc_role_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES bc_people(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES bc_roles(id) ON DELETE CASCADE,
    team_structure_id UUID NOT NULL REFERENCES bc_team_structure(id) ON DELETE CASCADE,
    assignment_type VARCHAR(20) DEFAULT 'primary' CHECK (assignment_type IN ('primary', 'backup', 'alternate', 'deputy')),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    notification_preferences JSONB, -- Email, SMS, phone preferences
    availability_status VARCHAR(20) DEFAULT 'available' CHECK (availability_status IN ('available', 'on_leave', 'unavailable', 'limited')),
    last_training_date DATE,
    next_training_due DATE,
    competency_score INTEGER CHECK (competency_score >= 0 AND competency_score <= 100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(person_id, role_id, team_structure_id, assignment_type)
);

-- Contact information and communication preferences
CREATE TABLE bc_contact_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES bc_people(id) ON DELETE CASCADE,
    contact_type VARCHAR(20) NOT NULL CHECK (contact_type IN ('email', 'phone', 'mobile', 'satellite_phone', 'radio', 'pager', 'teams', 'slack', 'whatsapp')),
    contact_value VARCHAR(255) NOT NULL,
    priority_order INTEGER DEFAULT 1,
    is_primary BOOLEAN DEFAULT FALSE,
    is_24_7_available BOOLEAN DEFAULT FALSE,
    preferred_for_alerts BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Training records and competencies
CREATE TABLE bc_training_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES bc_people(id) ON DELETE CASCADE,
    training_type VARCHAR(100) NOT NULL,
    training_title VARCHAR(255) NOT NULL,
    provider VARCHAR(255),
    completion_date DATE NOT NULL,
    expiry_date DATE,
    certificate_number VARCHAR(100),
    certificate_url VARCHAR(500),
    score INTEGER CHECK (score >= 0 AND score <= 100),
    status VARCHAR(20) NOT NULL CHECK (status IN ('completed', 'in_progress', 'expired', 'failed')),
    renewal_required BOOLEAN DEFAULT FALSE,
    renewal_reminder_days INTEGER DEFAULT 30,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Competency matrix
CREATE TABLE bc_competencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    competency_category VARCHAR(30) NOT NULL CHECK (competency_category IN ('technical', 'leadership', 'communication', 'crisis_management', 'regulatory', 'business_specific')),
    required_for_roles UUID[], -- Array of role IDs that require this competency
    assessment_criteria TEXT,
    proficiency_levels JSONB, -- JSON object defining levels (e.g., {"beginner": 1, "intermediate": 3, "expert": 5})
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    organization_id UUID NOT NULL
);

-- Person competency assessments
CREATE TABLE bc_person_competencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES bc_people(id) ON DELETE CASCADE,
    competency_id UUID NOT NULL REFERENCES bc_competencies(id) ON DELETE CASCADE,
    proficiency_level INTEGER NOT NULL CHECK (proficiency_level >= 1 AND proficiency_level <= 5),
    assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    assessor_id UUID REFERENCES bc_people(id),
    assessment_method VARCHAR(30) NOT NULL CHECK (assessment_method IN ('self_assessment', 'manager_assessment', 'peer_review', 'formal_test', 'observation')),
    evidence TEXT,
    next_assessment_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(person_id, competency_id)
);

-- Succession planning and backup assignments
CREATE TABLE bc_succession_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    primary_role_assignment_id UUID NOT NULL REFERENCES bc_role_assignments(id) ON DELETE CASCADE,
    backup_person_id UUID NOT NULL REFERENCES bc_people(id),
    succession_order INTEGER NOT NULL DEFAULT 1,
    readiness_level VARCHAR(30) NOT NULL CHECK (readiness_level IN ('ready_now', 'ready_in_6_months', 'ready_in_1_year', 'development_needed')),
    development_plan TEXT,
    last_updated_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Communication cascades and notification trees
CREATE TABLE bc_communication_cascades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    trigger_conditions TEXT[],
    cascade_type VARCHAR(30) NOT NULL CHECK (cascade_type IN ('emergency', 'business_disruption', 'recovery', 'all_clear', 'test')),
    team_structure_id UUID REFERENCES bc_team_structure(id),
    escalation_timeout_minutes INTEGER DEFAULT 30,
    max_escalation_levels INTEGER DEFAULT 3,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    organization_id UUID NOT NULL
);

-- Communication cascade steps
CREATE TABLE bc_cascade_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cascade_id UUID NOT NULL REFERENCES bc_communication_cascades(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    person_id UUID REFERENCES bc_people(id),
    role_id UUID REFERENCES bc_roles(id),
    message_template TEXT,
    delivery_methods TEXT[], -- ['email', 'phone', 'sms']
    timeout_minutes INTEGER DEFAULT 15,
    escalation_on_no_response BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_bc_people_org_id ON bc_people(organization_id);
CREATE INDEX idx_bc_people_manager ON bc_people(manager_id);
CREATE INDEX idx_bc_people_status ON bc_people(employment_status);
CREATE INDEX idx_bc_roles_org_id ON bc_roles(organization_id);
CREATE INDEX idx_bc_team_structure_parent ON bc_team_structure(parent_id);
CREATE INDEX idx_bc_team_structure_org_id ON bc_team_structure(organization_id);
CREATE INDEX idx_bc_role_assignments_person ON bc_role_assignments(person_id);
CREATE INDEX idx_bc_role_assignments_active ON bc_role_assignments(is_active);
CREATE INDEX idx_bc_training_expiry ON bc_training_records(expiry_date);
CREATE INDEX idx_bc_competencies_org_id ON bc_competencies(organization_id);

-- Sample data for testing (using a default organization ID)
INSERT INTO bc_roles (name, description, role_type, criticality_level, key_responsibilities, organization_id) VALUES
('Crisis Manager', 'Overall crisis response coordination and decision making', 'executive', 'critical', 
 '{"Activate business continuity plans", "Coordinate response efforts", "Authorize emergency expenditure", "Communicate with stakeholders"}', 
 '00000000-0000-0000-0000-000000000001'),
('IT Recovery Lead', 'Lead IT infrastructure recovery and restoration', 'operational', 'critical',
 '{"Assess IT damage", "Prioritize system recovery", "Coordinate with vendors", "Report recovery status"}',
 '00000000-0000-0000-0000-000000000001'),
('Communications Manager', 'Internal and external communications during incidents', 'strategic', 'high',
 '{"Manage media relations", "Internal communications", "Stakeholder updates", "Crisis messaging"}',
 '00000000-0000-0000-0000-000000000001');

INSERT INTO bc_team_structure (name, description, structure_type, level, organization_id) VALUES
('Crisis Management Team', 'Executive level crisis response team', 'crisis_team', 1, '00000000-0000-0000-0000-000000000001'),
('IT Recovery Team', 'Technology infrastructure recovery team', 'recovery_team', 2, '00000000-0000-0000-0000-000000000001'),
('Communications Team', 'Crisis communications and stakeholder management', 'communication_team', 2, '00000000-0000-0000-0000-000000000001');
