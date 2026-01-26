# Dimension Breakdown Settings Feature

## 🎯 Feature Overview

Allow users to define maturity ambition levels and business context for each of the 5 maturity dimensions, transforming static targets into personalized strategic goals aligned with organizational priorities.

**Status**: 📋 Design Phase - Ready for Implementation  
**Created**: January 22, 2026  
**Priority**: Medium (Phase 2 Enhancement)

---

## 📊 What Users Could Define

### 1. Per-Dimension Target Ambition (1-5 Levels)

| Dimension               | Default Target | Possible Targets | Business Rationale                                            |
| ----------------------- | -------------- | ---------------- | ------------------------------------------------------------- |
| **Coverage Maturity**   | Level 5        | 3-5              | Documentation completeness - lower cost vs. higher compliance |
| **Capability Maturity** | Level 5        | 3-5              | Recovery tier quality - cost/benefit trade-off decision       |
| **Readiness Maturity**  | Level 5        | 4-5              | Testing & execution - higher confidence required              |
| **Compliance Maturity** | Level 5        | 4-5              | RTO achievement - regulatory/contractual requirements         |
| **Risk Management**     | Level 5        | 3-5              | Risk mitigation rate - acceptable risk tolerance              |

### 2. Business Context & Rationale

For each dimension, users define:

- **Business Context** (textarea)
  - Why this dimension matters
  - Organizational driver (e.g., "Required for SOX compliance")
  - Expected business outcome (e.g., "Reduce downtime by 80%")

- **Timeline to Achieve** (input)
  - When target should be reached (e.g., "Q2 2026", "12 months")
  - Realistic estimation based on current state

- **Owner / Accountability** (select)
  - Person or role responsible (e.g., "VP Operations", "BC Manager")
  - Used for tracking and notifications

- **Success Criteria** (textarea)
  - Business metrics to validate achievement
  - Examples:
    - "Coverage: 100% of critical processes documented"
    - "Capability: All Tier 1 processes have hot-site"
    - "Readiness: 95%+ recovery options tested"
    - "Compliance: 100% processes meet RTO targets"
    - "Risk: 85%+ of open risks treated"

### 3. Dimension Weighting (Optional)

Allow custom weighting for overall maturity score based on industry/organizational priorities:

**Example Weights by Industry**:

**Financial Services** (Compliance-heavy):

- Compliance Maturity: 25%
- Risk Management: 25%
- Coverage Maturity: 20%
- Readiness Maturity: 15%
- Capability Maturity: 15%

**Healthcare** (Availability-critical):

- Compliance Maturity: 25%
- Readiness Maturity: 25%
- Coverage Maturity: 20%
- Risk Management: 20%
- Capability Maturity: 10%

**E-Commerce** (Speed-focused):

- Readiness Maturity: 30%
- Capability Maturity: 25%
- Coverage Maturity: 20%
- Risk Management: 15%
- Compliance Maturity: 10%

**Default** (Equal):

- Each dimension: 20%

---

## 🏗️ Architecture Required

### 1. Database Schema (Prisma)

```prisma
model DimensionTarget {
  id                String    @id @default(cuid())
  organizationId    String

  // Target definition
  dimension         String    // "Coverage", "Capability", "Readiness", "Compliance", "Risk"
  targetLevel       Int       // 1-5

  // Business context
  businessContext   String    @db.Text  // Why this matters
  successCriteria   String    @db.Text  // How to validate success
  timeline          String    // "Q2 2026" or "6 months"
  owner             String    // Role/name responsible

  // Weighting
  weight            Float     @default(0.2)  // Default 20% for 5 dimensions

  // Metadata
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  createdBy         String    // User who created

  @@unique([organizationId, dimension])
  @@index([organizationId])
  @@map("dimension_targets")
}

model DimensionGapAnalysis {
  id                String    @id @default(cuid())
  organizationId    String
  dimension         String

  // Calculated fields
  currentLevel      Int       // From calculateMaturityDimensions()
  targetLevel       Int       // From DimensionTarget
  currentScore      Float     // 0-100%
  gapPercentage     Float     // How far from target

  // Status tracking
  status            String    @default("at-risk")  // "on-track", "at-risk", "complete"
  lastUpdated       DateTime  @default(now())

  @@unique([organizationId, dimension])
  @@index([organizationId])
  @@map("dimension_gap_analysis")
}
```

