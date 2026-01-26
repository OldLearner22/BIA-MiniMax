# Nexus BCMS - Multi-Tenant Enterprise Architecture
## Comprehensive Architectural Design Document (.NET 10 Edition with Dapper)

**Document Reference:** NEXUS-BCMS-ARCH-001-DOTNET-DAPPER  
**Version:** 1.1  
**Classification:** Confidential  
**Standard Alignment:** ISO 22301:2019, DORA, NIS2, ISO 27001:2022

---

## Document Control

| Item | Details |
|------|---------|
| Author | Muhamed - Chief Architect, Nexus GRC Solutions |
| Date | January 2026 |
| Status | Draft for Review |
| Review Period | Quarterly |
| Next Review | April 2026 |
| Distribution | Architecture Team, Security, Compliance |

### Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 2026 | Muhamed | Initial multi-tenant architecture with .NET 10, TDD methodology, Railway deployment |
| 1.1 | January 2026 | Muhamed | Updated to use Dapper instead of EF Core for data access |

---

## Executive Summary

The Nexus Business Continuity Management System (BCMS) is an enterprise-grade, multi-tenant SaaS platform engineered using **Test-Driven Development (TDD)** principles and built on the **.NET 10** framework with **Dapper** as the micro-ORM. The platform delivers comprehensive operational resilience capabilities while maintaining strict regulatory compliance across ISO 22301:2019, Digital Operational Resilience Act (DORA), and Network and Information Security Directive 2 (NIS2).

This architecture represents a paradigm shift from traditional "state-based" compliance tools to a **velocity-driven GRC engineering approach**, treating business continuity and disaster recovery as executable code with built-in automation, continuous validation, and real-time resilience metrics.

### Key Differentiators

- **TDD-First Development**: 100% test coverage with red-green-refactor methodology
- **.NET 10 Modern Stack**: Leveraging minimal APIs, performance improvements, and native AOT
- **Dapper Micro-ORM**: High-performance SQL execution with full control over queries (3-5x faster than EF Core)
- **Railway Platform Hosting**: Simplified deployment with built-in PostgreSQL, observability, and scaling
- **Multi-tenant Architecture**: Complete data isolation with tenant-specific cryptographic boundaries
- **Regulatory Convergence**: Single platform addressing ISO 22301, DORA, and NIS2 requirements
- **Zero Trust Security Model**: Never trust, always verify, enforce least privilege
- **Policy-as-Code**: Machine-readable continuity policies with automated enforcement
- **Real-time Resilience Scoring**: Continuous assessment of organizational preparedness
- **API-First Design**: Enabling ecosystem integration and automation workflows

### TDD Development Philosophy

Every feature in Nexus BCMS follows strict Test-Driven Development:
```
Write Test (RED) → Write Code (GREEN) → Refactor (CLEAN) → Repeat
```

**Test Coverage Targets:**
- Unit Tests: 100% code coverage
- Integration Tests: All API endpoints and database operations
- End-to-End Tests: Critical user workflows
- Contract Tests: API consumer contracts
- Performance Tests: Load and stress testing
- Security Tests: OWASP Top 10 validation

### Why Dapper Over EF Core

**Performance Benefits:**
- 3-5x faster query execution compared to EF Core
- Minimal memory overhead (no change tracking, no query translation layer)
- Direct SQL control for complex queries and optimizations
- Ideal for high-throughput multi-tenant scenarios

**Control & Transparency:**
- Explicit SQL queries - no hidden N+1 problems
- Fine-grained optimization for PostgreSQL-specific features
- Easier performance profiling and debugging
- Better suited for CQRS pattern with optimized read queries

**Trade-offs Accepted:**
- Manual migration management (using DbUp)
- Explicit object mapping (using Mapster)
- No automatic change tracking (explicit update statements)

---

## Table of Contents

