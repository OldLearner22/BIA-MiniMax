# Data Architecture and Sources - Nexus BCMS Framework

## Executive Summary

This document explains the data architecture, sources, and integration points for the Nexus Business Continuity Management System (BCMS). It addresses the critical question of where framework data originates, how it flows through the system, and how the various modules interconnect to provide comprehensive business continuity intelligence.

## Data Architecture Overview

### System Integration Model

The Nexus BCMS follows a **hub-and-spoke data architecture** where:

- **Central Data Repository**: PostgreSQL database storing all BC-related information
- **Module-Specific Tables**: Dedicated schemas for each functional area
- **Cross-Module Integration**: Shared foreign keys and integration views
- **Real-Time Synchronization**: Event-driven updates across modules

```
┌─────────────────────────────────────────────────────────────────┐
│                    NEXUS BCMS DATA ARCHITECTURE                 │
├─────────────────────────────────────────────────────────────────┤
│  Dashboard (Aggregated Views)                                   │
├──────────┬──────────┬──────────┬──────────┬──────────┬──────────┤
│   BIA    │   Risk   │ Strategy │ People & │ Testing  │ Incident │
│ Analysis │ Register │Framework │  Roles   │Exercises │   Mgmt   │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│        CENTRAL POSTGRESQL DATABASE (Multi-Tenant)              │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ Core Tables: Organizations, Users, Processes, Assets   │   │
│   │ Integration Views: Cross-module analytics and reporting │   │
│   └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│ External Integrations: HR Systems, IT Monitoring, Compliance    │
└─────────────────────────────────────────────────────────────────┘
```

## Primary Data Sources

### 1. Business Impact Analysis (BIA) Module
**Primary Data Tables:**
- `bia_processes`: Business process inventory
- `bia_dependencies`: Process dependencies and relationships
- `bia_dependency_diagrams`: Visual dependency mappings (ReactFlow data)
- `bia_resource_dependencies`: Personnel, technology, facility dependencies

**Data Collection Methods:**
- **Process Owner Interviews**: Manual data entry through structured forms
- **Workshop Sessions**: Collaborative BIA sessions with stakeholders  
- **System Discovery**: Automated discovery of IT dependencies
- **Financial System Integration**: Revenue/cost data from ERP systems

**Sample Data Flow:**
```sql
-- Process criticality feeds into multiple downstream modules
INSERT INTO bia_processes (name, criticality_level, rto_hours, rpo_hours)
VALUES ('Payment Processing', 'critical', 1, 0);

-- This feeds the Risk Register, Strategy Framework, and Contact Directory
```

### 2. Risk Assessment Module
**Primary Data Tables:**
- `risk_register`: Quantitative risk assessments
- `risk_scenarios`: Monte Carlo simulation parameters
- `risk_treatments`: Mitigation and control measures
- `threat_intelligence`: External threat data feeds

**Data Sources:**
- **Risk Workshops**: Facilitated risk identification sessions
- **Monte Carlo Simulations**: Quantitative risk calculations (10,000+ iterations)
- **External Threat Feeds**: Automated ingestion from threat intelligence providers
- **Insurance Data**: Historical loss data and industry benchmarks

**Monte Carlo Data Generation:**
```javascript
// Risk exposure calculation from BIA + Risk Register
function calculateRiskExposure(process) {
    const bia_criticality = getBIACriticality(process.id);
    const risk_probability = getRiskProbability(process.id);
    const financial_impact = getBIAFinancialImpact(process.id);
    
    return runMonteCarloSimulation({
        probability: risk_probability,
        impact: financial_impact,
        iterations: 10000
    });
}
```

### 3. People & Roles Module  
**Primary Data Tables:**
- `bc_people`: Contact directory with competencies
- `bc_roles`: Business continuity role definitions
- `bc_team_structure`: Organizational chart and reporting
- `bc_training_records`: Training completion and certification tracking

**Data Sources:**
- **HR System Integration**: Employee data, org charts, contact information
- **Active Directory**: User authentication and role assignments
- **Training Management System**: Competency tracking and certification
- **Manual Updates**: Role-specific BC responsibilities and contact preferences

**Integration Example:**
```sql
-- Contact Directory populated from multiple sources
SELECT 
    p.name,
    p.job_title,
    hr.department,
    hr.manager,
    bc.bc_role,
    bc.emergency_contact_24_7
FROM bc_people p
JOIN hr_employees hr ON p.employee_id = hr.id
JOIN bc_role_assignments bc ON p.id = bc.person_id;
```

### 4. Strategy Framework Module
**Data Sources & Calculation Logic:**