### 2. Zustand Store Extension

```typescript
// Add to useStore
export interface DimensionSetting {
  targetLevel: number;
  businessContext: string;
  timeline: string;
  owner: string;
  successCriteria: string;
  weight: number;
}

export interface DimensionGap {
  dimension: string;
  currentLevel: number;
  targetLevel: number;
  currentScore: number;
  gapPercentage: number;
  status: "on-track" | "at-risk" | "complete";
}

export interface SettingsState {
  dimensionSettings: Record<string, DimensionSetting>;
  dimensionGaps: Record<string, DimensionGap>;

  // Actions
  setDimensionSetting: (
    dimension: string,
    setting: Partial<DimensionSetting>,
  ) => void;
  fetchDimensionSettings: () => Promise<void>;
  calculateDimensionGaps: (maturityDimensions: MaturityDimension[]) => void;
  updateDimensionWeights: (weights: Record<string, number>) => void;
}

// Store slices
const useSettingsStore = create<SettingsState>((set) => ({
  dimensionSettings: {},
  dimensionGaps: {},

  setDimensionSetting: (dimension, setting) =>
    set((state) => ({
      dimensionSettings: {
        ...state.dimensionSettings,
        [dimension]: {
          ...state.dimensionSettings[dimension],
          ...setting,
        },
      },
    })),

  // ... other actions
}));
```

### 3. API Endpoints

```typescript
// GET /api/settings/dimensions
// Fetch all dimension targets for organization
Response: {
  Coverage: { targetLevel: 5, businessContext: "...", ... },
  Capability: { targetLevel: 4, businessContext: "...", ... },
  // ...
}

// POST /api/settings/dimensions
// Create/update all dimension targets
Body: {
  [dimensionName]: {
    targetLevel: number,
    businessContext: string,
    timeline: string,
    owner: string,
    successCriteria: string,
    weight: number
  }
}

// PUT /api/settings/dimensions/:dimension
// Update specific dimension
Body: Partial<DimensionSetting>

// DELETE /api/settings/dimensions/:dimension
// Remove custom target (revert to defaults)

// GET /api/settings/dimensions/gaps
// Get calculated gap analysis
Response: {
  Coverage: { currentLevel: 3, targetLevel: 5, gapPercentage: 40%, status: "at-risk" },
  // ...
}

// POST /api/settings/industry-presets/:industry
// Apply industry-standard weighting
// Industries: "financial", "healthcare", "ecommerce", "manufacturing", "government"
```

### 4. New Components

#### `src/components/DimensionSettings.tsx`

Main settings panel featuring:

- Grid of 5 dimension cards
- Each card with:
  - Level selector (1-5 dropdown)
  - Business context textarea
  - Timeline input
  - Owner selector (dropdown from team)
  - Success criteria textarea
  - Weight slider (if advanced mode)
- "Apply Industry Preset" button
- Save/Cancel actions
- Form validation

#### `src/components/DimensionCard.tsx` (Reusable)

Single dimension editor with:

- Visual representation (current vs. target)
- Edit mode toggle
- Inline validation
- Unsaved changes indicator

#### `src/components/GapAnalysisSection.tsx`

New dashboard section showing:

- Table: Dimension | Current Level | Target Level | Gap | Status
- Gap bars (visual progress toward target)
- Color coding: Green (complete), Yellow (on-track), Red (at-risk)
- Sortable by dimension, gap size, status

### 5. Updated strategyMetrics.ts

```typescript
// New function
export function calculateWeightedMaturityScore(
  dimensions: MaturityDimension[],
  weights: Record<string, number> = DEFAULT_WEIGHTS
): number {
  // Multiply each dimension level × weight
  // Sum and normalize to 0-100
}

// New function
export function calculateDimensionGaps(
  maturityDimensions: MaturityDimension[],
  targetLevels: Record<string, number>
): DimensionGap[] {
  // Compare current vs. target for each dimension
  // Calculate gap percentage
  // Determine status
}

// Exported for use in BCStrategy
export const DEFAULT_WEIGHTS: Record<string, number> = {
  Coverage: 0.2,
  Capability: 0.2,
  Readiness: 0.2,
  Compliance: 0.2,
  "Risk Management": 0.2,
};

export const INDUSTRY_PRESETS: Record<string, Record<string, number>> = {
  financial: { Compliance: 0.25, "Risk Management": 0.25, ... },
  healthcare: { Compliance: 0.25, Readiness: 0.25, ... },
  ecommerce: { Readiness: 0.3, Capability: 0.25, ... },
  // ...
};
```

