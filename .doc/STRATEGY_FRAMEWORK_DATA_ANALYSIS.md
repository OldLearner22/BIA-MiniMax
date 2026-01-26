# Strategy Framework - Data Source Analysis

## Executive Summary

The Strategy Framework is **USING LIVE DATA FROM THE DATABASE** combined with **HARDCODED FRAMEWORK STRUCTURE**. The framework displays:

- ✅ **Live, calculated metrics** derived from database records (processes, impacts, recovery objectives, risks, threats, recovery options, cost-benefit analyses)
- ✅ **Live dimension settings** stored in the database
- ❌ **Hardcoded framework structure** (pillar titles, objectives, component descriptions)

---

## 1. Architecture Overview

### Component Hierarchy

```
BCStrategy.tsx (Main Component)
├── Live Data Sources:
│   ├── useStore() hook
│   │   ├── processes (from DB)
│   │   ├── impacts (from DB)
│   │   ├── recoveryObjectives (from DB)
│   │   ├── recoveryOptions (from DB)
│   │   ├── costBenefitAnalyses (from DB)
│   │   ├── risks (from DB)
│   │   ├── threats (from DB)
│   │   ├── riskTreatments (from DB)
│   │   ├── strategyAssessments (from DB)
│   │   └── strategyObjectives (from DB)
│   └── API Calls:
│       └── dimensionSettingsApi.fetchDimensionSettings() → /api/settings/dimensions
├── Calculation Functions:
│   ├── calculateResilienceMetrics() → uses ALL live data
│   ├── calculateMaturityDimensions() → uses live data
│   └── calculateDimensionGaps() → uses live data + dimension settings
└── Hardcoded Structures:
    ├── pillars[] (Strategic, Operational, Tactical, Governance)
    └── frameworkComponents[] (Prevention, Response, Recovery, Learning)
```

---

## 2. Live Data Analysis

### 2.1 Resilience Metrics (Lines 85-296 in strategyMetrics.ts)

**Data Source:** All from database records  
**Calculated from:**

| Metric                    | Source Data                                  | Calculation                                     |
| ------------------------- | -------------------------------------------- | ----------------------------------------------- |
| `processCount`            | `processes[]`                                | `processes.length`                              |
| `processesWithImpact`     | `impacts{}` record                           | `Object.keys(impacts).length`                   |
| `processesWithObjectives` | `recoveryObjectives{}` record                | `Object.keys(recoveryObjectives).length`        |
| `processesWithStrategy`   | `recoveryOptions[]`                          | `unique(recoveryOptions.processId).length`      |
| `impactCoverage`          | Both above                                   | `(processesWithImpact / processCount) * 100`    |
| `totalRisks`              | `risks[]` from DB                            | `risks.length`                                  |
| `openRisks`               | `risks[]` filtered                           | `risks.filter(r => r.status === "Open").length` |
| `riskMitigation`          | `riskTreatments[]`                           | `(completed / total) * 100`                     |
| `totalThreats`            | `threats[]` from DB                          | `threats.length`                                |
| `rtoCompliance`           | `recoveryOptions[]` + `recoveryObjectives{}` | Compare strategy RTO vs objective RTO           |
| `totalImplementationCost` | `costBenefitAnalyses[]`                      | Sum of implementation costs                     |
| `totalOperationalCost`    | `costBenefitAnalyses[]`                      | Sum of operational costs                        |
| `totalAnnualBenefit`      | `costBenefitAnalyses[]`                      | Sum of benefits                                 |
| `overallROI`              | Calculated from above                        | `(totalBenefit - totalCost) / totalCost * 100`  |
| `avgReadinessScore`       | `recoveryOptions[]`                          | Average of `readinessScore` field               |
| `strategyTestingCoverage` | `recoveryOptions[]`                          | `(tested / total) * 100`                        |

**Example from BCStrategy.tsx (lines 85-113):**

```typescript
const resilienceMetrics = useMemo(
  () =>
    calculateResilienceMetrics(
      processes, // ← Live from DB
      impacts, // ← Live from DB
      recoveryObjectives, // ← Live from DB
      recoveryOptions, // ← Live from DB
      costBenefitAnalyses, // ← Live from DB
      risks, // ← Live from DB
      threats, // ← Live from DB
      riskTreatments, // ← Live from DB
    ),
  [
    processes,
    impacts,
    recoveryObjectives,
    recoveryOptions,
    costBenefitAnalyses,
    risks,
    threats,
    riskTreatments,
  ],
);
```

### 2.2 Maturity Dimensions (Lines 442-536 in strategyMetrics.ts)

**Data Source:** Calculated from live database records

