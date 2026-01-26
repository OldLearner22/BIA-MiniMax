# Nexus BCMS Integration Tests

These tests serve as the **correctness baseline** for the Hybrid Migration.
They target the existing Node.js/Express API relative to the current database state.

## Core Domains Covered

1.  **Processes** (`/api/processes`) - BIA Core
2.  **Resources** (`/api/resources`, `/api/resource-dependencies`) - Dependency Graph
3.  **Incidents** (`/api/incidents`) - Incident Management
4.  **Compliance** (`/api/compliance`) - Audits & Controls

## How to Run

```bash
npm install
npx vitest run
```

## TDD Workflow for Migration

When migrating a domain (e.g., Resources) to .NET:

1.  Run these tests to confirm Node.js behavior.
2.  Implement the .NET endpoint.
3.  Point these tests to the .NET port (or YARP).
4.  Run these tests again.
5.  **Green = Parity Achieved.**
