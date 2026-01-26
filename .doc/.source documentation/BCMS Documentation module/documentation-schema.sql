-- =====================================================
-- Documentation Module - Database Schema
-- Part of Nexus BCMS Framework
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- CORE DOCUMENTATION TABLES
-- =====================================================

-- Document Categories and Types
CREATE TABLE document_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    category_description TEXT,
    category_type VARCHAR(50) NOT NULL, -- 'policy', 'procedure', 'template', 'external', 'reference'
    parent_category_id UUID,
    category_path TEXT, -- Hierarchical path like 'governance/policies/bcm'
    display_order INTEGER DEFAULT 1,
    category_icon VARCHAR(20), -- Emoji or icon reference
    access_level VARCHAR(50) DEFAULT 'internal', -- 'public', 'internal', 'confidential', 'restricted'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(organization_id, category_name, parent_category_id),
    CONSTRAINT fk_doc_categories_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_doc_categories_parent FOREIGN KEY (parent_category_id) REFERENCES document_categories(id)
);

-- Document Templates (Master templates for creating new documents)
CREATE TABLE document_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    template_id VARCHAR(50) NOT NULL, -- TMPL-001
    template_name VARCHAR(255) NOT NULL,
    template_description TEXT,
    category_id UUID NOT NULL,
    
    -- Template Structure
    template_type VARCHAR(50) NOT NULL, -- 'policy', 'procedure', 'form', 'checklist', 'report'
    template_format VARCHAR(20) DEFAULT 'document', -- 'document', 'form', 'spreadsheet', 'presentation'
    template_content JSONB, -- Structured template content/fields
    template_schema JSONB, -- JSON schema for validation
    
    -- Template Metadata
    required_sections JSONB, -- Array of required sections/fields
    optional_sections JSONB, -- Array of optional sections/fields
    validation_rules JSONB, -- Validation rules for template fields
    
    -- Integration Points
    related_modules JSONB, -- BCMS modules this template integrates with
    auto_populate_fields JSONB, -- Fields that auto-populate from other modules
    
    -- Approval and Usage
    approved_by UUID,
    approved_date DATE,
    usage_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT false, -- Available to all organizations
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(organization_id, template_id),
    CONSTRAINT fk_doc_templates_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_doc_templates_category FOREIGN KEY (category_id) REFERENCES document_categories(id),
    CONSTRAINT fk_doc_templates_approved_by FOREIGN KEY (approved_by) REFERENCES bc_people(id)
);