1. [Regulatory Context & Requirements](#1-regulatory-context--requirements)
2. [System Architecture Overview](#2-system-architecture-overview)
3. [Multi-Tenancy Strategy](#3-multi-tenancy-strategy)
4. [.NET 10 Technology Stack with Dapper](#4-net-10-technology-stack-with-dapper)
5. [Test-Driven Development Strategy](#5-test-driven-development-strategy)
6. [Data Architecture & Entity Model](#6-data-architecture--entity-model)
7. [Security Architecture](#7-security-architecture)
8. [API Design & Integration Layer](#8-api-design--integration-layer)
9. [Compliance Automation Engine](#9-compliance-automation-engine)
10. [Railway Deployment Architecture](#10-railway-deployment-architecture)
11. [Monitoring, Logging & Observability](#11-monitoring-logging--observability)
12. [Implementation Roadmap](#12-implementation-roadmap)
13. [Appendices](#13-appendices)

---

## 1. Regulatory Context & Requirements

### 1.1 ISO 22301:2019 Business Continuity Management

**Key Requirements Mapped to Architecture:**

| Clause | Requirement | Architectural Implementation |
|--------|-------------|------------------------------|
| 4.1 | Understanding the organization and its context | Multi-tenant Organization entity with configurable scope boundaries |
| 4.4 | BCMS Scope Definition | Flexible scope configuration per tenant with regulatory profile selection |
| 5.3 | Organizational Roles and Responsibilities | BC_Team_Structure with hierarchical role assignments and approval workflows |
| 6.1 | Actions to address risks and opportunities | Integrated Risk Register with threat modeling and mitigation tracking |
| 6.2 | BC Objectives and planning | Automated objective setting linked to process criticality |
| 8.2 | Business Impact Analysis | Automated BIA workflow with multi-dimensional impact scoring algorithms |
| 8.3 | BC Strategy | Strategy Framework with resource allocation engine and cost-benefit analysis |
| 8.4 | BC Plans and Procedures | SOP Management with version control, approval workflows, and accessibility |
| 8.5 | Exercising and Testing | Exercise Scheduler with automated scenario generation and action tracking |
| 9.1 | Monitoring, measurement, analysis and evaluation | Real-time KPI dashboard with compliance metrics and trend analysis |
| 9.2 | Internal Audit | Compliance control mapping with evidence collection |
| 9.3 | Management Review | Automated management review agenda generation |
| 10.1 | Nonconformity and corrective action | Corrective Action tracking with root cause analysis |
| 10.2 | Continual Improvement | Improvement initiative tracking with metrics |

### 1.2 DORA (Digital Operational Resilience Act)

**Critical Requirements for Financial Entities:**

| Article | Requirement | System Capability | Implementation Notes |
|---------|-------------|-------------------|---------------------|
| Art. 6 | ICT Risk Management Framework | Integrated ICT asset inventory with automated risk assessment | Includes threat intelligence integration and vulnerability tracking |
| Art. 11 | ICT Business Continuity Policy | Policy-as-Code engine with automated compliance validation | Machine-readable policies with continuous enforcement |
| Art. 13 | Communication | Automated notification workflows and escalation chains | Multi-channel alerting with regulatory body templates |
| Art. 14 | Recovery Time & Point Objectives | RTO/RPO calculator with scenario modeling | Monte Carlo simulation for recovery time predictions |
| Art. 17-19 | ICT-related incident classification and reporting | Multi-tier incident taxonomy with automated regulatory reporting triggers | 24-hour initial report, 72-hour detailed report automation |
| Art. 24 | ICT Third-Party Risk | Vendor dependency mapping with concentration risk analysis | Recursive dependency graphs with critical path identification |
| Art. 25 | Testing of ICT Tools and Systems | Automated testing framework with evidence collection | Scheduling, execution, and documentation automation |
| Art. 26 | Advanced Testing (Critical Entities) | Threat-Led Penetration Testing (TLPT) scenario builder | Red team exercise management with finding remediation tracking |
| Art. 28 | Incident Classification | Multi-tier incident taxonomy with regulatory reporting triggers | Automated severity assessment based on impact thresholds |

**DORA Compliance Dashboard Features:**
- Real-time ICT risk exposure metrics
- Third-party concentration risk heatmap
- Testing coverage percentage by critical service
- Incident reporting timeline adherence
- Major incident root cause analysis trends

### 1.3 NIS2 Directive

**Essential & Important Entities Requirements:**

| Requirement | Article | Implementation | Validation Method |
|-------------|---------|----------------|-------------------|
| Security Risk Management | Art. 21(2)(a) | Unified risk register with supply chain risk modules | Automated risk assessment questionnaires |
| Incident Handling | Art. 21(2)(b) | Automated incident workflow with 24/72-hour reporting logic | Pre-configured CSIRT notification templates |
| Business Continuity | Art. 21(2)(c) | ISO 22301-aligned BC planning with crisis simulation | Annual exercise evidence collection |
| Supply Chain Security | Art. 21(2)(d) | Recursive vendor dependency graph with criticality scoring | Vendor assessment scoring with remediation tracking |
| Security in Acquisition | Art. 21(2)(e) | Vendor assessment questionnaires with automated evaluation | Security requirements validation checklist |
| Notification Obligations | Art. 23 | Automated CSIRT/regulatory notification with templating | Multi-step notification workflow with confirmations |
| Governance Measures | Art. 20 | Board-level reporting dashboards with KRI tracking | Executive summary generation with trends |
| Cybersecurity Training | Art. 21(2)(h) | Training module tracking with competency assessment | Completion tracking and renewal scheduling |
| Use of Cryptography | Art. 21(2)(f) | Encryption status tracking for all resources | Automated compliance verification |
| Human Resources Security | Art. 21(2)(g) | Background check tracking for critical roles | Renewal reminder automation |

**NIS2 Incident Classification Thresholds:**

| Criteria | Significant Incident Threshold | Reporting Timeline |
|----------|-------------------------------|-------------------|
| Service Users Affected | >500,000 users | 24 hours (early warning) |
| Service Duration | >24 hours | 72 hours (detailed report) |
| Geographical Spread | >2 Member States | Immediate notification |
| Data Loss | Personal data of >10,000 individuals | 24 hours + GDPR reporting |
| Economic Impact | >€100,000 estimated losses | 72 hours |

### 1.4 Regulatory Convergence Matrix

The architecture implements a **unified control framework** where a single technical control satisfies multiple regulatory requirements, eliminating duplicate effort and ensuring consistency:
```
Example 1: Business Impact Analysis Module
├── ISO 22301:2019 Clause 8.2 (BIA Requirements) ✓
├── DORA Article 6 (ICT Risk Management) ✓
├── NIS2 Article 21(2)(a) (Cybersecurity Risk Management) ✓
└── Implementation: Single BIA workflow with multi-framework evidence generation

Example 2: Incident Management Module
├── ISO 22301:2019 Clause 8.4.2 (Incident Response) ✓
├── DORA Articles 17-19 (ICT Incident Reporting) ✓
├── NIS2 Article 23 (Notification of Significant Incidents) ✓
└── Implementation: Unified incident workflow with framework-specific reporting

Example 3: Testing & Exercising Module
├── ISO 22301:2019 Clause 8.5 (Exercising and Testing) ✓
├── DORA Article 25 (Testing of ICT Tools) ✓
├── DORA Article 26 (Advanced Testing - TLPT) ✓
├── NIS2 Article 21(2)(c) (BC Testing) ✓
└── Implementation: Exercise scheduler with framework-specific scenarios
```

**Cross-Framework Control Mapping Example:**

| System Feature | ISO 22301 | DORA | NIS2 | Common Implementation |
|----------------|-----------|------|------|----------------------|
| Process Inventory | Clause 4.4 (Scope) | Art. 6 (ICT Assets) | Art. 21 (Asset Management) | Single process repository with regulatory tagging |
| Risk Assessment | Clause 6.1 (Risk Assessment) | Art. 6 (ICT Risk Mgmt) | Art. 21(2)(a) (Risk Mgmt) | FAIR-framework quantitative risk model |
| Vendor Management | Clause 8.2.2(e) (Dependencies) | Art. 28 (Third-Party Risk) | Art. 21(2)(d) (Supply Chain) | Vendor assessment with dependency mapping |
| Recovery Objectives | Clause 8.3 (BC Strategy) | Art. 14 (RTO/RPO) | Art. 21(2)(c) (BC/DR) | RTO/RPO calculator with validation rules |

---

## 2. System Architecture Overview

### 2.1 Architectural Principles

1. **Test-Driven Development**: Write tests first, then implementation (100% coverage target)
2. **Multi-Tenancy First**: Complete logical and physical isolation between organizations
3. **Zero Trust Security**: Never trust, always verify, assume breach
4. **API-Driven**: All functionality exposed via versioned ASP.NET Core Minimal APIs
5. **Event-Driven**: Asynchronous processing using MediatR and background services
6. **Immutable Audit Trail**: Every state change recorded with cryptographic integrity
7. **Declarative Configuration**: Infrastructure and policies defined as code
8. **Clean Architecture**: Domain-driven design with clear separation of concerns
9. **SQL-First Data Access**: Optimized queries using Dapper for maximum performance
10. **Fail-Fast Validation**: Input validation at API boundary with FluentValidation
11. **Idempotent Operations**: All state-changing operations are idempotent
12. **Observable by Default**: Built-in telemetry, logging, and health checks

### 2.2 High-Level System Diagram
```
┌─────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION LAYER                            │
├─────────────────────────────────────────────────────────────────────────┤
│  Blazor WASM      │  Mobile App      │  Admin Portal    │  3rd Party    │
│  (TypeScript)     │  (.NET MAUI)     │  (Blazor Server) │  Integrations │
│  • Responsive UI  │  • iOS/Android   │  • Tenant Mgmt   │  • SIEM       │
│  • Offline Mode   │  • Push Notif.   │  • Analytics     │  • Ticketing  │
└────────┬──────────┴──────────┬───────┴──────────┬───────┴──────────┬────┘
         │                     │                  │                  │
         └─────────────────────┴──────────────────┴──────────────────┘
                                       │
                        ┌──────────────▼──────────────┐
                        │   API GATEWAY LAYER         │
                        │  (YARP Reverse Proxy)       │
                        │  • JWT Validation           │
                        │  • Rate Limiting            │
                        │  • Request Routing          │
                        │  • Response Caching         │
                        │  • API Versioning           │
                        │  • Request Logging          │
                        └──────────────┬──────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         │                             │                             │
         ▼                             ▼                             ▼
┌────────────────────┐       ┌────────────────────┐       ┌────────────────────┐
│  CORE SERVICES     │       │ COMPLIANCE         │       │  INTEGRATION       │
│  (.NET 10 API)     │       │ AUTOMATION         │       │  SERVICES          │
│                    │       │                    │       │                    │
│ • BIA Engine       │       │ • Rule Engine      │       │ • SIEM Connector   │
│ • Risk Calculator  │       │ • Policy Checker   │       │ • Ticketing Int.   │
│ • Resource Mapper  │       │ • Report Generator │       │ • CMDB Sync        │
│ • Exercise Manager │       │ • Evidence Collector│       │ • Notification Hub │
│ • Incident Handler │       │ • Audit Logger     │       │ • Webhook Delivery │
└────────┬───────────┘       └────────┬───────────┘       └────────┬───────────┘
         │                            │                            │
         └────────────────────────────┼────────────────────────────┘
                                      │
                        ┌─────────────▼──────────────┐
                        │    DATA ACCESS LAYER       │
                        │    (Dapper + Custom SQL)   │
                        │  • Query Optimization      │
                        │  • Multi-tenant Filtering  │
                        │  • Connection Pooling      │
                        │  • Transaction Management  │
                        │  • Batch Operations        │
                        └─────────────┬──────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         │                            │                            │
         ▼                            ▼                            ▼
┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐
│  PRIMARY DB     │        │  READ REPLICAS  │        │  ANALYTICS DB   │
│  (PostgreSQL)   │───────▶│  (PostgreSQL)   │        │  (TimescaleDB   │
│  • OLTP         │        │  • Reporting    │        │   Extension)    │
│  • Row-Level    │        │  • Async Loads  │        │  • Metrics      │
│    Security     │        │  • Geo-distrib. │        │  • Time-series  │
│  • ACID Txns    │        │  • Load Balance │        │  • Aggregations │
└─────────────────┘        └─────────────────┘        └─────────────────┘

         ┌────────────────────────────┼────────────────────────────┐
         │                            │                            │
         ▼                            ▼                            ▼
┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐
│  BLOB STORAGE   │        │  CACHE LAYER    │        │  MESSAGE QUEUE  │
│  (Railway       │        │  (Redis)        │        │  (RabbitMQ)     │
│   Volumes)      │        │  • Sessions     │        │  • Async Jobs   │
│  • Documents    │        │  • API Cache    │        │  • Notifications│
│  • Attachments  │        │  • Rate Limits  │        │  • Event Stream │
│  • Exports      │        │  • Tenant Data  │        │  • Dead Letter  │
└─────────────────┘        └─────────────────┘        └─────────────────┘
```

### 2.3 Clean Architecture Layers with Dapper
```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                           │
│  • Nexus.BCMS.Web (Blazor WebAssembly)                         │
│    - Components, Pages, Services                               │
│  • Nexus.BCMS.API (ASP.NET Core Minimal APIs)                  │
│    - Endpoints, Filters, Middleware                            │
│  • Nexus.BCMS.Admin (Blazor Server - Admin Portal)             │
│    - Tenant Management, Analytics, Configuration               │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                   APPLICATION LAYER                             │
│  • Nexus.BCMS.Application                                       │
│    - Commands (CQRS Write Operations via MediatR)               │
│    - Queries (CQRS Read Operations via MediatR)                 │
│    - DTOs (Data Transfer Objects)                               │
│    - Validators (FluentValidation rules)                        │
│    - Behaviors (MediatR Pipeline: Logging, Validation, Caching) │
│    - Mappers (Mapster configurations)                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                     DOMAIN LAYER                                │
│  • Nexus.BCMS.Domain                                            │
│    - Entities (Rich Domain Models with behavior)                │
│    - Value Objects (Immutable Types: RTO, RPO, CriticalityTier) │
│    - Domain Events (ProcessCreated, RTOChanged, etc.)           │
│    - Domain Services (Complex business logic)                   │
│    - Repository Interfaces (Persistence abstractions)           │
│    - Specifications (Reusable query criteria)                   │
│    - Exceptions (Domain-specific exceptions)                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                  INFRASTRUCTURE LAYER                           │
│  • Nexus.BCMS.Infrastructure                                    │
│    - Data/                                                      │
│      • DbConnectionFactory (Connection management)              │
│      • SqlQueries/ (Organized SQL as constants)                 │
│      • Repositories/ (Dapper implementations)                   │
│      • TypeHandlers/ (Custom Dapper type mapping)               │
│      • Migrations/Scripts/ (DbUp SQL scripts)                   │
│    - Identity/ (Authentication & Authorization)                 │
│    - Caching/ (Redis implementations)                           │
│    - Messaging/ (RabbitMQ implementations)                      │
│    - ExternalServices/ (3rd party integrations)                 │
│    - BackgroundJobs/ (Hangfire/Quartz jobs)                     │
│    - FileStorage/ (Blob storage implementations)                │
└─────────────────────────────────────────────────────────────────┘
```

**Layer Dependencies Rule:**
```
Presentation ────▶ Application ────▶ Domain
                         ▲              ▲
                         │              │
                   Infrastructure ──────┘
                   (Implements Domain Interfaces)
```

### 2.4 Railway Deployment Architecture
```
┌──────────────────────────────────────────────────────────────────┐
│                    RAILWAY PLATFORM (railway.app)                │
└──────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  PRODUCTION ENVIRONMENT                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐    │
│  │  Nexus BCMS API Service                               │    │
│  │  • Auto-scaling (1-10 instances based on CPU/Memory)  │    │
│  │  • Health checks: /health (liveness), /ready (startup)│    │
│  │  • Resource limits: 2GB RAM, 1 vCPU per instance      │    │
│  │  • .NET 10 Runtime with Dapper                        │    │
│  │  • Graceful shutdown (30s timeout)                    │    │
│  └───────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐    │
│  │  PostgreSQL Database (Railway Managed)                │    │
│  │  • Version: PostgreSQL 16.1                           │    │
│  │  • Shared CPU, 8GB RAM (scalable)                     │    │
│  │  • Automated daily backups (retained 7 days)          │    │
│  │  • Point-in-time recovery (PITR) available            │    │
│  │  • Connection pooling via PgBouncer                   │    │
│  │  • SSL/TLS encryption enforced                        │    │
│  └───────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐    │
│  │  Redis Cache (Railway Plugin)                         │    │
│  │  • Version: Redis 7.2                                 │    │
│  │  • Session storage (distributed sessions)             │    │
│  │  • API response caching (5-minute TTL)                │    │
│  │  • Rate limiting state (sliding window)               │    │
│  │  • Pub/Sub for real-time notifications                │    │
│  └───────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐    │
│  │  RabbitMQ (Railway Plugin)                            │    │
│  │  • Version: RabbitMQ 3.12                             │    │
│  │  • Async job processing (BIA calculations, reports)   │    │
│  │  • Event-driven messaging (domain events)             │    │
│  │  • Notification dispatch queue                        │    │
│  │  • Dead letter queue (failed message retry)           │    │
│  │  • Message persistence enabled                        │    │
│  └───────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐    │
│  │  Railway Volumes (Persistent Storage)                 │    │
│  │  • Document storage (SOPs, policies, evidence)        │    │
│  │  • File attachments (incidents, exercises)            │    │
│  │  • Export files (CSV, PDF reports)                    │    │
│  │  • Log files (structured logs)                        │    │
│  │  • Backup staging area                                │    │
│  └───────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  STAGING ENVIRONMENT                                            │
├─────────────────────────────────────────────────────────────────┤
│  • Mirrors production configuration (lower resources)           │
│  • Used for integration testing and QA validation               │
│  • Separate database with anonymized production data            │
│  • Auto-deploy on merge to 'develop' branch                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  DEVELOPMENT ENVIRONMENT                                        │
├─────────────────────────────────────────────────────────────────┤
│  • Feature branch deployments (ephemeral)                       │
│  • Minimal resources (512MB RAM, 0.5 vCPU)                      │
│  • Auto-destroy after 7 days of inactivity                      │
│  • Seeded with test data for development                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Multi-Tenancy Strategy

### 3.1 Tenancy Model Selection

**Hybrid Approach: Pool-First with Dedicated Infrastructure Option**

| Tenant Tier | Isolation Level | Infrastructure | Database | Compute | Storage | Use Case |
|-------------|----------------|----------------|----------|---------|---------|----------|
| **Enterprise** | Dedicated | Dedicated Railway service | Dedicated PostgreSQL instance | Dedicated pods | Dedicated volumes | Large orgs (>1000 users), strict regulatory requirements |
| **Professional** | Logical | Shared Railway service | Shared DB with RLS | Shared pods | Shared volumes | Mid-market companies (100-1000 users) |
| **Starter** | Logical | Shared Railway service | Shared DB with RLS | Shared pods | Shared volumes | SMBs (<100 users), trial users |

### 3.2 Data Isolation Strategy with Dapper

**Multi-Layer Isolation Enforcement:**
```csharp
// LAYER 1: DATABASE LEVEL - PostgreSQL Row-Level Security (RLS)
-- Enable RLS on all tenant tables
ALTER TABLE processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY tenant_isolation_processes ON processes
    USING (organization_id = current_setting('app.current_tenant', true)::uuid);

CREATE POLICY tenant_isolation_impact_assessments ON impact_assessments
    USING (organization_id = current_setting('app.current_tenant', true)::uuid);

CREATE POLICY tenant_isolation_recovery_objectives ON recovery_objectives
    USING (organization_id = current_setting('app.current_tenant', true)::uuid);

-- LAYER 2: APPLICATION LEVEL - Base Repository with Tenant Context
public abstract class BaseRepository
{
    protected readonly IDbConnectionFactory _connectionFactory;
    protected readonly ITenantService _tenantService;
    protected readonly ILogger _logger;
    
    protected BaseRepository(
        IDbConnectionFactory connectionFactory,
        ITenantService tenantService,
        ILogger logger)
    {
        _connectionFactory = connectionFactory;
        _tenantService = tenantService;
        _logger = logger;
    }
    
    protected async Task<IDbConnection> GetConnectionAsync()
    {
        var connection = await _connectionFactory.CreateConnectionAsync();
        
        // Set tenant context for all queries in this connection
        var tenantId = _tenantService.GetCurrentTenantId();
        
        if (tenantId == Guid.Empty)
        {
            throw new InvalidOperationException("Tenant context not set");
        }
        
        await connection.ExecuteAsync(
            "SELECT set_config('app.current_tenant', @tenantId, false)",
            new { tenantId });
        
        _logger.LogDebug(
            "Database connection established for tenant {TenantId}",
            tenantId);
        
        return connection;
    }
    
    protected Guid TenantId => _tenantService.GetCurrentTenantId();
    
    protected async Task<T> ExecuteInTransactionAsync<T>(
        Func<IDbConnection, IDbTransaction, Task<T>> operation)
    {
        using var connection = await GetConnectionAsync();
        using var transaction = connection.BeginTransaction();
        
        try
        {
            var result = await operation(connection, transaction);
            transaction.Commit();
            return result;
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }
}

// LAYER 3: MIDDLEWARE LEVEL - Tenant Resolution
public class TenantResolutionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<TenantResolutionMiddleware> _logger;
    
    public async Task InvokeAsync(
        HttpContext context,
        ITenantService tenantService,
        ITenantRepository tenantRepository)
    {
        // Extract tenant ID from multiple sources
        var tenantId = await ExtractTenantIdAsync(context, tenantRepository);
        
        if (tenantId == Guid.Empty)
        {
            context.Response.StatusCode = 400;
            await context.Response.WriteAsJsonAsync(new
            {
                error = "Tenant identification required",
                message = "Request must include tenant identification via JWT claim, subdomain, or X-Tenant-Id header"
            });
            return;
        }
        
        // Validate tenant exists and is active
        var tenant = await tenantRepository.GetByIdAsync(tenantId);
        
        if (tenant == null)
        {
            context.Response.StatusCode = 404;
            await context.Response.WriteAsJsonAsync(new
            {
                error = "Tenant not found",
                message = $"No tenant found with ID: {tenantId}"
            });
            return;
        }
        
        if (tenant.SuspendedAt.HasValue)
        {
            context.Response.StatusCode = 403;
            await context.Response.WriteAsJsonAsync(new
            {
                error = "Tenant suspended",
                message = "This organization's account has been suspended"
            });
            return;
        }
        
        // Set tenant context for this request
        tenantService.SetCurrentTenant(tenantId);
        
        _logger.LogInformation(
            "Request authenticated for tenant {TenantId} ({TenantName})",
            tenantId,
            tenant.Name);
        
        await _next(context);
    }
    
    private async Task<Guid> ExtractTenantIdAsync(
        HttpContext context,
        ITenantRepository tenantRepository)
    {
        // Priority 1: JWT Claim (most secure)
        var claimTenantId = context.User.FindFirst("tenant_id")?.Value
                         ?? context.User.FindFirst("extension_TenantId")?.Value;
        
        if (!string.IsNullOrEmpty(claimTenantId) && Guid.TryParse(claimTenantId, out var tenantIdFromClaim))
        {
            return tenantIdFromClaim;
        }
        
        // Priority 2: Subdomain (e.g., acmecorp.nexusbcms.com)
        var host = context.Request.Host.Host;
        var parts = host.Split('.');
        
        if (parts.Length >= 3)
        {
            var subdomain = parts[0];
            var tenantBySubdomain = await tenantRepository.GetBySubdomainAsync(subdomain);
            
            if (tenantBySubdomain != null)
            {
                return tenantBySubdomain.Id;
            }
        }
        
        // Priority 3: Custom Header (for API clients)
        if (context.Request.Headers.TryGetValue("X-Tenant-Id", out var headerValue))
        {
            if (Guid.TryParse(headerValue, out var tenantIdFromHeader))
            {
                return tenantIdFromHeader;
            }
        }
        
        // Priority 4: Route parameter (for admin operations)
        if (context.Request.RouteValues.TryGetValue("orgId", out var routeValue))
        {
            if (Guid.TryParse(routeValue?.ToString(), out var tenantIdFromRoute))
            {
                return tenantIdFromRoute;
            }
        }
        
        return Guid.Empty;
    }
}

// LAYER 4: REPOSITORY LEVEL - Automatic Tenant Filtering
public static class DapperMultiTenancyExtensions
{
    public static async Task<IEnumerable<T>> QueryTenantAsync<T>(
        this IDbConnection connection,
        string sql,
        object param = null,
        Guid? tenantId = null,
        IDbTransaction transaction = null)
    {
        if (tenantId.HasValue)
        {
            await connection.ExecuteAsync(
                "SELECT set_config('app.current_tenant', @tenantId, false)",
                new { tenantId = tenantId.Value });
        }
        
        return await connection.QueryAsync<T>(sql, param, transaction);
    }
    
    public static async Task<T> QuerySingleTenantAsync<T>(
        this IDbConnection connection,
        string sql,
        object param = null,
        Guid? tenantId = null,
        IDbTransaction transaction = null)
    {
        if (tenantId.HasValue)
        {
            await connection.ExecuteAsync(
                "SELECT set_config('app.current_tenant', @tenantId, false)",
                new { tenantId = tenantId.Value });
        }
        
        return await connection.QuerySingleOrDefaultAsync<T>(sql, param, transaction);
    }
}
```

### 3.3 Tenant Provisioning Workflow
```csharp
// TDD Example: Tenant Provisioning Service Tests
public class TenantProvisioningServiceTests : IAsyncLifetime
{
    private readonly NpgsqlConnection _connection;
    private readonly TenantProvisioningService _sut;
    private readonly IEncryptionService _encryptionService;
    
    public TenantProvisioningServiceTests()
    {
        _connection = new NpgsqlConnection(TestConnectionString);
        _encryptionService = Substitute.For<IEncryptionService>();
        _encryptionService.GenerateKeyAsync()
            .Returns(Task.FromResult(Guid.NewGuid()));
        
        _sut = new TenantProvisioningService(
            new DbConnectionFactory(_connection),
            _encryptionService,
            new NullLogger<TenantProvisioningService>());
    }
    
    public async Task InitializeAsync()
    {
        await _connection.OpenAsync();
        await SetupTestDatabaseAsync();
    }
    
    [Fact]
    public async Task ProvisionTenant_WithValidData_ShouldCreateOrganizationAndSeedDefaults()
    {
        // Arrange
        var request = new ProvisionTenantRequest
        {
            OrganizationName = "Acme Corporation",
            SubscriptionTier = SubscriptionTier.Professional,
            AdminEmail = "admin@acme.com",
            AdminName = "John Doe",
            RegulatoryScope = new[] { "ISO22301", "NIS2" },
            EntityClassification = "Important",
            DataResidency = "GB",
            Industry = "Financial Services"
        };
        
        // Act
        var result = await _sut.ProvisionTenantAsync(request);
        
        // Assert
        result.Should().NotBeNull();
        result.OrganizationId.Should().NotBeEmpty();
        result.Success.Should().BeTrue();
        result.AdminUserId.Should().NotBeEmpty();
        
        // Verify organization created
        var org = await _connection.QuerySingleOrDefaultAsync<Organization>(
            "SELECT * FROM organizations WHERE id = @Id",
            new { Id = result.OrganizationId });
        
        org.Should().NotBeNull();
        org!.Name.Should().Be("Acme Corporation");
        org.SubscriptionTier.Should().Be("Professional");
        
        // Verify default data seeded
        var processCount = await _connection.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM processes WHERE organization_id = @OrgId",
            new { OrgId = result.OrganizationId });
        processCount.Should().BeGreaterThan(0);
        
        // Verify default compliance controls created
        var controlCount = await _connection.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM compliance_controls WHERE organization_id = @OrgId",
            new { OrgId = result.OrganizationId });
        controlCount.Should().BeGreaterThan(0);
        
        // Verify admin user created
        var adminUser = await _connection.QuerySingleOrDefaultAsync<User>(
            "SELECT * FROM users WHERE id = @Id",
            new { Id = result.AdminUserId });
        adminUser.Should().NotBeNull();
        adminUser!.Email.Should().Be("admin@acme.com");
        
        // Verify audit log created
        var auditLog = await _connection.QuerySingleOrDefaultAsync<AuditLog>(
            @"SELECT * FROM audit_logs 
              WHERE organization_id = @OrgId 
                AND action = 'TENANT_PROVISIONED'",
            new { OrgId = result.OrganizationId });
        auditLog.Should().NotBeNull();
    }
    
    [Fact]
    public async Task ProvisionTenant_WithDuplicateName_ShouldThrowException()
    {
        // Arrange
        await SeedExistingTenant("Acme Corporation");
        
        var request = new ProvisionTenantRequest
        {
            OrganizationName = "Acme Corporation",
            SubscriptionTier = SubscriptionTier.Starter,
            AdminEmail = "admin@acme.com"
        };
        
        // Act & Assert
        await _sut.Invoking(s => s.ProvisionTenantAsync(request))
            .Should().ThrowAsync<DuplicateTenantException>()
            .WithMessage("*Acme Corporation*already exists*");
    }
    
    [Fact]
    public async Task ProvisionTenant_ShouldCreateSubdomain()
    {
        // Arrange
        var request = new ProvisionTenantRequest
        {
            OrganizationName = "Test Company Ltd",
            SubscriptionTier = SubscriptionTier.Professional,
            AdminEmail = "admin@test.com"
        };
        
        // Act
        var result = await _sut.ProvisionTenantAsync(request);
        
        // Assert
        var org = await _connection.QuerySingleOrDefaultAsync<Organization>(
            "SELECT * FROM organizations WHERE id = @Id",
            new { Id = result.OrganizationId });
        
        org!.Subdomain.Should().Be("test-company");
    }
    
    public async Task DisposeAsync()
    {
        await _connection.CloseAsync();
        _connection.Dispose();
    }
}

// Implementation: Tenant Provisioning Service with Dapper
public class TenantProvisioningService
{
    private readonly IDbConnectionFactory _connectionFactory;
    private readonly IEncryptionService _encryption;
    private readonly ILogger<TenantProvisioningService> _logger;
    
    public TenantProvisioningService(
        IDbConnectionFactory connectionFactory,
        IEncryptionService encryption,
        ILogger<TenantProvisioningService> logger)
    {
        _connectionFactory = connectionFactory;
        _encryption = encryption;
        _logger = logger;
    }
    
    public async Task<TenantProvisioningResult> ProvisionTenantAsync(
        ProvisionTenantRequest request,
        CancellationToken cancellationToken = default)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        
        // 1. Validate uniqueness
        var existingTenant = await connection.ExecuteScalarAsync<bool>(
            "SELECT EXISTS(SELECT 1 FROM organizations WHERE name = @Name)",
            new { Name = request.OrganizationName });
        
        if (existingTenant)
        {
            throw new DuplicateTenantException(request.OrganizationName);
        }
        
        using var transaction = connection.BeginTransaction();
        
        try
        {
            // 2. Create organization
            var organizationId = Guid.NewGuid();
            var encryptionKeyId = await _encryption.GenerateKeyAsync();
            var subdomain = GenerateSubdomain(request.OrganizationName);
            
            await connection.ExecuteAsync(
                @"INSERT INTO organizations (
                    id, name, subdomain, subscription_tier, regulatory_scope, 
                    entity_classification, encryption_key_id, data_residency,
                    industry, created_at
                  )
                  VALUES (
                    @Id, @Name, @Subdomain, @Tier, @Scope::jsonb, 
                    @Classification, @KeyId, @Residency,
                    @Industry, @CreatedAt
                  )",
                new
                {
                    Id = organizationId,
                    Name = request.OrganizationName,
                    Subdomain = subdomain,
                    Tier = request.SubscriptionTier.ToString(),
                    Scope = JsonSerializer.Serialize(request.RegulatoryScope),
                    Classification = request.EntityClassification,
                    KeyId = encryptionKeyId,
                    Residency = request.DataResidency,
                    Industry = request.Industry,
                    CreatedAt = DateTime.UtcNow
                },
                transaction);
            
            _logger.LogInformation(
                "Organization {OrganizationName} created with ID {OrganizationId}",
                request.OrganizationName,
                organizationId);
            
            // 3. Create admin user
            var adminUserId = await CreateAdminUserAsync(
                connection,
                organizationId,
                request.AdminEmail,
                request.AdminName,
                transaction);
            
            // 4. Seed default processes
            await SeedDefaultProcessesAsync(connection, organizationId, transaction);
            
            // 5. Seed compliance controls based on regulatory scope
            await SeedComplianceControlsAsync(
                connection,
                organizationId,
                request.RegulatoryScope,
                transaction);
            
            // 6. Create default BC roles
            await SeedDefaultRolesAsync(connection, organizationId, transaction);
            
            // 7. Create default metric definitions
            await SeedMetricDefinitionsAsync(connection, organizationId, transaction);
            
            // 8. Audit log
            await connection.ExecuteAsync(
                @"INSERT INTO audit_logs (
                    id, organization_id, action, entity_type, entity_id, 
                    changes, timestamp
                  )
                  VALUES (
                    @Id, @OrgId, @Action, @EntityType, @EntityId, 
                    @Changes::jsonb, @Timestamp
                  )",
                new
                {
                    Id = Guid.NewGuid(),
                    OrgId = organizationId,
                    Action = "TENANT_PROVISIONED",
                    EntityType = "Organization",
                    EntityId = organizationId,
                    Changes = JsonSerializer.Serialize(new
                    {
                        organization_name = request.OrganizationName,
                        subscription_tier = request.SubscriptionTier,
                        regulatory_scope = request.RegulatoryScope,
                        admin_email = request.AdminEmail
                    }),
                    Timestamp = DateTime.UtcNow
                },
                transaction);
            
            transaction.Commit();
            
            _logger.LogInformation(
                "Tenant provisioning completed successfully for {OrganizationName}",
                request.OrganizationName);
            
            return new TenantProvisioningResult
            {
                OrganizationId = organizationId,
                AdminUserId = adminUserId,
                Subdomain = subdomain,
                Success = true
            };
        }
        catch (Exception ex)
        {
            transaction.Rollback();
            
            _logger.LogError(
                ex,
                "Failed to provision tenant {OrganizationName}",
                request.OrganizationName);
            
            throw;
        }
    }
    
    private async Task<Guid> CreateAdminUserAsync(
        IDbConnection connection,
        Guid organizationId,
        string email,
        string name,
        IDbTransaction transaction)
    {
        var userId = Guid.NewGuid();
        
        await connection.ExecuteAsync(
            @"INSERT INTO users (
                id, organization_id, email, full_name, 
                identity_provider, roles, mfa_enabled, 
                account_status, created_at
              )
              VALUES (
                @Id, @OrgId, @Email, @Name, 
                'Local', @Roles::text[], @MfaEnabled, 
                @Status, @CreatedAt
              )",
            new
            {
                Id = userId,
                OrgId = organizationId,
                Email = email,
                Name = name,
                Roles = new[] { "OrgAdmin" },
                MfaEnabled = false,
                Status = "Active",
                CreatedAt = DateTime.UtcNow
            },
            transaction);
        
        return userId;
    }
    
    private async Task SeedDefaultProcessesAsync(
        IDbConnection connection,
        Guid organizationId,
        IDbTransaction transaction)
    {
        var defaultProcesses = new[]
        {
            new { Name = "Customer Service Operations", Tier = "Tier2", Description = "Front-line customer support and service delivery" },
            new { Name = "Financial Transaction Processing", Tier = "Tier1", Description = "Core payment and transaction processing systems" },
            new { Name = "IT Infrastructure Management", Tier = "Tier1", Description = "Critical IT infrastructure and system management" },
            new { Name = "Human Resources Management", Tier = "Tier3", Description = "HR administration and employee management" },
            new { Name = "Supply Chain Management", Tier = "Tier2", Description = "Supply chain and procurement operations" }
        };
        
        foreach (var process in defaultProcesses)
        {
            await connection.ExecuteAsync(
                @"INSERT INTO processes (
                    id, organization_id, name, description, 
                    criticality_tier, created_at, updated_at
                  )
                  VALUES (
                    @Id, @OrgId, @Name, @Description, 
                    @Tier, @CreatedAt, @UpdatedAt
                  )",
                new
                {
                    Id = Guid.NewGuid(),
                    OrgId = organizationId,
                    process.Name,
                    process.Description,
                    process.Tier,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                transaction);
        }
    }
    
    private async Task SeedComplianceControlsAsync(
        IDbConnection connection,
        Guid organizationId,
        string[] regulatoryScope,
        IDbTransaction transaction)
    {
        var controls = new List<(string ControlId, string Framework, string Description)>();
        
        if (regulatoryScope.Contains("ISO22301"))
        {
            controls.AddRange(new[]
            {
                ("ISO22301-4.4", "ISO22301", "BCMS Scope Definition"),
                ("ISO22301-8.2", "ISO22301", "Business Impact Analysis"),
                ("ISO22301-8.3", "ISO22301", "BC Strategy"),
                ("ISO22301-8.5", "ISO22301", "Exercising and Testing")
            });
        }
        
        if (regulatoryScope.Contains("DORA"))
        {
            controls.AddRange(new[]
            {
                ("DORA-Art.6", "DORA", "ICT Risk Management Framework"),
                ("DORA-Art.14", "DORA", "Recovery Time and Point Objectives"),
                ("DORA-Art.25", "DORA", "Testing of ICT Tools")
            });
        }
        
        if (regulatoryScope.Contains("NIS2"))
        {
            controls.AddRange(new[]
            {
                ("NIS2-Art.21", "NIS2", "Cybersecurity Risk Management"),
                ("NIS2-Art.23", "NIS2", "Reporting Significant Incidents")
            });
        }
        
        foreach (var (controlId, framework, description) in controls)
        {
            await connection.ExecuteAsync(
                @"INSERT INTO compliance_controls (
                    id, organization_id, control_id, framework, 
                    control_description, implementation_status, 
                    created_at
                  )
                  VALUES (
                    @Id, @OrgId, @ControlId, @Framework, 
                    @Description, @Status, @CreatedAt
                  )",
                new
                {
                    Id = Guid.NewGuid(),
                    OrgId = organizationId,
                    ControlId = controlId,
                    Framework = framework,
                    Description = description,
                    Status = "NotImplemented",
                    CreatedAt = DateTime.UtcNow
                },
                transaction);
        }
    }
    
    private async Task SeedDefaultRolesAsync(
        IDbConnection connection,
        Guid organizationId,
        IDbTransaction transaction)
    {
        var defaultRoles = new[]
        {
            new { Name = "Crisis Management Team", Type = "CrisisManagement", Threshold = "Major" },
            new { Name = "IT Recovery Team", Type = "Recovery", Threshold = "Moderate" },
            new { Name = "Communication Team", Type = "Communication", Threshold = "Minor" }
        };
        
        foreach (var role in defaultRoles)
        {
            await connection.ExecuteAsync(
                @"INSERT INTO bc_team_structures (
                    id, organization_id, team_name, team_type, 
                    activation_threshold, created_at
                  )
                  VALUES (
                    @Id, @OrgId, @Name, @Type, 
                    @Threshold, @CreatedAt
                  )",
                new
                {
                    Id = Guid.NewGuid(),
                    OrgId = organizationId,
                    role.Name,
                    role.Type,
                    role.Threshold,
                    CreatedAt = DateTime.UtcNow
                },
                transaction);
        }
    }
    
    private async Task SeedMetricDefinitionsAsync(
        IDbConnection connection,
        Guid organizationId,
        IDbTransaction transaction)
    {
        var metrics = new[]
        {
            new { Name = "BIA Completion Rate", Category = "BIA", Target = 100m },
            new { Name = "RTO Compliance Rate", Category = "RTO_Compliance", Target = 95m },
            new { Name = "Exercise Frequency", Category = "Exercise_Frequency", Target = 4m },
            new { Name = "Incident Response Time", Category = "Incident_Response_Time", Target = 15m }
        };
        
        foreach (var metric in metrics)
        {
            await connection.ExecuteAsync(
                @"INSERT INTO metric_definitions (
                    id, organization_id, metric_name, metric_category, 
                    target_value, measurement_frequency, created_at
                  )
                  VALUES (
                    @Id, @OrgId, @Name, @Category, 
                    @Target, @Frequency, @CreatedAt
                  )",
                new
                {
                    Id = Guid.NewGuid(),
                    OrgId = organizationId,
                    metric.Name,
                    metric.Category,
                    metric.Target,
                    Frequency = "Monthly",
                    CreatedAt = DateTime.UtcNow
                },
                transaction);
        }
    }
    
    private string GenerateSubdomain(string organizationName)
    {
        // Convert to lowercase and replace spaces/special chars with hyphens
        var subdomain = organizationName.ToLowerInvariant()
            .Replace(" ", "-")
            .Replace("ltd", "")
            .Replace("limited", "")
            .Replace("inc", "")
            .Replace("corporation", "")
            .Replace("corp", "");
        
        // Remove any characters that aren't alphanumeric or hyphen
        subdomain = new string(subdomain
            .Where(c => char.IsLetterOrDigit(c) || c == '-')
            .ToArray());
        
        // Remove consecutive hyphens and trim
        subdomain = System.Text.RegularExpressions.Regex
            .Replace(subdomain, "-+", "-")
            .Trim('-');
        
        return subdomain;
    }
}

// DTOs
public class ProvisionTenantRequest
{
    public string OrganizationName { get; set; } = default!;
    public SubscriptionTier SubscriptionTier { get; set; }
    public string AdminEmail { get; set; } = default!;
    public string AdminName { get; set; } = default!;
    public string[] RegulatoryScope { get; set; } = Array.Empty<string>();
    public string? EntityClassification { get; set; }
    public string? DataResidency { get; set; }
    public string? Industry { get; set; }
}

public class TenantProvisioningResult
{
    public Guid OrganizationId { get; set; }
    public Guid AdminUserId { get; set; }
    public string Subdomain { get; set; } = default!;
    public bool Success { get; set; }
}

public enum SubscriptionTier
{
    Starter,
    Professional,
    Enterprise
}

public class DuplicateTenantException : Exception
{
    public DuplicateTenantException(string organizationName)
        : base($"Organization with name '{organizationName}' already exists")
    {
    }
}
```

### 3.4 Tenant Lifecycle Management

| Operation | Process | Data Handling | Implementation |
|-----------|---------|---------------|----------------|
| **Onboarding** | Automated via API | Template-based initialization | `TenantProvisioningService.ProvisionTenantAsync()` |
| **Scaling** | Railway auto-scaling | Resource quota enforcement | Middleware-based throttling by tier |
| **Upgrade** | Self-service or admin-initiated | Feature gating updated | Subscription tier change workflow |
| **Downgrade** | Grace period with warnings | Data retained, features limited | Feature flags based on subscription |
| **Suspension** | Auth revocation | Data frozen, read-only access | `suspended_at` timestamp set |
| **Offboarding** | 30-day grace period | Full export provided via API | Soft delete → hard delete after grace |

**Tenant Suspension Implementation:**
```csharp
public class TenantSuspensionService
{
    private readonly IDbConnectionFactory _connectionFactory;
    private readonly ILogger<TenantSuspensionService> _logger;
    
    public async Task SuspendTenantAsync(
        Guid organizationId,
        string reason,
        Guid suspendedBy)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        
        await connection.ExecuteAsync(
            @"UPDATE organizations 
              SET suspended_at = @SuspendedAt,
                  suspension_reason = @Reason,
                  suspended_by = @SuspendedBy
              WHERE id = @Id",
            new
            {
                Id = organizationId,
                SuspendedAt = DateTime.UtcNow,
                Reason = reason,
                SuspendedBy = suspendedBy
            });
        
        _logger.LogWarning(
            "Tenant {OrganizationId} suspended. Reason: {Reason}",
            organizationId,
            reason);
    }
    
    public async Task ReactivateTenantAsync(Guid organizationId)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        
        await connection.ExecuteAsync(
            @"UPDATE organizations 
              SET suspended_at = NULL,
                  suspension_reason = NULL,
                  suspended_by = NULL
              WHERE id = @Id",
            new { Id = organizationId });
        
        _logger.LogInformation(
            "Tenant {OrganizationId} reactivated",
            organizationId);
    }
}
```

---

## 4. .NET 10 Technology Stack with Dapper

### 4.1 Core Technology Matrix

| Layer | Technology | Version | Justification | Performance Notes |
|-------|------------|---------|---------------|-------------------|
| **Runtime** | .NET | 10.0 | Performance improvements, minimal APIs, native AOT support | 30% faster than .NET 6 |
| **Language** | C# | 13.0 | Pattern matching, records, nullable reference types, primary constructors | Enhanced type safety |
| **Web Framework** | ASP.NET Core | 10.0 | Minimal APIs, high performance, built-in DI | Request throughput: 7M req/s |
| **Frontend** | Blazor WebAssembly | 10.0 | .NET in browser, component reusability, ahead-of-time compilation | Near-native performance |
| **Admin Portal** | Blazor Server | 10.0 | Rich interactivity with server-side rendering, SignalR | Real-time updates |
| **Micro-ORM** | Dapper | 2.1+ | High-performance SQL execution, lightweight (2x faster than EF Core) | 0.8ms avg query time |
| **Database** | PostgreSQL | 16+ | ACID compliance, JSONB support, advanced features, mature RLS | 15K TPS sustained |
| **Database Migrations** | DbUp | 5.0+ | Simple, reliable SQL-based migrations, embedded resources | Zero downtime migrations |
| **Testing Framework** | xUnit | 2.6+ | Industry standard, excellent tooling support, parallel execution | Fast test runs |
| **Mocking** | NSubstitute | 5.1+ | Clean syntax, compatible with async/await | Easy test setup |
| **Assertions** | FluentAssertions | 7.0+ | Readable test assertions, comprehensive matchers | Better error messages |
| **Test Coverage** | Coverlet | 6.0+ | Cross-platform code coverage, CI/CD integration | Branch coverage support |
| **CQRS/Mediator** | MediatR | 12.2+ | Command/query separation, pipeline behaviors | Decoupled architecture |
| **Validation** | FluentValidation | 11.9+ | Fluent validation rules, async validators | Rich error details |
| **Mapping** | Mapster | 7.4+ | High-performance object mapping (3x faster than AutoMapper) | Compile-time generation |
| **Caching** | StackExchange.Redis | 2.7+ | Distributed caching, pub/sub support | Microsecond latency |
| **Messaging** | RabbitMQ.Client | 6.8+ | Reliable message delivery, message persistence | 50K msg/s throughput |
| **API Documentation** | Scalar (OpenAPI) | Latest | Interactive API documentation, modern UI | Better than Swagger UI |
| **Authentication** | Microsoft.Identity.Web | 2.16+ | Entra ID integration, MSAL support | OAuth2/OIDC compliant |
| **Logging** | Serilog | 3.1+ | Structured logging with sinks, context enrichment | Async logging |
| **Monitoring** | OpenTelemetry | 1.7+ | Vendor-neutral instrumentation, W3C compliant | Full observability |

### 4.2 Detailed Project Structure
```
Nexus.BCMS/
├── src/
│   ├── Nexus.BCMS.Domain/                    # Core business logic (no dependencies)
│   │   ├── Entities/
│   │   │   ├── Organization.cs               # Tenant root aggregate
│   │   │   ├── Process.cs                    # Business process entity
│   │   │   ├── ImpactAssessment.cs          # BIA impact data
│   │   │   ├── RecoveryObjective.cs         # RTO/RPO/MTPD
│   │   │   ├── BusinessResource.cs          # Assets, systems, people
│   │   │   ├── ResourceDependency.cs        # Dependency mappings
│   │   │   ├── RiskRegister.cs              # Risk tracking
│   │   │   ├── BCTeamStructure.cs           # Crisis teams
│   │   │   ├── BCPeople.cs                  # Personnel registry
│   │   │   ├── Incident.cs                  # Incident management
│   │   │   ├── Exercise.cs                  # BC testing
│   │   │   ├── ComplianceControl.cs         # Control framework
│   │   │   └── AuditLog.cs                  # Audit trail
│   │   ├── ValueObjects/
│   │   │   ├── RTOValue.cs                  # Recovery Time Objective
│   │   │   ├── RPOValue.cs                  # Recovery Point Objective
│   │   │   ├── CriticalityTier.cs           # Tier1/2/3/4 enum
│   │   │   ├── ImpactScore.cs               # 0-5 impact rating
│   │   │   └── RiskScore.cs                 # Calculated risk value
│   │   ├── Events/
│   │   │   ├── ProcessCreatedEvent.cs
│   │   │   ├── ProcessCriticalityChangedEvent.cs
│   │   │   ├── IncidentCreatedEvent.cs
│   │   │   ├── RTOBreachWarningEvent.cs
│   │   │   └── ExerciseCompletedEvent.cs
│   │   ├── Interfaces/
│   │   │   ├── IProcessRepository.cs
│   │   │   ├── IImpactAssessmentRepository.cs
│   │   │   ├── IBusinessResourceRepository.cs
│   │   │   ├── IIncidentRepository.cs
│   │   │   └── IUnitOfWork.cs
│   │   ├── Specifications/
│   │   │   ├── ProcessByCriticalitySpec.cs
│   │   │   ├── OverdueExercisesSpec.cs
│   │   │   └── DORAICTServicesSpec.cs
│   │   └── Exceptions/
│   │       ├── DomainException.cs
│   │       ├── InvalidRTOException.cs
│   │       └── DuplicateProcessException.cs
│   │
│   ├── Nexus.BCMS.Application/                # Application services layer
│   │   ├── Commands/
│   │   │   ├── CreateProcess/
│   │   │   │   ├── CreateProcessCommand.cs
│   │   │   │   ├── CreateProcessCommandHandler.cs
│   │   │   │   └── CreateProcessCommandValidator.cs
│   │   │   ├── UpdateImpactAssessment/
│   │   │   │   ├── UpdateImpactAssessmentCommand.cs
│   │   │   │   ├── UpdateImpactAssessmentCommandHandler.cs
│   │   │   │   └── UpdateImpactAssessmentCommandValidator.cs
│   │   │   ├── SetRecoveryObjectives/
│   │   │   ├── CreateIncident/
│   │   │   ├── ScheduleExercise/
│   │   │   └── ProvisionTenant/
│   │   ├── Queries/
│   │   │   ├── GetProcessById/
│   │   │   │   ├── GetProcessByIdQuery.cs
│   │   │   │   └── GetProcessByIdQueryHandler.cs
│   │   │   ├── GetProcessesByTenant/
│   │   │   ├── GetResilienceDashboard/
│   │   │   ├── GetComplianceReport/
│   │   │   └── SearchProcesses/
│   │   ├── DTOs/
│   │   │   ├── ProcessDto.cs
│   │   │   ├── ImpactAssessmentDto.cs
│   │   │   ├── RecoveryObjectiveDto.cs
│   │   │   ├── IncidentDto.cs
│   │   │   └── ResilienceDashboardDto.cs
│   │   ├── Validators/
│   │   │   ├── CreateProcessValidator.cs
│   │   │   ├── ImpactAssessmentValidator.cs
│   │   │   └── RTOValidator.cs
│   │   ├── Behaviors/
│   │   │   ├── ValidationBehavior.cs          # FluentValidation pipeline
│   │   │   ├── LoggingBehavior.cs            # Request/response logging
│   │   │   ├── PerformanceBehavior.cs        # Slow query detection
│   │   │   ├── TenantValidationBehavior.cs   # Tenant isolation check
│   │   │   └── CachingBehavior.cs            # Response caching
│   │   ├── Mappings/
│   │   │   └── MappingConfig.cs              # Mapster configuration
│   │   └── Services/
│   │       ├── ResilienceScoreCalculator.cs
│   │       ├── RTOComplianceChecker.cs
│   │       └── IncidentNotificationService.cs
│   │
│   ├── Nexus.BCMS.Infrastructure/             # External concerns
│   │   ├── Data/
│   │   │   ├── DbConnectionFactory.cs        # Connection management
│   │   │   ├── SqlQueries/
│   │   │   │   ├── ProcessQueries.cs         # Process SQL
│   │   │   │   ├── ImpactAssessmentQueries.cs
│   │   │   │   ├── IncidentQueries.cs
│   │   │   │   └── ComplianceQueries.cs
│   │   │   ├── Repositories/
│   │   │   │   ├── BaseRepository.cs         # Multi-tenant base
│   │   │   │   ├── ProcessRepository.cs
│   │   │   │   ├── ImpactAssessmentRepository.cs
│   │   │   │   ├── BusinessResourceRepository.cs
│   │   │   │   ├── IncidentRepository.cs
│   │   │   │   └── AuditLogRepository.cs
│   │   │   ├── TypeHandlers/
│   │   │   │   ├── JsonbTypeHandler.cs       # JSONB mapping
│   │   │   │   ├── ArrayTypeHandler.cs       # PostgreSQL arrays
│   │   │   │   └── InetTypeHandler.cs        # IP address type
│   │   │   └── Migrations/
│   │   │       ├── MigrationRunner.cs        # DbUp runner
│   │   │       └── Scripts/
│   │   │           ├── 001_CreateOrganizations.sql
│   │   │           ├── 002_CreateProcesses.sql
│   │   │           ├── 003_CreateImpactAssessments.sql
│   │   │           ├── 004_CreateRecoveryObjectives.sql
│   │   │           ├── 005_CreateBusinessResources.sql
│   │   │           ├── 006_CreateIncidents.sql
│   │   │           ├── 007_CreateExercises.sql
│   │   │           ├── 008_CreateAuditLogs.sql
│   │   │           ├── 009_EnableRowLevelSecurity.sql
│   │   │           └── 010_CreateIndexes.sql
│   │   ├── Identity/
│   │   │   ├── TenantService.cs              # Current tenant tracking
│   │   │   ├── EntraIdAuthService.cs         # Microsoft Entra integration
│   │   │   └── JwtTokenValidator.cs
│   │   ├── Caching/
│   │   │   ├── RedisCacheService.cs
│   │   │   └── CacheKeyGenerator.cs
│   │   ├── Messaging/
│   │   │   ├── RabbitMQPublisher.cs
│   │   │   └── RabbitMQConsumer.cs
│   │   ├── ExternalServices/
│   │   │   ├── SIEMConnector.cs
│   │   │   ├── TicketingIntegration.cs
│   │   │   └── EmailNotificationService.cs
│   │   ├── BackgroundJobs/
│   │   │   ├── ResilienceScoreCalculationJob.cs
│   │   │   ├── ExerciseReminderJob.cs
│   │   │   └── ComplianceReportGenerationJob.cs
│   │   └── FileStorage/
│   │       ├── BlobStorageService.cs
│   │       └── DocumentGenerator.cs
│   │
│   ├── Nexus.BCMS.API/                        # Web API layer
│   │   ├── Program.cs                         # Application entry point
│   │   ├── Endpoints/
│   │   │   ├── ProcessEndpoints.cs
│   │   │   ├── BIAEndpoints.cs
│   │   │   ├── IncidentEndpoints.cs
│   │   │   ├── ExerciseEndpoints.cs
│   │   │   ├── ComplianceEndpoints.cs
│   │   │   └── TenantEndpoints.cs
│   │   ├── Middleware/
│   │   │   ├── TenantResolutionMiddleware.cs
│   │   │   ├── ExceptionHandlingMiddleware.cs
│   │   │   ├── RequestLoggingMiddleware.cs
│   │   │   └── PerformanceMonitoringMiddleware.cs
│   │   ├── Filters/
│   │   │   ├── ValidateModelFilter.cs
│   │   │   └── TenantAuthorizationFilter.cs
│   │   ├── Extensions/
│   │   │   ├── ServiceCollectionExtensions.cs
│   │   │   └── WebApplicationExtensions.cs
│   │   └── appsettings.json
│   │
│   ├── Nexus.BCMS.Web/                        # Blazor WebAssembly
│   │   ├── Components/
│   │   ├── Pages/
│   │   ├── Services/
│   │   └── wwwroot/
│   │
│   └── Nexus.BCMS.Admin/                      # Admin portal
│       ├── Components/
│       ├── Pages/
│       └── Services/
│
└── tests/
    ├── Nexus.BCMS.Domain.Tests/
    │   ├── Entities/
    │   │   ├── ProcessTests.cs
    │   │   ├── ImpactAssessmentTests.cs
    │   │   └── RecoveryObjectiveTests.cs
    │   ├── ValueObjects/
    │   │   ├── RTOValueTests.cs
    │   │   └── CriticalityTierTests.cs
    │   └── Specifications/
    │       └── ProcessByCriticalitySpecTests.cs
    │
    ├── Nexus.BCMS.Application.Tests/
    │   ├── Commands/
    │   │   ├── CreateProcessCommandHandlerTests.cs
    │   │   └── UpdateImpactAssessmentCommandHandlerTests.cs
    │   ├── Queries/
    │   │   └── GetProcessByIdQueryHandlerTests.cs
    │   └── Behaviors/
    │       ├── ValidationBehaviorTests.cs
    │       └── TenantValidationBehaviorTests.cs
    │
    ├── Nexus.BCMS.Infrastructure.Tests/
    │   ├── Repositories/
    │   │   ├── ProcessRepositoryTests.cs
    │   │   ├── IncidentRepositoryTests.cs
    │   │   └── TenantIsolationTests.cs
    │   ├── Caching/
    │   │   └── RedisCacheServiceTests.cs
    │   └── Migrations/
    │       └── MigrationTests.cs
    │
    ├── Nexus.BCMS.API.Tests/
    │   ├── Integration/
    │   │   ├── ProcessEndpointsTests.cs
    │   │   ├── BIAEndpointsTests.cs
    │   │   └── AuthenticationTests.cs
    │   └── Unit/
    │       └── MiddlewareTests.cs
    │
    └── Nexus.BCMS.E2E.Tests/
        ├── Workflows/
        │   ├── CompleteB IAWorkflowTests.cs
        │   └── IncidentManagementWorkflowTests.cs
        └── Scenarios/
            └── RegulatoryComplianceScenarioTests.cs
```
### 4.3 NuGet Package Dependencies
```xml
<!-- Nexus.BCMS.Domain.csproj -->
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <!-- No external dependencies - pure domain logic -->
    <PackageReference Include="Ardalis.GuardClauses" Version="4.5.0" />
  </ItemGroup>
</Project>

<!-- Nexus.BCMS.Application.csproj -->
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <!-- CQRS & Mediator -->
    <PackageReference Include="MediatR" Version="12.2.0" />
    
    <!-- Validation -->
    <PackageReference Include="FluentValidation" Version="11.9.0" />
    <PackageReference Include="FluentValidation.DependencyInjectionExtensions" Version="11.9.0" />
    
    <!-- Object Mapping -->
    <PackageReference Include="Mapster" Version="7.4.0" />
    
    <!-- Assertions for testing -->
    <PackageReference Include="FluentAssertions" Version="7.0.0" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\Nexus.BCMS.Domain\Nexus.BCMS.Domain.csproj" />
  </ItemGroup>
</Project>

<!-- Nexus.BCMS.Infrastructure.csproj -->
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <!-- Dapper & Database -->
    <PackageReference Include="Dapper" Version="2.1.28" />
    <PackageReference Include="Dapper.Contrib" Version="2.0.78" />
    <PackageReference Include="Npgsql" Version="8.0.1" />
    <PackageReference Include="DbUp" Version="5.0.37" />
    <PackageReference Include="DbUp-PostgreSQL" Version="5.0.37" />
    
    <!-- Caching -->
    <PackageReference Include="StackExchange.Redis" Version="2.7.0" />
    
    <!-- Messaging -->
    <PackageReference Include="RabbitMQ.Client" Version="6.8.0" />
    
    <!-- Background Jobs -->
    <PackageReference Include="Hangfire.Core" Version="1.8.9" />
    <PackageReference Include="Hangfire.AspNetCore" Version="1.8.9" />
    <PackageReference Include="Hangfire.PostgreSql" Version="1.20.8" />
    
    <!-- Identity -->
    <PackageReference Include="Microsoft.Identity.Web" Version="2.16.0" />
    
    <!-- Object Mapping -->
    <PackageReference Include="Mapster" Version="7.4.0" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\Nexus.BCMS.Domain\Nexus.BCMS.Domain.csproj" />
    <ProjectReference Include="..\Nexus.BCMS.Application\Nexus.BCMS.Application.csproj" />
  </ItemGroup>
</Project>

<!-- Nexus.BCMS.API.csproj -->
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <!-- Web Framework -->
    <PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="10.0.0" />
    <PackageReference Include="Scalar.AspNetCore" Version="1.0.4" />
    
    <!-- CQRS -->
    <PackageReference Include="MediatR" Version="12.2.0" />
    
    <!-- Validation -->
    <PackageReference Include="FluentValidation.AspNetCore" Version="11.9.0" />
    
    <!-- Authentication -->
    <PackageReference Include="Microsoft.Identity.Web" Version="2.16.0" />
    <PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="10.0.0" />
    
    <!-- Health Checks -->
    <PackageReference Include="AspNetCore.HealthChecks.UI.Client" Version="8.0.0" />
    <PackageReference Include="AspNetCore.HealthChecks.NpgSql" Version="8.0.0" />
    <PackageReference Include="AspNetCore.HealthChecks.Redis" Version="8.0.0" />
    <PackageReference Include="AspNetCore.HealthChecks.RabbitMQ" Version="8.0.0" />
    
    <!-- Logging -->
    <PackageReference Include="Serilog.AspNetCore" Version="8.0.0" />
    <PackageReference Include="Serilog.Sinks.Console" Version="5.0.0" />
    <PackageReference Include="Serilog.Sinks.File" Version="5.0.0" />
    <PackageReference Include="Serilog.Sinks.Seq" Version="7.0.0" />
    <PackageReference Include="Serilog.Enrichers.Environment" Version="2.3.0" />
    
    <!-- Monitoring -->
    <PackageReference Include="OpenTelemetry.Exporter.Console" Version="1.7.0" />
    <PackageReference Include="OpenTelemetry.Exporter.Prometheus.AspNetCore" Version="1.7.0-rc.1" />
    <PackageReference Include="OpenTelemetry.Extensions.Hosting" Version="1.7.0" />
    <PackageReference Include="OpenTelemetry.Instrumentation.AspNetCore" Version="1.7.0" />
    <PackageReference Include="OpenTelemetry.Instrumentation.Http" Version="1.7.0" />
    
    <!-- Rate Limiting -->
    <PackageReference Include="AspNetCoreRateLimit" Version="5.0.0" />
    
    <!-- CORS -->
    <PackageReference Include="Microsoft.AspNetCore.Cors" Version="2.2.0" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\Nexus.BCMS.Application\Nexus.BCMS.Application.csproj" />
    <ProjectReference Include="..\Nexus.BCMS.Infrastructure\Nexus.BCMS.Infrastructure.csproj" />
  </ItemGroup>
</Project>

<!-- Test Projects -->
<!-- Nexus.BCMS.Domain.Tests.csproj -->
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <IsPackable>false</IsPackable>
    <IsTestProject>true</IsTestProject>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="xunit" Version="2.6.4" />
    <PackageReference Include="xunit.runner.visualstudio" Version="2.5.6" />
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.9.0" />
    <PackageReference Include="FluentAssertions" Version="7.0.0" />
    <PackageReference Include="NSubstitute" Version="5.1.0" />
    <PackageReference Include="Bogus" Version="35.3.0" />
    <PackageReference Include="Coverlet.Collector" Version="6.0.0" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\..\src\Nexus.BCMS.Domain\Nexus.BCMS.Domain.csproj" />
  </ItemGroup>
</Project>

<!-- Nexus.BCMS.Infrastructure.Tests.csproj -->
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <IsPackable>false</IsPackable>
    <IsTestProject>true</IsTestProject>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="xunit" Version="2.6.4" />
    <PackageReference Include="xunit.runner.visualstudio" Version="2.5.6" />
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.9.0" />
    <PackageReference Include="FluentAssertions" Version="7.0.0" />
    <PackageReference Include="NSubstitute" Version="5.1.0" />
    <PackageReference Include="Testcontainers" Version="3.7.0" />
    <PackageReference Include="Testcontainers.PostgreSql" Version="3.7.0" />
    <PackageReference Include="Respawn" Version="6.1.0" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\..\src\Nexus.BCMS.Infrastructure\Nexus.BCMS.Infrastructure.csproj" />
  </ItemGroup>
</Project>
```

---

## 5. Test-Driven Development Strategy

### 5.1 TDD Principles & Workflow

**Red-Green-Refactor Cycle:**
```
1. RED:    Write a failing test that defines desired behavior
2. GREEN:  Write minimal code to make the test pass
3. REFACTOR: Improve code quality while keeping tests green
4. REPEAT: Next feature/requirement
```

**Test Pyramid Strategy:**
```
        /\
       /  \
      / E2E \ ←── 10% (Critical workflows - 50 tests)
     /------\
    /  Inte- \
   / gration \ ←── 20% (API endpoints, DB - 100 tests)
  /------------\
 /    Unit      \
/    Tests       \ ←── 70% (Business logic - 350 tests)
------------------
Total: ~500 automated tests
```

### 5.2 Unit Testing Standards

**Example: Domain Entity Tests**
```csharp
// tests/Nexus.BCMS.Domain.Tests/Entities/ProcessTests.cs
public class ProcessTests
{
    private readonly ProcessTestBuilder _builder = new();
    
    [Fact]
    public void CreateProcess_WithValidData_ShouldSucceed()
    {
        // Arrange
        var organizationId = Guid.NewGuid();
        var name = "Customer Transaction Processing";
        var criticalityTier = CriticalityTier.Tier1;
        
        // Act
        var process = Process.Create(organizationId, name, criticalityTier);
        
        // Assert
        process.Should().NotBeNull();
        process.OrganizationId.Should().Be(organizationId);
        process.Name.Should().Be(name);
        process.CriticalityTier.Should().Be(criticalityTier);
        process.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<ProcessCreatedEvent>();
    }
    
    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void CreateProcess_WithInvalidName_ShouldThrowException(string invalidName)
    {
        // Arrange
        var organizationId = Guid.NewGuid();
        var criticalityTier = CriticalityTier.Tier1;
        
        // Act & Assert
        var act = () => Process.Create(organizationId, invalidName, criticalityTier);
        act.Should().Throw<ArgumentException>()
            .WithMessage("*name*");
    }
    
    [Fact]
    public void UpdateCriticality_WhenChanged_ShouldRaiseDomainEvent()
    {
        // Arrange
        var process = _builder.Build();
        var newCriticality = CriticalityTier.Tier2;
        
        // Act
        process.UpdateCriticality(newCriticality);
        
        // Assert
        process.CriticalityTier.Should().Be(newCriticality);
        process.DomainEvents.Should().Contain(e => 
            e is ProcessCriticalityChangedEvent evt 
            && evt.ProcessId == process.Id
            && evt.NewCriticality == newCriticality);
    }
    
    [Fact]
    public void UpdateCriticality_WhenSameValue_ShouldNotRaiseDomainEvent()
    {
        // Arrange
        var process = _builder.WithCriticality(CriticalityTier.Tier1).Build();
        var eventCountBefore = process.DomainEvents.Count;
        
        // Act
        process.UpdateCriticality(CriticalityTier.Tier1);
        
        // Assert
        process.DomainEvents.Should().HaveCount(eventCountBefore);
    }
    
    [Theory]
    [InlineData("New Name")]
    [InlineData("Updated Process Name")]
    public void UpdateName_WithValidName_ShouldUpdateSuccessfully(string newName)
    {
        // Arrange
        var process = _builder.Build();
        var oldUpdatedAt = process.UpdatedAt;
        
        // Act
        process.UpdateName(newName);
        
        // Assert
        process.Name.Should().Be(newName);
        process.UpdatedAt.Should().BeAfter(oldUpdatedAt);
    }
}

// Test Builder Pattern
public class ProcessTestBuilder
{
    private Guid _organizationId = Guid.NewGuid();
    private string _name = "Test Process";
    private CriticalityTier _criticalityTier = CriticalityTier.Tier2;
    private string _description = "Test description";
    
    public ProcessTestBuilder WithOrganization(Guid organizationId)
    {
        _organizationId = organizationId;
        return this;
    }
    
    public ProcessTestBuilder WithName(string name)
    {
        _name = name;
        return this;
    }
    
    public ProcessTestBuilder WithCriticality(CriticalityTier tier)
    {
        _criticalityTier = tier;
        return this;
    }
    
    public ProcessTestBuilder WithDescription(string description)
    {
        _description = description;
        return this;
    }
    
    public Process Build()
    {
        var process = Process.Create(_organizationId, _name, _criticalityTier);
        process.UpdateDescription(_description);
        return process;
    }
}

// src/Nexus.BCMS.Domain/Entities/Process.cs
public class Process : BaseEntity, ITenantEntity, IAggregateRoot
{
    public Guid OrganizationId { get; private set; }
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public CriticalityTier CriticalityTier { get; private set; }
    
    private readonly List<IDomainEvent> _domainEvents = new();
    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();
    
    // Navigation properties
    public ImpactAssessment? ImpactAssessment { get; private set; }
    public RecoveryObjective? RecoveryObjective { get; private set; }
    
    // Private constructor for Dapper
    private Process() { }
    
    public static Process Create(
        Guid organizationId, 
        string name, 
        CriticalityTier criticalityTier)
    {
        Guard.Against.Default(organizationId, nameof(organizationId));
        Guard.Against.NullOrWhiteSpace(name, nameof(name));
        
        var process = new Process
        {
            Id = Guid.NewGuid(),
            OrganizationId = organizationId,
            Name = name,
            CriticalityTier = criticalityTier,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        
        process.AddDomainEvent(new ProcessCreatedEvent(process.Id, name));
        
        return process;
    }
    
    public void UpdateCriticality(CriticalityTier newCriticality)
    {
        if (CriticalityTier == newCriticality)
            return;
            
        var oldCriticality = CriticalityTier;
        CriticalityTier = newCriticality;
        UpdatedAt = DateTime.UtcNow;
        
        AddDomainEvent(new ProcessCriticalityChangedEvent(
            Id, 
            oldCriticality, 
            newCriticality));
    }
    
    public void UpdateName(string newName)
    {
        Guard.Against.NullOrWhiteSpace(newName, nameof(newName));
        
        Name = newName;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void UpdateDescription(string? description)
    {
        Description = description;
        UpdatedAt = DateTime.UtcNow;
    }
    
    private void AddDomainEvent(IDomainEvent domainEvent)
    {
        _domainEvents.Add(domainEvent);
    }
    
    public void ClearDomainEvents()
    {
        _domainEvents.Clear();
    }
}
```

### 5.3 Repository Testing with Dapper

**Example: Repository Integration Tests**
```csharp
// tests/Nexus.BCMS.Infrastructure.Tests/Repositories/ProcessRepositoryTests.cs
public class ProcessRepositoryTests : IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgresContainer;
    private NpgsqlConnection _connection;
    private ProcessRepository _repository;
    private Guid _testTenantId;
    
    public ProcessRepositoryTests()
    {
        _postgresContainer = new PostgreSqlBuilder()
            .WithImage("postgres:16")
            .WithDatabase("nexus_bcms_test")
            .WithUsername("postgres")
            .WithPassword("postgres")
            .Build();
    }
    
    public async Task InitializeAsync()
    {
        await _postgresContainer.StartAsync();
        
        _connection = new NpgsqlConnection(_postgresContainer.GetConnectionString());
        await _connection.OpenAsync();
        
        // Run migrations
        await RunMigrationsAsync();
        
        _testTenantId = Guid.NewGuid();
        var tenantService = Substitute.For<ITenantService>();
        tenantService.GetCurrentTenantId().Returns(_testTenantId);
        
        var connectionFactory = Substitute.For<IDbConnectionFactory>();
        connectionFactory.CreateConnectionAsync()
            .Returns(Task.FromResult<IDbConnection>(_connection));
        
        _repository = new ProcessRepository(
            connectionFactory, 
            tenantService,
            NullLogger<ProcessRepository>.Instance);
        
        // Seed test organization
        await SeedTestOrganizationAsync();
    }
    
    [Fact]
    public async Task GetByIdAsync_ExistingProcess_ShouldReturnProcess()
    {
        // Arrange
        var processId = await SeedTestProcessAsync("Test Process", "Tier1");
        
        // Act
        var result = await _repository.GetByIdAsync(processId);
        
        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(processId);
        result.Name.Should().Be("Test Process");
        result.CriticalityTier.Should().Be(CriticalityTier.Tier1);
        result.OrganizationId.Should().Be(_testTenantId);
    }
    
    [Fact]
    public async Task GetByIdAsync_NonExistentProcess_ShouldReturnNull()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();
        
        // Act
        var result = await _repository.GetByIdAsync(nonExistentId);
        
        // Assert
        result.Should().BeNull();
    }
    
    [Fact]
    public async Task GetByCriticalityAsync_ShouldReturnOnlyMatchingProcesses()
    {
        // Arrange
        await SeedTestProcessAsync("Critical Process 1", "Tier1");
        await SeedTestProcessAsync("Critical Process 2", "Tier1");
        await SeedTestProcessAsync("Non-Critical Process", "Tier3");
        
        // Act
        var result = await _repository.GetByCriticalityAsync(CriticalityTier.Tier1);
        
        // Assert
        result.Should().HaveCount(2);
        result.Should().OnlyContain(p => p.CriticalityTier == CriticalityTier.Tier1);
        result.Should().Contain(p => p.Name == "Critical Process 1");
        result.Should().Contain(p => p.Name == "Critical Process 2");
    }
    
    [Fact]
    public async Task AddAsync_ValidProcess_ShouldPersistToDatabase()
    {
        // Arrange
        var process = Process.Create(_testTenantId, "New Process", CriticalityTier.Tier2);
        process.UpdateDescription("Test description");
        
        // Act
        var processId = await _repository.AddAsync(process);
        
        // Assert
        processId.Should().Be(process.Id);
        
        // Verify persistence
        var persisted = await _connection.QuerySingleOrDefaultAsync<dynamic>(
            "SELECT * FROM processes WHERE id = @Id",
            new { Id = process.Id });
        
        persisted.Should().NotBeNull();
        ((string)persisted.name).Should().Be("New Process");
        ((string)persisted.criticality_tier).Should().Be("Tier2");
        ((string)persisted.description).Should().Be("Test description");
    }
    
    [Fact]
    public async Task UpdateAsync_ExistingProcess_ShouldUpdateDatabase()
    {
        // Arrange
        var processId = await SeedTestProcessAsync("Original Name", "Tier1");
        var process = await _repository.GetByIdAsync(processId);
        process!.UpdateName("Updated Name");
        process.UpdateCriticality(CriticalityTier.Tier2);
        
        // Act
        await _repository.UpdateAsync(process);
        
        // Assert
        var updated = await _connection.QuerySingleOrDefaultAsync<dynamic>(
            "SELECT * FROM processes WHERE id = @Id",
            new { Id = processId });
        
        ((string)updated.name).Should().Be("Updated Name");
        ((string)updated.criticality_tier).Should().Be("Tier2");
    }
    
    [Fact]
    public async Task DeleteAsync_ExistingProcess_ShouldRemoveFromDatabase()
    {
        // Arrange
        var processId = await SeedTestProcessAsync("To Delete", "Tier2");
        
        // Act
        await _repository.DeleteAsync(processId);
        
        // Assert
        var exists = await _connection.ExecuteScalarAsync<bool>(
            "SELECT EXISTS(SELECT 1 FROM processes WHERE id = @Id)",
            new { Id = processId });
        
        exists.Should().BeFalse();
    }
    
    [Fact]
    public async Task Repository_ShouldEnforceTenantIsolation()
    {
        // Arrange - Create processes for different tenants
        var otherTenantId = Guid.NewGuid();
        await SeedTestOrganizationAsync(otherTenantId);
        
        await _connection.ExecuteAsync(
            @"INSERT INTO processes (id, organization_id, name, criticality_tier, created_at, updated_at)
              VALUES (@Id, @OrgId, @Name, @Tier, @CreatedAt, @UpdatedAt)",
            new
            {
                Id = Guid.NewGuid(),
                OrgId = otherTenantId,
                Name = "Other Tenant Process",
                Tier = "Tier1",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        
        await SeedTestProcessAsync("My Tenant Process", "Tier1");
        
        // Act - Query all processes (should only return current tenant's)
        var processes = await _repository.GetAllAsync();
        
        // Assert
        processes.Should().HaveCount(1);
        processes.Should().OnlyContain(p => p.OrganizationId == _testTenantId);
        processes.Should().NotContain(p => p.OrganizationId == otherTenantId);
    }
    
    [Fact]
    public async Task GetWithAssessmentsAsync_ShouldLoadRelatedData()
    {
        // Arrange
        var processId = await SeedTestProcessAsync("Process With Assessment", "Tier1");
        
        // Add impact assessment
        await _connection.ExecuteAsync(
            @"INSERT INTO impact_assessments (
                id, process_id, organization_id, financial_impact, 
                reputational_impact, regulatory_impact, operational_impact, 
                customer_impact, assessment_date, created_at, updated_at
              )
              VALUES (
                @Id, @ProcessId, @OrgId, @FinancialImpact::jsonb, 
                @RepImpact, @RegImpact, @OpImpact, 
                @CustImpact, @AssessDate, @CreatedAt, @UpdatedAt
              )",
            new
            {
                Id = Guid.NewGuid(),
                ProcessId = processId,
                OrgId = _testTenantId,
                FinancialImpact = "{\"hour_1\": 10000, \"hour_4\": 50000}",
                RepImpact = 4,
                RegImpact = 5,
                OpImpact = 3,
                CustImpact = 4,
                AssessDate = DateTime.UtcNow.Date,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        
        // Act
        var result = await _repository.GetWithAssessmentsAsync(processId);
        
        // Assert
        result.Should().NotBeNull();
        result!.Process.Should().NotBeNull();
        result.ImpactAssessment.Should().NotBeNull();
        result.ImpactAssessment!.ReputationalImpact.Should().Be(4);
    }
    
    private async Task RunMigrationsAsync()
    {
        var migrationRunner = new MigrationRunner(_connection.ConnectionString);
        var result = migrationRunner.RunMigrations();
        
        if (!result.Successful)
        {
            throw new Exception("Migration failed", result.Error);
        }
    }
    
    private async Task SeedTestOrganizationAsync(Guid? orgId = null)
    {
        var organizationId = orgId ?? _testTenantId;
        
        await _connection.ExecuteAsync(
            @"INSERT INTO organizations (id, name, subscription_tier, created_at)
              VALUES (@Id, @Name, @Tier, @CreatedAt)
              ON CONFLICT (id) DO NOTHING",
            new
            {
                Id = organizationId,
                Name = $"Test Organization {organizationId}",
                Tier = "Professional",
                CreatedAt = DateTime.UtcNow
            });
    }
    
    private async Task<Guid> SeedTestProcessAsync(string name, string tier)
    {
        var id = Guid.NewGuid();
        
        await _connection.ExecuteAsync(
            @"INSERT INTO processes (id, organization_id, name, criticality_tier, created_at, updated_at)
              VALUES (@Id, @OrgId, @Name, @Tier, @CreatedAt, @UpdatedAt)",
            new
            {
                Id = id,
                OrgId = _testTenantId,
                Name = name,
                Tier = tier,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        
        return id;
    }
    
    public async Task DisposeAsync()
    {
        await _connection.CloseAsync();
        _connection.Dispose();
        await _postgresContainer.DisposeAsync();
    }
}
```

### 5.4 Application Layer Testing (CQRS)

**Example: Command Handler Tests**
```csharp
// tests/Nexus.BCMS.Application.Tests/Commands/CreateProcessCommandHandlerTests.cs
public class CreateProcessCommandHandlerTests : IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgresContainer;
    private NpgsqlConnection _connection;
    private CreateProcessCommandHandler _handler;
    private IProcessRepository _repository;
    private IMediator _mediator;
    private Guid _testTenantId;
    
    public CreateProcessCommandHandlerTests()
    {
        _postgresContainer = new PostgreSqlBuilder()
            .WithImage("postgres:16")
            .Build();
    }
    
    public async Task InitializeAsync()
    {
        await _postgresContainer.StartAsync();
        
        _connection = new NpgsqlConnection(_postgresContainer.GetConnectionString());
        await _connection.OpenAsync();
        
        await RunMigrationsAsync();
        
        _testTenantId = Guid.NewGuid();
        await SeedTestOrganizationAsync();
        
        var tenantService = Substitute.For<ITenantService>();
        tenantService.GetCurrentTenantId().Returns(_testTenantId);
        
        var connectionFactory = Substitute.For<IDbConnectionFactory>();
        connectionFactory.CreateConnectionAsync()
            .Returns(_connection);
        
        _repository = new ProcessRepository(
            connectionFactory, 
            tenantService,
            NullLogger<ProcessRepository>.Instance);
        
        _mediator = Substitute.For<IMediator>();
        
        _handler = new CreateProcessCommandHandler(
            _repository, 
            _mediator,
            NullLogger<CreateProcessCommandHandler>.Instance);
    }
    
    [Fact]
    public async Task Handle_ValidCommand_ShouldCreateProcess()
    {
        // Arrange
        var command = new CreateProcessCommand
        {
            OrganizationId = _testTenantId,
            Name = "Payment Processing",
            Description = "Core payment system",
            CriticalityTier = "Tier1"
        };
        
        // Act
        var result = await _handler.Handle(command, CancellationToken.None);
        
        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Id.Should().NotBeEmpty();
        result.Data.Name.Should().Be("Payment Processing");
        
        // Verify database persistence
        var savedProcess = await _connection.QuerySingleOrDefaultAsync<dynamic>(
            "SELECT * FROM processes WHERE id = @Id",
            new { Id = result.Data.Id });
        
        savedProcess.Should().NotBeNull();
        ((string)savedProcess.name).Should().Be("Payment Processing");
        
        // Verify domain event published
        await _mediator.Received(1)
            .Publish(Arg.Any<ProcessCreatedEvent>(), Arg.Any<CancellationToken>());
    }
    
    [Fact]
    public async Task Handle_DuplicateName_ShouldReturnFailure()
    {
        // Arrange
        await SeedExistingProcessAsync(_testTenantId, "Payment Processing");
        
        var command = new CreateProcessCommand
        {
            OrganizationId = _testTenantId,
            Name = "Payment Processing",
            CriticalityTier = "Tier1"
        };
        
        // Act
        var result = await _handler.Handle(command, CancellationToken.None);
        
        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Errors.Should().Contain(e => 
            e.Contains("already exists", StringComparison.OrdinalIgnoreCase));
    }
    
    [Fact]
    public async Task Handle_ShouldEnforceTenantIsolation()
    {
        // Arrange
        var tenantA = Guid.NewGuid();
        var tenantB = Guid.NewGuid();
        
        await SeedTestOrganizationAsync(tenantA);
        await SeedTestOrganizationAsync(tenantB);
        await SeedExistingProcessAsync(tenantA, "Payment Processing");
        
        var command = new CreateProcessCommand
        {
            OrganizationId = tenantB,
            Name = "Payment Processing", // Same name, different tenant
            CriticalityTier = "Tier1"
        };
        
        // Act
        var result = await _handler.Handle(command, CancellationToken.None);
        
        // Assert
        result.IsSuccess.Should().BeTrue(); // Should succeed due to tenant isolation
    }
    
    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task Handle_InvalidName_ShouldReturnValidationError(string invalidName)
    {
        // Arrange
        var command = new CreateProcessCommand
        {
            OrganizationId = _testTenantId,
            Name = invalidName,
            CriticalityTier = "Tier1"
        };
        
        var validator = new CreateProcessCommandValidator();
        
        // Act
        var validationResult = await validator.ValidateAsync(command);
        
        // Assert
        validationResult.IsValid.Should().BeFalse();
        validationResult.Errors.Should().Contain(e => 
            e.PropertyName == nameof(command.Name));
    }
    
    public async Task DisposeAsync()
    {
        await _connection.CloseAsync();
        _connection.Dispose();
        await _postgresContainer.DisposeAsync();
    }
}

// src/Nexus.BCMS.Application/Commands/CreateProcess/CreateProcessCommandHandler.cs
public class CreateProcessCommandHandler 
    : IRequestHandler<CreateProcessCommand, Result<ProcessDto>>
{
    private readonly IProcessRepository _repository;
    private readonly IMediator _mediator;
    private readonly ILogger<CreateProcessCommandHandler> _logger;
    
    public CreateProcessCommandHandler(
        IProcessRepository repository,
        IMediator mediator,
        ILogger<CreateProcessCommandHandler> logger)
    {
        _repository = repository;
        _mediator = mediator;
        _logger = logger;
    }
    
    public async Task<Result<ProcessDto>> Handle(
        CreateProcessCommand request, 
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Creating process {ProcessName} for organization {OrganizationId}",
            request.Name,
            request.OrganizationId);
        
        // Check for duplicate name within tenant
        var exists = await _repository.ExistsByNameAsync(
            request.OrganizationId,
            request.Name,
            cancellationToken);
            
        if (exists)
        {
            _logger.LogWarning(
                "Process with name {ProcessName} already exists for organization {OrganizationId}",
                request.Name,
                request.OrganizationId);
            
            return Result<ProcessDto>.Failure(
                $"Process with name '{request.Name}' already exists");
        }
        
        // Create domain entity
        var criticalityTier = Enum.Parse<CriticalityTier>(request.CriticalityTier);
        var process = Process.Create(
            request.OrganizationId,
            request.Name,
            criticalityTier);
            
        if (!string.IsNullOrWhiteSpace(request.Description))
        {
            process.UpdateDescription(request.Description);
        }
        
        // Persist
        await _repository.AddAsync(process, cancellationToken);
        
        _logger.LogInformation(
            "Process {ProcessId} created successfully",
            process.Id);
        
        // Publish domain events
        foreach (var domainEvent in process.DomainEvents)
        {
            await _mediator.Publish(domainEvent, cancellationToken);
        }
        
        // Map to DTO
        var dto = process.Adapt<ProcessDto>();
        
        return Result<ProcessDto>.Success(dto);
    }
}

// Validator
public class CreateProcessCommandValidator : AbstractValidator<CreateProcessCommand>
{
    public CreateProcessCommandValidator()
    {
        RuleFor(x => x.OrganizationId)
            .NotEmpty()
            .WithMessage("Organization ID is required");
        
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Process name is required")
            .MaximumLength(255)
            .WithMessage("Process name must not exceed 255 characters");
        
        RuleFor(x => x.CriticalityTier)
            .NotEmpty()
            .WithMessage("Criticality tier is required")
            .Must(tier => Enum.TryParse<CriticalityTier>(tier, out _))
            .WithMessage("Invalid criticality tier. Must be Tier1, Tier2, Tier3, or Tier4");
        
        RuleFor(x => x.Description)
            .MaximumLength(2000)
            .When(x => !string.IsNullOrWhiteSpace(x.Description))
            .WithMessage("Description must not exceed 2000 characters");
    }
}

// Result pattern
public class Result<T>
{
    public bool IsSuccess { get; private set; }
    public T? Data { get; private set; }
    public List<string> Errors { get; private set; } = new();
    
    public static Result<T> Success(T data)
    {
        return new Result<T>
        {
            IsSuccess = true,
            Data = data
        };
    }
    
    public static Result<T> Failure(params string[] errors)
    {
        return new Result<T>
        {
            IsSuccess = false,
            Errors = errors.ToList()
        };
    }
}
```

### 5.5 API Integration Testing
```csharp
// tests/Nexus.BCMS.API.Tests/Integration/ProcessEndpointsTests.cs
public class ProcessEndpointsTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;
    private readonly PostgreSqlContainer _postgresContainer;
    private readonly NpgsqlConnection _connection;
    
    public ProcessEndpointsTests(WebApplicationFactory<Program> factory)
    {
        _postgresContainer = new PostgreSqlBuilder()
            .WithImage("postgres:16")
            .Build();
        
        _postgresContainer.StartAsync().Wait();
        
        _connection = new NpgsqlConnection(_postgresContainer.GetConnectionString());
        _connection.Open();
        
        _client = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // Replace database with test container
                services.AddSingleton<IDbConnectionFactory>(sp =>
                    new DbConnectionFactory(_postgresContainer.GetConnectionString()));
            });
        }).CreateClient();
    }
    
    [Fact]
    public async Task POST_Process_WithValidData_Returns201Created()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        await SeedTestOrganization(tenantId);
        
        var request = new CreateProcessRequest
        {
            Name = "Order Fulfillment",
            Description = "E-commerce order processing",
            CriticalityTier = "Tier1"
        };
        
        _client.DefaultRequestHeaders.Add("X-Tenant-Id", tenantId.ToString());
        _client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", GenerateTestJWT(tenantId));
        
        // Act
        var response = await _client.PostAsJsonAsync(
            $"/api/v1/organizations/{tenantId}/processes", 
            request);
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        
        var createdProcess = await response.Content
            .ReadFromJsonAsync<ProcessDto>();
        createdProcess.Should().NotBeNull();
        createdProcess!.Name.Should().Be(request.Name);
        
        // Verify Location header
        response.Headers.Location.Should().NotBeNull();
        response.Headers.Location!.ToString()
            .Should().Contain($"/api/v1/organizations/{tenantId}/processes/{createdProcess.Id}");
        
        // Verify database persistence
        var dbProcess = await _connection.QuerySingleOrDefaultAsync<dynamic>(
            "SELECT * FROM processes WHERE id = @Id",
            new { Id = createdProcess.Id });
        dbProcess.Should().NotBeNull();
    }
    
    [Fact]
    public async Task GET_Processes_ShouldEnforceTenantIsolation()
    {
        // Arrange
        var tenantA = Guid.NewGuid();
        var tenantB = Guid.NewGuid();
        
        await SeedTestOrganization(tenantA);
        await SeedTestOrganization(tenantB);
        await SeedProcess(tenantA, "TenantA Process");
        await SeedProcess(tenantB, "TenantB Process");
        
        _client.DefaultRequestHeaders.Clear();
        _client.DefaultRequestHeaders.Add("X-Tenant-Id", tenantA.ToString());
        _client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", GenerateTestJWT(tenantA));
        
        // Act
        var response = await _client.GetAsync(
            $"/api/v1/organizations/{tenantA}/processes");
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var processes = await response.Content
            .ReadFromJsonAsync<List<ProcessDto>>();
        processes.Should().HaveCount(1);
        processes![0].Name.Should().Be("TenantA Process");
    }
    
    [Fact]
    public async Task POST_Process_WithoutAuthentication_Returns401()
    {
        // Arrange
        var request = new CreateProcessRequest
        {
            Name = "Test Process",
            CriticalityTier = "Tier1"
        };
        
        // Act (no auth header)
        var response = await _client.PostAsJsonAsync(
            "/api/v1/organizations/00000000-0000-0000-0000-000000000000/processes",
            request);
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
    
    [Fact]
    public async Task GET_Process_ById_ReturnsCorrectProcess()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        await SeedTestOrganization(tenantId);
        var processId = await SeedProcess(tenantId, "Test Process");
        
        _client.DefaultRequestHeaders.Add("X-Tenant-Id", tenantId.ToString());
        _client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", GenerateTestJWT(tenantId));
        
        // Act
        var response = await _client.GetAsync(
            $"/api/v1/organizations/{tenantId}/processes/{processId}");
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var process = await response.Content.ReadFromJsonAsync<ProcessDto>();
        process.Should().NotBeNull();
        process!.Id.Should().Be(processId);
        process.Name.Should().Be("Test Process");
    }
    
    [Fact]
    public async Task PUT_Process_UpdatesSuccessfully()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        await SeedTestOrganization(tenantId);
        var processId = await SeedProcess(tenantId, "Original Name");
        
        var updateRequest = new UpdateProcessRequest
        {
            Name = "Updated Name",
            Description = "Updated description",
            CriticalityTier = "Tier2"
        };
        
        _client.DefaultRequestHeaders.Add("X-Tenant-Id", tenantId.ToString());
        _client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", GenerateTestJWT(tenantId));
        
        // Act
        var response = await _client.PutAsJsonAsync(
            $"/api/v1/organizations/{tenantId}/processes/{processId}",
            updateRequest);
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var updated = await response.Content.ReadFromJsonAsync<ProcessDto>();
        updated!.Name.Should().Be("Updated Name");
        updated.CriticalityTier.Should().Be("Tier2");
    }
    
    [Fact]
    public async Task DELETE_Process_RemovesSuccessfully()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        await SeedTestOrganization(tenantId);
        var processId = await SeedProcess(tenantId, "To Delete");
        
        _client.DefaultRequestHeaders.Add("X-Tenant-Id", tenantId.ToString());
        _client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", GenerateTestJWT(tenantId));
        
        // Act
        var response = await _client.DeleteAsync(
            $"/api/v1/organizations/{tenantId}/processes/{processId}");
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
        
        // Verify deletion
        var exists = await _connection.ExecuteScalarAsync<bool>(
            "SELECT EXISTS(SELECT 1 FROM processes WHERE id = @Id)",
            new { Id = processId });
        exists.Should().BeFalse();
    }
    
    private string GenerateTestJWT(Guid tenantId)
    {
        // Generate a simple test JWT (in production, use proper signing)
        var claims = new[]
        {
            new Claim("sub", Guid.NewGuid().ToString()),
            new Claim("tenant_id", tenantId.ToString()),
            new Claim("role", "BCManager")
        };
        
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("test-secret-key-at-least-32-characters-long"));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        
        var token = new JwtSecurityToken(
            issuer: "test",
            audience: "test",
            claims: claims,
            expires: DateTime.Now.AddHours(1),
            signingCredentials: creds
        );
        
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
```

### 5.6 Test Coverage Requirements

**Coverage Targets per Layer:**

| Layer | Target Coverage | Minimum Coverage | Critical Areas |
|-------|----------------|------------------|----------------|
| **Domain** | 100% | 95% | Entity logic, value objects, domain events, business rules |
| **Application** | 95% | 90% | Command/query handlers, validators, behaviors |
| **Infrastructure** | 85% | 75% | Repository implementations, SQL queries, migrations |
| **API** | 90% | 85% | Endpoints, middleware, filters, authentication |
| **Overall** | 95% | 90% | Project-wide requirement |

**CI/CD Coverage Enforcement:**
```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: nexus_bcms_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup .NET
      uses: actions/setup-dotnet@v4
      with:
        dotnet-version: '10.0.x'
    
    - name: Restore dependencies
      run: dotnet restore
    
    - name: Build
      run: dotnet build --no-restore --configuration Release
    
    - name: Run tests with coverage
      run: |
        dotnet test --no-build --configuration Release \
          --verbosity normal \
          /p:CollectCoverage=true \
          /p:CoverletOutputFormat=opencover \
          /p:CoverletOutput=./coverage/ \
          /p:Threshold=90 \
          /p:ThresholdType=line \
          /p:ThresholdStat=total
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        files: ./**/coverage.opencover.xml
        fail_ci_if_error: true
        flags: unittests
    
    - name: Generate coverage report
      run: |
        dotnet tool install -g dotnet-reportgenerator-globaltool
        reportgenerator \
          -reports:./**/coverage.opencover.xml \
          -targetdir:./coverage-report \
          -reporttypes:Html
    
    - name: Upload coverage report artifact
      uses: actions/upload-artifact@v3
      with:
        name: coverage-report
        path: ./coverage-report
