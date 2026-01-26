# Nexus BCMS - Hybrid Migration Strategy (v1.2)

**Document Reference:** NEXUS-MIG-PLAN-002
**Target Architecture:** `Architecture-v1.2.md`
**Strategy:** Strangler Fig (Hybrid)
**Status:** ACTIVE - PHASE 5 PREPARATION

---

## 1. Migration Philosophy: "Strangler Fig"

We will **NOT** pause feature development to rewrite the system. Instead, we will deploy the new .NET 10 Microservices _alongside_ the existing Node.js application, gradually routing specific traffic to the new high-performance endpoints.

**Core Rule:** "If it is Critical Calculation or Graph Traversal -> Migrate to .NET. If it is simple CRUD -> Keep in Node.js."

- [x] Phase 1.1: Database Unification & RLS
- [x] Phase 1.2: .NET 10 Skeleton & DI
- [x] Phase 1.3: YARP Unified Gateway
- [x] Phase 2.1: Risk Management Migration (Full CRUD)
- [x] Phase 2.2: Threat Management Migration
- [x] Phase 2.3: Resource Graph Optimization (Calculations)
- [x] Phase 3.1: Global Audit Logging (Compliance)
- [x] Phase 3.2: Automated RLS Enforcement (Defense in Depth)
- [x] Phase 3.3: API Security Baseline (Headers & Rate Limiting)
- [x] Phase 4.1: Simulation & Exercise Engine (BCDR)
- [x] Phase 4.2: Exercise Tracking Migration
- [x] Phase 4.3: DORA Reporting Engine

---

## Phase 1: Foundation & "The Sidecar" (COMPLETE)

**Goal:** Establish the hybrid infrastructure where both stacks coexist and share the database.

| Step    | Action Item              | Technical Detail                              | Result                                                             |
| :------ | :----------------------- | :-------------------------------------------- | :----------------------------------------------------------------- |
| **1.1** | **Database Unification** | Apply PostgreSQL RLS policies to existing DB. | [x] `current_setting('app.current_tenant')` works for both stacks. |
| **1.2** | **.NET Skeleton**        | Initialize `Nexus.BCMS.Core` (.NET 10 API).   | [x] Solution builds, DI wired, Health Checks pass.                 |
| **1.3** | **YARP Gateway**         | Implement YARP Reverse Proxy.                 | [x] `localhost:5000` routes migrated domains to .NET.              |
| **1.4** | **Shared Auth**          | Standardize JWT Token Validation.             | [x] .NET API validation active with shared keys.                   |

---

## Phase 2: The "Performance Strike" (COMPLETE)

**Goal:** Migrate the heaviest logic to .NET for 100x performance gains.

| Step    | Action Item            | Legacy State (Node)                 | Target State (.NET)           | ROI                                             |
| :------ | :--------------------- | :---------------------------------- | :---------------------------- | :---------------------------------------------- |
| **2.1** | **Risk Management**    | Node.js CRUD (Prisma)               | .NET CRUD (Dapper + RLS)      | [x] **Validated:** 100% Parity                  |
| **2.2** | **Threats & Strategy** | Node.js CRUD (Prisma)               | .NET CRUD (Dapper + RLS)      | [x] **Validated:** Clean Domain + CBA Parity    |
| **2.3** | **Resource Graph**     | `for (node of nodes) await fetch()` | `WITH RECURSIVE` CTE (Dapper) | [x] **Validated:** single-query graph traversal |

---

## Phase 3: Compliance & Resilience Hardening (COMPLETE)

**Goal:** Ensure the platform meets DORA and ISO 22301 standards for traceability and security.

| Step    | Action Item       | Implementation Detail                      | ROI                                              |
| :------ | :---------------- | :----------------------------------------- | :----------------------------------------------- |
| **3.1** | **Audit Trail**   | Global `AuditLog` Table                    | [x] **Validated:** Multi-tenant Audit Logging    |
| **3.2** | **Hardened RLS**  | `TenantAwareConnectionFactory` (Decorator) | [x] **Validated:** Automated context application |
| **3.3** | **API Hardening** | Security Headers, Rate Limiting & CSP      | [x] **Validated:** OWASP Compliance Baseline     |

---

## Phase 4: Recovery Scenarios & Simulation (COMPLETE)

**Goal:** Implement the "Actionable" BCDR features to enable testing and exercising.

| Step    | Action Item           | Technical Detail                                                      | ROI                                                        |
| :------ | :-------------------- | :-------------------------------------------------------------------- | :--------------------------------------------------------- |
| **4.1** | **Simulation Engine** | Build a "What-If" engine for resource outages in the Resource Graph.  | [x] **Validated:** Automated blast-radius calculation.     |
| **4.2** | **Exercise Tracking** | Migrate Exercise & Testing modules to handle high-concurrency events. | [x] **Validated:** Automated audit & follow-up management. |
| **4.3** | **DORA Reporting**    | Build complex SQL aggregation for real-time compliance dashboards.    | [x] **Validated:** Multi-pillar DORA indicator engine.     |

---

## Phase 5: Long-Term Hybrid (Maintenance)

**Goal:** Sustained stable operations.

- **Node.js**: Retained for Identity (Keycloak wrapper), Document Storage (S3), and low-traffic HR/Staff CRUD.
- **.NET**: Handles all Calculations, Risks, Threats, Strategy, and Resource Graph Graph.
- **Frontend**: React application consuming both APIs through the YARP gateway.

---

## Migration Checklist (Safety First)

- [x] **Data Integrity**: Both apps respect the same PostgreSQL schema and RLS policies.
- [x] **Audit Traceability**: All write operations in .NET are logged to `GlobalAuditLog`.
- [x] **Security Headers**: API `nosniff`, `DENY` frames, and `CSP` are active.
- [x] **Simulation Ready**: Resource graph supports "What-If" outage modelling via .NET engine.

---