-- Main Documents Table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    document_id VARCHAR(50) NOT NULL, -- DOC-001
    title VARCHAR(500) NOT NULL,
    description TEXT,
    category_id UUID NOT NULL,
    template_id UUID, -- If created from template
    
    -- Document Classification
    document_type VARCHAR(50) NOT NULL, -- 'policy', 'procedure', 'template', 'form', 'external', 'reference'
    document_format VARCHAR(20) DEFAULT 'document', -- 'document', 'spreadsheet', 'presentation', 'form', 'external_link'
    content_type VARCHAR(100), -- MIME type: 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    
    -- Status and Lifecycle
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- 'draft', 'review', 'approved', 'current', 'superseded', 'archived'
    lifecycle_stage VARCHAR(50), -- 'development', 'active', 'maintenance', 'retirement'
    
    -- Version Control
    version VARCHAR(20) NOT NULL DEFAULT '1.0',
    is_current_version BOOLEAN DEFAULT true,
    superseded_by_id UUID, -- Document ID that supersedes this one
    supersedes_id UUID, -- Document ID this supersedes
    
    -- Content and Storage
    content_summary TEXT,
    file_path VARCHAR(1000), -- Path to actual file storage
    file_size_bytes BIGINT,
    file_checksum VARCHAR(64), -- SHA-256 checksum for integrity
    external_url VARCHAR(1000), -- For external documents
    
    -- Authoring and Ownership
    author_id UUID NOT NULL,
    owner_id UUID, -- Current document owner
    department VARCHAR(100),
    business_unit VARCHAR(100),
    
    -- Approval Workflow
    requires_approval BOOLEAN DEFAULT true,
    approval_workflow_id UUID,
    approved_by UUID,
    approved_date DATE,
    approval_notes TEXT,
    
    -- Review and Maintenance
    review_frequency_months INTEGER DEFAULT 12,
    next_review_date DATE,
    last_reviewed_date DATE,
    reviewed_by UUID,
    review_notes TEXT,
    
    -- Access Control and Security
    access_level VARCHAR(50) DEFAULT 'internal', -- 'public', 'internal', 'confidential', 'restricted'
    access_groups JSONB, -- Array of group IDs with access
    download_restricted BOOLEAN DEFAULT false,
    print_restricted BOOLEAN DEFAULT false,
    
    -- Integration with BCMS Modules
    related_processes JSONB, -- BIA process IDs this document supports
    related_risks JSONB, -- Risk register IDs this document addresses
    related_procedures JSONB, -- Response procedure IDs this document defines
    related_recovery_options JSONB, -- Recovery option IDs this document enables
    
    -- Document Relationships
    parent_document_id UUID, -- Parent document for hierarchical structures
    related_documents JSONB, -- Array of related document IDs
    prerequisite_documents JSONB, -- Documents that must be read first
    
    -- Usage and Analytics
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    
    -- Tagging and Search
    tags TEXT[], -- Array of tags for categorization
    keywords TEXT[], -- Keywords for search
    search_vector TSVECTOR, -- Full-text search vector
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(organization_id, document_id),
    CONSTRAINT fk_documents_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_documents_category FOREIGN KEY (category_id) REFERENCES document_categories(id),
    CONSTRAINT fk_documents_template FOREIGN KEY (template_id) REFERENCES document_templates(id),
    CONSTRAINT fk_documents_author FOREIGN KEY (author_id) REFERENCES bc_people(id),
    CONSTRAINT fk_documents_owner FOREIGN KEY (owner_id) REFERENCES bc_people(id),
    CONSTRAINT fk_documents_approved_by FOREIGN KEY (approved_by) REFERENCES bc_people(id),
    CONSTRAINT fk_documents_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES bc_people(id),
    CONSTRAINT fk_documents_superseded_by FOREIGN KEY (superseded_by_id) REFERENCES documents(id),
    CONSTRAINT fk_documents_supersedes FOREIGN KEY (supersedes_id) REFERENCES documents(id),
    CONSTRAINT fk_documents_parent FOREIGN KEY (parent_document_id) REFERENCES documents(id)
);

-- =====================================================
-- VERSION CONTROL AND HISTORY
-- =====================================================

-- Document Versions (Complete version history)
CREATE TABLE document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    document_id UUID NOT NULL,
    version_number VARCHAR(20) NOT NULL,
    version_type VARCHAR(20) DEFAULT 'minor', -- 'major', 'minor', 'patch', 'draft'
    
    -- Version Metadata
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    change_summary TEXT,
    change_reason VARCHAR(100), -- 'initial', 'update', 'correction', 'review', 'regulatory_change'
    change_impact VARCHAR(50), -- 'low', 'medium', 'high', 'critical'
    
    -- Version Content
    title VARCHAR(500),
    description TEXT,
    content_summary TEXT,
    file_path VARCHAR(1000), -- Path to version-specific file
    file_size_bytes BIGINT,
    file_checksum VARCHAR(64),
    
    -- Version Status
    status VARCHAR(50) NOT NULL, -- 'draft', 'submitted', 'approved', 'published', 'superseded'
    is_current BOOLEAN DEFAULT false,
    
    -- Approval for this version
    approved_by UUID,
    approved_date DATE,
    approval_comments TEXT,
    
    -- Comparison and Differences
    previous_version_id UUID,
    changes_from_previous JSONB, -- Structured change log
    
    -- Metadata
    created_at_version TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_doc_versions_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_doc_versions_document FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    CONSTRAINT fk_doc_versions_created_by FOREIGN KEY (created_by) REFERENCES bc_people(id),
    CONSTRAINT fk_doc_versions_approved_by FOREIGN KEY (approved_by) REFERENCES bc_people(id),
    CONSTRAINT fk_doc_versions_previous FOREIGN KEY (previous_version_id) REFERENCES document_versions(id),
    UNIQUE(document_id, version_number)
);