---

## 🎨 UI/UX Changes

### BCStrategy Dashboard Updates

#### Maturity Radar (Enhanced)

- **Golden line**: Current maturity (existing)
- **Green line**: User-defined targets (NEW)
- **Shaded zone**: Gap between current and target (NEW)
- **Hover tooltip**: Shows business context and timeline (NEW)

#### New Gap Analysis Section

```
╔════════════════════════════════════════════════════════════╗
║ Maturity Gap Analysis                                      ║
├─────────────────────────┬──────────┬─────────┬─────────────┤
║ Dimension               │ Current  │ Target  │ Gap / Status ║
├─────────────────────────┼──────────┼─────────┼─────────────┤
║ Coverage Maturity       │ Level 3  │ Level 5 │ ▭▭▭▭░░░░░░ ║
║                         │ 75%      │ 95%     │ -20% ⚠️      ║
├─────────────────────────┼──────────┼─────────┼─────────────┤
║ Capability Maturity     │ Level 4  │ Level 4 │ ◯◯◯◯◯◯◯◯◯◯ ║
║                         │ 80%      │ 80%     │  0% ✅      ║
├─────────────────────────┼──────────┼─────────┼─────────────┤
║ ...                     │          │         │             ║
╚════════════════════════════════════════════════════════════╝
```

#### Business Context Display (Sidebar)

When user hovers over dimension on Radar:

```
Coverage Maturity
Target: Level 5 (by Q2 2026)
Owner: VP Operations

Business Context:
"Required for annual audit compliance and
customer confidence in data integrity."

Success Criteria:
• 100% of critical processes have impact assessments
• All recovery objectives documented
• Risk mitigation plans for all identified threats

Current Status:
75% complete (Gap: -20%)
Timeline: On track for Q2 target
```

### Settings Modal/Page

Accessible from main navigation or dashboard:

**Tab 1: Dimension Targets**

- 5 dimension cards in grid layout
- Each card shows:
  - Dimension name
  - Current level badge
  - Target level (editable)
  - Business context preview
  - "Edit" button expands full form

**Tab 2: Weighting**

- Sliders for each dimension (totaling 100%)
- "Use Industry Preset" dropdown
- Visual bar chart showing current weights

**Tab 3: Gap Analysis**

- Read-only table of calculated gaps
- Sorted by gap size (largest first)
- Color-coded status indicators
- Action buttons: "Dismiss", "Create Action Item", "Generate Roadmap"

---

## 🚀 Implementation Phases

### **Phase 1: MVP - Basic Targets (Estimated: 1-2 weeks)**

**Deliverables**:

- ✅ DimensionTarget database table
- ✅ Simple Settings component (level + context textarea)
- ✅ API endpoints (GET/POST dimension settings)
- ✅ Update Radar to show user targets (green line)
- ✅ Calculate and display gaps in tooltip

**Not Included**:

- Weighting system
- Gap analysis section
- Industry presets

### **Phase 2: Business Context (Estimated: 1 week)**

**Deliverables**:

- ✅ Extended DimensionSettings component (timeline, owner, success criteria)
- ✅ New GapAnalysisSection in BCStrategy dashboard
- ✅ DimensionGapAnalysis table
- ✅ Gap status calculation logic
- ✅ Enhanced Radar hover with full business context

### **Phase 3: Advanced (Estimated: 2 weeks)**

**Deliverables**:

- ✅ Weighting system with sliders
- ✅ Industry preset templates
- ✅ Weighted maturity score calculation
- ✅ Gap trend tracking (historical)
- ✅ Roadmap visualization (quarterly progression)
- ✅ Notifications when targets achieved

### **Phase 4: Optimization (Optional)**

**Deliverables**:

