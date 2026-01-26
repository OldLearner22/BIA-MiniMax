# CBA API Endpoint Reference

**API Base URL**: `http://localhost:3001/api/cost-benefit-analyses`

---

## GET - List All CBAs

### Request

```bash
GET /api/cost-benefit-analyses
```

### Response (200 OK)

```json
[
  {
    "id": "uuid-1",
    "title": "Cloud Migration Analysis",
    "description": "Initial analysis for cloud migration",
    "analysisDate": "2026-01-26T00:00:00.000Z",

    "implementationPersonnel": 150000,
    "implementationTech": 250000,
    "implementationInfra": 100000,
    "implementationTraining": 0,
    "implementationExternal": 0,
    "implementationOther": 0,

    "operationalPersonnel": 50000,
    "operationalTech": 30000,
    "operationalInfra": 20000,
    "operationalTraining": 0,
    "operationalExternal": 0,
    "operationalOther": 0,

    "maintenancePersonnel": 0,
    "maintenanceTech": 0,
    "maintenanceInfra": 0,
    "maintenanceTraining": 0,
    "maintenanceExternal": 0,
    "maintenanceOther": 0,

    "avoidedFinancial": 1000000,
    "avoidedOperational": 500000,
    "avoidedReputational": 250000,
    "avoidedLegal": 100000,

    "totalCost": 500000,
    "totalBenefit": 1850000,
    "netBenefit": 1350000,
    "roi": 270,
    "paybackPeriod": 3.2,
    "bcRatio": 3.7,

    "bestCaseRoi": 350,
    "bestCaseNetBenefit": 1750000,
    "worstCaseRoi": 150,
    "worstCaseNetBenefit": 750000,

    "riskReduction": 45,
    "intangibleBenefits": [
      "Improved staff morale",
      "Better customer satisfaction"
    ],
    "recommendation": "Proceed with implementation",
    "recommendationNotes": "Strong financial case with manageable risk",

    "status": "approved",
    "createdAt": "2026-01-26T10:30:00.000Z",
    "updatedAt": "2026-01-26T15:45:00.000Z",
    "createdBy": "analyst-001",
    "organizationId": "00000000-0000-0000-0000-000000000001"
  }
]
```

---

## GET - Single CBA

### Request

```bash
GET /api/cost-benefit-analyses/:id
```

### Response (200 OK)

```json
{
  "id": "uuid-1",
  "title": "Cloud Migration Analysis"
  // ... same as above
}
```

### Response (404 Not Found)

```json
{
  "error": "Analysis not found"
}
```

---

## POST - Create CBA

### Request

```bash
POST /api/cost-benefit-analyses
Content-Type: application/json

{
  "title": "Disaster Recovery Strategy",
  "description": "DRP for critical systems",

  "implementationPersonnel": 100000,
  "implementationTech": 150000,
  "implementationInfra": 75000,

  "operationalPersonnel": 30000,
  "operationalTech": 20000,
  "operationalInfra": 10000,

  "avoidedFinancial": 2000000,
  "avoidedOperational": 800000,

  "intangibleBenefits": ["Reduced downtime", "Compliance readiness"],
  "recommendation": "Approve",
  "status": "draft",
  "createdBy": "user-123"
}
```

### Notes on Fields

- **Required**: `title`
- **Optional (default to 0)**: All numeric fields
- **Optional (default to "")**: `description`, `recommendation`, `recommendationNotes`
- **Optional (default to [])**: `intangibleBenefits`
- **Optional (default to "draft")**: `status`
- **Optional (default to "system")**: `createdBy`

### Response (200 OK)