| Dimension               | Base Data                                    | Calculation                                                       |
| ----------------------- | -------------------------------------------- | ----------------------------------------------------------------- |
| **Coverage Maturity**   | `impacts` record                             | `(Object.keys(impacts).length / processCount) * 100`              |
| **Capability Maturity** | `recoveryOptions[]`                          | Average tier score (immediate=5, rapid=4, standard=3, extended=2) |
| **Readiness Maturity**  | `recoveryOptions[]`                          | Average `readinessScore` from DB records                          |
| **Compliance Maturity** | `recoveryObjectives{}` + `recoveryOptions[]` | `(RTO-compliant processes / total) * 100`                         |
| **Risk Management**     | `riskTreatments[]`                           | `(completed / total) * 100`                                       |

**Code Example (lines 470-475):**

```typescript
const coveragePercent = (Object.keys(impacts).length / processCount) * 100;
const coverageLevel = calculateLevel(coveragePercent);
const coverageDimension: MaturityDimension = {
  dimension: "Coverage Maturity",
  currentLevel: coverageLevel,
  description: getMaturityDescription("Coverage", coverageLevel),
  score: Math.round(coveragePercent),
};
```

### 2.3 Dimension Settings (From Database)

**API Endpoint:** `GET /api/settings/dimensions`  
**Storage:** PostgreSQL via Prisma ORM  
**Loaded in BCStrategy.tsx (lines 116-129):**

```typescript
useEffect(() => {
  const loadSettings = async () => {
    try {
      const settings = await dimensionSettingsApi.fetchDimensionSettings();
      // ↑ Fetches from /api/settings/dimensions endpoint
      setDimensionSettings(settings);
    } catch (error) {
      console.error("Failed to load dimension settings:", error);
    } finally {
      setIsLoadingSettings(false);
    }
  };
  loadSettings();
}, []);
```

**Dimension Settings include:**

- `targetLevel` - User-defined maturity target (0-5)
- `weight` - Relative importance weight for calculations
- Custom thresholds and risk assessments

### 2.4 Overall Resilience Score (Line 267 in strategyMetrics.ts)

**Calculated from:**

- `impactCoverage` (live)
- `objectiveCoverage` (live)
- `strategyCoverage` (live)
- `rtoCompliance` (live)
- `riskMitigation` (live)
- `threatCoverage` (live)
- `avgReadinessScore` (live)
- `strategyTestingCoverage` (live)
- `overallROI` (live)

All inputs are dynamic, database-driven values.

---

## 3. Hardcoded Framework Structure

### 3.1 Strategic Pillars (BCStrategy.tsx Lines 239-281)

**Status:** HARDCODED (static framework, not data-driven)

```typescript
const pillars = [
  {
    id: "strategic",
    title: "Strategic Leadership",
    description: "Executive commitment and strategic direction...",
    icon: <Target className="w-6 h-6" />,
    color: "strategy-gold",
    gradient: "from-strategy-gold to-orange-500",
  },
  {
    id: "operational",
    title: "Operational Excellence",
    description: "Robust processes and capabilities...",
    // ... more hardcoded pillars
  },
  // 4 total pillars hardcoded
];
```

**Rationale:** Pillars represent ISO 22301 framework structure - these are industry-standard organizational levels that don't change per assessment.

### 3.2 Framework Components (BCStrategy.tsx Lines 283-352)

**Status:** HARDCODED (static assessment framework)

```typescript
const frameworkComponents = [
  {
    id: "prevention",
    title: "Prevention",
    subtitle: "Proactive Risk Management",
    icon: <Shield className="w-8 h-8 text-operational-emerald" />,
    objectives: [
      "Implement comprehensive risk assessment and management",
      "Establish robust business impact analysis processes",
      "Deploy proactive monitoring and early warning systems",
      "Maintain continuous threat intelligence and scenario planning",
    ],
    borderClass: "border-t-operational-emerald",
  },
  // ... 4 total components hardcoded
  // (Prevention, Response, Recovery, Learning)
];
```

**Rationale:** These represent the PURL (Prevention, Understanding/Readiness, Response, Learning) phases of business continuity - standard framework components per ISO 22301.

---

## 4. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                            │
├─────────────────────────────────────────────────────────────────┤
│ • Processes          • Impacts          • RecoveryObjectives     │
│ • RecoveryOptions    • CostBenefitAnalyses  • Risks              │
│ • Threats            • RiskTreatments       • DimensionSettings   │
└──────────────────────────────────┬──────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
          ┌─────────────────────┐      ┌──────────────────────┐
          │   useStore Hook     │      │   API Calls          │
          │                     │      │                      │
          │ • processes         │      │ dimensionSettings    │
          │ • impacts           │      │ .fetchDimensions()   │
          │ • recoveryObjects   │      │                      │
          │ • recoveryOptions   │      │ .saveDimensions()    │
          │ • costs/benefits    │      │                      │
          │ • risks/threats     │      │ .updateGaps()        │
          │ • riskTreatments    │      └──────────────────────┘
          └──────────┬──────────┘
                     │
            ┌────────┴────────┐
            ▼                 ▼
       ┌──────────────────────────────────────────┐
       │     BCStrategy Component                 │
       └──────────────────────────────────────────┘
            │
    ┌───────┼───────┐
    ▼       ▼       ▼
 LIVE    HARD-    DISPLAY
 CALCS   CODED
 │       │        │
 │       │        │
 ├─►Calculate     ├─►Radar Charts
 │  Resilience    ├─►Maturity Scores
 │  Metrics       ├─►Pillar Descriptions
 │                ├─►Framework Components
 ├─►Calculate     ├─►Stats Dashboard
 │  Maturity      └─►Gap Analysis
 │  Dimensions
 │
 ├─►Calculate
 │  Dimension Gaps
 │
 └─►Weighted
    Maturity Score