-- Document Change Log (Detailed audit trail)
CREATE TABLE document_changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    document_id UUID NOT NULL,
    version_id UUID,
    
    -- Change Details
    change_type VARCHAR(50) NOT NULL, -- 'created', 'updated', 'approved', 'published', 'archived', 'accessed', 'downloaded'
    change_description TEXT,
    field_changed VARCHAR(100), -- Specific field that was changed
    old_value TEXT,
    new_value TEXT,
    
    -- Change Context
    changed_by UUID NOT NULL,
    change_reason TEXT,
    change_source VARCHAR(50), -- 'manual', 'system', 'api', 'workflow'
    ip_address INET,
    user_agent TEXT,
    
    -- Integration Context
    related_module VARCHAR(50), -- Which BCMS module triggered the change
    related_record_id UUID, -- ID of related record in other modules
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_doc_changes_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_doc_changes_document FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    CONSTRAINT fk_doc_changes_version FOREIGN KEY (version_id) REFERENCES document_versions(id),
    CONSTRAINT fk_doc_changes_changed_by FOREIGN KEY (changed_by) REFERENCES bc_people(id)
);

-- =====================================================
-- COLLABORATION AND WORKFLOW
-- =====================================================

-- Document Collaboration (Comments, reviews, discussions)
CREATE TABLE document_collaboration (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    document_id UUID NOT NULL,
    version_id UUID,
    
    -- Collaboration Type
    collaboration_type VARCHAR(50) NOT NULL, -- 'comment', 'suggestion', 'review', 'approval_request', 'question'
    collaboration_status VARCHAR(50) DEFAULT 'active', -- 'active', 'resolved', 'accepted', 'rejected'
    
    -- Content and Context
    title VARCHAR(255),
    content TEXT NOT NULL,
    content_section VARCHAR(100), -- Which section/paragraph the collaboration refers to
    content_position INTEGER, -- Position in document (line number, paragraph, etc.)
    
    -- Collaboration Metadata
    created_by UUID NOT NULL,
    assigned_to UUID, -- Who should respond/address this
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    
    -- Response and Resolution
    response TEXT,
    responded_by UUID,
    responded_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    resolved_by UUID,
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    -- Threading
    parent_collaboration_id UUID, -- For threaded discussions
    thread_position INTEGER DEFAULT 0,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_doc_collab_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_doc_collab_document FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    CONSTRAINT fk_doc_collab_version FOREIGN KEY (version_id) REFERENCES document_versions(id),
    CONSTRAINT fk_doc_collab_created_by FOREIGN KEY (created_by) REFERENCES bc_people(id),
    CONSTRAINT fk_doc_collab_assigned_to FOREIGN KEY (assigned_to) REFERENCES bc_people(id),
    CONSTRAINT fk_doc_collab_responded_by FOREIGN KEY (responded_by) REFERENCES bc_people(id),
    CONSTRAINT fk_doc_collab_resolved_by FOREIGN KEY (resolved_by) REFERENCES bc_people(id),
    CONSTRAINT fk_doc_collab_parent FOREIGN KEY (parent_collaboration_id) REFERENCES document_collaboration(id)
);

-- Document Approval Workflows
CREATE TABLE document_approval_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    workflow_name VARCHAR(255) NOT NULL,
    workflow_description TEXT,
    
    -- Workflow Configuration
    document_types TEXT[], -- Which document types use this workflow
    approval_stages JSONB NOT NULL, -- Array of approval stages with roles and requirements
    parallel_approval BOOLEAN DEFAULT false, -- Can approvals happen in parallel
    
    -- Workflow Rules
    auto_approval_rules JSONB, -- Conditions for automatic approval
    escalation_rules JSONB, -- Rules for escalating stuck approvals
    notification_rules JSONB, -- Who gets notified at each stage
    
    -- Timing
    stage_timeout_hours INTEGER DEFAULT 72, -- Hours before escalation
    overall_timeout_days INTEGER DEFAULT 14, -- Overall workflow timeout
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_doc_workflows_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    UNIQUE(organization_id, workflow_name)
);

