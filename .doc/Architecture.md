# Business Impact Analysis Tool

## Comprehensive Architectural Design Document

**Document Reference:** BIA-ARCH-002  
**Version:** 3.0  
**Classification:** Internal  
**Standard Alignment:** ISO 22301:2019 Business Continuity Management Systems

---

## Document Control

| Item          | Details                  |
| ------------- | ------------------------ |
| Author        | Architecture Review Team |
| Date          | January 2026             |
| Status        | Approved                 |
| Review Period | Continuous               |

---

## Executive Summary

The Nexus BCMS is a full-stack Business Continuity Management System engineered to support organisations in building operational resilience aligned with ISO 22301:2019. Unlike early prototypes, the platform features a robust distributed architecture with an Express.js/Node.js backend, a PostgreSQL persistence layer, and a high-performance React frontend.

The system centralises critical business data, automates impact analysis, visualises complex resource dependencies, and manages the human element of crisis response through an interactive organigram and exercise tracking.

---

## 1. Introduction and Scope

### 1.1 Purpose

This document defines the production architecture of the Nexus BCMS. It serves as the primary technical reference for developers maintaining the full-stack codebase and for auditors verifying technical controls.

### 1.2 System Context

The tool implements the "Plan-Do-Check-Act" (PDCA) cycle for ISO 22301:2019, covering:

- **BIA (Clause 8.2.2)**: Impact assessments and recovery objectives.
- **BC Teams (Clause 5.3)**: Organisation structure and role assignments.
- **Resource Mapping (Clause 8.2.2.e)**: Technical and operational dependency chains.
- **Exercising (Clause 8.5)**: Testing and validation of procedures.

---

## 2. Application Architecture

### 2.1 Technology Stack

| Layer           | Technology             | Purpose                                       |
| --------------- | ---------------------- | --------------------------------------------- |
| **Frontend**    | React 18 / TypeScript  | Type-safe component architecture              |
| **Styling**     | Vanilla CSS / Tailwind | High-performance, modern UI components        |
| **State**       | Zustand                | Global client-side state synchronized via API |
| **Backend**     | Express / tsx          | Modern Node.js API with native TS support     |
| **Database**    | PostgreSQL             | Relational storage for complex dependencies   |
| **ORM**         | Prisma                 | Type-safe database access and migrations      |
| **Flow Engine** | @xyflow/react          | Visual diagramming for Resource Maps          |

### 2.2 System Components (Sidebar Modules)

The application is structured into the following operational modules:

1. **Dashboard**: High-level KPI visualization and risk overview.
2. **Business Impact Analysis**:
   - **Process Inventory**: Cataloging of all business functions.
   - **Impact Assessment**: Multi-dimensional severity analysis (0-5 scale).
   - **Recovery Requirements**: Setting RTO, RPO, and MTPD targets.
3. **Resource & Dependency Mapping**:
   - **Resource Registry**: Comprehensive catalog of Systems, People, Facilities, and Vendors.
   - **Dependency Graph**: Interactive visual mapping of recursive resource dependencies.
4. **Resilience Strategy**:
   - **Strategy Framework**: defining how the organization will recover.
   - **Resource Requirements**: Tiered resource needs across recovery phases.
5. **People & Roles (ISO 22301 Compliance)**:
   - **BC Team Structure**: Interactive organigram with drag-and-drop role assignment.
   - **Role Definition**: Standardized BC roles (Crisis Lead, Scribe, etc.).
6. **Testing & Exercises**:
   - **Exercise Log**: Tracking tabletops and simulations.
   - **Action Tracking**: Managing follow-up remediation tasks.

### 2.3 Data Flow Architecture

```
User Action (UI) ──► Zustand Store Action ──► fetch(API)
                                                │
                                                ▼
         Prisma Client ◄── Express Route ◄── Controller Logic
               │
               ▼
         PostgreSQL DB (ACID Compliant)
```

---

## 3. Data Model and Entity Relationships

### 3.1 Persistence Strategy

The system uses a **PostgreSQL** database managed via **Prisma**. All tables are related via foreign keys to ensure referential integrity.

### 3.2 Key Entity Groups

#### **Identity & Context**

- **Organization**: Multi-tenant root (implicit in current phase).
- **BC_People**: The pool of personnel available for BC assignments.

#### **BIA Domain**

- **Process**: The core unit of analysis.
- **ImpactAssessment**: 1:1 with Process, stores weighted scores.
- **RecoveryObjective**: 1:1 with Process, stores RTO/RPO timing.

#### **Dependency Domain**

- **BusinessResource**: Categorized assets (Systems, Vendors, etc.).
- **ProcessResourceLink**: Connects processes to their required resources.
- **ResourceDependency**: Recursive self-join mapping resource chains.
- **Diagram**: Stores visual layout metadata for x/y coordinates.

#### **Organization Domain**

- **BC_Team_Structure**: Hierarchy of crisis/recovery teams.
- **BC_Role_Assignments**: Mapping People to Teams in specific Roles.

---

## 4. Implementation Roadmap (Planned Features)

Based on the sidebar structure, the following phases are planned for implementation:

### Phase 1: Risk & Strategy (Next Up)

- **Risk Register**: Qualitative and quantitative risk assessment (Threat x Vulnerability).
- **Cost-Benefit Analysis**: Comparison of recovery strategy costs vs. downtime losses.

### Phase 2: Operations & Procedures

- **Standard Operating Procedures (SOPs)**: Markdown-based digital procedure library.
- **Communication Hub**: Centralized contact directories and escalation paths.

### Phase 3: Monitoring & Review

- **Audit Center**: ISO 22301 compliance checklists and gap analysis.
- **Management Review**: Automated meeting agendas and review trackers.

---

## 5. Security & Multi-Tenancy

- **Row Level Security (RLS)**: Enforced via `organization_id` on all tables.
- **Audit Logging**: Planned tracking of all PII access (BC_People records).
- **API Security**: Middleware-based authentication and input validation (Zod).