```json
{
  "id": "uuid-new",
  "title": "Disaster Recovery Strategy",
  "description": "DRP for critical systems",
  "analysisDate": "2026-01-26T12:00:00.000Z",

  "implementationPersonnel": 100000,
  "implementationTech": 150000,
  "implementationInfra": 75000,
  "implementationTraining": 0,
  "implementationExternal": 0,
  "implementationOther": 0,

  "operationalPersonnel": 30000,
  "operationalTech": 20000,
  "operationalInfra": 10000,
  "operationalTraining": 0,
  "operationalExternal": 0,
  "operationalOther": 0,

  "maintenancePersonnel": 0,
  "maintenanceTech": 0,
  "maintenanceInfra": 0,
  "maintenanceTraining": 0,
  "maintenanceExternal": 0,
  "maintenanceOther": 0,

  "avoidedFinancial": 2000000,
  "avoidedOperational": 800000,
  "avoidedReputational": 0,
  "avoidedLegal": 0,

  "totalCost": 325000,
  "totalBenefit": 2800000,
  "netBenefit": 2475000,
  "roi": 761.5,
  "paybackPeriod": 1.39,
  "bcRatio": 8.6,

  "bestCaseRoi": 850,
  "bestCaseNetBenefit": 2700000,
  "worstCaseRoi": 600,
  "worstCaseNetBenefit": 2000000,

  "riskReduction": 0,
  "intangibleBenefits": ["Reduced downtime", "Compliance readiness"],
  "recommendation": "Approve",
  "recommendationNotes": "",

  "status": "draft",
  "createdAt": "2026-01-26T12:00:00.000Z",
  "updatedAt": "2026-01-26T12:00:00.000Z",
  "createdBy": "user-123",
  "organizationId": "00000000-0000-0000-0000-000000000001"
}
```

---

## PUT - Update CBA

### Request

```bash
PUT /api/cost-benefit-analyses/:id
Content-Type: application/json

{
  "avoidedFinancial": 2500000,
  "avoidedReputational": 500000,
  "status": "submitted",
  "recommendationNotes": "Updated analysis shows stronger benefits"
}
```

### Notes

- All fields are optional
- Omitted fields are left unchanged
- Numeric fields use `?? 0` if falsy value provided

### Response (200 OK)

```json
{
  "id": "uuid-1",
  "title": "Disaster Recovery Strategy",

  // Previous values remain
  "implementationPersonnel": 100000,
  "implementationTech": 150000,

  // Updated values
  "avoidedFinancial": 2500000,
  "avoidedReputational": 500000,

  // Unchanged
  "status": "submitted",
  "recommendationNotes": "Updated analysis shows stronger benefits",

  "updatedAt": "2026-01-26T14:30:00.000Z",
  "createdAt": "2026-01-26T12:00:00.000Z"
}
```

---

## DELETE - Remove CBA

### Request

```bash
DELETE /api/cost-benefit-analyses/:id
```

### Response (200 OK)

```json
{
  "success": true
}
```

### Response (500 Error)

```json
{
  "error": "Failed to delete cost-benefit analysis"
}
```

---

## Field Reference

### Implementation Costs

| Field                     | Type  | Default | Description                        |
| ------------------------- | ----- | ------- | ---------------------------------- |
| `implementationPersonnel` | Float | 0       | Personnel costs for implementation |
| `implementationTech`      | Float | 0       | Technology purchase/setup costs    |
| `implementationInfra`     | Float | 0       | Infrastructure costs               |
| `implementationTraining`  | Float | 0       | Training program costs             |
| `implementationExternal`  | Float | 0       | External consulting/vendor costs   |
| `implementationOther`     | Float | 0       | Other implementation costs         |

### Operational Costs (Annual)

| Field                  | Type  | Default | Description                     |
| ---------------------- | ----- | ------- | ------------------------------- |
| `operationalPersonnel` | Float | 0       | Annual personnel costs          |
| `operationalTech`      | Float | 0       | Annual technology/license costs |
| `operationalInfra`     | Float | 0       | Annual infrastructure costs     |
| `operationalTraining`  | Float | 0       | Annual training costs           |
| `operationalExternal`  | Float | 0       | Annual external support costs   |
| `operationalOther`     | Float | 0       | Other annual costs              |

### Maintenance Costs (Annual)