-- Document Approval Instances (Active approval processes)
CREATE TABLE document_approval_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    document_id UUID NOT NULL,
    version_id UUID NOT NULL,
    workflow_id UUID NOT NULL,
    
    -- Approval Status
    approval_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'approved', 'rejected', 'cancelled', 'escalated'
    current_stage INTEGER DEFAULT 1,
    total_stages INTEGER NOT NULL,
    
    -- Timing
    initiated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    initiated_by UUID NOT NULL,
    target_completion_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Results
    final_outcome VARCHAR(50), -- 'approved', 'rejected', 'cancelled', 'expired'
    final_comments TEXT,
    completed_by UUID,
    
    -- Escalation
    escalated_at TIMESTAMP WITH TIME ZONE,
    escalation_reason TEXT,
    escalated_to UUID,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_doc_approval_inst_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_doc_approval_inst_document FOREIGN KEY (document_id) REFERENCES documents(id),
    CONSTRAINT fk_doc_approval_inst_version FOREIGN KEY (version_id) REFERENCES document_versions(id),
    CONSTRAINT fk_doc_approval_inst_workflow FOREIGN KEY (workflow_id) REFERENCES document_approval_workflows(id),
    CONSTRAINT fk_doc_approval_inst_initiated_by FOREIGN KEY (initiated_by) REFERENCES bc_people(id),
    CONSTRAINT fk_doc_approval_inst_completed_by FOREIGN KEY (completed_by) REFERENCES bc_people(id),
    CONSTRAINT fk_doc_approval_inst_escalated_to FOREIGN KEY (escalated_to) REFERENCES bc_people(id)
);

-- Individual Approval Actions
CREATE TABLE document_approval_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    approval_instance_id UUID NOT NULL,
    stage_number INTEGER NOT NULL,
    
    -- Approver Information
    approver_id UUID NOT NULL,
    approver_role VARCHAR(100), -- Role-based approval
    approval_authority VARCHAR(50), -- 'required', 'optional', 'advisory'
    
    -- Approval Decision
    action_taken VARCHAR(50) NOT NULL, -- 'approved', 'rejected', 'approved_with_conditions', 'deferred', 'abstained'
    approval_comments TEXT,
    conditions_notes TEXT, -- If approved with conditions
    
    -- Timing
    action_deadline DATE,
    action_taken_at TIMESTAMP WITH TIME ZONE,
    
    -- Delegation
    delegated_to UUID,
    delegation_reason TEXT,
    delegation_start_date DATE,
    delegation_end_date DATE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_doc_approval_actions_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_doc_approval_actions_instance FOREIGN KEY (approval_instance_id) REFERENCES document_approval_instances(id) ON DELETE CASCADE,
    CONSTRAINT fk_doc_approval_actions_approver FOREIGN KEY (approver_id) REFERENCES bc_people(id),
    CONSTRAINT fk_doc_approval_actions_delegated_to FOREIGN KEY (delegated_to) REFERENCES bc_people(id),
    UNIQUE(approval_instance_id, stage_number, approver_id)
);

-- =====================================================
-- DOCUMENT ACCESS AND ANALYTICS
-- =====================================================

-- Document Access Log
CREATE TABLE document_access_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    document_id UUID NOT NULL,
    version_id UUID,
    
    -- Access Details
    access_type VARCHAR(50) NOT NULL, -- 'view', 'download', 'print', 'share', 'edit', 'comment'
    access_method VARCHAR(50), -- 'web', 'api', 'mobile', 'email_link'
    access_location VARCHAR(255), -- Geographic location or office
    
    -- User Information
    user_id UUID NOT NULL,
    user_role VARCHAR(100),
    user_department VARCHAR(100),
    
    -- Technical Details
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
    
    -- Context
    referrer_url TEXT, -- How they got to the document
    access_duration INTERVAL, -- How long they had it open
    pages_viewed INTEGER, -- For multi-page documents
    
    -- Security and Compliance
    data_classification VARCHAR(50), -- Classification level of accessed data
    export_restricted BOOLEAN DEFAULT false, -- Whether export was restricted
    watermark_applied BOOLEAN DEFAULT false, -- Whether document was watermarked
    
    -- Metadata
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_doc_access_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_doc_access_document FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    CONSTRAINT fk_doc_access_version FOREIGN KEY (version_id) REFERENCES document_versions(id),
    CONSTRAINT fk_doc_access_user FOREIGN KEY (user_id) REFERENCES bc_people(id)
);