```

---

## 6. Data Architecture & Entity Model

### 6.1 Complete Database Schema

**Core Entity Relationship Diagram:**
```
┌─────────────────┐
│ organizations   │
│ (Tenant Root)   │
└────────┬────────┘
         │
         │ 1:N
         │
    ┌────┴─────────────────────────────────────────┐
    │                                              │
┌───▼────────┐  1:1   ┌──────────────────┐       │
│ processes  │◄───────│impact_assessments│       │
└────┬───────┘        └──────────────────┘       │
     │                                            │
     │ 1:1                                        │
     │                ┌──────────────────┐        │
     └───────────────►│recovery_objectives│       │
                      └──────────────────┘        │
                                                  │
    ┌─────────────────────────────────────────────┘
    │
    │ 1:N
    │
┌───▼─────────────┐
│business_resources│
└───┬─────────────┘
    │
    │ N:N (self-referential)
    │
┌───▼──────────────┐
│resource_dependency│
└──────────────────┘
```

### 6.2 Database Migration Scripts

**001_CreateOrganizationsTable.sql:**
```sql
-- Organizations table (Tenant root entity)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) NOT NULL,
    subscription_tier VARCHAR(50) NOT NULL CHECK (subscription_tier IN ('Starter', 'Professional', 'Enterprise')),
    regulatory_scope JSONB,
    entity_classification VARCHAR(50) CHECK (entity_classification IN ('Essential', 'Important', 'Other')),
    encryption_key_id UUID NOT NULL,
    data_residency VARCHAR(2),
    industry VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    suspended_at TIMESTAMPTZ,
    suspension_reason TEXT,
    suspended_by UUID,
    metadata JSONB,
    
    CONSTRAINT unique_organization_name UNIQUE(name),
    CONSTRAINT unique_organization_subdomain UNIQUE(subdomain)
);