- Integration with Action Items/Corrective Actions
- Export dimension targets to PDF
- Dimension target templates per industry
- Gap closure recommendations (AI-powered)

---

## 💡 Implementation Recommendations

### Start With Phase 1 + Phase 2

**Rationale**:

1. Phase 1 gives immediate business value (visible targets on Radar)
2. Phase 2 adds context without complexity (explains "why")
3. Combined effort is ~2-3 weeks for strong foundation
4. Can defer weighting (Phase 3) until maturity system is refined

### Database Migration Path

```sql
-- Add to next migration
CREATE TABLE dimension_targets (
  id SERIAL PRIMARY KEY,
  organizationId VARCHAR(255) NOT NULL,
  dimension VARCHAR(50) NOT NULL,
  targetLevel INTEGER CHECK (targetLevel BETWEEN 1 AND 5),
  businessContext TEXT,
  timeline VARCHAR(100),
  owner VARCHAR(255),
  successCriteria TEXT,
  weight FLOAT DEFAULT 0.2,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(organizationId, dimension)
);

CREATE INDEX idx_dimension_targets_org
ON dimension_targets(organizationId);
```

### Default Values (First-Time Setup)

When user first opens Settings:

```typescript
const DEFAULT_DIMENSION_TARGETS = {
  Coverage: {
    targetLevel: 5,
    businessContext: "Ensure comprehensive documentation of all processes",
    timeline: "Q4 2026",
    owner: "BC Coordinator",
    successCriteria: "100% of processes have impact assessments",
    weight: 0.2,
  },
  // ... 4 more dimensions
};
```

---

## 🔌 Integration Points

### With BCStrategy Component

- Import `dimensionSettings` from store
- Pass to `calculateDimensionGaps()`
- Display gaps in new section
- Update Radar data to include targets

### With Action Items Module

- "Create Action Item" from Gap Analysis section
- Link action items to specific dimension gaps
- Track closure as dimension improves

### With Reporting

- Export dimension targets with gap analysis
- Include in executive summary
- Historical trend chart

---

## 📋 Development Checklist (Phase 1)

- [ ] Create `DimensionTarget` Prisma schema
- [ ] Create database migration
- [ ] Add dimension target API endpoints
- [ ] Extend Zustand store with settings state
- [ ] Create `DimensionSettings` component (basic)
- [ ] Update `strategyMetrics.ts` with gap calculation
- [ ] Update Radar visualization (add target line)
- [ ] Update Radar tooltip (show targets)
- [ ] Add Settings button to BCStrategy header
- [ ] Test API endpoints
- [ ] Test UI interactions
- [ ] Update documentation

---

## 🎯 Success Criteria

**Phase 1 Complete When**:

- ✅ Users can set 1-5 targets for each dimension
- ✅ Targets persist in database
- ✅ Radar shows current (gold) vs. target (green) lines
- ✅ Gap percentage visible on hover
- ✅ No compilation errors

**Phase 2 Complete When**:

- ✅ Users can add business context for each dimension
- ✅ Gap Analysis section displays in dashboard
- ✅ Status badges (on-track, at-risk, complete) calculate correctly
- ✅ Hover shows full business context
- ✅ Professional polish on UI

---

## 📝 Future Enhancements

1. **AI Recommendations**: "Based on your targets, you should prioritize..."
2. **Compliance Mapping**: Link dimensions to compliance frameworks (SOX, HIPAA, ISO27001)
3. **Benchmarking**: Compare targets against industry averages
4. **Scenario Planning**: "If we reach Level 4 in X dimension, RTO improves by..."
5. **Integration with Finance**: Cost implications of target levels
6. **Team Alignment**: Share targets with stakeholders, get feedback

---

## 🔗 Related Files

- `src/components/BCStrategy.tsx` - Main dashboard
- `src/utils/strategyMetrics.ts` - Metric calculations
- `prisma/schema.prisma` - Database definitions
- `server/routes/settings.ts` - API endpoints (to create)
- `BCSTRATEGY_IMPLEMENTATION_COMPLETE.md` - Current implementation

---

**Next Steps**:

1. Review design with stakeholders
2. Create database migration
3. Begin Phase 1 implementation
4. Set up API endpoints
5. Build Settings component UI