-- Document Sharing and Distribution
CREATE TABLE document_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    document_id UUID NOT NULL,
    version_id UUID,
    
    -- Sharing Details
    shared_by UUID NOT NULL,
    shared_with JSONB, -- Array of recipient identifiers (emails, user IDs, etc.)
    share_type VARCHAR(50), -- 'internal', 'external', 'public', 'restricted'
    share_method VARCHAR(50), -- 'email', 'link', 'portal', 'api'
    
    -- Access Control
    access_level VARCHAR(50) DEFAULT 'view', -- 'view', 'comment', 'edit'
    password_protected BOOLEAN DEFAULT false,
    expiry_date TIMESTAMP WITH TIME ZONE,
    download_limit INTEGER, -- Maximum number of downloads
    view_limit INTEGER, -- Maximum number of views
    
    -- Share Configuration
    watermark_required BOOLEAN DEFAULT false,
    print_disabled BOOLEAN DEFAULT false,
    download_disabled BOOLEAN DEFAULT false,
    email_notifications BOOLEAN DEFAULT true,
    
    -- Tracking
    share_token VARCHAR(255) UNIQUE, -- Unique token for tracking
    times_accessed INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    share_status VARCHAR(50) DEFAULT 'active', -- 'active', 'expired', 'revoked', 'suspended'
    revoked_by UUID,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revocation_reason TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_doc_shares_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_doc_shares_document FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    CONSTRAINT fk_doc_shares_version FOREIGN KEY (version_id) REFERENCES document_versions(id),
    CONSTRAINT fk_doc_shares_shared_by FOREIGN KEY (shared_by) REFERENCES bc_people(id),
    CONSTRAINT fk_doc_shares_revoked_by FOREIGN KEY (revoked_by) REFERENCES bc_people(id)
);

-- =====================================================
-- INTEGRATION VIEWS AND ANALYTICS
-- =====================================================