CREATE INDEX idx_organizations_name ON organizations(name);
CREATE INDEX idx_organizations_subdomain ON organizations(subdomain);
CREATE INDEX idx_organizations_created_at ON organizations(created_at DESC);
CREATE INDEX idx_organizations_subscription_tier ON organizations(subscription_tier);

COMMENT ON TABLE organizations IS 'Tenant root entity - each organization is a separate tenant';
COMMENT ON COLUMN organizations.regulatory_scope IS 'Array of applicable frameworks: ISO22301, DORA, NIS2';
COMMENT ON COLUMN organizations.entity_classification IS 'NIS2 classification: Essential or Important entity';
COMMENT ON COLUMN organizations.encryption_key_id IS 'Reference to tenant-specific encryption key in KMS';
```

**002_CreateProcessesTable.sql:**
```sql
CREATE TABLE IF NOT EXISTS processes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    process_owner_id UUID,
    criticality_tier VARCHAR(20) NOT NULL,
    regulatory_classification JSONB,
    annual_revenue_dependency DECIMAL(18, 2),
    customer_count INTEGER,
    regulatory_obligations TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_processes_organizations 
        FOREIGN KEY (organization_id) 
        REFERENCES organizations(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT unique_process_name_per_org 
        UNIQUE(organization_id, name),
    
    CONSTRAINT check_criticality_tier 
        CHECK (criticality_tier IN ('Tier1', 'Tier2', 'Tier3', 'Tier4'))
);

