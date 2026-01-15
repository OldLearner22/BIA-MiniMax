-- Business Impact Analysis (BIA) Tool - Multi-tenant Database Schema
-- Target Architecture (PostgreSQL)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tenants Table
-- Represents distinct organizations using the SaaS platform
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subscription_plan VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table
-- Users belong to a specific tenant
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'analyst', -- e.g., 'admin', 'analyst', 'viewer'
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uk_tenant_email UNIQUE (tenant_id, email)
);

-- 3. Assessments Table
-- Top-level container for a BIA session. Linked to a tenant.
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'in-review', 'approved'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Processes Table
-- Business processes being analyzed within an assessment
CREATE TABLE processes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    owner VARCHAR(255),
    description TEXT,
    criticality VARCHAR(50), -- 'critical', 'high', 'medium', 'low'
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Impact Assessments Table
-- Stores impact scores across different categories for a process
CREATE TABLE impact_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    process_id UUID NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL, -- 'financial', 'operational', 'reputational', 'legal', etc.
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 5),
    justification TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_process_category UNIQUE (process_id, category)
);

-- 6. Recovery Objectives Table
-- Defines RTO, RPO, and MTPD for a process
CREATE TABLE recovery_objectives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    process_id UUID NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
    mtpd_hours INTEGER,
    rto_hours INTEGER,
    rpo_hours INTEGER,
    mbco_flag BOOLEAN DEFAULT FALSE,
    recovery_strategy VARCHAR(100), -- 'warm-standby', 'manual', etc.
    strategy_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Dependencies Table
-- Links processes to indicate dependencies (Process A depends on Process B)
CREATE TABLE dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    source_process_id UUID NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
    target_process_id UUID NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
    dependency_type VARCHAR(50), -- 'technical', 'operational', 'resource'
    criticality INTEGER CHECK (criticality >= 1 AND criticality <= 5),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_source_target UNIQUE (source_process_id, target_process_id)
);

-- 8. Audit Logs Table (Optional but recommended for SaaS)
-- Tracks actions within a tenant
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_assessments_tenant ON assessments(tenant_id);
CREATE INDEX idx_processes_assessment ON processes(assessment_id);
CREATE INDEX idx_impacts_process ON impact_assessments(process_id);