-- Document Library Dashboard View
CREATE VIEW document_library_dashboard AS
SELECT 
    d.organization_id,
    
    -- Document Type Summary
    COUNT(*) as total_documents,
    COUNT(CASE WHEN d.document_type = 'policy' THEN 1 END) as policy_count,
    COUNT(CASE WHEN d.document_type = 'procedure' THEN 1 END) as procedure_count,
    COUNT(CASE WHEN d.document_type = 'template' THEN 1 END) as template_count,
    COUNT(CASE WHEN d.document_type = 'external' THEN 1 END) as external_count,
    
    -- Status Summary
    COUNT(CASE WHEN d.status = 'current' THEN 1 END) as current_documents,
    COUNT(CASE WHEN d.status = 'draft' THEN 1 END) as draft_documents,
    COUNT(CASE WHEN d.status = 'review' THEN 1 END) as review_documents,
    COUNT(CASE WHEN d.status = 'archived' THEN 1 END) as archived_documents,
    
    -- Recent Activity
    COUNT(CASE WHEN d.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_documents_last_30_days,
    COUNT(CASE WHEN d.updated_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as updated_documents_last_7_days,
    
    -- Review Status
    COUNT(CASE WHEN d.next_review_date <= CURRENT_DATE THEN 1 END) as documents_due_review,
    COUNT(CASE WHEN d.next_review_date <= CURRENT_DATE + INTERVAL '30 days' THEN 1 END) as documents_due_review_soon,
    
    -- Access Analytics
    SUM(d.view_count) as total_views,
    SUM(d.download_count) as total_downloads,
    AVG(d.view_count) as avg_views_per_document
    
FROM documents d
WHERE d.is_active = true
GROUP BY d.organization_id;

-- Document Version Analytics View
CREATE VIEW document_version_analytics AS
SELECT 
    d.organization_id,
    d.id as document_id,
    d.document_id as document_code,
    d.title,
    d.document_type,
    d.status,
    d.version as current_version,
    
    -- Version Statistics
    COUNT(dv.id) as total_versions,
    MAX(dv.created_at) as last_version_date,
    MIN(dv.created_at) as first_version_date,
    
    -- Change Frequency
    CASE 
        WHEN COUNT(dv.id) > 1 THEN
            EXTRACT(DAYS FROM (MAX(dv.created_at) - MIN(dv.created_at))) / (COUNT(dv.id) - 1)
        ELSE NULL
    END as avg_days_between_versions,
    
    -- Recent Activity
    COUNT(CASE WHEN dv.created_at >= CURRENT_DATE - INTERVAL '90 days' THEN 1 END) as versions_last_90_days,
    
    -- Collaboration Metrics
    COUNT(DISTINCT dc.created_by) as unique_collaborators,
    COUNT(dc.id) as total_collaboration_items
    
FROM documents d
LEFT JOIN document_versions dv ON d.id = dv.document_id
LEFT JOIN document_collaboration dc ON d.id = dc.document_id AND dc.is_active = true
WHERE d.is_active = true
GROUP BY d.organization_id, d.id, d.document_id, d.title, d.document_type, d.status, d.version;

-- Document Access Analytics View  
CREATE VIEW document_access_analytics AS
SELECT 
    dal.organization_id,
    dal.document_id,
    d.title,
    d.document_type,
    d.access_level,
    
    -- Access Metrics
    COUNT(*) as total_accesses,
    COUNT(DISTINCT dal.user_id) as unique_users,
    COUNT(CASE WHEN dal.access_type = 'view' THEN 1 END) as view_count,
    COUNT(CASE WHEN dal.access_type = 'download' THEN 1 END) as download_count,
    
    -- Recent Access
    COUNT(CASE WHEN dal.accessed_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as accesses_last_30_days,
    COUNT(CASE WHEN dal.accessed_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as accesses_last_7_days,
    MAX(dal.accessed_at) as last_accessed,
    
    -- User Distribution
    COUNT(CASE WHEN dal.device_type = 'desktop' THEN 1 END) as desktop_accesses,
    COUNT(CASE WHEN dal.device_type = 'mobile' THEN 1 END) as mobile_accesses,
    COUNT(CASE WHEN dal.device_type = 'tablet' THEN 1 END) as tablet_accesses
    
FROM document_access_log dal
JOIN documents d ON dal.document_id = d.id
WHERE d.is_active = true
  AND dal.accessed_at >= CURRENT_DATE - INTERVAL '1 year'
GROUP BY dal.organization_id, dal.document_id, d.title, d.document_type, d.access_level;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Document Indexes
CREATE INDEX idx_documents_org_type_status ON documents(organization_id, document_type, status) WHERE is_active = true;
CREATE INDEX idx_documents_category ON documents(category_id);
CREATE INDEX idx_documents_author ON documents(author_id);
CREATE INDEX idx_documents_next_review ON documents(next_review_date) WHERE status = 'current';
CREATE INDEX idx_documents_search_vector ON documents USING gin(search_vector);
CREATE INDEX idx_documents_tags ON documents USING gin(tags);

-- Version Control Indexes
CREATE INDEX idx_document_versions_document ON document_versions(document_id, version_number);
CREATE INDEX idx_document_versions_current ON document_versions(document_id) WHERE is_current = true;
CREATE INDEX idx_document_changes_document_date ON document_changes(document_id, created_at);

-- Collaboration Indexes
CREATE INDEX idx_document_collaboration_document ON document_collaboration(document_id) WHERE is_active = true;
CREATE INDEX idx_document_collaboration_assigned ON document_collaboration(assigned_to, collaboration_status);

-- Access Log Indexes
CREATE INDEX idx_document_access_log_document_date ON document_access_log(document_id, accessed_at);
CREATE INDEX idx_document_access_log_user ON document_access_log(user_id, accessed_at);
CREATE INDEX idx_document_access_log_org_date ON document_access_log(organization_id, accessed_at);

-- Approval Indexes
CREATE INDEX idx_document_approval_instances_status ON document_approval_instances(approval_status, current_stage);
CREATE INDEX idx_document_approval_actions_approver ON document_approval_actions(approver_id, action_taken);

-- =====================================================
-- TRIGGERS FOR AUTOMATION
-- =====================================================

-- Update search vector when document content changes
CREATE OR REPLACE FUNCTION update_document_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.content_summary, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'D');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_document_search_vector
    BEFORE INSERT OR UPDATE OF title, description, content_summary, tags ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_document_search_vector();

-- Auto-update next review date when document is approved
CREATE OR REPLACE FUNCTION update_document_review_date()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'current' AND OLD.status != 'current' THEN
        NEW.next_review_date := CURRENT_DATE + (NEW.review_frequency_months || ' months')::INTERVAL;
        NEW.last_reviewed_date := CURRENT_DATE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_document_review_date
    BEFORE UPDATE OF status ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_document_review_date();

-- Log document changes automatically
CREATE OR REPLACE FUNCTION log_document_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Log significant changes
    IF TG_OP = 'UPDATE' THEN
        IF OLD.status != NEW.status THEN
            INSERT INTO document_changes (organization_id, document_id, change_type, change_description, field_changed, old_value, new_value, changed_by)
            VALUES (NEW.organization_id, NEW.id, 'status_change', 'Document status changed', 'status', OLD.status, NEW.status, NEW.owner_id);
        END IF;
        
        IF OLD.version != NEW.version THEN
            INSERT INTO document_changes (organization_id, document_id, change_type, change_description, field_changed, old_value, new_value, changed_by)
            VALUES (NEW.organization_id, NEW.id, 'version_update', 'Document version updated', 'version', OLD.version, NEW.version, NEW.owner_id);
        END IF;
    END IF;
    
    -- Update the updated_at timestamp
    NEW.updated_at := CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_document_changes
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION log_document_changes();

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Sample Document Categories
INSERT INTO document_categories (organization_id, category_name, category_description, category_type, display_order) VALUES
(gen_random_uuid(), 'BCMS Policies', 'Core business continuity management policies', 'policy', 1),
(gen_random_uuid(), 'Response Procedures', 'Crisis response and emergency procedures', 'procedure', 2),
(gen_random_uuid(), 'Risk Management Forms', 'Risk assessment and treatment templates', 'template', 3),
(gen_random_uuid(), 'Regulatory Standards', 'External regulatory and compliance documents', 'external', 4),
(gen_random_uuid(), 'Training Materials', 'Training guides and reference documents', 'reference', 5);

-- Sample Document Templates
INSERT INTO document_templates (organization_id, template_id, template_name, template_description, category_id, template_type) VALUES
(gen_random_uuid(), 'TMPL-001', 'Business Continuity Policy Template', 'Standard template for creating business continuity policies', 
 (SELECT id FROM document_categories WHERE category_name = 'BCMS Policies' LIMIT 1), 'policy'),
(gen_random_uuid(), 'TMPL-002', 'Risk Assessment Form', 'Quantitative risk assessment template with Monte Carlo support',
 (SELECT id FROM document_categories WHERE category_name = 'Risk Management Forms' LIMIT 1), 'form'),
(gen_random_uuid(), 'TMPL-003', 'Incident Response Checklist', 'Step-by-step incident response checklist template',
 (SELECT id FROM document_categories WHERE category_name = 'Response Procedures' LIMIT 1), 'checklist');

COMMENT ON TABLE documents IS 'Central repository for all BCMS documents with version control and integration';
COMMENT ON TABLE document_versions IS 'Complete version history for all documents';
COMMENT ON TABLE document_collaboration IS 'Comments, reviews, and collaborative feedback on documents';
COMMENT ON TABLE document_access_log IS 'Comprehensive audit trail of document access and usage';
COMMENT ON TABLE document_approval_workflows IS 'Configurable approval workflows for document governance';