#### Maturity Assessment Data
**Source Tables:**
- `strategy_assessments`: Maturity evaluations across 8 dimensions
- `strategy_objectives`: Strategic goals and KPI tracking
- `strategy_initiatives`: Implementation projects and status

**Calculation Method:**
```sql
-- Maturity radar chart data aggregation
SELECT 
    assessment_dimension,
    AVG(current_score) as current_maturity,
    AVG(target_score) as target_maturity,
    COUNT(*) as assessment_count
FROM strategy_assessments 
WHERE assessment_date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY assessment_dimension;
```

#### Strategic Metrics Derivation
The framework's "87% Maturity Score" comes from:

```sql
-- Weighted maturity calculation
WITH dimension_weights AS (
    SELECT 'Risk Management' as dimension, 0.15 as weight
    UNION SELECT 'Crisis Response', 0.15
    UNION SELECT 'Recovery Planning', 0.15  
    UNION SELECT 'Communication', 0.10
    UNION SELECT 'Training & Awareness', 0.10
    UNION SELECT 'Testing & Exercises', 0.15
    UNION SELECT 'Governance', 0.10
    UNION SELECT 'Continuous Improvement', 0.10
)
SELECT 
    SUM(sa.current_score * dw.weight * 20) as weighted_maturity_percentage
FROM strategy_assessments sa
JOIN dimension_weights dw ON sa.assessment_dimension = dw.dimension
WHERE sa.assessment_date = (SELECT MAX(assessment_date) FROM strategy_assessments);
```

## Cross-Module Data Integration

### Dashboard Data Aggregation

The main dashboard aggregates data from all modules:

**Process Count Logic:**
```sql
-- Total processes from BIA module
SELECT COUNT(*) as total_processes 
FROM bia_processes 
WHERE organization_id = ? AND is_active = true;

-- Critical processes count  
SELECT COUNT(*) as critical_processes
FROM bia_processes 
WHERE organization_id = ? 
  AND criticality_level = 'critical' 
  AND is_active = true;
```

**Financial Impact Calculation:**
```sql
-- Total VaR aggregation from Risk Register
SELECT 
    SUM(var_95_percent) as total_var,
    AVG(expected_value) as avg_expected_loss
FROM risk_register r
JOIN bia_processes p ON r.process_id = p.id
WHERE p.organization_id = ?
  AND r.is_active = true;
```

### Real-Time Data Updates

**Event-Driven Architecture:**
- **Process Changes**: BIA updates trigger risk recalculation
- **Risk Updates**: New risks update strategy framework metrics
- **Contact Changes**: People updates trigger notification list refresh
- **Incident Events**: Active incidents update dashboard status

## External Data Sources

### 1. Enterprise System Integration

**HR Information System (HRIS)**
- **Data**: Employee records, organizational structure, contact information
- **Integration**: Daily batch sync via REST API
- **Tables Updated**: `bc_people`, `bc_team_structure`

**Enterprise Resource Planning (ERP)**
- **Data**: Financial impact data, process costs, revenue attribution
- **Integration**: Real-time API integration for financial calculations  
- **Tables Updated**: `bia_processes` (financial_impact fields)

**IT Service Management (ITSM)**
- **Data**: IT asset dependencies, incident history, service catalogs
- **Integration**: Webhook-based real-time updates
- **Tables Updated**: `bia_resource_dependencies`, `threat_intelligence`

### 2. External Threat Intelligence

**Commercial Threat Feeds**
- **Sources**: CrowdStrike, FireEye, IBM X-Force
- **Data**: Threat indicators, vulnerability assessments, industry alerts
- **Integration**: Automated daily ingestion via API
- **Impact**: Updates risk probability calculations

**Government Advisories** 
- **Sources**: CISA, NCSC, industry regulators
- **Data**: Threat warnings, regulatory changes, compliance requirements
- **Integration**: RSS feed parsing and manual review
- **Impact**: Triggers risk reassessment workflows

### 3. Industry Benchmarking Data

**Business Continuity Institute (BCI) Benchmarks**
- **Data**: Industry maturity benchmarks, RTO/RPO standards
- **Integration**: Annual manual updates
- **Usage**: Maturity assessment calibration

**Insurance Industry Data**
- **Data**: Loss frequency, severity distributions, industry loss costs
- **Integration**: Quarterly data imports from insurance partners
- **Usage**: Monte Carlo simulation parameter validation

## Data Quality and Validation

### Automated Data Quality Checks

