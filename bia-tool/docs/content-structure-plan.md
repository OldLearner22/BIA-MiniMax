# Content Structure Plan - Business Impact Analysis (BIA) Tool

## 1. Material Inventory

**Technical Reference:**
- `TECHNICAL_DOCUMENTATION.md` (Architecture, Data Models, Logic)
  - **Entities**: Process, Impact, Timeline, RecoveryObjective, Dependency
  - **Logic**: Impact Scoring, MTPD Calculation, Cascading Impacts
  - **Compliance**: ISO 22301:2019 Clause 8.2

**Visual Assets:**
- **Icons**: SVG (Lucide/Heroicons) - *Strictly no emojis*
- **Charts**: Chart.js (Radar, Line, Bar, Dependency Graph)
- **Logos**: Placeholder "BIA Secure" branding

## 2. Website Structure

**Type:** SPA (Single Page Application)
**Reasoning:**
- **User Workflow**: Highly interactive, non-linear data entry (wizards, graphs).
- **Performance**: Instant state updates for impact calculations (as per Tech Doc 2.2).
- **Offline Capability**: Requirement for local storage persistence (Tech Doc 2.1).

## 3. View/Module Breakdown

**Visual Asset Column Rules:**
- **[OK] Content Images**: Specific UI data visualizations (charts, graphs).
- **[X] Decorative Images**: Backgrounds, abstract textures (handled in Design Spec).

### View 1: Dashboard (Home)
**Route**: `/`
**Purpose**: High-level risk posture and assessment progress.

| Section | Component Pattern | Data Entity Reference | Content to Extract | Visual Asset |
| :--- | :--- | :--- | :--- | :--- |
| **Global Status** | KPI Cards (Glass) | `Assessment` | Total Processes, Critical Count, % Compliant | - |
| **Risk Overview** | Radar Chart | `ImpactAssessment` | Aggregate Risk Score vs. Risk Tolerance | `chart_radar_risk` |
| **Progress Tracker** | Progress Bar | `Assessment.status` | Completion % of current BIA cycle | - |
| **Critical Alerts** | Notification List | `Process.criticality` | Processes with missing RTO/RPO | - |

### View 2: Process Registry
**Route**: `/processes`
**Purpose**: CRUD operations for business processes.

| Section | Component Pattern | Data Entity Reference | Content to Extract | Visual Asset |
| :--- | :--- | :--- | :--- | :--- |
| **Process List** | Data Table (Glass) | `Process` | Name, Dept, Owner, Criticality Score | - |
| **Quick Actions** | Action Bar | - | Add Process, Import/Export (JSON) | - |
| **Filter/Search** | Search Input | - | Filter by Department, Criticality | - |

### View 3: Impact Assessment Wizard
**Route**: `/assessment/:processId`
**Purpose**: Detailed scoring of disruption impacts (Iso 22301 Clause 8.2.2).

| Section | Component Pattern | Data Entity Reference | Content to Extract | Visual Asset |
| :--- | :--- | :--- | :--- | :--- |
| **Step 1: Details** | Form (Input Fields) | `Process` | Name, Description, Owner | - |
| **Step 2: Impacts** | Slider/Rating Inputs | `ImpactAssessment` | Financial, Operational, Reputational (0-5) | - |
| **Step 3: Timeline** | Line Chart Input | `TimelinePoint` | Impact evolution (4h, 24h, 72h, 1w) | `chart_line_timeline` |
| **Step 4: Objectives**| Form (Calculated) | `RecoveryObjective` | MTPD (Calculated), RTO, RPO | - |

### View 4: Dependency Map
**Route**: `/dependencies`
**Purpose**: Visualize and manage process interdependencies.

| Section | Component Pattern | Data Entity Reference | Content to Extract | Visual Asset |
| :--- | :--- | :--- | :--- | :--- |
| **Graph View** | Node-Link Diagram | `Dependency` | Nodes (Processes), Edges (Dependencies) | `chart_graph_dependency` |
| **Critical Path** | Highlighted List | `Dependency` | Chain of most critical dependencies | - |
| **Editor Panel** | Side Drawer | `Dependency` | Add Upstream/Downstream links | - |

### View 5: Reports & Analytics
**Route**: `/reports`
**Purpose**: Generate ISO-compliant documentation.

| Section | Component Pattern | Data Entity Reference | Content to Extract | Visual Asset |
| :--- | :--- | :--- | :--- | :--- |
| **Executive Summary**| Document Preview | `Assessment` | High-level findings text | - |
| **Risk Matrix** | Scatter Plot | `RiskScore` | Likelihood vs. Impact plotting | `chart_scatter_risk` |
| **Export Actions** | Button Group | - | PDF, CSV, JSON download actions | - |

## 4. Content Analysis

**Information Density:** High
- **Reasoning**: BIA requires handling 50+ data points per process, complex relationships, and precise time values.
**Content Balance:**
- **Text (Forms/Tables)**: 60% (Dominant)
- **Data Vis (Charts)**: 30% (Critical for insights)
- **Navigation/Chrome**: 10%