CREATE INDEX idx_processes_organization ON processes(organization_id);
CREATE INDEX idx_processes_criticality ON processes(criticality_tier);
CREATE INDEX idx_processes_name ON processes(organization_id, name);
CREATE INDEX idx_processes_updated_at ON processes(updated_at DESC);

-- Full-text search
ALTER TABLE processes ADD COLUMN search_vector tsvector 
    GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
    ) STORED;

CREATE INDEX idx_processes_search_vector ON processes USING GIN(search_vector);

-- Enable Row-Level Security
ALTER TABLE processes ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_processes ON processes
    USING (organization_id = current_setting('app.current_tenant', true)::uuid);

COMMENT ON TABLE processes IS 'Business processes subject to BIA and continuity planning';
COMMENT ON COLUMN processes.criticality_tier IS 'Tier1 (Mission Critical) to Tier4 (Non-Critical)';
COMMENT ON COLUMN processes.regulatory_classification IS 'JSONB: {DORAICTService: bool, NIS2Essential: bool}';
```

**003_CreateImpactAssessmentsTable.sql:**
```sql
CREATE TABLE IF NOT EXISTS impact_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    process_id UUID NOT NULL,
    organization_id UUID NOT NULL,
    
    -- Financial impact (JSONB with time-based breakdown)
    financial_impact JSONB NOT NULL,
    
    -- Multi-dimensional impact scores (0-5 scale)
    reputational_impact INTEGER NOT NULL,
    regulatory_impact INTEGER NOT NULL,
    operational_impact INTEGER NOT NULL,
    customer_impact INTEGER NOT NULL,
    
    -- Calculated scores
    weighted_score DECIMAL(5, 2),
    
    -- Assessment metadata
    assessment_date DATE NOT NULL,
    assessor_id UUID,
    next_review_date DATE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_impact_assessments_processes 
        FOREIGN KEY (process_id) 
        REFERENCES processes(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_impact_assessments_organizations 
        FOREIGN KEY (organization_id) 
        REFERENCES organizations(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT unique_assessment_per_process 
        UNIQUE(process_id),
    
    CONSTRAINT check_impact_scores 
        CHECK (
            reputational_impact BETWEEN 0 AND 5 AND
            regulatory_impact BETWEEN 0 AND 5 AND
            operational_impact BETWEEN 0 AND 5 AND
            customer_impact BETWEEN 0 AND 5
        )
);

CREATE INDEX idx_impact_assessments_organization ON impact_assessments(organization_id);
CREATE INDEX idx_impact_assessments_process ON impact_assessments(process_id);
CREATE INDEX idx_impact_assessments_weighted_score ON impact_assessments(weighted_score DESC);
CREATE INDEX idx_impact_assessments_assessment_date ON impact_assessments(assessment_date DESC);

ALTER TABLE impact_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_impact_assessments ON impact_assessments
    USING (organization_id = current_setting('app.current_tenant', true)::uuid);

COMMENT ON TABLE impact_assessments IS 'Business Impact Analysis results for processes';
COMMENT ON COLUMN impact_assessments.financial_impact IS 'JSONB: {hour_1: 10000, hour_4: 50000, ...}';
COMMENT ON COLUMN impact_assessments.weighted_score IS 'Calculated composite score using weighted formula';
```

**004_CreateRecoveryObjectivesTable.sql:**
```sql
CREATE TABLE IF NOT EXISTS recovery_objectives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    process_id UUID NOT NULL,
    organization_id UUID NOT NULL,
    
    -- Recovery objectives (in hours for consistency)
    rto_hours DECIMAL(10, 2) NOT NULL,
    rpo_hours DECIMAL(10, 2) NOT NULL,
    mtpd_hours DECIMAL(10, 2) NOT NULL,
    
    -- Additional DORA requirements
    mro_value DECIMAL(18, 2),  -- Minimum Recovery Objective (data volume)
    wrt_hours DECIMAL(10, 2),  -- Work Recovery Time
    
    -- Justification and approval
    justification TEXT,
    approved_by UUID,
    approval_date DATE,
    
    -- Compliance flags
    dora_compliance_validated BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_recovery_objectives_processes 
        FOREIGN KEY (process_id) 
        REFERENCES processes(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_recovery_objectives_organizations 
        FOREIGN KEY (organization_id) 
        REFERENCES organizations(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT unique_recovery_objective_per_process 
        UNIQUE(process_id),
    
    CONSTRAINT check_rto_less_than_mtpd 
        CHECK (rto_hours <= mtpd_hours),
    
    CONSTRAINT check_positive_values 
        CHECK (
            rto_hours >= 0 AND 
            rpo_hours >= 0 AND 
            mtpd_hours > 0
        )
);

CREATE INDEX idx_recovery_objectives_organization ON recovery_objectives(organization_id);
CREATE INDEX idx_recovery_objectives_process ON recovery_objectives(process_id);
CREATE INDEX idx_recovery_objectives_rto ON recovery_objectives(rto_hours);
CREATE INDEX idx_recovery_objectives_compliance ON recovery_objectives(dora_compliance_validated) WHERE dora_compliance_validated = true;

ALTER TABLE recovery_objectives ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_recovery_objectives ON recovery_objectives
    USING (organization_id = current_setting('app.current_tenant', true)::uuid);

COMMENT ON TABLE recovery_objectives IS 'RTO/RPO/MTPD targets per process (DORA Art. 14 compliance)';
COMMENT ON COLUMN recovery_objectives.rto_hours IS 'Recovery Time Objective - max acceptable downtime';
COMMENT ON COLUMN recovery_objectives.rpo_hours IS 'Recovery Point Objective - max acceptable data loss';
COMMENT ON COLUMN recovery_objectives.mtpd_hours IS 'Maximum Tolerable Period of Disruption';
```

**005_CreateBusinessResourcesTable.sql:**
```sql
CREATE TABLE IF NOT EXISTS business_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    criticality VARCHAR(20) NOT NULL,
    
    -- Vendor/supplier information
    vendor_id UUID,
    vendor_name VARCHAR(255),
    sla_availability DECIMAL(5, 2),
    
    -- Geographic and compliance attributes
    geo_location VARCHAR(2),
    dora_third_party BOOLEAN DEFAULT FALSE,
    nis2_supply_chain_critical BOOLEAN DEFAULT FALSE,
    
    -- Security attributes
    encryption_enabled BOOLEAN DEFAULT FALSE,
    redundancy_configured BOOLEAN DEFAULT FALSE,
    last_tested DATE,
    
    -- Flexible metadata
    metadata JSONB,
    
    -- Ownership
    owner_id UUID,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_business_resources_organizations 
        FOREIGN KEY (organization_id) 
        REFERENCES organizations(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT check_resource_type 
        CHECK (resource_type IN (
            'ICT_SYSTEM', 'APPLICATION', 'DATABASE', 
            'NETWORK_INFRASTRUCTURE', 'CRITICAL_VENDOR', 
            'CLOUD_SERVICE', 'KEY_PERSONNEL', 'FACILITY', 
            'DATA_CENTER', 'TELECOM_SERVICE'
        )),
    
    CONSTRAINT check_criticality 
        CHECK (criticality IN ('Critical', 'High', 'Medium', 'Low'))
);

CREATE INDEX idx_business_resources_organization ON business_resources(organization_id);
CREATE INDEX idx_business_resources_type ON business_resources(resource_type);
CREATE INDEX idx_business_resources_criticality ON business_resources(criticality);
CREATE INDEX idx_business_resources_vendor ON business_resources(vendor_id) WHERE vendor_id IS NOT NULL;
CREATE INDEX idx_business_resources_dora ON business_resources(dora_third_party) WHERE dora_third_party = true;

ALTER TABLE business_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_business_resources ON business_resources
    USING (organization_id = current_setting('app.current_tenant', true)::uuid);

COMMENT ON TABLE business_resources IS 'Assets, systems, people, and vendors supporting business processes';
COMMENT ON COLUMN business_resources.dora_third_party IS 'DORA Art. 28 - ICT third-party service provider';
COMMENT ON COLUMN business_resources.nis2_supply_chain_critical IS 'NIS2 Art. 21(2)(d) - Critical supply chain component';
```

**006_CreateResourceDependenciesTable.sql:**
```sql
CREATE TABLE IF NOT EXISTS resource_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    
    -- Source resource (dependent)
    source_resource_id UUID NOT NULL,
    
    -- Target resource (dependency)
    target_resource_id UUID NOT NULL,
    
    -- Dependency characteristics
    dependency_type VARCHAR(50) NOT NULL,
    criticality VARCHAR(20) NOT NULL,
    
    -- Concentration risk indicators
    is_single_point_of_failure BOOLEAN DEFAULT FALSE,
    alternative_available BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_resource_dependencies_organizations 
        FOREIGN KEY (organization_id) 
        REFERENCES organizations(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_resource_dependencies_source 
        FOREIGN KEY (source_resource_id) 
        REFERENCES business_resources(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_resource_dependencies_target 
        FOREIGN KEY (target_resource_id) 
        REFERENCES business_resources(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT unique_dependency_pair 
        UNIQUE(source_resource_id, target_resource_id),
    
    CONSTRAINT check_no_self_dependency 
        CHECK (source_resource_id != target_resource_id),
    
    CONSTRAINT check_dependency_type 
        CHECK (dependency_type IN (
            'TECHNICAL', 'CONTRACTUAL', 'OPERATIONAL', 
            'DATA_FLOW', 'PERSONNEL', 'FACILITY'
        ))
);

CREATE INDEX idx_resource_dependencies_organization ON resource_dependencies(organization_id);
CREATE INDEX idx_resource_dependencies_source ON resource_dependencies(source_resource_id);
CREATE INDEX idx_resource_dependencies_target ON resource_dependencies(target_resource_id);
CREATE INDEX idx_resource_dependencies_spof ON resource_dependencies(is_single_point_of_failure) 
    WHERE is_single_point_of_failure = true;

ALTER TABLE resource_dependencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_resource_dependencies ON resource_dependencies
    USING (organization_id = current_setting('app.current_tenant', true)::uuid);

COMMENT ON TABLE resource_dependencies IS 'Dependency graph between resources (supports recursive queries)';
COMMENT ON COLUMN resource_dependencies.is_single_point_of_failure IS 'DORA concentration risk indicator';
```

**007_CreateIncidentsTable.sql:**
```sql
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    incident_number VARCHAR(50) NOT NULL,
    
    -- Classification
    incident_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    
    -- DORA/NIS2 classification
    is_major_incident BOOLEAN DEFAULT FALSE,
    regulatory_reportable BOOLEAN DEFAULT FALSE,
    
    -- Status tracking
    status VARCHAR(50) NOT NULL,
    
    -- Timing
    detected_at TIMESTAMPTZ NOT NULL,
    reported_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    
    -- Impact
    affected_processes UUID[],
    affected_resources UUID[],
    estimated_users_affected INTEGER,
    estimated_financial_impact DECIMAL(18, 2),
    
    -- Description
    title VARCHAR(500) NOT NULL,
    description TEXT,
    root_cause TEXT,
    
    -- Assignment
    assigned_to UUID,
    incident_manager_id UUID,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_incidents_organizations 
        FOREIGN KEY (organization_id) 
        REFERENCES organizations(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT unique_incident_number_per_org 
        UNIQUE(organization_id, incident_number),
    
    CONSTRAINT check_incident_type 
        CHECK (incident_type IN (
            'SYSTEM_OUTAGE', 'DATA_BREACH', 'CYBER_ATTACK', 
            'NATURAL_DISASTER', 'SUPPLY_CHAIN_DISRUPTION',
            'PERSONNEL_UNAVAILABILITY', 'FACILITY_ISSUE'
        )),
    
    CONSTRAINT check_severity 
        CHECK (severity IN ('Critical', 'High', 'Medium', 'Low')),
    
    CONSTRAINT check_status 
        CHECK (status IN (
            'New', 'InProgress', 'Contained', 'Resolved', 'Closed'
        ))
);

CREATE INDEX idx_incidents_organization ON incidents(organization_id);
CREATE INDEX idx_incidents_number ON incidents(organization_id, incident_number);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_detected_at ON incidents(detected_at DESC);
CREATE INDEX idx_incidents_major ON incidents(is_major_incident) WHERE is_major_incident = true;
CREATE INDEX idx_incidents_reportable ON incidents(regulatory_reportable) WHERE regulatory_reportable = true;

ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_incidents ON incidents
    USING (organization_id = current_setting('app.current_tenant', true)::uuid);

COMMENT ON TABLE incidents IS 'Incident tracking with DORA Art. 17-19 and NIS2 Art. 23 compliance';
COMMENT ON COLUMN incidents.is_major_incident IS 'DORA major incident flag (triggers 24h reporting)';
COMMENT ON COLUMN incidents.regulatory_reportable IS 'NIS2 significant incident flag (triggers CSIRT notification)';
```

**008_CreateAuditLogsTable.sql:**
```sql
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    
    -- Actor
    user_id UUID,
    user_email VARCHAR(255),
    
    -- Action
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    
    -- Changes (before/after state)
    changes JSONB,
    
    -- Request context
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(100),
    
    -- Timestamp
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Cryptographic integrity
    signature VARCHAR(512),
    
    CONSTRAINT fk_audit_logs_organizations 
        FOREIGN KEY (organization_id) 
        REFERENCES organizations(id) 
        ON DELETE CASCADE
);

CREATE INDEX idx_audit_logs_organization ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id) WHERE user_id IS NOT NULL;

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_audit_logs ON audit_logs
    USING (organization_id = current_setting('app.current_tenant', true)::uuid);

-- Convert to hypertable for time-series optimization (if using TimescaleDB)
-- SELECT create_hypertable('audit_logs', 'timestamp', if_not_exists => TRUE);

COMMENT ON TABLE audit_logs IS 'Immutable audit trail (DORA 7-year retention requirement)';
COMMENT ON COLUMN audit_logs.signature IS 'HMAC-SHA256 signature for tamper detection';
```

**009_CreateExercisesTable.sql:**
```sql
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    
    -- Exercise details
    exercise_name VARCHAR(255) NOT NULL,
    exercise_type VARCHAR(50) NOT NULL,
    
    -- DORA TLPT flag
    is_tlpt BOOLEAN DEFAULT FALSE,
    
    -- Scope
    scope_description TEXT,
    tested_processes UUID[],
    tested_resources UUID[],
    
    -- Scheduling
    scheduled_date DATE NOT NULL,
    actual_start_date DATE,
    actual_end_date DATE,
    
    -- Status
    status VARCHAR(50) NOT NULL,
    
    -- Results
    objectives_met BOOLEAN,
    success_rate DECIMAL(5, 2),
    findings_count INTEGER,
    
    -- Documentation
    scenario_description TEXT,
    results_summary TEXT,
    lessons_learned TEXT,
    
    -- Follow-up
    action_items_created INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_exercises_organizations 
        FOREIGN KEY (organization_id) 
        REFERENCES organizations(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT check_exercise_type 
        CHECK (exercise_type IN (
            'TABLETOP', 'WALKTHROUGH', 'SIMULATION', 
            'FULL_INTERRUPTION', 'TLPT'
        )),
    
    CONSTRAINT check_status 
        CHECK (status IN (
            'Planned', 'InProgress', 'Completed', 'Cancelled'
        ))
);

CREATE INDEX idx_exercises_organization ON exercises(organization_id);
CREATE INDEX idx_exercises_scheduled_date ON exercises(scheduled_date);
CREATE INDEX idx_exercises_status ON exercises(status);
CREATE INDEX idx_exercises_type ON exercises(exercise_type);
CREATE INDEX idx_exercises_tlpt ON exercises(is_tlpt) WHERE is_tlpt = true;

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_exercises ON exercises
    USING (organization_id = current_setting('app.current_tenant', true)::uuid);

COMMENT ON TABLE exercises IS 'BC/DR testing and exercising (ISO 22301 Clause 8.5, DORA Art. 25-26)';
COMMENT ON COLUMN exercises.is_tlpt IS 'DORA Art. 26 - Threat-Led Penetration Testing flag';
```

**010_CreateIndexesAndOptimizations.sql:**
```sql
-- Additional performance indexes

-- Composite indexes for common queries
CREATE INDEX idx_processes_org_criticality_name 
    ON processes(organization_id, criticality_tier, name);

CREATE INDEX idx_impact_assessments_org_score 
    ON impact_assessments(organization_id, weighted_score DESC);

CREATE INDEX idx_recovery_objectives_org_rto 
    ON recovery_objectives(organization_id, rto_hours);

-- Partial indexes for active records
CREATE INDEX idx_incidents_active 
    ON incidents(organization_id, status, detected_at DESC) 
    WHERE status IN ('New', 'InProgress', 'Contained');

CREATE INDEX idx_exercises_upcoming 
    ON exercises(organization_id, scheduled_date) 
    WHERE status = 'Planned' AND scheduled_date >= CURRENT_DATE;

-- JSONB GIN indexes
CREATE INDEX idx_organizations_regulatory_scope 
    ON organizations USING GIN(regulatory_scope);

CREATE INDEX idx_processes_regulatory_classification 
    ON processes USING GIN(regulatory_classification);

CREATE INDEX idx_impact_assessments_financial_impact 
    ON impact_assessments USING GIN(financial_impact);

-- Statistics update
ANALYZE organizations;
ANALYZE processes;
ANALYZE impact_assessments;
ANALYZE recovery_objectives;
ANALYZE business_resources;
ANALYZE incidents;
ANALYZE exercises;
ANALYZE audit_logs;
```

### 6.3 Advanced Dapper Queries

**Complex Aggregation Example:**
```csharp
public class ComplianceReportRepository : BaseRepository
{
    public async Task<ComplianceReport> GetDORAComplianceReportAsync(
        Guid organizationId,
        CancellationToken cancellationToken = default)
    {
        using var connection = await GetConnectionAsync();
        
        const string sql = @"
            WITH process_stats AS (
                SELECT 
                    COUNT(*) AS total_processes,
                    COUNT(CASE WHEN p.regulatory_classification->>'DORAICTService' = 'true' THEN 1 END) AS ict_services,
                    COUNT(ia.id) AS assessed_processes,
                    COUNT(ro.id) AS processes_with_rto
                FROM processes p
                LEFT JOIN impact_assessments ia ON ia.process_id = p.id
                LEFT JOIN recovery_objectives ro ON ro.process_id = p.id
                WHERE p.organization_id = @OrgId
            ),
            resource_stats AS (
                SELECT 
                    COUNT(*) AS total_resources,
                    COUNT(CASE WHEN dora_third_party = true THEN 1 END) AS third_party_resources,
                    COUNT(CASE WHEN resource_type = 'ICT_SYSTEM' THEN 1 END) AS ict_systems
                FROM business_resources
                WHERE organization_id = @OrgId
            ),
            incident_stats AS (
                SELECT 
                    COUNT(*) AS total_incidents,
                    COUNT(CASE WHEN is_major_incident = true THEN 1 END) AS major_incidents,
                    COUNT(CASE WHEN regulatory_reportable = true THEN 1 END) AS reportable_incidents,
                    AVG(EXTRACT(EPOCH FROM (resolved_at - detected_at)) / 3600) AS avg_resolution_hours
                FROM incidents
                WHERE organization_id = @OrgId
                  AND detected_at >= CURRENT_DATE - INTERVAL '12 months'
            ),
            exercise_stats AS (
                SELECT 
                    COUNT(*) AS total_exercises,
                    COUNT(CASE WHEN is_tlpt = true THEN 1 END) AS tlpt_exercises,
                    AVG(success_rate) AS avg_success_rate
                FROM exercises
                WHERE organization_id = @OrgId
                  AND actual_end_date >= CURRENT_DATE - INTERVAL '12 months'
            ),
            rto_compliance AS (
                SELECT 
                    COUNT(CASE 
                        WHEN p.criticality_tier = 'Tier1' AND ro.rto_hours <= 4 THEN 1 
                    END) AS compliant_tier1,
                    COUNT(CASE WHEN p.criticality_tier = 'Tier1' THEN 1 END) AS total_tier1
                FROM processes p
                LEFT JOIN recovery_objectives ro ON ro.process_id = p.id
                WHERE p.organization_id = @OrgId
            )
            SELECT 
                -- Process metrics
                ps.total_processes,
                ps.ict_services,
                ps.assessed_processes,
                ps.processes_with_rto,
                CASE 
                    WHEN ps.total_processes > 0 
                    THEN (ps.assessed_processes::DECIMAL / ps.total_processes * 100)
                    ELSE 0 
                END AS bia_completion_percentage,
                
                -- Resource metrics
                rs.total_resources,
                rs.third_party_resources,
                rs.ict_systems,
                
                -- Incident metrics
                is.total_incidents,
                is.major_incidents,
                is.reportable_incidents,
                is.avg_resolution_hours,
                
                -- Exercise metrics
                es.total_exercises,
                es.tlpt_exercises,
                es.avg_success_rate,
                
                -- RTO compliance
                CASE 
                    WHEN rc.total_tier1 > 0 
                    THEN (rc.compliant_tier1::DECIMAL / rc.total_tier1 * 100)
                    ELSE 100 
                END AS rto_compliance_percentage,
                
                -- Overall compliance score (weighted average)
                (
                    (CASE WHEN ps.total_processes > 0 THEN (ps.assessed_processes::DECIMAL / ps.total_processes * 100) ELSE 0 END * 0.3) +
                    (CASE WHEN rc.total_tier1 > 0 THEN (rc.compliant_tier1::DECIMAL / rc.total_tier1 * 100) ELSE 100 END * 0.3) +
                    (COALESCE(es.avg_success_rate, 0) * 0.2) +
                    (CASE WHEN es.tlpt_exercises > 0 THEN 100 ELSE 0 END * 0.2)
                ) AS overall_dora_score
                
            FROM process_stats ps, resource_stats rs, incident_stats is, exercise_stats es, rto_compliance rc";
        
        return await connection.QuerySingleAsync<ComplianceReport>(sql, new { OrgId = organizationId });
    }
}
```

**Recursive Dependency Graph Query:**
```csharp
public async Task<List<DependencyPath>> GetResourceDependencyPathsAsync(
    Guid resourceId,
    int maxDepth = 5)
{
    using var connection = await GetConnectionAsync();
    
    const string sql = @"
        WITH RECURSIVE dependency_tree AS (
            -- Base case: direct dependencies
            SELECT 
                rd.source_resource_id,
                rd.target_resource_id,
                br.name AS target_name,
                br.resource_type,
                rd.is_single_point_of_failure,
                1 AS depth,
                ARRAY[rd.source_resource_id, rd.target_resource_id] AS path
            FROM resource_dependencies rd
            JOIN business_resources br ON br.id = rd.target_resource_id
            WHERE rd.source_resource_id = @ResourceId
            
            UNION ALL
            
            -- Recursive case: transitive dependencies
            SELECT 
                dt.source_resource_id,
                rd.target_resource_id,
                br.name AS target_name,
                br.resource_type,
                rd.is_single_point_of_failure,
                dt.depth + 1,
                dt.path || rd.target_resource_id
            FROM dependency_tree dt
            JOIN resource_dependencies rd ON rd.source_resource_id = dt.target_resource_id
            JOIN business_resources br ON br.id = rd.target_resource_id
            WHERE dt.depth < @MaxDepth
              AND NOT (rd.target_resource_id = ANY(dt.path))  -- Prevent cycles
        )
        SELECT 
            source_resource_id AS SourceResourceId,
            target_resource_id AS TargetResourceId,
            target_name AS TargetName,
            resource_type AS ResourceType,
            is_single_point_of_failure AS IsSinglePointOfFailure,
            depth,
            path
        FROM dependency_tree
        ORDER BY depth, target_name";
    
    var results = await connection.QueryAsync<DependencyPath>(
        sql, 
        new { ResourceId = resourceId, MaxDepth = maxDepth });
    
    return results.ToList();
}
```

---

## 7. Security Architecture

### 7.1 Zero Trust Implementation

**Principle: Never Trust, Always Verify**
```csharp
// Continuous session validation middleware
public class ContinuousAuthenticationMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ContinuousAuthenticationMiddleware> _logger;
    
    public async Task InvokeAsync(
        HttpContext context,
        ISessionValidationService sessionService)
    {
        var userId = context.User.FindFirst("sub")?.Value;
        var sessionId = context.User.FindFirst("sid")?.Value;
        
        if (!string.IsNullOrEmpty(userId) && !string.IsNullOrEmpty(sessionId))
        {
            var isValid = await sessionService.ValidateSessionAsync(
                userId, 
                sessionId);
            
            if (!isValid)
            {
                _logger.LogWarning(
                    "Invalid session detected for user {UserId}",
                    userId);
                
                context.Response.StatusCode = 401;
                await context.Response.WriteAsJsonAsync(new
                {
                    error = "Session expired or invalid",
                    requiresReauth = true
                });
                return;
            }
        }
        
        await _next(context);
    }
}

// Anomaly detection service
public class SecurityAnomalyDetectionService
{
    private readonly IDbConnectionFactory _connectionFactory;
    private readonly ILogger<SecurityAnomalyDetectionService> _logger;
    
    public async Task DetectAnomaliesAsync(
        string userId,
        string ipAddress,
        string action)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        
        // Check for unusual access patterns
        const string sql = @"
            SELECT 
                COUNT(DISTINCT ip_address) AS unique_ips_last_hour,
                COUNT(*) AS actions_last_hour
            FROM audit_logs
            WHERE user_id = @UserId
              AND timestamp >= NOW() - INTERVAL '1 hour'";
        
        var stats = await connection.QuerySingleAsync<dynamic>(
            sql,
            new { UserId = userId });
        
        int uniqueIps = stats.unique_ips_last_hour;
        int actionsCount = stats.actions_last_hour;
        
        // Flag suspicious activity
        if (uniqueIps > 3)
        {
            _logger.LogWarning(
                "Anomaly detected: User {UserId} accessed from {IpCount} different IPs in last hour",
                userId,
                uniqueIps);
            
            await RaiseSecurityAlertAsync(
                userId,
                "MULTIPLE_IP_ADDRESSES",
                $"Access from {uniqueIps} different IPs");
        }
        
        if (actionsCount > 100)
        {
            _logger.LogWarning(
                "Anomaly detected: User {UserId} performed {ActionCount} actions in last hour",
                userId,
                actionsCount);
            
            await RaiseSecurityAlertAsync(
                userId,
                "EXCESSIVE_ACTIVITY",
                $"{actionsCount} actions in one hour");
        }
    }
}
```

### 7.2 Field-Level Encryption
```csharp
// Usage in BCPeople repository
public class BCPeopleRepository : BaseRepository, IBCPeopleRepository
{
    private readonly IEncryptionService _encryption;
    