```

---

## 5. Key Findings

### ✅ What's Live (Data-Driven)

1. **All Metrics Calculations**
   - Resilience Score: 0-100 (dynamically calculated)
   - Coverage, Capability, Readiness, Compliance, Risk Management maturity levels
   - RTO compliance percentages
   - Financial metrics (ROI, payback period)
   - Risk mitigation rates
   - Threat coverage percentages

2. **Dimension Settings**
   - Target maturity levels per dimension
   - Weighted importance of each dimension
   - Custom thresholds and KPIs

3. **Dashboard Statistics**
   - Process counts and coverage
   - Risk/threat counts and statuses
   - Strategy coverage percentages
   - Testing coverage metrics

### ❌ What's Hardcoded (Framework Structure)

1. **Strategic Pillars** (4 fixed pillars)
   - Strategic Leadership
   - Operational Excellence
   - Tactical Response
   - Governance & Oversight

2. **Framework Components** (4 fixed phases)
   - Prevention
   - Response
   - Recovery
   - Learning

3. **Component Objectives** (4 predefined objectives per phase)
   - Examples: "Implement comprehensive risk assessment", "Activate emergency response teams", etc.

---

## 6. Recommendations

### Current State Assessment

| Aspect                   | Status       | Recommendation                            |
| ------------------------ | ------------ | ----------------------------------------- |
| **Metrics Calculation**  | ✅ Live      | No change - working correctly             |
| **Data Persistence**     | ✅ Database  | Maintain current approach                 |
| **Framework Structure**  | ⚠️ Hardcoded | **Consider:** Make customizable           |
| **Dimension Settings**   | ✅ Database  | Maintain current approach                 |
| **Pillar Descriptions**  | ❌ Hardcoded | **Consider:** Allow editing via API       |
| **Component Objectives** | ❌ Hardcoded | **Consider:** Allow customization per org |

### Potential Enhancements

**Option 1: Keep as-is** (Low effort)

- Framework structure is ISO 22301 standard
- Hardcoding is appropriate for universal framework
- ✅ Current implementation is correct

**Option 2: Make Customizable** (Medium effort)

```typescript
// Add to database:
model FrameworkCustomization {
  id: String
  organizationId: String
  pillarId: String
  title: String        // User-customized
  description: String  // User-customized
  objectives: String[] // User-customized
  createdAt: DateTime
  updatedAt: DateTime
}

// Then load in BCStrategy:
const pillars = await fetch('/api/framework-customization')
  .then(r => r.json())
  .catch(() => DEFAULT_PILLARS); // Fallback to hardcoded
```

**Option 3: Data-driven Framework Config** (High effort)

- Create framework templates in database
- Allow organizations to select/customize templates
- Track framework evolution over time
- Enable multi-framework support (ISO 22301, NFPA 1600, etc.)

---

## 7. Current Configuration

### Backend Database Tables (Prisma Schema)

```prisma
model StrategyAssessment {
  id            String   @id @default(uuid())
  assessmentDate DateTime
  // ... assessment details
}

model StrategyObjective {
  id        String   @id @default(uuid())
  title     String
  // ... objective details
}

model DimensionSetting {
  id          String   @id @default(uuid())
  dimension   String
  targetLevel Int      // 0-5 scale
  weight      Float    // 0-1 scale
  // ... custom settings
}
```

### API Endpoints

| Endpoint                     | Method | Purpose                    | Data Source |
| ---------------------------- | ------ | -------------------------- | ----------- |
| `GET /strategy/assessments`  | GET    | Fetch strategy assessments | Database    |
| `POST /strategy/assessments` | POST   | Create new assessment      | Database    |
| `GET /strategy/objectives`   | GET    | Fetch strategy objectives  | Database    |
| `POST /strategy/objectives`  | POST   | Create new objective       | Database    |
| `GET /settings/dimensions`   | GET    | Fetch dimension settings   | Database    |
| `POST /settings/dimensions`  | POST   | Save dimension settings    | Database    |

---

## 8. Conclusion

The Strategy Framework is **appropriately designed** with:

- ✅ **Live, database-driven metrics and calculations** for all KPIs and maturity assessments
- ✅ **Customizable dimension settings** stored in database
- ✅ **Hardcoded framework structure** (appropriate for ISO 22301 standard framework)

No immediate changes required. The framework correctly separates:

- **Dynamic data** (metrics, settings) → Database
- **Static framework** (pillars, phases, standard objectives) → Code

This is the correct architecture pattern for a standards-based compliance tool.
