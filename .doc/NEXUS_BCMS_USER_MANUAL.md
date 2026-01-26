# Nexus BCMS - Comprehensive User Manual

**Version:** 1.0  
**Date:** January 26, 2026  
**Application:** Nexus Business Continuity Management System  
**Compliance Focus:** ISO 22301:2019

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [ISO 22301 Overview & Application Context](#2-iso-22301-overview--application-context)
3. [System Architecture & Navigation](#3-system-architecture--navigation)
4. [Business Impact Analysis Module](#4-business-impact-analysis-module)
5. [Resource & Dependency Management](#5-resource--dependency-management)
6. [Risk & Threat Management](#6-risk--threat-management)
7. [Business Continuity Strategy](#7-business-continuity-strategy)
8. [People & Roles Management](#8-people--roles-management)
9. [Documentation & Compliance](#9-documentation--compliance)
10. [Incident Management](#10-incident-management)
11. [Training & Exercises](#11-training--exercises)
12. [Reports & Analytics](#12-reports--analytics)
13. [Administrative Settings](#13-administrative-settings)
14. [Compliance Mapping Reference](#14-compliance-mapping-reference)
15. [Best Practices & Workflows](#15-best-practices--workflows)
16. [Troubleshooting & Support](#16-troubleshooting--support)

---

## 1. Introduction

### 1.1 Purpose of This Manual

This user manual provides comprehensive guidance for using Nexus BCMS, a premium enterprise-grade Business Continuity Management System designed specifically for ISO 22301:2019 compliance. The manual explains:

- How to navigate and use each module of the application
- How application features support ISO 22301 requirements
- Best practices for business continuity management
- Step-by-step procedures for common tasks
- Understanding how data flows through the system

### 1.2 Target Audience

This manual is designed for:

- **Business Continuity Managers** - Primary system users responsible for BCMS implementation
- **Business Process Owners** - Department leads contributing to BIA activities
- **Risk Managers** - Professionals managing organizational risk assessments
- **Compliance Officers** - Ensuring adherence to ISO 22301 standards
- **Executive Leadership** - Reviewing dashboards and strategic reports
- **IT Administrators** - Managing system configuration and users

### 1.3 System Overview

Nexus BCMS is a web-based application that provides:

- **Business Impact Analysis (BIA)** - Identify critical processes and assess disruption impacts
- **Resource & Dependency Mapping** - Catalog business resources and their interdependencies
- **Risk Management** - Register risks, assess threats, and plan treatments
- **BC Strategy Development** - Define recovery strategies and resource requirements
- **People & Roles Management** - Organize BC teams and track competencies
- **Documentation Hub** - Centralized repository for BC plans, procedures, and policies
- **Incident Management** - Track and manage business continuity incidents
- **Training & Exercises** - Schedule exercises and maintain training records
- **Compliance Tracking** - Monitor compliance with ISO 22301 and other frameworks

### 1.4 Key Features

- **Real-time Dashboards** - Executive-level KPIs and risk visualization
- **Multi-dimensional Impact Assessment** - Financial, operational, reputational, legal, health, environmental
- **Temporal Analysis** - Understand how impacts escalate over time
- **Dependency Mapping** - Visual representation of process and resource dependencies
- **Monte Carlo Risk Simulation** - Advanced quantitative risk analysis
- **Drag-and-Drop BC Team Builder** - Intuitive team structure management
- **Approval Workflows** - Multi-step document approval processes
- **Version Control** - Complete audit trail of all changes
- **Compliance Matrix** - Map documentation to regulatory requirements
- **Export & Reporting** - Generate PDF reports for auditors and management

---

## 2. ISO 22301 Overview & Application Context

### 2.1 Understanding ISO 22301:2019

ISO 22301 is the international standard for Business Continuity Management Systems (BCMS). It specifies requirements for:

1. **Planning** - Establishing the BCMS scope and objectives
2. **Implementing** - Conducting BIA, risk assessment, and developing BC strategies
3. **Maintaining** - Monitoring, reviewing, and continually improving
4. **Operating** - Responding to disruptions and activating BC plans

The standard follows the **Plan-Do-Check-Act (PDCA)** cycle common to all ISO management systems.

### 2.2 BCMS Lifecycle Supported by Nexus

```
┌─────────────────────────────────────────────────────────────┐
│                    PLAN (Establish BCMS)                     │
│  • Define scope and policy (Documentation Hub)              │
│  • Identify stakeholders (Process Registry)                 │
│  • Establish BC objectives (Settings)                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      DO (Implement BCMS)                     │
│  • Conduct BIA (Impact Assessment, Recovery Objectives)     │
│  • Perform Risk Assessment (Risk Register, Threat Analysis) │
│  • Define BC Strategies (BC Strategy, Recovery Options)     │
│  • Establish BC Teams (BC Team Structure)                   │
│  • Create BC Plans & Procedures (Documentation Hub)         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   CHECK (Monitor & Review)                   │
│  • Exercise BC plans (Exercise Log)                         │
│  • Monitor KPIs (Dashboard, Reports)                        │
│  • Track incidents (Incident Management)                    │
│  • Conduct audits (Compliance Matrix)                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      ACT (Maintain & Improve)                │
│  • Update procedures (Documentation Hub)                    │
│  • Revise risk treatments (Risk Treatment)                  │
│  • Improve training (Training Records)                      │
│  • Update BC strategies (BC Strategy)                       │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Core ISO 22301 Processes Mapped to Application

| ISO 22301 Clause | Requirement                    | Application Module                     | How It Helps                                                 |
| ---------------- | ------------------------------ | -------------------------------------- | ------------------------------------------------------------ |
| **Clause 4.4**   | Understanding the organization | Process Registry, Dependencies         | Document all business processes, owners, and criticality     |
| **Clause 6.1**   | Actions to address risks       | Risk Register, Threat Analysis         | Identify and assess risks to business continuity             |
| **Clause 8.2**   | Business Impact Analysis       | Impact Assessment, Recovery Objectives | Determine impacts of disruption and recovery time objectives |
| **Clause 8.3**   | Business Continuity Strategies | BC Strategy, Recovery Options          | Define how the organization will recover from disruptions    |
| **Clause 8.4**   | BC Plans & Procedures          | Documentation Hub, Procedures Library  | Document response and recovery procedures                    |
| **Clause 8.5**   | Exercising & Testing           | Exercise Log                           | Plan and track BC exercises and tests                        |
| **Clause 9.1**   | Monitoring & Measurement       | Dashboard, Reports                     | Track performance metrics and compliance status              |
| **Clause 10.2**  | Continual Improvement          | All modules with version control       | Identify and implement improvements                          |

### 2.4 Why Use Nexus BCMS for ISO 22301 Compliance?

**Evidence Collection** - Every action in Nexus creates auditable records with timestamps and user attribution.

**Traceability** - Link processes → impacts → risks → strategies → procedures → exercises → incidents for complete traceability.

**Compliance Dashboards** - Real-time view of compliance status across multiple frameworks (ISO 22301, DORA, NIS2).

**Version Control** - Maintain complete history of all documents and changes for audit purposes.

**Gap Analysis** - Automatically identify missing documentation or incomplete assessments.

**Regulatory Reporting** - Generate compliance reports in minutes instead of days.

---

## 3. System Architecture & Navigation

### 3.1 Login & Authentication

1. Navigate to the application URL provided by your administrator
2. Enter your **username** and **password**
3. Click **Sign In**

**First-time Users:**

- Contact your BCMS administrator to create an account
- Change your password after first login in Settings

### 3.2 Main Interface Layout

The application uses a **sidebar navigation** layout:

```
┌─────────────┬───────────────────────────────────────────┐
│             │         Top Header Bar                    │
│  SIDEBAR    │  • Page Title                             │
│  MENU       │  • Action Buttons                         │
│             │  • User Profile                           │
│  Dashboard  ├───────────────────────────────────────────┤
│  BIA        │                                           │
│  Resources  │                                           │
│  Strategy   │         MAIN CONTENT AREA                 │
│  Risk       │                                           │
│  People     │         (Dynamic based on selected        │
│  Docs       │          menu item)                       │
│  Incidents  │                                           │
│  Training   │                                           │
│  Reports    │                                           │
│  Settings   │                                           │
└─────────────┴───────────────────────────────────────────┘
```

### 3.3 Sidebar Menu Structure

#### **Dashboard**

- Executive overview with KPIs and visualizations

#### **Business Impact Analysis**

- Process Registry
- Impact Assessment
- Recovery Objectives
- Temporal Analysis
- Dependency Analysis

#### **Resource & Dependencies**

- Resource Registry
- Resource Dependencies
- Process-Resource Mapping

#### **BC Strategy**

- Strategic Resilience Framework
- Recovery Options (Strategies)
- Cost-Benefit Analysis

#### **Risk Management**

- Risk Register
- Threat Analysis
- Risk Treatment Plans

#### **People & Roles**

- BC Team Structure
- Roles & Responsibilities
- Competency Matrix
- Contact Directory

#### **Documentation**

- Documentation Hub
- BCMS Policy
- Procedures Library
- Forms & Templates
- Compliance Matrix
- Approval Workflow

#### **Incident Management**

- Incident Dashboard
- Incident Log

#### **Training & Exercises**

- Exercise Log
- Training Records

#### **Reports**

- BIA Reports
- Risk Matrix
- Compliance Reports
- Recovery Strategy Reports

#### **Settings**

- System Configuration
- Dimension Settings
- User Management
- Organization Settings

### 3.4 Common UI Patterns

#### **Glass Panel Design**

Most content is displayed in translucent "glass panels" with subtle borders and shadows for premium aesthetics.

#### **Action Buttons**

- **Primary Actions** - Solid blue/gold buttons (e.g., "Save", "Create")
- **Secondary Actions** - Outlined glass buttons (e.g., "Cancel", "View")
- **Danger Actions** - Red buttons (e.g., "Delete", "Reject")

#### **Status Indicators**

- 🟢 **Green** - Approved, Compliant, Active, Completed
- 🟡 **Yellow** - In Review, Partial, At Risk
- 🔴 **Red** - Critical, Non-Compliant, Overdue
- 🔵 **Blue** - Draft, Planned, In Progress

#### **Icons**

The system uses Lucide React icons throughout:

- 📊 Charts and dashboards
- ⚠️ Warnings and alerts
- ✓ Confirmations and completions
- ⚙️ Settings and configuration
- 👥 People and teams
- 📄 Documents and files

#### **Tooltips**

Hover over field labels and icons to see helpful tooltips explaining their purpose.

### 3.5 Data Persistence

**Auto-save:** Most forms auto-save as you type or when you navigate away.

**Manual Save:** Some complex forms require clicking "Save" or "Submit" button.

**Unsaved Changes Indicator:** An asterisk (\*) or warning message appears when you have unsaved changes.

### 3.6 Search & Filtering

Most list views include:

- **Search Bar** - Type to filter by name, description, or other text fields
- **Filter Dropdowns** - Filter by status, criticality, department, etc.
- **Sort Options** - Click column headers to sort tables

---

## 4. Business Impact Analysis Module

### 4.1 Purpose & ISO 22301 Alignment

The BIA module directly implements **ISO 22301 Clause 8.2** requirements:

> "The organization shall conduct a business impact analysis to establish business continuity requirements."

The BIA process identifies:

1. Business processes and their criticality
2. Impacts of disruption across multiple dimensions
3. Recovery time objectives (RTO) and recovery point objectives (RPO)
4. Maximum tolerable period of disruption (MTPD)
5. Dependencies between processes and resources

### 4.2 Process Registry

#### **Purpose**

The Process Registry is your organization's **inventory of all business processes**. It's the foundation of your BCMS.

#### **How to Add a Process**

1. Navigate to **Business Impact Analysis → Process Registry**
2. Click **+ Add Process** button
3. Fill in the form:
   - **Process Name** - Descriptive name (e.g., "Customer Order Processing")
   - **Owner** - Person responsible for the process
   - **Department** - Organizational unit (Finance, IT, Operations, etc.)
   - **Description** - What the process does and why it matters
   - **Criticality** - How critical is this process?
     - **Critical** - Mission-critical, cannot function without it
     - **High** - Major impact if disrupted
     - **Medium** - Moderate impact
     - **Low** - Minor impact
     - **Minimal** - Negligible impact
   - **Status** - Current process status
     - **Draft** - Still being documented
     - **In Review** - Under review
     - **Approved** - Approved and active
4. Click **Save Process**

#### **Process List View**

The main view shows a table with:

- Process name
- Department
- Owner
- Criticality (color-coded badge)
- Status
- Actions (Edit, Delete, View Impact)

**Criticality Distribution:** Pie chart shows breakdown of processes by criticality level.

**Department Risk:** Bar chart shows average risk score per department.

#### **Best Practices**

- Start with high-level processes, then break down into sub-processes
- Involve process owners in documenting their processes
- Review and update criticality ratings annually
- Use consistent naming conventions (e.g., verb-noun: "Process Customer Orders")

#### **ISO 22301 Evidence**

✓ Clause 4.4 - Process inventory demonstrates understanding of the organization  
✓ Clause 8.2 - Foundation for impact analysis and recovery planning

### 4.3 Impact Assessment

#### **Purpose**

Evaluate the **multi-dimensional impacts** of process disruption over time.

Nexus uses **6 impact dimensions** by default:

1. **Financial Impact** - Direct costs, revenue loss, fines
2. **Operational Impact** - Productivity loss, service degradation
3. **Reputational Impact** - Brand damage, customer confidence
4. **Legal Impact** - Regulatory violations, contractual breaches
5. **Health & Safety Impact** - Employee/public safety risks
6. **Environmental Impact** - Environmental damage, compliance issues

#### **How to Conduct an Impact Assessment**

1. Navigate to **Business Impact Analysis → Impact Assessment**
2. Select a process from the dropdown
3. For each time point (1h, 4h, 8h, 24h, 48h, 1 week, 4 weeks), rate the impact:
   - **0** - No impact
   - **1** - Minimal impact
   - **2** - Minor impact
   - **3** - Moderate impact
   - **4** - Major impact
   - **5** - Catastrophic impact

4. The system automatically:
   - Calculates weighted impact scores
   - Generates temporal analysis charts
   - Identifies peak impact timeframes
   - Determines MTPD (Maximum Tolerable Period of Disruption)

#### **Understanding the Impact Scale**

**Financial Impact Examples:**

- **1** - <$10k loss
- **2** - $10k-$50k loss
- **3** - $50k-$250k loss
- **4** - $250k-$1M loss
- **5** - >$1M loss

**Operational Impact Examples:**

- **1** - <10% productivity reduction
- **2** - 10-25% productivity reduction
- **3** - 25-50% productivity reduction
- **4** - 50-75% productivity reduction
- **5** - >75% productivity reduction or complete stoppage

**Reputational Impact Examples:**

- **1** - Internal awareness only
- **2** - Minor customer complaints
- **3** - Local media coverage
- **4** - National media coverage
- **5** - International coverage, brand damage

#### **Temporal Analysis Chart**

The chart shows how each impact dimension escalates over time:

- X-axis: Time points (1h → 4 weeks)
- Y-axis: Impact severity (0-5)
- Multiple lines: One per dimension (color-coded)

**Key Insights:**

- Identify which dimensions escalate fastest
- Determine when impacts become unacceptable
- Establish MTPD based on escalation curves

#### **Customizing Impact Dimensions**

Organizations can customize dimensions in **Settings → Dimension Settings**:

- Add custom dimensions (e.g., "Customer Impact", "Data Integrity")
- Adjust dimension weights (must total 100%)
- Define industry-specific severity scales
- Apply industry presets (Financial, Healthcare, E-commerce, Manufacturing, Government)

#### **Best Practices**

- Involve process owners and subject matter experts
- Use consistent assessment criteria across all processes
- Document assumptions and data sources
- Review assessments annually or after major changes
- Consider worst-case scenarios, not average-case

#### **ISO 22301 Evidence**

✓ Clause 8.2.2 - Impact evaluation across multiple dimensions  
✓ Clause 8.2.2(d) - Timeframes for impact assessment  
✓ Clause 8.2.2(e) - Dependencies and resource requirements

### 4.4 Recovery Objectives

#### **Purpose**

Define **target recovery times** for each critical process based on impact analysis.

Three key metrics:

1. **MTPD** (Maximum Tolerable Period of Disruption) - How long before impacts become unacceptable
2. **RTO** (Recovery Time Objective) - Target time to restore process functionality
3. **RPO** (Recovery Point Objective) - Maximum acceptable data loss (time)

#### **How to Set Recovery Objectives**

1. Navigate to **Business Impact Analysis → Recovery Objectives**
2. Select a process
3. Set the objectives:
   - **MTPD (hours)** - Derived from impact assessment, can be manually adjusted
   - **RTO (hours)** - Must be less than MTPD
   - **RPO (hours)** - Based on data criticality and backup frequency
   - **MBCO** (Minimum Business Continuity Objective) - Yes/No - Can you operate at reduced capacity?
4. Select **Recovery Strategy Category**:
   - **Immediate** (<1 hour) - High availability, failover
   - **Rapid** (1-4 hours) - Cloud backup, warm standby
   - **Standard** (4-24 hours) - Cold standby, manual recovery
   - **Extended** (>24 hours) - Manual processes, workarounds
5. Add **Strategy Notes** - Explain the approach
6. Click **Save**

#### **Recovery Objectives Table View**

Shows all processes with:

- Process name
- MTPD, RTO, RPO values
- Recovery strategy
- Status (compliant/at-risk)
- Gap analysis (if strategy cannot meet RTO)

#### **RTO Compliance Analysis**

The system automatically flags **RTO compliance gaps**:

- ⚠️ **Gap Detected** - Recovery strategy cannot meet target RTO
- ✓ **Compliant** - Strategy aligns with RTO

**Example:**

```
Process: Payment Processing
RTO: 2 hours
Recovery Strategy: Standard (4-24 hours)
Status: ⚠️ GAP - Strategy insufficient to meet RTO
```

#### **Best Practices**

- RTO must always be less than MTPD
- Set realistic RTOs based on available resources
- Consider cost vs. speed trade-offs
- Document assumptions (e.g., "Assumes cloud backup is accessible")
- Validate RTOs through testing and exercises

#### **ISO 22301 Evidence**

✓ Clause 8.2.2(b) - Determine prioritization of activities  
✓ Clause 8.2.2(c) - Identify critical resources  
✓ Clause 8.3 - Recovery objectives inform BC strategy selection

### 4.5 Temporal Analysis

#### **Purpose**

Visualize how disruption impacts **escalate over time** to support data-driven MTPD determination.

#### **How to Use**

1. Navigate to **Business Impact Analysis → Temporal Analysis**
2. Select a process
3. View the **Temporal Impact Chart**:
   - Multiple lines showing each dimension's escalation
   - Threshold lines indicating severity levels
   - Peak impact identification
4. Review **Key Metrics**:
   - Time to first major impact (≥3)
   - Time to catastrophic impact (=5)
   - Fastest escalating dimension
   - Suggested MTPD

#### **Interpreting the Chart**

**Gradual Escalation** - Impacts increase slowly over time (e.g., Reputational)

- More time to respond
- Lower urgency for immediate recovery
- May allow for extended recovery strategies

**Rapid Escalation** - Impacts spike quickly (e.g., Financial, Operational)

- High urgency
- Requires rapid or immediate recovery
- Justifies investment in high-availability solutions

#### **Best Practices**

- Use temporal analysis to justify recovery investments
- Show charts to executives to communicate urgency
- Identify "tipping points" where impacts become unacceptable
- Consider cascading effects between dimensions

#### **ISO 22301 Evidence**

✓ Clause 8.2.2(d) - Timeframes for impact determination  
✓ Strategic planning support for Clause 8.3

### 4.6 Dependency Analysis

#### **Purpose**

Map **process-to-process** and **process-to-resource** dependencies to understand cascading impacts.

#### **How to Map Dependencies**

1. Navigate to **Business Impact Analysis → Dependency Analysis**
2. Select a source process
3. Click **+ Add Dependency**
4. Choose:
   - **Target Process** - What this process depends on
   - **Dependency Type**:
     - **Technical** - IT systems, data
     - **Operational** - Workflow, business logic
     - **Resource** - People, facilities
   - **Criticality** - How critical is this dependency? (1-5)
   - **Description** - Explain the dependency
5. Click **Save**

#### **Dependency Visualization**

The system generates an **interactive dependency graph**:

- Nodes represent processes
- Arrows show dependencies (A → B means "A depends on B")
- Colors indicate criticality:
  - 🔴 Red - Critical dependencies (5)
  - 🟡 Yellow - High dependencies (4)
  - 🔵 Blue - Medium dependencies (3)
  - 🟢 Green - Low dependencies (1-2)

**Cascading Impact Analysis:**
If Process B fails, all processes that depend on B are highlighted, showing potential cascading failures.

#### **Best Practices**

- Start with critical processes and map their dependencies first
- Document both upstream (what it depends on) and downstream (what depends on it)
- Review dependencies during process changes
- Use for incident response planning (what fails if X fails?)

#### **ISO 22301 Evidence**

✓ Clause 8.2.2(f) - Identify dependencies and supporting resources  
✓ Clause 8.2 - Support process prioritization

---

## 5. Resource & Dependency Management

### 5.1 Purpose & ISO 22301 Alignment

The Resource module supports **ISO 22301 Clause 8.2.2(c)**:

> "Identify critical resources to support prioritized activities."

Critical resources include:

- **People** - Key personnel with critical skills
- **Systems** - IT infrastructure, applications
- **Facilities** - Buildings, data centers
- **Vendors** - Third-party suppliers

### 5.2 Resource Registry

#### **How to Add a Resource**

1. Navigate to **Resource & Dependencies → Resource Registry**
2. Click **+ Add Resource**
3. Fill in the form:
   - **Resource Name** - Descriptive name
   - **Type** - People, Systems, Facilities, or Vendors
   - **Description** - Purpose and importance
   - **RTO** - How quickly must this resource be recovered? (value + unit)
   - **RPO** (optional) - For data resources
   - **Redundancy Level**:
     - **None** - Single point of failure
     - **Partial** - Some backup/redundancy
     - **Full** - Complete redundancy/failover
   - **Recovery Procedure** - How to restore this resource
4. Click **Save**

#### **Vendor Resources**

For vendor/supplier resources, additional fields:

- Vendor Name
- Contract Reference
- Contact Person (name, email, phone)
- Guaranteed RTO (per SLA)
- Availability % (uptime commitment)
- Support Hours
- Penalty Clause (SLA penalties)

#### **Resource Workarounds**

Define **manual workarounds** if resource is unavailable:

- Workaround Title
- Description
- RTO Impact (additional time required)
- Activation Time
- Step-by-step instructions

#### **Best Practices**

- Maintain complete vendor contact information
- Review SLAs annually
- Document workarounds for all single points of failure
- Track resource end-of-life dates
- Map resource owners/administrators

#### **ISO 22301 Evidence**

✓ Clause 8.2.2(c) - Critical resource identification  
✓ Clause 8.3.3 - Recovery strategies for resources

### 5.3 Resource Dependencies

#### **Purpose**

Map dependencies **between resources** (e.g., Application depends on Database Server).

#### **How to Map Resource Dependencies**

1. Navigate to **Resource & Dependencies → Resource Dependencies**
2. View the **visual dependency map** (React Flow diagram)
3. Click **+ Add Dependency**
4. Select:
   - **Source Resource** - What depends on something
   - **Target Resource** - What it depends on
   - **Dependency Type** - Technical, Operational, Resource
   - **Is Blocking?** - Yes if target must be restored first
   - **Description**
5. Click **Save**

#### **Dependency Visualization**

Interactive node-and-edge diagram:

- Drag nodes to rearrange layout
- Zoom in/out
- Click nodes for details
- Click edges to view dependency details

**Cascading Analysis:**

- Highlight a resource to see all dependent resources
- Identify single points of failure
- Determine recovery sequencing

#### **Best Practices**

- Start with system architecture diagrams
- Involve IT teams in mapping technical dependencies
- Use for DR (Disaster Recovery) planning
- Update after infrastructure changes

#### **ISO 22301 Evidence**

✓ Clause 8.2.2(f) - Dependencies and supporting resources  
✓ Clause 8.3 - Inform recovery strategy sequencing

### 5.4 Process-Resource Mapping

#### **Purpose**

Link processes to the resources they require, specifying criticality and quantity.

#### **How to Map Process-Resource Links**

1. Navigate to **Resource & Dependencies → Process-Resource Mapping**
2. Select a process
3. Click **+ Link Resource**
4. Specify:
   - **Resource** - Select from Resource Registry
   - **Criticality** - How critical is this resource to the process?
     - **Essential** - Process cannot run without it
     - **Important** - Major degradation if unavailable
     - **Useful** - Minor impact if unavailable
   - **Quantity Required** - How many units needed? (e.g., 3 people, 2 servers)
   - **Notes** - Additional context
5. For **tiered requirements**, define different quantities for different recovery phases:
   - **Immediate** (0-1h) - Minimum critical resources
   - **Short-term** (1-24h) - Reduced operations
   - **Medium-term** (1-7 days) - Near-normal operations
   - **Long-term** (>7 days) - Full operations
6. Click **Save**

#### **Process-Resource Matrix View**

Table showing:

- Rows = Processes
- Columns = Resources
- Cells = Criticality + Quantity

**Use Cases:**

- Capacity planning (do we have enough resources?)
- Dependency analysis (which processes share resources?)
- Recovery prioritization (restore critical shared resources first)

#### **Best Practices**

- Define minimum resource requirements for each process
- Identify shared resources (contention risk)
- Plan for tiered recovery (not everything needs immediate full restoration)
- Consider alternate resources/workarounds

#### **ISO 22301 Evidence**

✓ Clause 8.2.2(c) - Link resources to prioritized activities  
✓ Clause 8.3.4 - Resource allocation in BC procedures

---

## 6. Risk & Threat Management

### 6.1 Purpose & ISO 22301 Alignment

The Risk module implements **ISO 22301 Clause 6.1**:

> "The organization shall identify risks and opportunities that need to be addressed."

And **Clause 8.2.1**:

> "The organization shall establish and implement a risk assessment process."

### 6.2 Risk Register

#### **Purpose**

Maintain a centralized register of **operational risks** that could disrupt business continuity.

#### **How to Add a Risk**

1. Navigate to **Risk Management → Risk Register**
2. Click **+ Add Risk**
3. Fill in the form:
   - **Risk Title** - Concise description
   - **Category**:
     - **Operational** - Process failures, human error
     - **Technical** - IT system failures, cyber attacks
     - **Natural** - Floods, earthquakes, pandemics
     - **Financial** - Budget cuts, market crashes
     - **Legal** - Regulatory changes, lawsuits
     - **Reputational** - Negative publicity
     - **Security** - Physical security breaches
   - **Description** - Detailed risk description
   - **Affected Processes** - Which processes are impacted?
   - **Likelihood** (1-5):
     - **1** - Rare (once in 10+ years)
     - **2** - Unlikely (once in 5-10 years)
     - **3** - Possible (once in 1-5 years)
     - **4** - Likely (once per year)
     - **5** - Almost Certain (multiple times per year)
   - **Impact** (1-5):
     - **1** - Negligible
     - **2** - Minor
     - **3** - Moderate
     - **4** - Major
     - **5** - Catastrophic
   - **Risk Score** - Auto-calculated: Likelihood × Impact
4. For **quantitative analysis**, add:
   - **Probability** (0.0 to 1.0) - Decimal probability of occurrence
   - **Minimum Financial Impact** - Best case loss
   - **Most Likely Impact** - Expected loss
   - **Maximum Financial Impact** - Worst case loss
5. Click **Save**

#### **Risk Matrix Visualization**

Standard 5×5 risk matrix:

- X-axis: Likelihood (1-5)
- Y-axis: Impact (1-5)
- Color zones:
  - 🟢 **Green** - Low risk (scores 1-4)
  - 🟡 **Yellow** - Medium risk (scores 5-9)
  - 🟠 **Orange** - High risk (scores 10-15)
  - 🔴 **Red** - Critical risk (scores 16-25)

#### **Monte Carlo Risk Simulation**

For advanced quantitative analysis:

1. Ensure risks have probability and impact ranges defined
2. Click **Run Simulation** button
3. The system runs **5,000 Monte Carlo iterations** to calculate:
   - **Value at Risk (VaR)** - Expected maximum loss at 95% confidence
   - **Expected Annual Loss (EAL)** - Average loss per year
   - **Loss Distribution** - Histogram of potential losses
   - **Cumulative Probability** - Likelihood of losses exceeding thresholds

**Interpreting Results:**

```
VaR (95%): $850,000
This means: There is a 5% chance annual losses will exceed $850K.

Expected Annual Loss: $275,000
This means: On average, expect $275K in risk-related losses per year.
```

**Use Case:** Justify BC investment by comparing cost vs. potential losses.

#### **Best Practices**

- Conduct risk assessments annually
- Involve cross-functional teams
- Focus on business continuity risks (not all enterprise risks)
- Link risks to specific processes
- Use quantitative analysis for financial justification
- Update after significant events or process changes

#### **ISO 22301 Evidence**

✓ Clause 6.1 - Risk identification and assessment  
✓ Clause 8.2.1 - Risk assessment process  
✓ Financial justification for BC investments

### 6.3 Threat Analysis

#### **Purpose**

Identify specific **threat scenarios** that could trigger business disruptions.

#### **How to Conduct Threat Analysis**

1. Navigate to **Risk Management → Threat Analysis**
2. Click **+ Add Threat**
3. Define:
   - **Threat Name** - Specific scenario (e.g., "Ransomware Attack on File Server")
   - **Category** - Similar to risk categories
   - **Source**:
     - **Internal** - Human error, equipment failure
     - **External** - Natural disasters, cyber attacks, supplier failures
   - **Likelihood** (1-5)
   - **Impact** (1-5)
   - **Vulnerability** (1-5) - How vulnerable is the organization?
     - **1** - Strong controls in place
     - **3** - Moderate controls
     - **5** - Weak or no controls
   - **Threat Score** - Auto-calculated: (Likelihood × Impact × Vulnerability) / 5
   - **Affected Assets** - Which resources/processes are targeted?
   - **Mitigation Measures** - Existing controls
   - **Recommended Actions** - Additional controls needed
4. Click **Save**

#### **Threat Dashboard**

Visual analytics:

- **Threat Heat Map** - Visualize likelihood vs. impact
- **Vulnerability Assessment** - Which threats have weakest controls?
- **Top Threats** - Ranked by threat score
- **Threat Trends** - Track threat landscape over time

#### **Best Practices**

- Use threat intelligence sources (industry reports, government advisories)
- Consider emerging threats (e.g., climate change, geopolitical risks)
- Link threats to specific vulnerabilities
- Conduct threat modeling workshops with stakeholders
- Review after security incidents or near-misses

#### **ISO 22301 Evidence**

✓ Clause 8.2.1 - Comprehensive risk assessment including threat analysis  
✓ Clause 8.3 - Threats inform BC strategy selection

### 6.4 Risk Treatment Plans

#### **Purpose**

Define how you will **treat identified risks** - avoid, reduce, transfer, or accept.

#### **How to Create a Risk Treatment Plan**

1. Navigate to **Risk Management → Risk Treatment**
2. Select a risk
3. Choose **Treatment Strategy**:
   - **Avoid** - Eliminate the risk by changing the process
   - **Reduce** - Implement controls to reduce likelihood or impact
   - **Transfer** - Use insurance or contracts to transfer financial impact
   - **Accept** - Accept the risk and plan for consequences
4. Define **Treatment Actions**:
   - Action Description
   - Owner (responsible person)
   - Due Date
   - Status (Not Started, In Progress, Completed)
   - Cost (estimated)
5. Set **Target Risk Score** - What will the risk score be after treatment?
6. Track **Residual Risk** - Risk remaining after treatment
7. Click **Save**

#### **Treatment Progress Dashboard**

Track:

- Treatment completion % across all risks
- Overdue actions
- Treatment costs vs. budget
- Risk reduction achieved (current vs. target scores)

#### **Best Practices**

- Prioritize high and critical risks for treatment
- Assign clear ownership
- Set realistic timelines
- Monitor treatment effectiveness
- Re-assess risks after treatment implementation
- Document risk acceptance decisions with executive approval

#### **ISO 22301 Evidence**

✓ Clause 6.1.2 - Actions to address risks  
✓ Clause 8.2.1 - Risk treatment planning  
✓ Clause 9.3 - Management review of risk status

---

## 7. Business Continuity Strategy

### 7.1 Purpose & ISO 22301 Alignment

The BC Strategy module implements **ISO 22301 Clause 8.3**:

> "The organization shall determine appropriate business continuity strategies and solutions."

### 7.2 Strategic Resilience Framework (Dashboard)

#### **Purpose**

Provide an **executive-level view** of organizational resilience across 9 dimensions:

1. **Process Maturity** - Completeness of BIA documentation
2. **Risk Management** - Risk identification and treatment
3. **Resource Adequacy** - Availability of critical resources
4. **Technology Resilience** - IT infrastructure robustness
5. **People Preparedness** - Training and competency levels
6. **Documentation Quality** - BC plan completeness
7. **Testing Frequency** - Exercise cadence
8. **Financial Preparedness** - BC budget adequacy
9. **Governance Oversight** - Management engagement

#### **Dashboard Components**

**Overall Resilience Score (0-100)**

- Color-coded:
  - 🟢 **80-100** - Excellent
  - 🔵 **60-79** - Good
  - 🟡 **40-59** - Fair
  - 🔴 **0-39** - At Risk

**Quick Metrics Panel:**

- Strategy Coverage % (processes with defined strategies)
- RTO Compliance % (strategies meeting target RTOs)
- Risk Mitigation % (risks with treatment plans)
- Investment ROI %
- Readiness Score (/100)

**Four-Panel Coverage Grid:**

1. **Coverage Analysis**
   - Impact Assessment Coverage %
   - Recovery Objectives Coverage %
   - Recovery Strategies Coverage %

2. **Compliance Status**
   - RTO Compliance % (most critical metric)
   - Risk Mitigation %
   - Threat Coverage %

3. **Financial Analysis**
   - Total Implementation Cost
   - Annual Benefit
   - ROI %
   - Payback Period

4. **Readiness Assessment**
   - Overall Readiness Score
   - Testing Coverage %
   - Modern Technology Adoption %

**Recovery Capability Chart**
Bar chart showing distribution of strategies across recovery tiers:

- 🟢 **Immediate** (<1h) - High-availability solutions
- 🔵 **Rapid** (1-4h) - Cloud backup, warm standby
- 🟡 **Standard** (4-24h) - Cold standby, tape backup
- 🔴 **Extended** (>24h) - Manual workarounds

**Critical Gaps Section**
Automated gap detection highlights:

- ⚠️ **RTO Compliance Gaps** - Processes that can't meet target RTO
- ⚠️ **Open Risks** - Risks without treatment plans
- ⚠️ **Capacity Risks** - Insufficient personnel
- ⚠️ **Vendor Risks** - Over-reliance on single suppliers
- ⚠️ **Critical Threats** - High-score threats without mitigation

**Resilience Radar Chart**
9-axis radar showing current maturity level (gold line) vs. target levels (green line) for each dimension.

#### **Dimension Settings**

To customize resilience targets:

1. Click **Dimension Settings** button in header
2. Two tabs available:

**Tab 1: Dimension Targets**
For each dimension, set:

- **Target Level** (1-5) - Where do you want to be?
- **Timeline** - When to achieve this target
- **Owner** - Who is responsible
- **Business Context** - Why is this dimension important?
- **Success Criteria** - How will you measure success?

**Tab 2: Weighting**
Adjust dimension weights based on your priorities:

- Slide bars to adjust weights (must total 100%)
- Apply **Industry Presets**:
  - **Financial Services** - Higher weight on technology and governance
  - **Healthcare** - Emphasizes people and compliance
  - **E-commerce** - Focuses on technology and customer impact
  - **Manufacturing** - Prioritizes resource and supply chain
  - **Government** - Governance and compliance focus

3. Click **Save Settings**

**Gap Analysis Section**
Table showing progress toward targets:

- Current Level vs. Target Level
- Gap percentage
- Status (Complete, On Track, At Risk)
- Owner
- Timeline

**Click any row** to edit dimension settings.

#### **Best Practices**

- Review resilience dashboard monthly in management meetings
- Set realistic targets (don't aim for Level 5 on everything)
- Focus improvements on highest-gap dimensions
- Use financial analysis to justify budget requests
- Track trends over time (is resilience improving?)

#### **ISO 22301 Evidence**

✓ Clause 9.1 - Performance monitoring and measurement  
✓ Clause 9.3 - Management review input  
✓ Clause 10.2 - Continual improvement tracking

### 7.3 Recovery Options (Strategies)

#### **Purpose**

Define **specific recovery strategies** for each critical process.

#### **How to Define a Recovery Strategy**

1. Navigate to **BC Strategy → Recovery Options**
2. Select a process
3. Click **+ Add Strategy**
4. Specify:
   - **Strategy Name** - Descriptive title
   - **Recovery Tier**:
     - **Immediate** (<1h) - HA clusters, active-active failover
     - **Rapid** (1-4h) - Cloud DR, warm standby sites
     - **Standard** (4-24h) - Cold standby, backup restoration
     - **Extended** (>24h) - Manual processes, alternate locations
   - **Technology Approach**:
     - **High Availability** - Redundant systems, load balancing
     - **Cloud Backup** - AWS/Azure backup services
     - **Replication** - Real-time or scheduled data replication
     - **Backup/Restore** - Traditional backup tapes/disks
     - **Manual Workaround** - Procedures for manual processing
     - **Alternate Site** - Secondary facility
   - **Description** - Detailed explanation of how recovery works
   - **RTO Target** - How quickly can this strategy recover? (hours)
   - **RPO Achieved** - What data loss is acceptable? (hours)
   - **Dependencies** - Prerequisites for this strategy to work
   - **Activation Criteria** - When to invoke this strategy
   - **Key Steps** - High-level recovery steps
5. Click **Save**

#### **Strategy Comparison Matrix**

Table comparing strategies across:

- Recovery Time
- Cost (CapEx + OpEx)
- Complexity
- Resource Requirements
- Maturity/Readiness

**Use Case:** Justify why you selected a particular strategy (cost vs. speed trade-off).

#### **Best Practices**

- Match strategy tier to process criticality
- Document assumptions (network available, staff accessible)
- Define activation criteria clearly
- Include rollback procedures
- Test strategies through exercises
- Consider hybrid approaches (primary + fallback strategies)

#### **ISO 22301 Evidence**

✓ Clause 8.3.2 - Choice of BC strategies  
✓ Clause 8.3.3 - Resource requirements for strategies  
✓ Clause 8.3.4 - BC procedures to implement strategies

### 7.4 Cost-Benefit Analysis (CBA)

#### **Purpose**

Financially justify BC strategy investments by comparing costs vs. benefits.

#### **How to Conduct a CBA**

1. Navigate to **BC Strategy → Cost-Benefit Analysis**
2. Click **+ New Analysis**
3. Link to a recovery strategy
4. Define **Implementation Costs**:
   - **Personnel** - FTE costs, consultants
   - **Technology** - Hardware, software licenses, cloud services
   - **Training** - Staff training expenses
   - **Testing** - Exercise and drill costs
   - **Other** - Miscellaneous costs
5. Define **Annual Operating Costs**:
   - **Personnel** - Ongoing staff costs
   - **Technology** - Subscriptions, maintenance
   - **Training** - Ongoing training
   - **Testing** - Annual testing costs
6. Define **Annual Benefits**:
   - **Avoided Financial Losses** - Revenue/losses prevented by BC capability
   - **Operational Efficiency** - Process improvements
   - **Reputational Benefit** - Customer confidence gains
   - **Regulatory Compliance** - Avoid fines/penalties
   - **Other Benefits**
7. Set **Analysis Period** (years) - Typically 3-5 years
8. The system calculates:
   - **Total Investment** (CapEx + OpEx over period)
   - **Total Benefits** (cumulative over period)
   - **Net Present Value (NPV)** - Discounted cash flow
   - **ROI %** - Return on investment
   - **Payback Period** - Months until break-even
9. Add **Qualitative Factors** - Non-financial benefits
10. Click **Save**

#### **CBA Dashboard**

Visual reports:

- Investment vs. Benefit comparison (bar chart)
- Cumulative cash flow over time (line chart)
- ROI % by strategy (comparison)
- Payback period analysis

**CBA Summary Table:**
| Strategy | Investment | Annual Benefit | ROI % | Payback | Status |
|----------|-----------|----------------|-------|---------|--------|
| Cloud DR | $250K | $180K | 72% | 16.7 mo | ✓ Approved |
| HA Cluster | $500K | $300K | 60% | 20 mo | In Review |
| Manual Workaround | $25K | $50K | 100% | 6 mo | ✓ Approved |

#### **Best Practices**

- Include **all costs** (hidden costs like training, change management)
- Be conservative with benefit estimates
- Use industry benchmarks for loss estimates
- Consider intangible benefits (brand protection, employee morale)
- Present to CFO/finance committee for budget approval
- Update annually based on actual costs/benefits

#### **ISO 22301 Evidence**

✓ Clause 8.3.2 - Justification for strategy selection  
✓ Clause 9.3 - Management review of BC performance  
✓ Financial governance and resource allocation

---

## 8. People & Roles Management

### 8.1 Purpose & ISO 22301 Alignment

The People module supports **ISO 22301 Clause 7.2**:

> "The organization shall determine the necessary competence of person(s) doing work that affects BC performance."

And **Clause 8.4.2**:

> "The organization shall ensure that its BCMS includes defined roles, responsibilities, and authorities."

### 8.2 BC Team Structure

#### **Purpose**

Define the **organizational structure** for business continuity management using an interactive drag-and-drop interface.

#### **How to Build BC Team Structure**

1. Navigate to **People & Roles → BC Team Structure**
2. View the **organigram canvas** with default teams:
   - Crisis Management Team (CMT)
   - IT Recovery Team
   - Communications Team
3. **Add a new team:**
   - Click **+ Add Team** button
   - Specify Team Name, Level (Executive/Operational/Strategic)
   - Click **Create**
4. **Define roles within teams:**
   - Click on a team node
   - Click **+ Add Role**
   - Specify Role Title (e.g., "Crisis Manager", "IT Recovery Lead")
   - Add Role Description
   - Define Responsibilities
   - Click **Save**
5. **Assign people to roles:**
   - View **People Pool** sidebar (shows available personnel from bc_people table)
   - **Drag a person** from the sidebar
   - **Drop onto a role slot** in the team node
   - Person is now assigned to that role
   - Click **× button** to remove an assignment
6. Layout is auto-saved as you make changes

#### **Team Node Components**

Each team node displays:

- Team Name
- Team Level badge (color-coded)
- Role slots showing:
  - Role title
  - Assigned person (avatar + name)
  - Empty slot indicator if unassigned

**Visual Indicators:**

- 🟢 **Green border** - All roles filled
- 🟡 **Yellow border** - Some roles unfilled
- 🔴 **Red border** - Critical roles unfilled

#### **Best Practices**

- Define primary and backup roles (succession planning)
- Ensure 24/7 coverage for critical roles
- Document role prerequisites (skills, clearances)
- Review team structure after organizational changes
- Conduct team roster exercises to test call-out procedures

#### **ISO 22301 Evidence**

✓ Clause 8.4.2(a) - Defined roles and responsibilities  
✓ Clause 8.4.2(b) - Authority to execute BC procedures  
✓ Clause 7.2 - Competence of BC personnel

### 8.3 Roles & Responsibilities

#### **Purpose**

Document detailed role descriptions and responsibilities for BC team members.

#### **How to Define Roles**

1. Navigate to **People & Roles → Roles & Responsibilities**
2. Click **+ Add Role**
3. Fill in:
   - **Role Title** - Standardized title
   - **Category**:
     - **Executive** - Strategic decision-making
     - **Operational** - Tactical execution
     - **Support** - Coordination and support
   - **Level**:
     - **Strategic** - Board/C-suite level
     - **Tactical** - Management level
     - **Operational** - Team member level
   - **Description** - Overview of the role
   - **Key Responsibilities** (list):
     - During Normal Operations
     - During Disruption
     - During Recovery
   - **Required Competencies**:
     - Technical skills
     - Certifications
     - Experience level
   - **Decision Authority** - What can this role decide?
   - **Reporting Relationship** - Who does this role report to?
   - **24/7 Availability Required?** - Yes/No
   - **Succession Plan** - Who backs up this role?
4. Click **Save**

#### **Role Matrix View**

Table showing:

- Role Title
- Category
- Number of people assigned
- Vacancy status
- Training compliance

#### **Best Practices**

- Use RACI matrix for clarity (Responsible, Accountable, Consulted, Informed)
- Define escalation paths
- Document decision-making authority limits
- Ensure backup personnel for all critical roles
- Review roles annually and after major incidents

#### **ISO 22301 Evidence**

✓ Clause 8.4.2 - BC roles and responsibilities  
✓ Clause 7.2 - Required competence documentation

### 8.4 Competency Matrix

#### **Purpose**

Track the **skills and competencies** required for BC roles and assess personnel readiness.

#### **How to Manage Competencies**

1. Navigate to **People & Roles → Competency Matrix**
2. **Define Required Competencies:**
   - Click **+ Add Competency**
   - Specify Competency Name (e.g., "Incident Command", "Crisis Communication")
   - Define Proficiency Levels:
     - **1 - Basic** - Awareness level
     - **2 - Intermediate** - Can perform with guidance
     - **3 - Advanced** - Can perform independently
     - **4 - Expert** - Can teach others
   - Link to roles that require this competency
   - Click **Save**
3. **Assess Personnel:**
   - Select a person
   - Rate their proficiency for each competency
   - Add assessment date and assessor name
   - Identify training gaps
4. **View Competency Heatmap:**
   - Rows = People
   - Columns = Competencies
   - Cell colors = Proficiency level (red=gap, green=proficient)

#### **Competency Gap Analysis**

Automated reports showing:

- Roles with insufficient trained personnel
- Skills gaps across the organization
- Training priorities
- Succession planning risks

#### **Best Practices**

- Conduct annual competency assessments
- Link training to competency development
- Track certifications and expirations
- Plan for knowledge transfer (experts train intermediates)
- Consider competency in promotion decisions

#### **ISO 22301 Evidence**

✓ Clause 7.2 - Competence determination and records  
✓ Clause 7.3 - Awareness and training effectiveness  
✓ Clause 9.1 - Competence monitoring

### 8.5 Contact Directory

#### **Purpose**

Maintain **up-to-date contact information** for all BC team members and key stakeholders.

#### **How to Manage Contacts**

1. Navigate to **People & Roles → Contact Directory**
2. View list of all BC personnel
3. Click on a person to view/edit:
   - **Basic Information:**
     - Full Name
     - Job Title
     - Department
     - Email Address
     - Office Phone
     - Mobile Phone
     - Emergency Contact
   - **BC Role Assignments:**
     - Primary Role
     - Backup Roles
     - Team Memberships
   - **Availability:**
     - 24/7 On-Call? Yes/No
     - Time Zone
     - Preferred Contact Method
   - **Status:**
     - Active/Inactive
     - Last Updated Date
4. **Export Contact List:**
   - Click **Export** button
   - Download PDF or Excel file
   - Print wallet cards for easy reference

#### **Contact Verification**

Schedule automatic reminders to verify contact information:

- Quarterly email to all personnel: "Please verify your contact info"
- Track verification date
- Flag outdated contacts (>6 months since verification)

#### **Best Practices**

- Update contacts immediately after personnel changes
- Include multiple contact methods (phone, email, SMS)
- Maintain printed copies in BC kits
- Verify contact information quarterly
- Protect sensitive contact data (access controls)
- Include vendor/supplier key contacts

#### **ISO 22301 Evidence**

✓ Clause 8.4.2 - Communication arrangements  
✓ Clause 8.4 - BC procedures include contact information

---

## 9. Documentation & Compliance

### 9.1 Purpose & ISO 22301 Alignment

The Documentation module implements **ISO 22301 Clause 7.5**:

> "The organization shall create and maintain documented information to the extent necessary to have confidence that the processes are being carried out as planned."

And **Clause 8.4**:

> "The organization shall establish, document, implement and maintain BC plans and procedures."

### 9.2 Documentation Hub

#### **Purpose**

Centralized repository for all BCMS documentation with version control, approval workflows, and compliance tracking.

#### **How to Access Documentation Hub**

1. Navigate to **Documentation → Documentation Hub**
2. Three main views available:
   - **Document List** - Browse all documents
   - **Document Editor** - Create/edit documents
   - **Version History** - Track changes over time

#### **Document List View**

Shows all BCMS documents with:

- Document Title
- Type (Policy, Procedure, Plan, Form, Template)
- Status (Draft, In Review, Approved, Archived)
- Version Number
- Last Modified Date
- Owner
- Actions (View, Edit, Delete, Export)

**Filters:**

- Document Type
- Status
- Owner
- Date Range

**Search:**
Type to search by title, content, or tags.

#### **How to Create a Document**

1. Click **+ New Document** button
2. Fill in:
   - **Title** - Descriptive title
   - **Type**:
     - **Policy** - High-level governance documents
     - **Procedure** - Step-by-step instructions
     - **Plan** - BC plans, DR plans
     - **Form** - Data collection forms
     - **Template** - Reusable templates
   - **Category**:
     - BCMS
     - Incident Response
     - Recovery
     - Training
     - Risk Management
   - **Description** - Purpose and scope
   - **Content** - Rich text editor with:
     - Formatting (bold, italic, headings)
     - Lists (bullet, numbered)
     - Tables
     - Links
     - Images
   - **Tags** - Keywords for searchability
   - **Owner** - Document owner/author
   - **Approvers** - List of people who must approve
   - **Review Date** - When document should be reviewed next
3. Click **Save Draft** or **Submit for Approval**

#### **Document Editor Features**

**Rich Text Editing:**

- Markdown support
- WYSIWYG editor
- Insert tables, images, links
- Format text (headings, lists, quotes)

**Template Variables:**
Auto-populate fields from system data:

- `{{organization.name}}` - Organization name
- `{{process.name}}` - Process name
- `{{process.owner}}` - Process owner
- `{{process.rto}}` - RTO value
- `{{current.date}}` - Today's date

**Collaboration Features:**

- Comments and suggestions
- Track changes
- @mention team members
- Attach related documents

#### **Version Control**

Every document edit creates a new version:

- Version number increments automatically
- Change summary required
- Full audit trail:
  - What changed
  - Who changed it
  - When it was changed
  - Why (change comment)
- Ability to revert to previous version
- Compare versions side-by-side

#### **Best Practices**

- Use templates for consistency
- Include document control information (version, date, owner)
- Link documents to related processes/risks
- Review documents annually
- Archive outdated documents (don't delete - maintain history)
- Use meaningful version comments

#### **ISO 22301 Evidence**

✓ Clause 7.5 - Documented information requirements  
✓ Clause 8.4 - BC plans and procedures documented  
✓ Clause 4.4 - BCMS scope and policy documented

### 9.3 BCMS Policy

#### **Purpose**

Define the **top-level governance** document for your BCMS.

#### **How to Create BCMS Policy**

1. Navigate to **Documentation → BCMS Policy**
2. If no policy exists, click **Create Policy**
3. Use the provided template structure:

**Section 1: Policy Statement**

- Purpose and scope of BCMS
- Commitment to BC
- Policy objectives

**Section 2: Scope**

- Organizational units covered
- Processes in scope
- Exclusions (if any)

**Section 3: BC Objectives**

- Strategic goals for BC program
- Target metrics (e.g., RTO ≤ 4 hours for critical processes)

**Section 4: Roles & Responsibilities**

- Executive sponsor
- BC Manager
- Process owners
- All employees

**Section 5: Policy Compliance**

- Consequences of non-compliance
- Exception process

**Section 6: Policy Review**

- Review frequency (annually)
- Approval authority

4. Submit for executive approval
5. Publish once approved

#### **Best Practices**

- Get CEO or Board approval for credibility
- Keep policy concise (2-3 pages)
- Communicate policy to all employees
- Review annually or after major changes
- Link policy to strategic objectives

#### **ISO 22301 Evidence**

✓ Clause 5.2 - BC policy defined and communicated  
✓ Clause 5.3 - Organizational roles and responsibilities

### 9.4 Procedures Library

#### **Purpose**

Maintain detailed **step-by-step procedures** for BC operations.

#### **Procedure Types**

1. **Response Procedures**
   - Initial incident response
   - Damage assessment
   - Notification and escalation
   - Crisis management activation

2. **Recovery Procedures**
   - Process-specific recovery steps
   - System recovery procedures
   - Data restoration procedures
   - Failover procedures

3. **Workaround Procedures**
   - Manual processing instructions
   - Alternate resource utilization
   - Temporary solutions

4. **Testing Procedures**
   - Exercise planning and execution
   - Test scenarios and scripts
   - Evaluation criteria

#### **How to Create a Procedure**

1. Navigate to **Documentation → Procedures Library**
2. Click **+ New Procedure**
3. Use standard procedure format:

**Header:**

- Procedure ID
- Title
- Version
- Effective Date
- Owner
- Approval

**Body:**

- **Purpose** - Why this procedure exists
- **Scope** - When to use it
- **Roles** - Who performs what
- **Prerequisites** - Conditions before starting
- **Steps** - Numbered sequential steps
- **Decision Points** - If/then logic
- **Forms** - Reference to required forms
- **References** - Related documents

4. Submit for approval

#### **Procedure Checklist Format**

For operational procedures, use checklist format:

```
☐ Step 1: Action to perform
  Expected outcome: [describe]

☐ Step 2: Next action
  If yes: proceed to Step 3
  If no: escalate to [role]

☐ Step 3: Final step
  Documentation required: [form name]
```

#### **Best Practices**

- Use action verbs (check, notify, restore, verify)
- Include screenshots or diagrams
- Define success criteria for each step
- Specify timing (Step 1: 0-15 min, Step 2: 15-30 min)
- Test procedures through exercises
- Update after every exercise based on lessons learned

#### **ISO 22301 Evidence**

✓ Clause 8.4.3 - BC procedures for incident response  
✓ Clause 8.4.4 - Recovery procedures

### 9.5 Forms & Templates

#### **Purpose**

Standardized forms for data collection and consistent documentation.

#### **Available Templates**

1. **Business Impact Analysis Questionnaire**
   - Process information collection form
   - Impact assessment form
   - Recovery objective worksheet

2. **Risk Assessment Form**
   - Risk identification form
   - Risk analysis worksheet

3. **Incident Report Form**
   - Initial incident notification
   - Situation report (SITREP) template
   - Incident closure report

4. **Exercise Forms**
   - Exercise planning form
   - Participant roster
   - Observer evaluation form
   - After-action report (AAR) template

5. **BC Plan Templates**
   - Business Continuity Plan (BCP) structure
   - IT Disaster Recovery Plan (DRP) structure
   - Crisis Communication Plan template

6. **Meeting Templates**
   - Management review agenda
   - Crisis management meeting minutes
   - Action item tracker

#### **How to Use Templates**

1. Navigate to **Documentation → Forms & Templates**
2. Browse template library
3. Click **Use Template** button
4. Fill in template fields
5. Auto-populated fields pull from system data
6. Save as new document

#### **Best Practices**

- Customize templates to your organization
- Include instructions/help text in templates
- Version control templates separately
- Train users on template usage
- Collect feedback and improve templates

#### **ISO 22301 Evidence**

✓ Clause 7.5.3 - Control of documented information  
✓ Standardized documentation across the organization

### 9.6 Compliance Matrix

#### **Purpose**

Map your BCMS documentation to **regulatory requirements** across multiple frameworks.

#### **Supported Frameworks**

1. **ISO 22301:2019** - Business Continuity Management
2. **DORA** (Digital Operational Resilience Act) - EU financial services
3. **NIS2** (Network and Information Security Directive) - EU critical infrastructure
4. **AI Act** (EU) - AI risk management

#### **How to Use Compliance Matrix**

1. Navigate to **Documentation → Compliance Matrix**
2. View requirements by framework:
   - **Framework Filter** - Select ISO 22301, DORA, NIS2, or AI Act
   - **Status Filter** - Filter by compliance status
3. For each requirement, view:
   - Clause/Article reference
   - Requirement title
   - Description
   - Required document type
   - Priority (Critical, High, Medium, Low)
   - Current status:
     - ✓ **Compliant** - Document exists and is current
     - ⚠️ **Partial** - Document exists but incomplete
     - ✗ **Non-Compliant** - Document missing or outdated
     - ○ **Not Assessed** - Not yet evaluated
     - N/A **Not Applicable** - Requirement doesn't apply
   - Linked document
   - Last reviewed date
   - Reviewer name
4. Click on a requirement to:
   - View detailed description
   - Link to existing document
   - Create new document from template
   - Add reviewer notes
   - Update status

#### **Compliance Dashboard**

Visual analytics:

- **Overall Compliance %** - Across all frameworks
- **Framework Breakdown** - Pie chart by framework
- **Status Distribution** - Bar chart of compliant/partial/non-compliant
- **Priority Gap Analysis** - Critical requirements that are non-compliant
- **Trend Over Time** - Line chart showing compliance improvement

#### **Gap Reporting**

Generate compliance gap reports:

- Identify missing documentation
- Prioritize remediation based on risk
- Assign owners to close gaps
- Track gap closure progress

#### **Best Practices**

- Conduct quarterly compliance reviews
- Assign compliance owners to each requirement
- Use templates to speed up gap closure
- Maintain evidence files (link supporting documents)
- Prepare compliance reports for audits
- Update after regulatory changes

#### **ISO 22301 Evidence**

✓ Demonstrates systematic approach to compliance  
✓ Supports certification audit preparation  
✓ Enables multi-framework compliance (ISO 22301 + others)

### 9.7 Approval Workflow

#### **Purpose**

Implement **multi-step approval processes** for critical documents with audit trail.

#### **How to Set Up Approval Workflow**

1. Navigate to **Documentation → Approval Workflow**
2. Select a document
3. Click **Initiate Approval**
4. Define workflow steps:
   - **Step 1**: Technical Review
     - Approver: [Process Owner]
     - Required: Yes
   - **Step 2**: Compliance Review
     - Approver: [Compliance Officer]
     - Required: Yes
   - **Step 3**: Executive Approval
     - Approver: [CEO/CFO]
     - Required: Yes
5. Add **Due Date** for each step
6. Add **Workflow Instructions**
7. Click **Submit for Approval**

#### **Approval Status Tracking**

**Workflow View** shows:

- Current step
- Step status:
  - ⏳ **Pending** - Awaiting approval
  - 🔍 **In Review** - Reviewer is evaluating
  - ✓ **Approved** - Step approved
  - ✗ **Rejected** - Step rejected (with reason)
- Approver name
- Approval date
- Comments

**Timeline View** shows chronological history of all approvals.

#### **Approver Actions**

When you are an approver:

1. Navigate to **Approval Workflow**
2. View **My Pending Approvals** list
3. Click on a document
4. Review document content
5. Choose action:
   - **Approve** - Document meets requirements
   - **Reject** - Document needs revision (add rejection reason)
   - **Request Changes** - Minor edits needed
6. Add comments (optional)
7. Click **Submit**

**If Rejected:**

- Document returns to author
- Author revises document
- Workflow restarts from rejected step

#### **Auto-Escalation**

If approval is not completed by due date:

- System sends reminder email to approver
- After 48 hours, escalates to approver's manager
- After 7 days, notifies BC Manager

#### **Best Practices**

- Define clear approval criteria
- Set realistic due dates
- Include subject matter experts in early review steps
- Keep workflow to 3-5 steps (too many steps = delays)
- Document approval decisions and rationale
- Notify all stakeholders when approved

#### **ISO 22301 Evidence**

✓ Clause 5.3 - Documented approval authority  
✓ Clause 7.5.3(c) - Document review and approval  
✓ Clause 9.3 - Management review and approval of BC plans

---

## 10. Incident Management

### 10.1 Purpose & ISO 22301 Alignment

The Incident Management module supports **ISO 22301 Clause 8.4**:

> "The organization shall respond to disrupting incidents by implementing appropriate BC procedures."

### 10.2 Incident Dashboard

#### **Purpose**

Provide **real-time situational awareness** during business continuity incidents.

#### **Dashboard Components**

**Current Status Panel:**

- Active incidents count
- Average resolution time
- Open vs. closed incidents ratio
- Escalation rate

**Incident Severity Distribution:**
Pie chart showing:

- 🔴 **Critical** - Business-critical impact
- 🟠 **High** - Major impact
- 🟡 **Medium** - Moderate impact
- 🟢 **Low** - Minor impact

**Incident Timeline:**
Chronological view of all incidents in the last 30 days.

**Open Incidents List:**
Table showing:

- Incident ID
- Title
- Severity
- Status (Open, Investigating, Mitigating, Resolving, Closed)
- Affected processes
- Owner
- Time since opened

#### **How to Use During an Incident**

1. Navigate to **Incident Management → Dashboard**
2. View active incidents at a glance
3. Click on an incident for details
4. Update incident status as response progresses
5. Generate situation reports (SITREPs) for management

#### **Real-Time Alerts**

Dashboard displays alerts for:

- New critical incidents
- Incidents approaching RTO
- Incidents requiring escalation
- SLA breaches

#### **Best Practices**

- Display dashboard on wall monitors in crisis management room
- Update status every 30-60 minutes during active incidents
- Use dashboard in crisis management meetings
- Track metrics to identify trends

#### **ISO 22301 Evidence**

✓ Clause 8.4 - Incident response monitoring  
✓ Clause 9.1 - Performance monitoring during incidents

### 10.3 Incident Log

#### **Purpose**

Maintain a complete **chronological record** of all business continuity incidents.

#### **How to Log an Incident**

1. Navigate to **Incident Management → Incident Log**
2. Click **+ Log Incident**
3. Fill in:
   - **Incident Title** - Concise description
   - **Incident Type**:
     - **System Outage** - IT system failure
     - **Data Breach** - Security incident
     - **Natural Disaster** - Flood, earthquake, etc.
     - **Pandemic** - Health emergency
     - **Cyber Attack** - Ransomware, DDoS, etc.
     - **Supplier Failure** - Vendor/supplier issue
     - **Facility Damage** - Building damage/inaccessibility
     - **Other**
   - **Severity**:
     - **Critical** - Multiple critical processes down, major impact
     - **High** - One critical process down or multiple high processes
     - **Medium** - High process down or multiple medium processes
     - **Low** - Medium/low processes affected, minimal impact
   - **Status**:
     - **Open** - Just detected
     - **Investigating** - Assessing impact and root cause
     - **Mitigating** - Implementing workarounds
     - **Resolving** - Restoring normal operations
     - **Closed** - Incident resolved
   - **Detection Time** - When was it first detected?
   - **Affected Processes** - Select from process registry
   - **Affected Resources** - Select from resource registry
   - **Incident Owner** - Who is managing the response?
   - **Description** - Detailed description of what happened
   - **Root Cause** (if known)
   - **Response Actions Taken** - List of actions
   - **Resolution Summary** - How was it resolved?
4. Click **Log Incident**

#### **Incident Updates**

As the incident progresses:

1. Click on the incident
2. Click **Add Update**
3. Add status update with timestamp
4. Updates appear in chronological order
5. All updates are auditable

#### **Incident Metrics Tracked**

- **Detection Time** - When incident first detected
- **Response Time** - Time from detection to first action
- **Resolution Time** - Time from detection to resolution
- **RTO Achievement** - Did we meet target RTO?
- **RPO Achievement** - Did we stay within RPO?
- **Financial Impact** - Estimated cost of incident
- **Customer Impact** - Number of customers affected

#### **Incident Closure**

When incident is resolved:

1. Update status to **Closed**
2. Fill in:
   - Resolution Summary
   - Root Cause Analysis
   - Lessons Learned
   - Improvement Actions
   - Final Impact Assessment
3. Assign follow-up actions
4. Generate incident report

#### **Best Practices**

- Log incidents immediately upon detection (don't wait)
- Update frequently during active incidents
- Include all communication in updates
- Document decision-making rationale
- Conduct after-action review for major incidents
- Update BC plans based on lessons learned

#### **ISO 22301 Evidence**

✓ Clause 8.4 - Response to disruptions  
✓ Clause 9.1(e) - Incident records  
✓ Clause 10.2 - Continual improvement from incidents

---

## 11. Training & Exercises

### 11.1 Purpose & ISO 22301 Alignment

The Training & Exercises module implements **ISO 22301 Clause 7.3**:

> "The organization shall ensure that persons doing work under the organization's control are aware of the BC policy and their roles."

And **Clause 8.5**:

> "The organization shall exercise and test its BC procedures to ensure they are consistent with its BC objectives."

### 11.2 Exercise Log

#### **Purpose**

Plan, schedule, and track **BC exercises and tests** to validate plan effectiveness.

#### **Exercise Types**

1. **Tabletop Exercise** - Discussion-based walkthrough of scenarios
2. **Walkthrough Exercise** - Detailed step-by-step review of procedures
3. **Simulation Exercise** - Realistic scenario with simulated response
4. **Full-Scale Exercise** - Actual invocation of BC plans with real systems

#### **How to Plan an Exercise**

1. Navigate to **Training & Exercises → Exercise Log**
2. Click **+ Plan Exercise**
3. Define exercise details:
   - **Title** - Exercise name (e.g., "Q1 2026 Ransomware Tabletop")
   - **Type** - Select from tabletop, walkthrough, simulation, full-scale
   - **Status** - Planned, Scheduled, In Progress, Completed, Cancelled
   - **Scheduled Date** - When will it occur?
   - **Duration** - Estimated time (hours)
   - **Description** - Exercise objectives and scenario
   - **Scope**:
     - **Processes** - Which processes will be tested?
     - **Resources** - Which resources will be tested?
   - **Participants** - List of participants (BC team members)
   - **Objectives** - What are you testing?
     - Test notification procedures
     - Validate recovery time estimates
     - Assess team coordination
     - Identify procedural gaps
   - **Scenario** - Detailed scenario description
4. Click **Schedule Exercise**

#### **Exercise Execution**

During the exercise:

1. Change status to **In Progress**
2. Use the **Exercise Controller Dashboard**:
   - Inject scenario events
   - Track participant actions
   - Record observations
   - Note gaps and issues
3. Take notes in real-time
4. Collect feedback from participants

#### **Post-Exercise Evaluation**

After the exercise:

1. Update status to **Completed**
2. Fill in **Findings**:
   - What worked well? ✓
   - What needs improvement? ⚠️
   - Gaps identified 🔴
3. Add **Follow-Up Actions**:
   - Description of corrective action
   - Owner (responsible person)
   - Due Date
   - Status (Not Started, In Progress, Completed)
4. Generate **After-Action Report (AAR)**
5. Update BC procedures based on lessons learned

#### **Exercise Metrics**

Track:

- Exercise frequency (exercises per year)
- Participation rate
- Average time to complete actions
- Number of gaps identified
- Follow-up action completion rate

**Target Metrics (ISO 22301 Best Practice):**

- Conduct at least **1 tabletop exercise per quarter**
- Conduct at least **1 full-scale exercise per year**
- Close **100% of follow-up actions** within 90 days

#### **Best Practices**

- Rotate exercise scenarios (don't always test the same thing)
- Include executive leadership in at least one exercise per year
- Test "failure modes" (what if backup fails?)
- Simulate realistic constraints (limited staff, degraded communications)
- Document everything for audit evidence
- Celebrate successes and share lessons learned

#### **ISO 22301 Evidence**

✓ Clause 8.5 - Exercise and testing program  
✓ Clause 9.1(d) - Exercise results monitoring  
✓ Clause 10.2 - Improvement actions from exercises

### 11.3 Training Records

#### **Purpose**

Track BC-related **training, certifications, and competency development**.

#### **Training Types**

1. **BC Awareness Training** - For all employees (annual)
2. **BC Team Training** - For BC team members
3. **Role-Specific Training** - For specialized roles (e.g., crisis communication)
4. **Technical Training** - For IT recovery teams
5. **Executive Training** - For crisis management team
6. **External Certifications** - Professional certifications (CBCP, MBCI, etc.)

#### **How to Add a Training Record**

1. Navigate to **Training & Exercises → Training Records**
2. Click **+ Add Training**
3. Fill in:
   - **Person** - Who received training?
   - **Training Title** - Name of training course
   - **Training Type** - Select from list above
   - **Provider** - Internal or external provider name
   - **Delivery Method**:
     - Classroom
     - Online/E-learning
     - On-the-Job
     - Workshop
   - **Completion Date**
   - **Expiration Date** (if applicable)
   - **Status**:
     - **Planned** - Scheduled but not yet taken
     - **In Progress** - Currently underway
     - **Completed** - Successfully completed
     - **Expired** - Certification/training expired
   - **Score/Assessment** - Pass/Fail or percentage
   - **Certificate Number** (if applicable)
   - **Next Renewal Date**
   - **Attachments** - Upload certificate PDF
4. Click **Save**

#### **Training Dashboard**

View analytics:

- Total training records
- Completed vs. in-progress
- Expired certifications (requires attention)
- Training compliance % by role
- Training hours per person

#### **Training Compliance Tracking**

Define training requirements by role:

- BC Manager: CBCP certification required, renewed every 3 years
- All BC Team Members: Annual BC training required
- All Employees: BC awareness training (annually)

System automatically:

- Tracks who is compliant vs. non-compliant
- Sends reminder emails 60 days before expiration
- Flags overdue training

#### **Training Plan Management**

Create annual training plans:

1. Define training objectives for the year
2. Schedule training sessions
3. Assign participants
4. Track attendance and completion
5. Measure training effectiveness

#### **Best Practices**

- Schedule training immediately after hiring (for BC team members)
- Include BC training in annual employee reviews
- Track training costs (budget management)
- Collect post-training feedback
- Measure training effectiveness through exercises
- Maintain training records for audit purposes (keep for 7 years)

#### **ISO 22301 Evidence**

✓ Clause 7.2 - Competence records  
✓ Clause 7.3 - Awareness and training  
✓ Clause 9.1 - Training effectiveness monitoring

---

## 12. Reports & Analytics

### 12.1 Purpose & ISO 22301 Alignment

The Reports module supports **ISO 22301 Clause 9.3**:

> "Top management shall review the organization's BCMS at planned intervals to ensure its continuing suitability, adequacy, and effectiveness."

### 12.2 Available Reports

#### **1. Business Impact Analysis Report**

**Purpose:** Comprehensive summary of BIA findings for all processes.

**Contents:**

- Executive Summary
- Process Inventory with criticality ratings
- Impact Assessment Results (by dimension)
- Temporal Analysis charts
- Recovery Objectives summary
- Critical Processes requiring immediate attention
- Compliance with RTO targets

**How to Generate:**

1. Navigate to **Reports → BIA Report**
2. Select filters:
   - Department (All or specific)
   - Criticality (All or specific level)
   - Date Range
3. Click **Generate Report**
4. Export as PDF or Excel

**Best Use:** Annual BIA report for executive leadership, board, or auditors.

#### **2. Risk Matrix Report**

**Purpose:** Visual risk matrix and risk register export.

**Contents:**

- Risk Matrix (5×5 grid)
- Risk Register table (all risks with scores)
- Risk Treatment Status
- Top 10 Risks by score
- Risk Trend Analysis (new risks, closed risks)
- Residual Risk Summary

**How to Generate:**

1. Navigate to **Reports → Risk Matrix**
2. Select filters:
   - Category
   - Status (Open/Mitigated/Accepted)
   - Date Range
3. Click **Generate Report**
4. Export as PDF or Excel

**Best Use:** Quarterly risk reviews, audit evidence, management briefings.

#### **3. Compliance Report**

**Purpose:** ISO 22301 compliance status report.

**Contents:**

- Overall Compliance % by clause
- Compliant vs. Non-Compliant breakdown
- Gap Analysis (requirements not met)
- Evidence Summary (documents linked to each requirement)
- Remediation Plan (actions to close gaps)
- Certification Readiness Assessment

**How to Generate:**

1. Navigate to **Reports → Compliance Report**
2. Select framework: ISO 22301, DORA, NIS2, or All
3. Click **Generate Report**
4. Export as PDF

**Best Use:** Pre-certification audits, management reviews, compliance tracking.

#### **4. Exercise & Testing Report**

**Purpose:** Summary of BC exercises and testing activities.

**Contents:**

- Exercise Schedule (planned vs. completed)
- Exercise Results summary
- Gaps Identified and Remediation Status
- Follow-Up Actions Tracker
- Exercise Participation Rates
- Average Time to Complete Actions
- Lessons Learned Summary

**How to Generate:**

1. Navigate to **Reports → Exercise Report**
2. Select date range (e.g., last 12 months)
3. Click **Generate Report**
4. Export as PDF

**Best Use:** Annual review, demonstrate testing program to auditors.

#### **5. Incident Analysis Report**

**Purpose:** Incident history and trend analysis.

**Contents:**

- Total Incidents by type and severity
- Average Resolution Time
- RTO Achievement Rate
- RPO Achievement Rate
- Root Cause Analysis Summary
- Trends Over Time (incidents per month)
- Financial Impact Summary
- Top Causes of Incidents

**How to Generate:**

1. Navigate to **Reports → Incident Report**
2. Select date range
3. Select incident types to include
4. Click **Generate Report**
5. Export as PDF or Excel

**Best Use:** Management review, identify recurring issues, justify BC investments.

#### **6. BC Strategy Resilience Report**

**Purpose:** Executive dashboard showing overall BC program maturity.

**Contents:**

- Resilience Score (0-100)
- 9-Dimension Maturity Assessment
- Coverage Analysis (% processes with strategies)
- RTO Compliance %
- Financial Investment vs. Benefits
- ROI Summary
- Critical Gaps requiring attention
- Recommendations for Improvement

**How to Generate:**

1. Navigate to **Reports → Resilience Report**
2. Click **Generate Report**
3. Export as PDF

**Best Use:** Quarterly management reviews, board presentations, strategic planning.

#### **7. Training Compliance Report**

**Purpose:** Training completion and compliance tracking.

**Contents:**

- Training Compliance % by role
- Completed vs. Required Training
- Expired Certifications
- Training Hours per person
- Training Costs
- Training Effectiveness Metrics
- Upcoming Training Schedule

**How to Generate:**

1. Navigate to **Reports → Training Report**
2. Select reporting period
3. Click **Generate Report**
4. Export as PDF or Excel

**Best Use:** HR reporting, compliance verification, training budget justification.

### 12.3 Custom Reports

#### **How to Create Custom Reports**

1. Navigate to **Reports → Custom Report Builder**
2. Select data sources:
   - Processes
   - Impacts
   - Recovery Objectives
   - Risks
   - Incidents
   - Exercises
   - Training
3. Select fields to include
4. Apply filters
5. Choose visualization type (table, chart, graph)
6. Preview report
7. Save as template for future use
8. Export as PDF, Excel, or CSV

#### **Best Practices for Reporting**

- **Know Your Audience** - Executives want high-level summaries, auditors want detailed evidence
- **Use Visualizations** - Charts and graphs communicate faster than tables
- **Highlight Key Findings** - Use callout boxes for critical information
- **Show Trends** - Compare current vs. previous period
- **Actionable Insights** - Don't just report data, provide recommendations
- **Consistent Format** - Use templates for recurring reports
- **Distribution** - Email reports to stakeholders automatically
- **Archive Reports** - Keep historical reports for trend analysis

#### **ISO 22301 Evidence**

✓ Clause 9.1 - Performance monitoring and reporting  
✓ Clause 9.3 - Management review input  
✓ Clause 10.2 - Improvement tracking

---

## 13. Administrative Settings

### 13.1 System Configuration

#### **Organization Settings**

1. Navigate to **Settings → Organization**
2. Configure:
   - Organization Name
   - Logo Upload
   - Primary Contact
   - Time Zone
   - Date Format
   - Currency
   - Industry Sector

#### **Impact Dimension Settings**

Customize impact assessment dimensions:

1. Navigate to **Settings → Dimension Settings**
2. Modify existing dimensions or add new ones:
   - Dimension Name
   - Description
   - Weight (% allocation)
   - Color (for charts)
   - Display Order
3. Define **severity scale definitions** for each dimension at each time point
4. Click **Save**

**Industry Presets:**

- Financial Services
- Healthcare
- E-commerce
- Manufacturing
- Government

Select a preset to auto-configure dimensions and weights.

#### **User Management**

1. Navigate to **Settings → Users**
2. Add/edit users:
   - Full Name
   - Email
   - Role:
     - **Administrator** - Full system access
     - **BC Manager** - Manage all BC modules
     - **Process Owner** - Edit own processes only
     - **Viewer** - Read-only access
   - Department
   - Active Status
3. Manage permissions by role
4. Reset passwords
5. View user activity logs

#### **Email Notifications**

Configure automatic email notifications:

1. Navigate to **Settings → Notifications**
2. Enable/disable notifications for:
   - New incidents
   - Approval requests
   - Training expiration reminders
   - Exercise reminders
   - Document updates
   - Risk alerts
3. Set notification frequency
4. Configure escalation rules

#### **Data Management**

**Backup & Export:**

1. Navigate to **Settings → Data Management**
2. Click **Export All Data**
3. Downloads complete database export (JSON format)
4. Store securely for disaster recovery

**Import Data:**

1. Click **Import Data**
2. Upload CSV or JSON file
3. Map fields
4. Validate and import

**Data Retention:**

- Configure retention policies
- Archive old records
- Purge deleted records (after 90 days)

#### **API Access**

For integrations:

1. Navigate to **Settings → API**
2. Generate API key
3. View API documentation
4. Configure webhooks
5. Monitor API usage

### 13.2 Best Practices for Administration

- **Regular Backups** - Export data weekly
- **User Access Review** - Quarterly review of user permissions
- **Audit Logs** - Review system logs monthly
- **Performance Monitoring** - Track system response times
- **Security Updates** - Apply patches promptly
- **Data Quality** - Conduct data quality audits quarterly

---

## 14. Compliance Mapping Reference

### 14.1 ISO 22301:2019 Clause-by-Module Mapping

This section provides a complete mapping of ISO 22301 clauses to Nexus BCMS modules, showing how the application supports compliance.

| ISO Clause | Requirement                            | Module(s)                                                 | How Nexus Supports                                       |
| ---------- | -------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------- |
| **4.1**    | Understanding the organization         | Process Registry, Dashboard                               | Document all processes, departments, criticality         |
| **4.2**    | Needs and expectations of stakeholders | Process Registry (owners), Contact Directory              | Identify process owners and stakeholders                 |
| **4.3**    | Scope of BCMS                          | BCMS Policy                                               | Define scope in policy document                          |
| **4.4**    | BCMS                                   | All modules                                               | Complete BCMS implementation                             |
| **5.1**    | Leadership and commitment              | BCMS Policy, BC Strategy                                  | Executive approval of policy, resilience score oversight |
| **5.2**    | Policy                                 | BCMS Policy                                               | Create, approve, communicate BC policy                   |
| **5.3**    | Roles, responsibilities, authorities   | BC Team Structure, Roles & Responsibilities               | Define and assign BC roles                               |
| **6.1**    | Actions to address risks               | Risk Register, Risk Treatment                             | Identify and treat BC risks                              |
| **6.2**    | BC objectives                          | BC Strategy, Dimension Settings                           | Define and track BC objectives                           |
| **7.1**    | Resources                              | Resource Registry, BC Team                                | Identify and allocate BC resources                       |
| **7.2**    | Competence                             | Competency Matrix, Training Records                       | Define and track competencies                            |
| **7.3**    | Awareness                              | Training Records                                          | BC awareness training tracking                           |
| **7.4**    | Communication                          | Contact Directory, Incident Management                    | Maintain communication channels                          |
| **7.5**    | Documented information                 | Documentation Hub                                         | Complete document management                             |
| **8.1**    | Operational planning                   | All BIA modules, BC Strategy                              | BIA and strategy planning                                |
| **8.2**    | Business impact analysis               | Impact Assessment, Recovery Objectives, Temporal Analysis | Complete BIA implementation                              |
| **8.2.1**  | Risk assessment                        | Risk Register, Threat Analysis                            | Risk identification and assessment                       |
| **8.2.2**  | BIA                                    | Impact Assessment, Recovery Objectives                    | Multi-dimensional impact assessment                      |
| **8.2.3**  | Dependencies                           | Dependency Analysis, Resource Dependencies                | Map all dependencies                                     |
| **8.3**    | Business continuity strategies         | BC Strategy, Recovery Options                             | Define and evaluate strategies                           |
| **8.4**    | BC plans and procedures                | Procedures Library, Documentation Hub                     | Document BC plans and procedures                         |
| **8.4.2**  | Incident response structure            | BC Team Structure, Incident Management                    | Define response teams and log incidents                  |
| **8.4.3**  | Warning and communication              | Incident Management, Contact Directory                    | Incident notification and escalation                     |
| **8.4.4**  | BC procedures                          | Procedures Library                                        | Step-by-step recovery procedures                         |
| **8.5**    | Exercising and testing                 | Exercise Log                                              | Plan and conduct BC exercises                            |
| **9.1**    | Monitoring, measurement, analysis      | Dashboard, Reports, All modules                           | KPIs, metrics, performance tracking                      |
| **9.2**    | Internal audit                         | Compliance Matrix                                         | Track compliance status                                  |
| **9.3**    | Management review                      | Dashboard, Reports (Resilience Report)                    | Executive dashboards for review                          |
| **10.1**   | Nonconformity and corrective action    | Exercise Log (follow-up actions), Incident Management     | Track and close corrective actions                       |
| **10.2**   | Continual improvement                  | All modules (version control), Exercise Log               | Lessons learned and improvements                         |

### 14.2 DORA Compliance Mapping

| DORA Article   | Requirement                | Module(s)                           | How Nexus Supports                   |
| -------------- | -------------------------- | ----------------------------------- | ------------------------------------ |
| **Article 6**  | ICT Asset Inventory        | Resource Registry, Process Registry | Complete asset and process inventory |
| **Article 11** | ICT Risk Management        | Risk Register, Threat Analysis      | Identify and manage ICT risks        |
| **Article 15** | Digital Resilience Testing | Exercise Log                        | Plan and track DR testing            |
| **Article 16** | Incident Reporting         | Incident Management                 | Log and report ICT incidents         |
| **Article 25** | Testing of ICT Tools       | Exercise Log                        | Test recovery tools and procedures   |

### 14.3 NIS2 Compliance Mapping

| NIS2 Article   | Requirement         | Module(s)                               | How Nexus Supports                       |
| -------------- | ------------------- | --------------------------------------- | ---------------------------------------- |
| **Article 17** | Incident Response   | Incident Management, Procedures Library | Incident response procedures and logging |
| **Article 21** | Business Continuity | All BIA modules, BC Strategy            | Complete BC capability                   |

---

## 15. Best Practices & Workflows

### 15.1 Getting Started: First 30 Days

**Week 1: Foundation**

- [ ] Configure organization settings
- [ ] Add users and assign roles
- [ ] Create BCMS policy (use template)
- [ ] Identify critical processes (start with top 10)

**Week 2: BIA Initiation**

- [ ] Add critical processes to Process Registry
- [ ] Conduct impact assessments for critical processes
- [ ] Set recovery objectives (RTO/RPO)
- [ ] Map process dependencies

**Week 3: Resource & Risk**

- [ ] Add critical resources to Resource Registry
- [ ] Map process-resource links
- [ ] Identify top 10 BC risks
- [ ] Add risks to Risk Register

**Week 4: Strategy & Planning**

- [ ] Define recovery strategies for critical processes
- [ ] Create initial BC procedures
- [ ] Set up BC team structure
- [ ] Schedule first tabletop exercise

### 15.2 Annual BCMS Cycle

**Q1: Review & Update**

- Review BCMS policy
- Update process criticality ratings
- Review and update impact assessments
- Conduct management review

**Q2: Risk & Strategy**

- Annual risk assessment
- Review and update risk treatments
- Evaluate BC strategy effectiveness
- Conduct cost-benefit analysis

**Q3: Testing & Training**

- Conduct tabletop exercises (one per critical process)
- Annual BC awareness training (all staff)
- Role-specific training (BC team)
- Test disaster recovery procedures

**Q4: Compliance & Improvement**

- Internal audit (self-assessment)
- Compliance matrix review
- Update documentation
- Plan improvements for next year
- Budget planning for BC program

### 15.3 Incident Response Workflow

**Detection (0-15 minutes)**

1. Detect disruption
2. Log incident in system
3. Assign incident owner
4. Notify BC Manager

**Assessment (15-60 minutes)**

1. Assess impact and scope
2. Determine severity level
3. Identify affected processes
4. Activate appropriate BC team

**Response (1-4 hours)**

1. Implement workarounds
2. Execute recovery procedures
3. Communicate to stakeholders
4. Update incident status regularly

**Recovery (varies)**

1. Restore normal operations
2. Verify recovery success
3. Document actions taken
4. Update RTO/RPO actuals

**Closure (post-incident)**

1. Conduct after-action review
2. Document lessons learned
3. Update BC procedures
4. Close follow-up actions

### 15.4 Exercise Planning Workflow

**Planning (8 weeks before)**

- Define exercise objectives
- Select scenario
- Identify participants
- Reserve date/location

**Preparation (4 weeks before)**

- Develop scenario details
- Create inject schedule
- Assign roles (controllers, observers)
- Send invitations

**Pre-Exercise (1 week before)**

- Send reminder to participants
- Confirm logistics
- Prepare materials
- Brief controllers

**Execution (exercise day)**

- Conduct safety briefing
- Run scenario
- Take notes and observations
- Collect participant feedback

**Post-Exercise (1 week after)**

- Compile observations
- Write after-action report
- Identify improvement actions
- Update procedures
- Share lessons learned

---

## 16. Troubleshooting & Support

### 16.1 Common Issues

**Issue: Can't log in**

- Check username/password
- Verify account is active (contact admin)
- Clear browser cache and cookies
- Try different browser

**Issue: Data not saving**

- Check internet connection
- Verify you have edit permissions
- Check for validation errors (red highlights)
- Refresh page and try again

**Issue: Reports not generating**

- Ensure you have data in the selected date range
- Check filter settings
- Try exporting to a different format
- Contact support if issue persists

**Issue: Slow performance**

- Check internet connection speed
- Close unused browser tabs
- Clear browser cache
- Try accessing during off-peak hours

**Issue: Chart not displaying**

- Verify you have data for the selected filters
- Check browser compatibility (use Chrome or Edge)
- Disable browser extensions temporarily
- Refresh the page

### 16.2 Browser Requirements

**Supported Browsers:**

- Google Chrome (latest version) ✓ **Recommended**
- Microsoft Edge (latest version) ✓
- Mozilla Firefox (latest version) ✓
- Safari (latest version) ⚠️ Limited support

**Not Supported:**

- Internet Explorer (any version)

**Recommended Screen Resolution:**

- Minimum: 1366×768
- Optimal: 1920×1080 or higher

### 16.3 Getting Help

**In-App Help:**

- Hover over **?** icons for tooltips
- Click **Help** button in top right corner
- View tutorial videos

**Contact Support:**

- Email: bcms-support@nexus.com
- Phone: +1-800-NEXUS-BC
- Support hours: 24/7 for critical incidents, Mon-Fri 9am-5pm for general inquiries

**Submit Support Ticket:**

1. Navigate to **Settings → Support**
2. Click **Submit Ticket**
3. Describe issue
4. Attach screenshots (if applicable)
5. Click **Submit**

**Knowledge Base:**

- Access help articles at: https://help.nexus.com/bcms
- Search for solutions to common questions
- Watch video tutorials

### 16.4 System Status

Check system status at: https://status.nexus.com

**Scheduled Maintenance:**

- Announced 7 days in advance
- Typically performed Sundays 2am-6am ET
- No data loss during maintenance

---

## Appendix A: Glossary

**BC** - Business Continuity  
**BCMS** - Business Continuity Management System  
**BIA** - Business Impact Analysis  
**CMT** - Crisis Management Team  
**DR** - Disaster Recovery  
**MBCO** - Minimum Business Continuity Objective  
**MTPD** - Maximum Tolerable Period of Disruption  
**RPO** - Recovery Point Objective  
**RTO** - Recovery Time Objective  
**SITREP** - Situation Report

---

## Appendix B: Keyboard Shortcuts

| Shortcut   | Action                       |
| ---------- | ---------------------------- |
| `Ctrl + S` | Save (in forms/editors)      |
| `Ctrl + F` | Search/Filter                |
| `Ctrl + N` | New item (context-dependent) |
| `Esc`      | Close modal/dialog           |
| `Ctrl + P` | Print/Export current view    |
| `Alt + D`  | Navigate to Dashboard        |
| `Alt + R`  | Navigate to Reports          |

---

## Appendix C: Document Revision History

| Version | Date       | Author                  | Changes                           |
| ------- | ---------- | ----------------------- | --------------------------------- |
| 1.0     | 2026-01-26 | BCMS Documentation Team | Initial comprehensive user manual |

---

**END OF USER MANUAL**

For the latest version of this manual, visit: [Documentation Hub]  
For training on using Nexus BCMS, contact: bcms-training@nexus.com

---

© 2026 Nexus BCMS. All rights reserved.