    public async Task<Guid> AddAsync(BCPeople person)
    {
        using var connection = await GetConnectionAsync();
        
        // Encrypt PII before storage
        var encryptedPhone = await _encryption.EncryptAsync(
            person.PhonePrimary, 
            TenantId);
        
        var encryptedEmail = await _encryption.EncryptAsync(
            person.PersonalEmail ?? string.Empty,
            TenantId);
        
        const string sql = @"
            INSERT INTO bc_people (
                id, organization_id, full_name, role_title,
                phone_primary, personal_email, department,
                availability_24_7, created_at
            )
            VALUES (
                @Id, @OrgId, @FullName, @RoleTitle,
                @PhonePrimary, @PersonalEmail, @Department,
                @Availability, @CreatedAt
            )";
        
        await connection.ExecuteAsync(sql, new
        {
            person.Id,
            OrgId = TenantId,
            person.FullName,
            person.RoleTitle,
            PhonePrimary = encryptedPhone,
            PersonalEmail = encryptedEmail,
            person.Department,
            person.Availability24_7,
            CreatedAt = DateTime.UtcNow
        });
        
        return person.Id;
    }
    
    public async Task<BCPeople?> GetByIdAsync(Guid id)
    {
        using var connection = await GetConnectionAsync();
        
        const string sql = "SELECT * FROM bc_people WHERE id = @Id";
        
        var person = await connection.QuerySingleOrDefaultAsync<BCPeople>(
            sql,
            new { Id = id });
        
        if (person != null)
        {
            // Decrypt PII after retrieval
            person.PhonePrimary = await _encryption.DecryptAsync(
                person.PhonePrimary, 
                TenantId);
            
            if (!string.IsNullOrEmpty(person.PersonalEmail))
            {
                person.PersonalEmail = await _encryption.DecryptAsync(
                    person.PersonalEmail,
                    TenantId);
            }
        }
        
        return person;
    }
}
```

---

## 8. API Design & Integration Layer

### 8.1 Complete Endpoint Implementation
```csharp
// BIA Endpoints with full CRUD
public static class BIAEndpoints
{
    public static void MapBIAEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/organizations/{orgId}/bia")
            .WithTags("Business Impact Analysis")
            .RequireAuthorization();
        
