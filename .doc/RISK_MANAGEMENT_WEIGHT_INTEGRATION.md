# Risk Management Hub - Impact Weight Integration Review

## ✅ **Components Already Using Database-Stored Weights Correctly**

### 1. **Dashboard Component** (`src/components/Dashboard.tsx`)

- **Status**: ✅ **CORRECT**
- Uses `settings.impactCategories` with `cat.weight`
- Calculates risk scores with weighted formula: `total += (maxImpacts[cat.id] || 0) * cat.weight`

### 2. **Reports Component** (`src/components/Reports.tsx`)

- **Status**: ✅ **CORRECT**
- Uses `categories` from settings
- Risk matrix calculations use category-based impact scores

### 3. **Impact Assessment Component** (`src/components/ImpactAssessment.tsx`)

- **Status**: ✅ **CORRECT**
- Uses `settings.impactCategories` for all calculations
- Auto-calculates process criticality based on weighted averages

## ⚠️ **Component Fixed - Risk Score Calculation**

### 4. **Zustand Store** (`src/store/useStore.ts`)

- **Status**: ✅ **FIXED**
- **Old Code** (INCORRECT):

  ```typescript
  calculateRiskScore: (processId) => {
    const impact = get().impacts[processId];
    const weights = get().settings.impactWeights; // ❌ Using old hardcoded weights
    if (!impact) return 0;
    let total = 0,
      weightSum = 0;
    Object.entries(weights).forEach(([key, weight]) => {
      total += (impact[key as keyof ImpactAssessment] || 0) * weight;
      weightSum += weight;
    });
    return parseFloat((total / weightSum).toFixed(2));
  };
  ```

- **New Code** (CORRECT):
  ```typescript
  calculateRiskScore: (processId) => {
    const impact = get().impacts[processId];
    const categories = get().settings.impactCategories || []; // ✅ Using database categories

    if (!impact || categories.length === 0) return 0;

    let total = 0,
      weightSum = 0;

    // Use impact categories and their weights from database
    categories.forEach((category) => {
      const impactValue = impact[category.id as keyof ImpactAssessment] || 0;
      total += impactValue * category.weight;
      weightSum += category.weight;
    });

    return weightSum > 0 ? parseFloat((total / weightSum).toFixed(2)) : 0;
  };
  ```

## 📊 **Risk Calculation Formula**

The risk score is calculated using a **weighted average**:

```
Risk Score = Σ(Impact_i × Weight_i) / Σ(Weight_i)
```

Where:

- `Impact_i` = Impact score for category i (0-5 scale)
- `Weight_i` = Weight percentage for category i (stored in database)
- Sum of all weights must equal 100%

### Example Calculation:

Given impact scores and weights:

- Financial: Impact=4, Weight=25% → 4 × 25 = 100
- Operational: Impact=3, Weight=20% → 3 × 20 = 60
- Reputational: Impact=5, Weight=20% → 5 × 20 = 100
- Legal: Impact=2, Weight=15% → 2 × 15 = 30
- Health: Impact=1, Weight=15% → 1 × 15 = 15
- Environmental: Impact=2, Weight=5% → 2 × 5 = 10

**Total = (100 + 60 + 100 + 30 + 15 + 10) / 100 = 3.15**

## 🔄 **Data Flow**

1. **Database** → Impact categories stored with weights (must sum to 100%)
2. **API** → `/api/impact-categories` loads categories into app
3. **Settings** → Categories loaded into `settings.impactCategories` on mount
4. **Risk Calculation** → All components use `settings.impactCategories[].weight` for calculations

## ✅ **Validation Points**

All risk calculations now properly:

1. ✅ Load impact categories from database
2. ✅ Use database-stored weights (not hardcoded)
3. ✅ Validate weights sum to 100% before saving
4. ✅ Prevent saving invalid weight configurations
5. ✅ Update risk scores when weights change

## 🎯 **Testing Recommendations**

1. Change impact weights in Settings page
2. Verify Dashboard risk scores update accordingly
3. Check Risk Matrix in Reports reflects new weights
4. Confirm process criticality auto-updates
5. Ensure all risk calculations use same weighted formula

## 📝 **Summary**

**All risk management components are now fully integrated with the database-stored impact category weights.** The old hardcoded `impactWeights` system has been replaced with the dynamic, database-driven `impactCategories` system that allows users to customize weights while ensuring they always sum to 100%.