| Field                  | Type  | Default | Description                       |
| ---------------------- | ----- | ------- | --------------------------------- |
| `maintenancePersonnel` | Float | 0       | Annual maintenance personnel      |
| `maintenanceTech`      | Float | 0       | Annual maintenance technology     |
| `maintenanceInfra`     | Float | 0       | Annual maintenance infrastructure |
| `maintenanceTraining`  | Float | 0       | Annual training maintenance       |
| `maintenanceExternal`  | Float | 0       | Annual external maintenance       |
| `maintenanceOther`     | Float | 0       | Other annual maintenance          |

### Avoided Losses (Annual Benefits)

| Field                 | Type  | Default | Description                    |
| --------------------- | ----- | ------- | ------------------------------ |
| `avoidedFinancial`    | Float | 0       | Financial losses avoided       |
| `avoidedOperational`  | Float | 0       | Operational losses avoided     |
| `avoidedReputational` | Float | 0       | Reputational damage avoided    |
| `avoidedLegal`        | Float | 0       | Legal/compliance costs avoided |

### Calculated Metrics

| Field           | Type  | Default | Description                                     |
| --------------- | ----- | ------- | ----------------------------------------------- |
| `totalCost`     | Float | 0       | Implementation + 3-year operational/maintenance |
| `totalBenefit`  | Float | 0       | Sum of avoided losses                           |
| `netBenefit`    | Float | 0       | Total benefit - total cost                      |
| `roi`           | Float | 0       | Return on investment (%)                        |
| `paybackPeriod` | Float | 0       | Months to break even                            |
| `bcRatio`       | Float | 0       | Benefit-cost ratio                              |
| `riskReduction` | Float | 0       | Risk reduction percentage                       |

### Scenario Analysis

| Field                 | Type  | Default | Description                |
| --------------------- | ----- | ------- | -------------------------- |
| `bestCaseRoi`         | Float | 0       | ROI in best case scenario  |
| `bestCaseNetBenefit`  | Float | 0       | Net benefit in best case   |
| `worstCaseRoi`        | Float | 0       | ROI in worst case scenario |
| `worstCaseNetBenefit` | Float | 0       | Net benefit in worst case  |

### Metadata

| Field                 | Type     | Default       | Description                                  |
| --------------------- | -------- | ------------- | -------------------------------------------- |
| `title`               | String   | (required)    | CBA title                                    |
| `description`         | String   | ""            | CBA description                              |
| `analysisDate`        | DateTime | now()         | Analysis date                                |
| `intangibleBenefits`  | String[] | []            | Non-financial benefits                       |
| `recommendation`      | String   | ""            | Recommendation (e.g., "Approve")             |
| `recommendationNotes` | String   | ""            | Additional notes                             |
| `status`              | Enum     | "draft"       | Status: draft, submitted, approved, rejected |
| `createdBy`           | String   | "system"      | User who created record                      |
| `createdAt`           | DateTime | now()         | Record creation timestamp                    |
| `updatedAt`           | DateTime | now()         | Last update timestamp                        |
| `organizationId`      | String   | "org-default" | Organization ID                              |

---

## Example Usage in TypeScript

```typescript
// Fetch all CBAs
const response = await fetch("/api/cost-benefit-analyses");
const cbas: CostBenefitAnalysis[] = await response.json();

// Create new CBA
const newCBA = await fetch("/api/cost-benefit-analyses", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    title: "New Analysis",
    implementationTech: 50000,
    avoidedFinancial: 200000,
  }),
});
const created: CostBenefitAnalysis = await newCBA.json();

// Update CBA
const updated = await fetch(`/api/cost-benefit-analyses/${id}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    avoidedFinancial: 300000,
    status: "approved",
  }),
});

// Delete CBA
await fetch(`/api/cost-benefit-analyses/${id}`, {
  method: "DELETE",
});
```

---

## Error Responses

### 400 Bad Request

```json
{
  "error": "Invalid request body"
}
```

### 404 Not Found

```json
{
  "error": "Analysis not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Failed to create cost-benefit analysis"
}
```

---

**Version**: 1.0  
**Last Updated**: January 26, 2026