        // Create impact assessment
        group.MapPost("/processes/{processId}/assessment", CreateImpactAssessment)
            .WithName("CreateImpactAssessment")
            .Produces<ImpactAssessmentDto>(201)
            .RequireAuthorization("WriteBIA");
        
        // Set recovery objectives
        group.MapPost("/processes/{processId}/recovery-objectives", SetRecoveryObjectives)
            .WithName("SetRecoveryObjectives")
            .Produces<RecoveryObjectiveDto>(201)
            .RequireAuthorization("WriteBIA");
        
        // Get BIA completion status
        group.MapGet("/completion-status", GetCompletionStatus)
            .WithName("GetBIACompletionStatus")
            .Produces<BIACompletionDto>()
            .RequireAuthorization("ViewBIA");
        
        // Generate BIA report
        group.MapPost("/generate-report", GenerateBIAReport)
            .WithName("GenerateBIAReport")
            .Produces<byte[]>(contentType: "application/pdf")
            .RequireAuthorization("ViewBIA");
    }
    
    private static async Task<IResult> CreateImpactAssessment(
        Guid orgId,
        Guid processId,
        CreateImpactAssessmentRequest request,
        IMediator mediator,
        IValidator<CreateImpactAssessmentRequest> validator)
    {
        var validationResult = await validator.ValidateAsync(request);
        if (!validationResult.IsValid)
            return Results.ValidationProblem(validationResult.ToDictionary());
        
        var command = new CreateImpactAssessmentCommand
        {
            ProcessId = processId,
            FinancialImpact = request.FinancialImpact,
            ReputationalImpact = request.ReputationalImpact,
            RegulatoryImpact = request.RegulatoryImpact,
            OperationalImpact = request.OperationalImpact,
            CustomerImpact = request.CustomerImpact
        };
        
        var result = await mediator.Send(command);
        
        return result.IsSuccess
            ? Results.Created(
                $"/api/v1/organizations/{orgId}/bia/processes/{processId}/assessment",
                result.Data)
            : Results.Problem(string.Join(", ", result.Errors));
    }
}
```

### 8.2 Webhook Integration
```csharp
public class WebhookDeliveryService
{
    private readonly IDbConnectionFactory _connectionFactory;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<WebhookDeliveryService> _logger;
    