```sql
-- Data completeness validation
CREATE VIEW data_quality_dashboard AS
SELECT 
    'BIA Processes' as module,
    COUNT(*) as total_records,
    COUNT(CASE WHEN rto_hours IS NULL THEN 1 END) as missing_rto,
    COUNT(CASE WHEN criticality_level IS NULL THEN 1 END) as missing_criticality
FROM bia_processes
UNION ALL
SELECT 
    'Risk Register' as module,
    COUNT(*) as total_records,
    COUNT(CASE WHEN probability_min IS NULL THEN 1 END) as missing_probability,
    COUNT(CASE WHEN impact_min IS NULL THEN 1 END) as missing_impact
FROM risk_register;
```

### Master Data Management

**Data Stewardship Model:**
- **BIA Data**: Process owners responsible for their process data
- **Risk Data**: Risk managers validate risk assessments
- **Contact Data**: HR system is authoritative source, BC team adds role-specific data
- **Strategy Data**: BC Manager owns strategic assessments and objectives

## Sample Data Generation Logic

For demonstration purposes, the framework includes sample data generation:

### BIA Sample Data
```javascript
// Generate realistic BIA sample data
const sampleProcesses = [
    {
        name: 'Payment Processing',
        criticality: 'critical',
        rto: 1, rpo: 0,
        annual_revenue_impact: 2400000,
        department: 'Finance'
    },
    {
        name: 'Customer Service Portal', 
        criticality: 'high',
        rto: 4, rpo: 1,
        annual_revenue_impact: 850000,
        department: 'Customer Service'
    }
];
```

### Risk Register Sample Data
```javascript
// Monte Carlo simulation parameters
const riskScenarios = [
    {
        risk_title: 'Cyber Security Breach',
        probability_range: [8.5, 12.3], // percentage
        impact_range: [250000, 2500000], // £
        distribution_type: 'lognormal'
    }
];

// Generate 10,000 simulation iterations
function generateRiskExposure(scenario) {
    const results = [];
    for (let i = 0; i < 10000; i++) {
        const prob = uniform(scenario.probability_range);
        const impact = lognormal(scenario.impact_range);
        results.push(prob * impact);
    }
    return {
        expected_value: mean(results),
        var_95: percentile(results, 95),
        var_99: percentile(results, 99)
    };
}
```

## Data Privacy and Security

### Multi-Tenant Data Isolation

```sql
-- All tables include organization_id for tenant isolation
CREATE TABLE bia_processes (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL, -- Tenant isolation
    name VARCHAR(255) NOT NULL,
    -- ... other fields
    CONSTRAINT fk_organization FOREIGN KEY (organization_id) 
        REFERENCES organizations(id)
);

-- Row-level security policy
CREATE POLICY tenant_isolation ON bia_processes
    USING (organization_id = current_setting('app.current_tenant')::UUID);
```

### Data Classification

**Public Data**: Process names, general procedures
**Internal Data**: Financial impacts, detailed dependencies  
**Restricted Data**: Personal contact information, security vulnerabilities
**Confidential Data**: Strategic information, risk appetite settings

## Reporting and Analytics Integration

### Executive Reporting Queries

```sql
-- Executive dashboard summary
WITH risk_summary AS (
    SELECT 
        COUNT(*) FILTER (WHERE risk_level = 'extreme') as extreme_risks,
        COUNT(*) FILTER (WHERE risk_level = 'high') as high_risks,
        SUM(var_95_percent) as total_var
    FROM risk_register 
    WHERE organization_id = ? AND is_active = true
),
process_summary AS (
    SELECT 
        COUNT(*) as total_processes,
        COUNT(*) FILTER (WHERE criticality_level = 'critical') as critical_processes
    FROM bia_processes 
    WHERE organization_id = ? AND is_active = true
)
SELECT * FROM risk_summary, process_summary;
```

## Conclusion

The Nexus BCMS data architecture provides a comprehensive foundation for business continuity management through:

1. **Integrated Data Model**: Cross-module data sharing enables comprehensive analysis
2. **Multiple Data Sources**: Combination of manual input, system integration, and external feeds
3. **Real-Time Processing**: Event-driven updates maintain data currency
4. **Quality Assurance**: Automated validation and stewardship processes
5. **Security by Design**: Multi-tenant architecture with appropriate access controls

The framework's strength lies not in any single data source, but in the integration and synthesis of multiple information streams to provide actionable business continuity intelligence. Each module contributes specific data while benefiting from the collective organizational knowledge captured across the entire system.

This data architecture ensures that strategic decisions are based on comprehensive, current, and validated information rather than isolated point-in-time assessments, providing organizations with the intelligence needed for effective business continuity management.
