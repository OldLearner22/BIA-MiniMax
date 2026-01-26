# System Configuration vs Sample Data - Clarification

**Date**: January 26, 2026

---

## Key Distinction

After removing ALL hardcoded sample data, the remaining `DEFAULT_*` constants in [src/types/index.ts](src/types/index.ts) are **NOT sample data** - they are **system configuration and baselines** that are appropriate to keep.

### Sample Data Definition

**Sample data** = Pre-populated instances of user content (processes, impacts, dependencies, etc.) used for demonstration/testing.

### System Configuration Definition

**System configuration** = Framework structures, default settings, and baseline values that define how the application operates.

---

## Remaining DEFAULT\_ Constants - Justified

### 1. DEFAULT_BUSINESS_RESOURCES

```typescript
export const DEFAULT_BUSINESS_RESOURCES: BusinessResource[] = [
  { id: "res-1", name: "ERP System", type: "systems", ... },
  { id: "res-2", name: "IT Support Team", type: "personnel", ... },
  { id: "res-3", name: "Primary Data Center", type: "facilities", ... },
];
```

**Why Keep:**

- These are **resource type templates**, not sample data
- They serve as the default resource pool that organizations can customize
- Users inherit and adapt these; they don't use them directly
- Analogous to default role templates in permission systems

**How Used:**

- Initial fallback resources when organization starts
- Templates for common resource types
- Customizable in Settings API

**Status**: ✅ **Appropriate to keep**

---

### 2. DEFAULT_RESOURCE_DEPENDENCIES

```typescript
export const DEFAULT_RESOURCE_DEPENDENCIES: ResourceDependency[] = [
  { id: "dep-1", sourceResourceId: "res-2", targetResourceId: "res-4", ... },
  // ... more dependency patterns
];
```

**Why Keep:**

- These define **typical dependency patterns**, not specific to any process
- Users can use as templates for modeling their own dependencies
- System-level configuration, not sample data

**How Used:**

- Reference patterns for how resources depend on each other
- Foundation for building real dependencies

**Status**: ✅ **Appropriate to keep**

---

### 3. DEFAULT_EXERCISE_RECORDS

```typescript
export const DEFAULT_EXERCISE_RECORDS: ExerciseRecord[] = [
  { id: "ex-1", name: "Initial Assessment", description: "...", ... },
  // ... exercise templates
];
```

**Why Keep:**

- These are **exercise templates/framework**, not sample testing records
- Organizations configure exercises based on these patterns
- Provides structure for business continuity testing

**How Used:**

- Templates that organizations customize with their specific processes
- Framework for exercise management

**Status**: ✅ **Appropriate to keep**

---

### 4. DEFAULT_TIMELINE_POINTS

```typescript
export const DEFAULT_TIMELINE_POINTS = [
  { timeOffset: 0, timeLabel: "Immediate" },
  { timeOffset: 4, timeLabel: "4 hours" },
  { timeOffset: 8, timeLabel: "8 hours" },
  // ... more time points
];
```

**Why Keep:**

- These are **standard time intervals** for impact analysis
- Not organization-specific data
- Used by ALL organizations for temporal analysis
- Can be overridden via DEFAULT_CUSTOM_TIMELINE_POINTS

**How Used:**

- Starting point for temporal analysis
- Configurable via Settings

**Status**: ✅ **Appropriate to keep - System standard**

---

### 5. DEFAULT_CUSTOM_TIMELINE_POINTS

```typescript
export const DEFAULT_CUSTOM_TIMELINE_POINTS: CustomTimelinePoint[] = [
  { id: "ctp-1", label: "Immediate", value: 0, unit: "hours" },
  { id: "ctp-2", label: "4 hours", value: 4, unit: "hours" },
  // ... customizable timeline points
];
```

**Why Keep:**

- These are **editable settings**, not hardcoded data
- Users can add/remove/modify timeline points
- Stored in Settings which is user-configurable
- Different for each organization

**How Used:**

- Initial defaults; users customize for their needs
- Persisted to Settings in database

**Status**: ✅ **Appropriate to keep - User configurable**

---

### 6. DEFAULT_IMPACT_CATEGORIES

```typescript
export const DEFAULT_IMPACT_CATEGORIES: ImpactCategory[] = [
  { id: 'financial', name: 'Financial Impact', ... },
  { id: 'operational', name: 'Operational Impact', ... },
  { id: 'reputational', name: 'Reputational Impact', ... },
  { id: 'legal', name: 'Legal/Regulatory Impact', ... },
  { id: 'health', name: 'Health & Safety Impact', ... },
  { id: 'environmental', name: 'Environmental Impact', ... },
];
```