    public async Task DeliverWebhookAsync(
        Guid organizationId,
        string eventType,
        object payload)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        
        // Get registered webhooks for this event type
        const string sql = @"
            SELECT webhook_url, secret_key
            FROM webhook_subscriptions
            WHERE organization_id = @OrgId
              AND event_types @> ARRAY[@EventType]::text[]
              AND is_active = true";
        
        var webhooks = await connection.QueryAsync<WebhookSubscription>(
            sql,
            new { OrgId = organizationId, EventType = eventType });
        
        foreach (var webhook in webhooks)
        {
            await DeliverToWebhookAsync(webhook, eventType, payload);
        }
    }
    
    private async Task DeliverToWebhookAsync(
        WebhookSubscription webhook,
        string eventType,
        object payload)
    {
        var webhookPayload = new
        {
            event_type = eventType,
            timestamp = DateTime.UtcNow,
            data = payload
        };
        
        var json = JsonSerializer.Serialize(webhookPayload);
        
        // Generate HMAC signature
        var signature = GenerateHmacSignature(json, webhook.SecretKey);
        
        var client = _httpClientFactory.CreateClient();
        var request = new HttpRequestMessage(HttpMethod.Post, webhook.WebhookUrl)
        {
            Content = new StringContent(json, Encoding.UTF8, "application/json")
        };
        
        request.Headers.Add("X-Webhook-Signature", signature);
        request.Headers.Add("X-Webhook-Event", eventType);
        
        try
        {
            var response = await client.SendAsync(request);
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "Webhook delivery failed: {Url}, Status: {Status}",
                    webhook.WebhookUrl,
                    response.StatusCode);
                
                await ScheduleRetryAsync(webhook, eventType, payload);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Webhook delivery exception: {Url}",
                webhook.WebhookUrl);
            
            await ScheduleRetryAsync(webhook, eventType, payload);
        }
    }
    
    private string GenerateHmacSignature(string payload, string secret)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
        return Convert.ToBase64String(hash);
    }
}
```

---

## 9. Compliance Automation Engine

### 9.1 Complete Rule Implementations
```csharp
// NIS2 Article 23 - Incident Notification Rule
public class NIS2IncidentNotificationRule : IComplianceRule
{
    private readonly IDbConnectionFactory _connectionFactory;
    
    public string ControlId => "NIS2-Art.23";
    public string Framework => "NIS2";
    
    public async Task<ComplianceResult> ValidateAsync(Guid organizationId)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        
        // Check for significant incidents without timely reporting
        const string sql = @"
            SELECT 
                COUNT(*) AS overdue_count
            FROM incidents
            WHERE organization_id = @OrgId
              AND regulatory_reportable = true
              AND reported_at IS NULL
              AND detected_at < NOW() - INTERVAL '24 hours'";
        
        var overdueCount = await connection.ExecuteScalarAsync<int>(
            sql,
            new { OrgId = organizationId });
        
        if (overdueCount > 0)
        {
            return ComplianceResult.NonCompliant(
                ControlId,
                $"{overdueCount} significant incidents not reported within 24 hours");
        }
        
        return ComplianceResult.Compliant(
            ControlId,
            "All significant incidents reported within required timeframes");
    }
}

// DORA Article 25 - Testing Frequency Rule
public class DORATestingFrequencyRule : IComplianceRule
{
    private readonly IDbConnectionFactory _connectionFactory;
    
    public string ControlId => "DORA-Art.25";
    public string Framework => "DORA";
    
    public async Task<ComplianceResult> ValidateAsync(Guid organizationId)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        
        // Check if annual testing requirement is met
        const string sql = @"
            SELECT 
                COUNT(*) AS exercises_last_12_months
            FROM exercises
            WHERE organization_id = @OrgId
              AND actual_end_date >= CURRENT_DATE - INTERVAL '12 months'
              AND status = 'Completed'";
        
        var exerciseCount = await connection.ExecuteScalarAsync<int>(
            sql,
            new { OrgId = organizationId });
        
        if (exerciseCount == 0)
        {
            return ComplianceResult.NonCompliant(
                ControlId,
                "No BC/DR exercises completed in the last 12 months");
        }
        else if (exerciseCount < 2)
        {
            return ComplianceResult.PartiallyCompliant(
                ControlId,
                $"Only {exerciseCount} exercise completed (recommended: at least 2 per year)");
        }
        
        return ComplianceResult.Compliant(
            ControlId,
            $"{exerciseCount} BC/DR exercises completed in last 12 months");
    }
}
```

---

## 10. Railway Deployment Architecture

### 10.1 Complete Deployment Configuration

**GitHub Actions CI/CD:**
```yaml
name: Deploy to Railway

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:
  RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
        ports:
          - 5432:5432
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup .NET
      uses: actions/setup-dotnet@v4
      with:
        dotnet-version: '10.0.x'
    
    - name: Restore
      run: dotnet restore
    
    - name: Build
      run: dotnet build --no-restore --configuration Release
    
    - name: Test with Coverage
      run: |
        dotnet test --no-build --configuration Release \
          /p:CollectCoverage=true \
          /p:CoverletOutputFormat=opencover \
          /p:Threshold=90
    
    - name: Upload Coverage
      uses: codecov/codecov-action@v3
      with:
        files: ./**/coverage.opencover.xml
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Install Railway CLI
      run: npm install -g @railway/cli
    
    - name: Deploy to Railway
      run: railway up --service nexus-bcms-api
      env:
        RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
    
    - name: Run Migrations
      run: railway run --service nexus-bcms-api dotnet run --project src/Nexus.BCMS.Infrastructure -- migrate
      env:
        RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## 11. Monitoring, Logging & Observability

### 11.1 OpenTelemetry Configuration
```csharp
// Program.cs
builder.Services.AddOpenTelemetry()
    .WithTracing(tracing =>
    {
        tracing
            .AddAspNetCoreInstrumentation()
            .AddHttpClientInstrumentation()
            .AddSource("Nexus.BCMS")
            .AddOtlpExporter(options =>
            {
                options.Endpoint = new Uri(
                    builder.Configuration["OpenTelemetry:Endpoint"]!);
            });
    })
    .WithMetrics(metrics =>
    {
        metrics
            .AddAspNetCoreInstrumentation()
            .AddHttpClientInstrumentation()
            .AddMeter("Nexus.BCMS")
            .AddPrometheusExporter();
    });

// Custom metrics
public class ResilienceMetrics
{
    private readonly Meter _meter;
    private readonly Counter<long> _biaCompletedCounter;
    private readonly Histogram<double> _resilienceScoreHistogram;
    
    public ResilienceMetrics(IMeterFactory meterFactory)
    {
        _meter = meterFactory.Create("Nexus.BCMS");
        
        _biaCompletedCounter = _meter.CreateCounter<long>(
            "nexus.bia.completed",
            description: "Number of completed BIA assessments");
        
        _resilienceScoreHistogram = _meter.CreateHistogram<double>(
            "nexus.resilience.score",
            description: "Organization resilience scores");
    }
    
    public void RecordBIACompleted(Guid organizationId)
    {
        _biaCompletedCounter.Add(1, new KeyValuePair<string, object?>(
            "organization_id", organizationId.ToString()));
    }
    
    public void RecordResilienceScore(Guid organizationId, double score)
    {
        _resilienceScoreHistogram.Record(score, new KeyValuePair<string, object?>(
            "organization_id", organizationId.ToString()));
    }
}
```

---

## 12. Implementation Roadmap

### 12.1 Detailed Phased Delivery

**Phase 1: Foundation (Months 1-3)**

| Week | Sprint Goal | Key Deliverables | Test Coverage Target |
|------|------------|------------------|---------------------|
| 1-2 | Domain Model | All entities, value objects, domain events | 100% |
| 3-4 | Data Layer | Dapper repositories, migrations, RLS | 90% |
| 5-6 | Multi-tenancy | Tenant provisioning, isolation validation | 95% |
| 7-8 | Authentication | Entra ID integration, JWT validation | 90% |
| 9-10 | Process Module | Process CRUD, search, filtering | 95% |
| 11-12 | BIA Foundation | Impact assessment workflow | 95% |

**Success Criteria:**
- ✅ 500+ unit tests passing
- ✅ 95%+ code coverage
- ✅ Railway deployment automated
- ✅ 5 test tenants provisioned
- ✅ Authentication working end-to-end

---

## 13. Appendices

### Appendix A: Performance Benchmarks

| Operation | EF Core | Dapper | Improvement |
|-----------|---------|--------|-------------|
| Simple SELECT | 2.3ms | 0.8ms | 2.9x |
| Complex JOIN | 8.5ms | 3.2ms | 2.7x |
| Bulk INSERT (100) | 45.0ms | 12.0ms | 3.8x |
| Aggregate Query | 15.0ms | 5.5ms | 2.7x |
| UPDATE with tracking | 5.2ms | 1.8ms | 2.9x |

### Appendix B: Glossary

| Term | Definition |
|------|------------|
| **Dapper** | Micro-ORM for .NET providing high-performance SQL execution |
| **DbUp** | .NET library for SQL-based database migrations |
| **TDD** | Test-Driven Development - write tests before implementation |
| **BIA** | Business Impact Analysis |
| **RTO** | Recovery Time Objective - maximum acceptable downtime |
| **RPO** | Recovery Point Objective - maximum acceptable data loss |
| **MTPD** | Maximum Tolerable Period of Disruption |
| **DORA** | Digital Operational Resilience Act (EU Regulation 2022/2554) |
| **NIS2** | Network and Information Security Directive 2 (EU 2022/2555) |
| **RLS** | Row-Level Security - PostgreSQL tenant isolation |
| **CQRS** | Command Query Responsibility Segregation |
| **TLPT** | Threat-Led Penetration Testing |

### Appendix C: Railway CLI Reference
```bash
# Project management
railway init                  # Initialize new project
railway link                  # Link to existing project
railway status                # View service status

# Deployment
railway up                    # Deploy application
railway up --detach           # Deploy without logs
railway logs                  # View application logs
railway logs --follow         # Follow logs in real-time

# Database
railway connect postgres      # Connect to PostgreSQL
railway run psql              # Run psql client
railway run "dotnet ef migrations add MigrationName"

# Environment
railway variables             # List all variables
railway variables set KEY=VALUE
railway variables unset KEY

# Services
railway service               # List services
railway service create        # Create new service
railway service delete        # Delete service
```

---

## Document Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| **Chief Architect** | Muhamed | _____________ | _____________ |
| **Lead Developer** | [Name] | _____________ | _____________ |
| **QA Lead** | [Name] | _____________ | _____________ |
| **DevOps Lead** | [Name] | _____________ | _____________ |
| **Security Officer** | [Name] | _____________ | _____________ |

---

## End of Document

**Total Pages:** 70+  
**Test Coverage Target:** 95%+  
**Deployment Platform:** Railway  
**Technology Stack:** .NET 10, Dapper, PostgreSQL 16, Blazor  
**Development Methodology:** Test-Driven Development (TDD)  
**Data Access Strategy:** Dapper Micro-ORM with optimized SQL  

**Next Review Date:** April 2026  

**Document Classification:** Confidential - Internal Use Only  

---

*This architecture represents Nexus GRC Solutions' commitment to engineering excellence through Test-Driven Development and high-performance data access, building world-class operational resilience platforms with .NET 10, Dapper, and modern cloud infrastructure.*

*For questions or clarifications, contact: [email protected]*

**Version History:**
- v1.0 (January 2026) - Initial architecture with EF Core
- v1.1 (January 2026) - Updated to Dapper micro-ORM for performance optimization

---

**END OF COMPLETE DOCUMENT**