**Why Keep:**

- These are **ISO 22301 standard impact dimensions**
- Required for compliance; universal across all organizations
- Not sample data; they're the framework itself
- Cannot be removed without breaking ISO compliance

**How Used:**

- Every impact assessment uses these categories
- Users assign severity scores (0-5) to each category
- Categories themselves never change

**Status**: ✅ **Appropriate to keep - Compliance required**

---

### 7. DEFAULT_SETTINGS

```typescript
export const DEFAULT_SETTINGS: Settings = {
  impactWeights: {
    financial: 25,
    operational: 25,
    reputational: 20,
    legal: 15,
    health: 10,
    environmental: 5,
  },
  theme: "dark",
  impactThreshold: 3,
  customTimelinePoints: DEFAULT_CUSTOM_TIMELINE_POINTS,
  impactCategories: DEFAULT_IMPACT_CATEGORIES,
};
```

**Why Keep:**

- These are **application-level settings**, not sample data
- Initialize Settings object that users can customize
- Stored in database; these are just defaults

**How Used:**

- Initialize Settings when organization created
- Users adjust impact weights, theme, threshold per their needs
- Persisted to database Settings table

**Status**: ✅ **Appropriate to keep - User configurable defaults**

---

### 8. DEFAULT_DIMENSION_TARGETS

```typescript
export const DEFAULT_DIMENSION_TARGETS: Record<string, DimensionTarget> = {
  coverage: { current: 0, target: 85 },
  capability: { current: 0, target: 80 },
  readiness: { current: 0, target: 75 },
  compliance: { current: 0, target: 90 },
  riskManagement: { current: 0, target: 85 },
};
```

**Why Keep:**

- These are **maturity dimension configuration**, not sample data
- Define what success looks like for BC program
- Can be customized by organization
- Framework standard, not sample content

**How Used:**

- Baseline targets for BC maturity assessment
- Users can modify per organizational goals

**Status**: ✅ **Appropriate to keep - System configuration**

---

## Summary: What Was Removed vs. What Remains

### ❌ REMOVED (Runtime Sample Data)

- `SAMPLE_PROCESSES` - 5 actual processes (sample data)
- `SAMPLE_IMPACTS` - Pre-filled impact assessments (sample data)
- `SAMPLE_RECOVERY` - Pre-calculated recovery objectives (sample data)
- `SAMPLE_TEMPORAL` - Timeline data for sample processes (sample data)
- `SAMPLE_DEPENDENCIES` - Process relationships (sample data)
- `SAMPLE_RISKS`, `SAMPLE_THREATS` - Sample risk items (sample data)
- `SAMPLE_STRATEGIC_ITEMS` - Sample strategic planning (sample data)
- `SAMPLE_BC_PEOPLE` - Sample team members (sample data)
- All other SAMPLE\_\* data = **Sample process/asset data**

### ✅ KEPT (System Configuration & Framework)

- `DEFAULT_BUSINESS_RESOURCES` - Resource type templates
- `DEFAULT_RESOURCE_DEPENDENCIES` - Dependency pattern templates
- `DEFAULT_EXERCISE_RECORDS` - Exercise framework
- `DEFAULT_TIMELINE_POINTS` - Standard time intervals
- `DEFAULT_CUSTOM_TIMELINE_POINTS` - User-configurable timeline
- `DEFAULT_IMPACT_CATEGORIES` - ISO 22301 impact types
- `DEFAULT_SETTINGS` - Application settings
- `DEFAULT_DIMENSION_TARGETS` - Maturity dimension configuration

**All kept items are**: Configuration, templates, frameworks, or user-customizable settings.

---

## Alignment with TECHNICAL_DOCUMENTATION.md

From Section 4 (Module-by-Module Logic):

> **"The application evaluates five distinct impact dimensions: financial loss, operational disruption, reputational damage, regulatory compliance violations, and customer impact."**

The DEFAULT_IMPACT_CATEGORIES represent exactly these **required framework elements**. These are NOT sample data; they're the structural requirement for ISO 22301 compliance.

---

## Conclusion

The distinction between **sample data** (removed) and **system configuration** (kept) is clear:

- **Sample data** = User-created content instances (processes, impacts, risks, etc.) → **Removed, now database-only**
- **System configuration** = Framework, templates, standards, user preferences → **Appropriately kept as code defaults**

This approach gives us the best of both worlds:

1. ✅ No hardcoded sample pollution
2. ✅ Fast initialization with system framework
3. ✅ Full customization via API/database
4. ✅ Clean, maintainable architecture

---

**Document**: System Configuration vs Sample Data Clarification  
**Status**: Complete  
**Date**: January 26, 2026
