# 🎯 Incident Management Module - Implementation Plan

**Project:** BIA - MiniMax BCMS  
**Module:** Incident Management  
**Scope:** Dashboard-Based Incident Declaration & Management  
**Created:** 2026-01-21  
**Status:** Ready for Implementation

---

## 📋 Implementation Plan Overview

### **Scope Definition**

Focus on core incident lifecycle management accessible from the main BCMS dashboard, with essential features only. Multi-channel access and advanced features are explicitly out of scope for this phase.

### **Time Estimates**

- **Phase 1: Database Schema** - 2-3 hours
- **Phase 2: Backend API** - 3-4 hours
- **Phase 3: Frontend Components** - 4-6 hours
- **Phase 4: Integration & Testing** - 2-3 hours

**Total Estimated Time:** 11-16 hours

---

## 🗄️ PHASE 1: Database Schema (Prisma)

### Objective

Create comprehensive database schema for incident management using Prisma ORM, ensuring ISO 22301 compliance and proper relationships with existing BCMS modules.

### Step 1.1: Create Incident Models in Prisma Schema

**File:** `prisma/schema.prisma`

Add the following models:

```prisma
// ============================================================================
// INCIDENT MANAGEMENT MODELS
// ============================================================================

model Incident {
  id                    String            @id @default(uuid())
  incidentNumber        String            @unique
  title                 String
  description           String
  category              IncidentCategory
  severity              IncidentSeverity
  status                IncidentStatus    @default(REPORTED)

  // Impact Assessment
  impactAreas           ImpactArea[]
  businessImpact        String
  estimatedFinancialImpact Float?

  // Affected Items
  affectedProcessIds    String[]          // Array of Process IDs
  affectedLocations     String[]
  affectedSystems       String[]

  // Timeline (ISO 22301 Required)
  detectionTime         DateTime          @default(now())
  reportTime            DateTime          @default(now())
  responseStartTime     DateTime?
  resolutionTime        DateTime?
  closureTime           DateTime?

  // Response Information
  initialResponseActions String
  escalationDetails     String?
  rootCause             String?
  correctiveActions     String?
  preventiveActions     String?

  // Relationships
  reportedBy            String
  assignedTo            String?

  // Metadata
  createdAt             DateTime          @default(now())
  updatedAt             DateTime          @updatedAt
  organizationId        String            @default("00000000-0000-0000-0000-000000000001")

  // Relations
  updates               IncidentUpdate[]
  decisions             IncidentDecision[]
  communications        IncidentCommunication[]
  recoveryTasks         RecoveryTask[]
}

model IncidentUpdate {
  id              String              @id @default(uuid())
  incidentId      String
  updateType      IncidentUpdateType
  title           String
  description     String
  previousStatus  IncidentStatus?
  newStatus       IncidentStatus?
  actionsTaken    String[]
  createdBy       String
  createdAt       DateTime            @default(now())

  incident        Incident            @relation(fields: [incidentId], references: [id], onDelete: Cascade)
}

model IncidentDecision {
  id                  String   @id @default(uuid())
  incidentId          String
  decisionNumber      String
  title               String
  description         String
  decisionMaker       String
  decisionRationale   String
  optionsConsidered   String[]
  implementationPlan  String?
  decisionTimestamp   DateTime @default(now())
  createdAt           DateTime @default(now())

  incident            Incident @relation(fields: [incidentId], references: [id], onDelete: Cascade)

  @@unique([incidentId, decisionNumber])
}

model IncidentCommunication {
  id                String   @id @default(uuid())
  incidentId        String
  communicationType String
  subject           String
  message           String
  recipients        String[]
  sentBy            String
  sentAt            DateTime @default(now())

  incident          Incident @relation(fields: [incidentId], references: [id], onDelete: Cascade)
}

model RecoveryTask {
  id              String              @id @default(uuid())
  incidentId      String
  taskNumber      String
  title           String
  description     String
  status          RecoveryTaskStatus  @default(NOT_STARTED)
  priority        TaskPriority
  assignedTo      String?
  dueDate         DateTime?
  completedAt     DateTime?
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt

  incident        Incident            @relation(fields: [incidentId], references: [id], onDelete: Cascade)

  @@unique([incidentId, taskNumber])
}

// ============================================================================
// ENUMS
// ============================================================================

enum IncidentCategory {
  TECHNICAL_FAILURE
  HUMAN_ERROR
  NATURAL_DISASTER
  MALICIOUS_ACTIVITY
  SUPPLY_CHAIN_DISRUPTION
  UTILITY_OUTAGE
  HEALTH_EMERGENCY
  OTHER
}

enum IncidentSeverity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum IncidentStatus {
  REPORTED
  ASSESSED
  RESPONDING
  ESCALATED
  RESOLVED
  CLOSED
  CANCELLED
}

enum ImpactArea {
  FINANCIAL
  OPERATIONAL
  REPUTATIONAL
  LEGAL
  SAFETY
  ENVIRONMENTAL
}

enum IncidentUpdateType {
  STATUS_CHANGE
  ACTION_TAKEN
  INFORMATION_UPDATE
  ESCALATION
}

enum RecoveryTaskStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
  BLOCKED
  CANCELLED
}

enum TaskPriority {
  CRITICAL
  HIGH
  MEDIUM
  LOW
}
```

### Step 1.2: Create and Apply Migration

**Commands:**

```bash
# Create migration
npx prisma migrate dev --name add_incident_management

# Generate Prisma client
npx prisma generate
```

**Verification:**

```bash
# Check migration status
npx prisma migrate status

# Validate schema
npx prisma validate
```

### Deliverables

- ✅ Complete Prisma schema with all incident management models
- ✅ Applied database migration
- ✅ Generated Prisma client with TypeScript types

---

## 🔧 PHASE 2: Backend API

### Objective

Create a robust REST API for incident management with proper service layer separation, type safety, and error handling.

### Step 2.1: Create Type Definitions

**File:** `shared/types/incident.types.ts`

```typescript
// Re-export Prisma-generated types and enums
export * from "@prisma/client";

export interface IncidentStatistics {
  total: number;
  byStatus: Record<string, number>;
  bySeverity: Record<string, number>;
  byCategory: Record<string, number>;
  mttr: number; // Mean Time to Resolution (hours)
  unresolved: number;
  escalated: number;
  activeIncidents: number;
  resolvedLast30Days: number;
}

export interface IncidentSearchCriteria {
  status?: string[];
  severity?: string[];
  category?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  reportedBy?: string;
  assignedTo?: string;
  searchText?: string;
  page?: number;
  limit?: number;
}

export interface CreateIncidentDTO {
  title: string;
  description: string;
  category: string;
  severity: string;
  impactAreas: string[];
  businessImpact: string;
  affectedProcessIds?: string[];
  affectedLocations?: string[];
  affectedSystems?: string[];
  initialResponseActions: string;
  estimatedFinancialImpact?: number;
  reportedBy: string;
  detectionTime?: Date;
}

export interface UpdateIncidentDTO {
  title?: string;
  description?: string;
  status?: string;
  severity?: string;
  assignedTo?: string;
  escalationDetails?: string;
  rootCause?: string;
  correctiveActions?: string;
  preventiveActions?: string;
}

export interface CreateIncidentUpdateDTO {
  updateType: string;
  title: string;
  description: string;
  previousStatus?: string;
  newStatus?: string;
  actionsTaken?: string[];
  createdBy: string;
}
```

### Step 2.2: Create Incident Service

**File:** `server/services/incident.service.ts`

```typescript
import { PrismaClient } from "@prisma/client";
import type {
  CreateIncidentDTO,
  UpdateIncidentDTO,
  CreateIncidentUpdateDTO,
  IncidentStatistics,
  IncidentSearchCriteria,
} from "../../shared/types/incident.types";

const prisma = new PrismaClient();

export class IncidentService {
  /**
   * Create a new incident with auto-generated incident number
   */
  async createIncident(data: CreateIncidentDTO) {
    // Generate incident number: INC-YYYY-NNNN
    const count = await prisma.incident.count();
    const incidentNumber = `INC-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

    return await prisma.incident.create({
      data: {
        ...data,
        incidentNumber,
        detectionTime: data.detectionTime || new Date(),
      },
    });
  }

  /**
   * Get incidents with filtering, pagination, and search
   */
  async getIncidents(criteria: IncidentSearchCriteria = {}) {
    const {
      page = 1,
      limit = 20,
      status,
      severity,
      category,
      searchText,
    } = criteria;

    const where: any = {};

    // Apply filters
    if (status?.length) where.status = { in: status };
    if (severity?.length) where.severity = { in: severity };
    if (category?.length) where.category = { in: category };

    // Apply search
    if (searchText) {
      where.OR = [
        { title: { contains: searchText, mode: "insensitive" } },
        { description: { contains: searchText, mode: "insensitive" } },
        { incidentNumber: { contains: searchText, mode: "insensitive" } },
      ];
    }

    // Execute query with pagination
    const [incidents, total] = await Promise.all([
      prisma.incident.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          updates: {
            take: 5,
            orderBy: { createdAt: "desc" },
          },
          _count: {
            select: {
              updates: true,
              decisions: true,
              communications: true,
              recoveryTasks: true,
            },
          },
        },
      }),
      prisma.incident.count({ where }),
    ]);

    return {
      incidents,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get a single incident by ID with all related data
   */
  async getIncidentById(id: string) {
    return await prisma.incident.findUnique({
      where: { id },
      include: {
        updates: { orderBy: { createdAt: "desc" } },
        decisions: { orderBy: { createdAt: "desc" } },
        communications: { orderBy: { sentAt: "desc" } },
        recoveryTasks: { orderBy: { createdAt: "desc" } },
      },
    });
  }

  /**
   * Update an existing incident
   */
  async updateIncident(id: string, data: UpdateIncidentDTO) {
    // Check if incident exists
    const existing = await prisma.incident.findUnique({ where: { id } });
    if (!existing) {
      throw new Error("Incident not found");
    }

    // Handle status transitions with timestamps
    const updateData: any = { ...data };

    if (data.status && data.status !== existing.status) {
      if (data.status === "RESPONDING" && !existing.responseStartTime) {
        updateData.responseStartTime = new Date();
      } else if (data.status === "RESOLVED" && !existing.resolutionTime) {
        updateData.resolutionTime = new Date();
      } else if (data.status === "CLOSED" && !existing.closureTime) {
        updateData.closureTime = new Date();
      }
    }

    return await prisma.incident.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Add an update/log entry to an incident
   */
  async addIncidentUpdate(
    incidentId: string,
    updateData: CreateIncidentUpdateDTO,
  ) {
    // Verify incident exists
    const incident = await prisma.incident.findUnique({
      where: { id: incidentId },
    });
    if (!incident) {
      throw new Error("Incident not found");
    }

    return await prisma.incidentUpdate.create({
      data: {
        ...updateData,
        incidentId,
      },
    });
  }

  /**
   * Get comprehensive incident statistics
   */
  async getStatistics(): Promise<IncidentStatistics> {
    const [
      total,
      byStatus,
      bySeverity,
      byCategory,
      resolvedIncidents,
      activeIncidents,
      resolvedLast30Days,
    ] = await Promise.all([
      // Total incidents
      prisma.incident.count(),

      // Group by status
      prisma.incident.groupBy({
        by: ["status"],
        _count: true,
      }),

      // Group by severity
      prisma.incident.groupBy({
        by: ["severity"],
        _count: true,
      }),

      // Group by category
      prisma.incident.groupBy({
        by: ["category"],
        _count: true,
      }),

      // Resolved incidents for MTTR calculation
      prisma.incident.findMany({
        where: {
          status: "RESOLVED",
          resolutionTime: { not: null },
        },
        select: {
          detectionTime: true,
          resolutionTime: true,
        },
      }),

      // Active incidents count
      prisma.incident.count({
        where: {
          status: { in: ["REPORTED", "ASSESSED", "RESPONDING", "ESCALATED"] },
        },
      }),

      // Resolved in last 30 days
      prisma.incident.count({
        where: {
          status: "RESOLVED",
          resolutionTime: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // Calculate Mean Time to Resolution (MTTR)
    let totalResolutionTime = 0;
    resolvedIncidents.forEach((inc) => {
      if (inc.resolutionTime && inc.detectionTime) {
        const resolutionHours =
          (inc.resolutionTime.getTime() - inc.detectionTime.getTime()) /
          (1000 * 60 * 60);
        totalResolutionTime += resolutionHours;
      }
    });
    const mttr =
      resolvedIncidents.length > 0
        ? totalResolutionTime / resolvedIncidents.length
        : 0;

    return {
      total,
      byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count])),
      bySeverity: Object.fromEntries(
        bySeverity.map((s) => [s.severity, s._count]),
      ),
      byCategory: Object.fromEntries(
        byCategory.map((c) => [c.category, c._count]),
      ),
      mttr: Math.round(mttr * 100) / 100,
      unresolved: activeIncidents,
      escalated: byStatus.find((s) => s.status === "ESCALATED")?._count || 0,
      activeIncidents,
      resolvedLast30Days,
    };
  }

  /**
   * Delete an incident (soft delete by setting status to CANCELLED)
   */
  async deleteIncident(id: string) {
    return await prisma.incident.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
  }
}

export const incidentService = new IncidentService();
```

### Step 2.3: Create API Routes

**File:** `server/routes/incident.routes.ts`

```typescript
import express from "express";
import { incidentService } from "../services/incident.service";

const router = express.Router();

/**
 * GET /api/incidents
 * Get all incidents with filtering and pagination
 */
router.get("/", async (req, res) => {
  try {
    const result = await incidentService.getIncidents(req.query);
    res.json(result);
  } catch (error) {
    console.error("Error fetching incidents:", error);
    res.status(500).json({ error: "Failed to fetch incidents" });
  }
});

/**
 * GET /api/incidents/statistics
 * Get incident statistics
 */
router.get("/statistics", async (req, res) => {
  try {
    const stats = await incidentService.getStatistics();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

/**
 * GET /api/incidents/:id
 * Get a single incident by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const incident = await incidentService.getIncidentById(req.params.id);
    if (!incident) {
      return res.status(404).json({ error: "Incident not found" });
    }
    res.json(incident);
  } catch (error) {
    console.error("Error fetching incident:", error);
    res.status(500).json({ error: "Failed to fetch incident" });
  }
});

/**
 * POST /api/incidents
 * Create a new incident
 */
router.post("/", async (req, res) => {
  try {
    const incident = await incidentService.createIncident(req.body);
    res.status(201).json(incident);
  } catch (error) {
    console.error("Error creating incident:", error);
    res.status(500).json({ error: "Failed to create incident" });
  }
});

/**
 * PUT /api/incidents/:id
 * Update an existing incident
 */
router.put("/:id", async (req, res) => {
  try {
    const incident = await incidentService.updateIncident(
      req.params.id,
      req.body,
    );
    res.json(incident);
  } catch (error) {
    console.error("Error updating incident:", error);
    res.status(500).json({ error: "Failed to update incident" });
  }
});

/**
 * POST /api/incidents/:id/updates
 * Add an update/log entry to an incident
 */
router.post("/:id/updates", async (req, res) => {
  try {
    const update = await incidentService.addIncidentUpdate(
      req.params.id,
      req.body,
    );
    res.status(201).json(update);
  } catch (error) {
    console.error("Error adding incident update:", error);
    res.status(500).json({ error: "Failed to add update" });
  }
});

/**
 * DELETE /api/incidents/:id
 * Delete (cancel) an incident
 */
router.delete("/:id", async (req, res) => {
  try {
    const incident = await incidentService.deleteIncident(req.params.id);
    res.json(incident);
  } catch (error) {
    console.error("Error deleting incident:", error);
    res.status(500).json({ error: "Failed to delete incident" });
  }
});

export default router;
```

### Step 2.4: Register Routes in Main Server

**File:** `server/index.ts`

Add the following:

```typescript
import incidentRoutes from "./routes/incident.routes";

// Register incident management routes
app.use("/api/incidents", incidentRoutes);
```

### Deliverables

- ✅ Complete type definitions for incident management
- ✅ Robust service layer with business logic
- ✅ RESTful API routes with proper error handling
- ✅ Integrated routes in main server

---

## 🎨 PHASE 3: Frontend Components

### Objective

Create intuitive, user-friendly React components for incident declaration and management with proper state management and error handling.

### Step 3.1: Create Zustand Store Slice

**File:** `src/store/useStore.ts`

Add the following to your existing store:

```typescript
interface IncidentState {
  incidents: any[];
  selectedIncident: any | null;
  statistics: any | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchIncidents: (criteria?: any) => Promise<void>;
  fetchStatistics: () => Promise<void>;
  createIncident: (data: any) => Promise<void>;
  updateIncident: (id: string, data: any) => Promise<void>;
  selectIncident: (id: string) => Promise<void>;
  addIncidentUpdate: (incidentId: string, update: any) => Promise<void>;
  clearSelectedIncident: () => void;
}

// Add to your store creation
const incidentSlice = (set, get) => ({
  incidents: [],
  selectedIncident: null,
  statistics: null,
  loading: false,
  error: null,

  fetchIncidents: async (criteria = {}) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams(criteria);
      const response = await fetch(`/api/incidents?${params}`);
      if (!response.ok) throw new Error("Failed to fetch incidents");
      const data = await response.json();
      set({ incidents: data.incidents, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchStatistics: async () => {
    try {
      const response = await fetch("/api/incidents/statistics");
      if (!response.ok) throw new Error("Failed to fetch statistics");
      const data = await response.json();
      set({ statistics: data });
    } catch (error) {
      console.error("Failed to fetch statistics:", error);
    }
  },

  createIncident: async (incidentData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(incidentData),
      });
      if (!response.ok) throw new Error("Failed to create incident");
      const incident = await response.json();
      set((state) => ({
        incidents: [incident, ...state.incidents],
        loading: false,
      }));
      // Refresh statistics
      get().fetchStatistics();
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateIncident: async (id, data) => {
    try {
      const response = await fetch(`/api/incidents/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update incident");
      const updated = await response.json();
      set((state) => ({
        incidents: state.incidents.map((inc) =>
          inc.id === id ? updated : inc,
        ),
        selectedIncident:
          state.selectedIncident?.id === id ? updated : state.selectedIncident,
      }));
      // Refresh statistics
      get().fetchStatistics();
    } catch (error) {
      console.error("Failed to update incident:", error);
      throw error;
    }
  },

  selectIncident: async (id) => {
    set({ loading: true });
    try {
      const response = await fetch(`/api/incidents/${id}`);
      if (!response.ok) throw new Error("Failed to fetch incident");
      const incident = await response.json();
      set({ selectedIncident: incident, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  addIncidentUpdate: async (incidentId, updateData) => {
    try {
      const response = await fetch(`/api/incidents/${incidentId}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) throw new Error("Failed to add update");
      // Refresh the incident details
      await get().selectIncident(incidentId);
    } catch (error) {
      console.error("Failed to add incident update:", error);
      throw error;
    }
  },

  clearSelectedIncident: () => {
    set({ selectedIncident: null });
  },
});
```

### Step 3.2: Create Incident Declaration Form

**File:** `src/components/incident/IncidentDeclarationForm.tsx`

```typescript
import React, { useState } from 'react';
import { X, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface IncidentDeclarationFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const IncidentDeclarationForm: React.FC<IncidentDeclarationFormProps> = ({
  onClose,
  onSuccess
}) => {
  const createIncident = useStore(state => state.createIncident);
  const processes = useStore(state => state.processes);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'TECHNICAL_FAILURE',
    severity: 'MEDIUM',
    impactAreas: [] as string[],
    businessImpact: '',
    affectedProcessIds: [] as string[],
    affectedLocations: [] as string[],
    affectedSystems: [] as string[],
    initialResponseActions: '',
    estimatedFinancialImpact: undefined as number | undefined,
    reportedBy: 'Current User', // TODO: Get from auth context
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const severityConfig = {
    CRITICAL: {
      color: 'bg-red-600 hover:bg-red-700 border-red-600',
      icon: AlertTriangle,
      label: 'Critical',
      description: 'Catastrophic disruption, severe impact'
    },
    HIGH: {
      color: 'bg-orange-500 hover:bg-orange-600 border-orange-500',
      icon: AlertCircle,
      label: 'High',
      description: 'Major disruption, substantial impact'
    },
    MEDIUM: {
      color: 'bg-yellow-500 hover:bg-yellow-600 border-yellow-500',
      icon: Info,
      label: 'Medium',
      description: 'Significant disruption, some impact'
    },
    LOW: {
      color: 'bg-blue-500 hover:bg-blue-600 border-blue-500',
      icon: Info,
      label: 'Low',
      description: 'Minor disruption, minimal impact'
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.businessImpact.trim()) newErrors.businessImpact = 'Business impact is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      await createIncident(formData);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to create incident:', error);
      setErrors({ submit: 'Failed to create incident. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleImpactArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      impactAreas: prev.impactAreas.includes(area)
        ? prev.impactAreas.filter(a => a !== area)
        : [...prev.impactAreas, area],
    }));
  };

  const toggleProcess = (processId: string) => {
    setFormData(prev => ({
      ...prev,
      affectedProcessIds: prev.affectedProcessIds.includes(processId)
        ? prev.affectedProcessIds.filter(id => id !== processId)
        : [...prev.affectedProcessIds, processId],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-red-600 text-white px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
            <h2 className="text-xl font-bold">🚨 DECLARE INCIDENT</h2>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-red-700 p-2 rounded transition-colors"
            disabled={submitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.submit}
            </div>
          )}

          {/* Critical Information */}
          <section className="border-l-4 border-red-500 pl-4 bg-red-50 p-4 rounded-r">
            <h3 className="text-lg font-semibold mb-4 text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Critical Information
            </h3>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Incident Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Brief, descriptive title (e.g., 'Data Center Power Failure')"
                  disabled={submitting}
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              {/* Severity Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Severity Level *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(severityConfig).map(([key, config]) => {
                    const Icon = config.icon;
                    const isSelected = formData.severity === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFormData({ ...formData, severity: key })}
                        disabled={submitting}
                        className={`
                          ${config.color}
                          ${isSelected ? 'ring-4 ring-offset-2 ring-gray-400 scale-105' : 'opacity-80'}
                          text-white p-4 rounded-lg transition-all duration-200
                          disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                      >
                        <Icon className="w-6 h-6 mx-auto mb-2" />
                        <div className="text-sm font-bold">{config.label}</div>
                        <div className="text-xs mt-1 opacity-90">{config.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Incident Type *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
                  disabled={submitting}
                >
                  <option value="TECHNICAL_FAILURE">Technical Failure</option>
                  <option value="HUMAN_ERROR">Human Error</option>
                  <option value="NATURAL_DISASTER">Natural Disaster</option>
                  <option value="MALICIOUS_ACTIVITY">Malicious Activity / Cyber Attack</option>
                  <option value="SUPPLY_CHAIN_DISRUPTION">Supply Chain Disruption</option>
                  <option value="UTILITY_OUTAGE">Utility Outage</option>
                  <option value="HEALTH_EMERGENCY">Health Emergency / Pandemic</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
          </section>

          {/* Detailed Information */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Incident Details</h3>

            <div className="space-y-4">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
                  placeholder="Detailed description of what happened, when it occurred, and current impact..."
                  disabled={submitting}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              {/* Business Impact */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Impact *
                </label>
                <textarea
                  value={formData.businessImpact}
                  onChange={(e) => setFormData({ ...formData, businessImpact: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
                  placeholder="Describe the impact on business operations, customers, revenue, etc."
                  disabled={submitting}
                />
                {errors.businessImpact && <p className="text-red-500 text-sm mt-1">{errors.businessImpact}</p>}
              </div>

              {/* Initial Response Actions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Response Actions
                </label>
                <textarea
                  value={formData.initialResponseActions}
                  onChange={(e) => setFormData({ ...formData, initialResponseActions: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
                  placeholder="Immediate actions taken or required to respond to this incident..."
                  disabled={submitting}
                />
              </div>
            </div>
          </section>

          {/* Impact Areas */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Impact Areas</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['FINANCIAL', 'OPERATIONAL', 'REPUTATIONAL', 'LEGAL', 'SAFETY', 'ENVIRONMENTAL'].map(area => (
                <label
                  key={area}
                  className="flex items-center space-x-2 cursor-pointer p-3 border rounded-md hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.impactAreas.includes(area)}
                    onChange={() => toggleImpactArea(area)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    disabled={submitting}
                  />
                  <span className="text-sm text-gray-700 font-medium">{area}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Affected Processes */}
          {processes && processes.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Affected Processes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                {processes.map(process => (
                  <label
                    key={process.id}
                    className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={formData.affectedProcessIds.includes(process.id)}
                      onChange={() => toggleProcess(process.id)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      disabled={submitting}
                    />
                    <span className="text-sm text-gray-700">{process.name}</span>
                  </label>
                ))}
              </div>
            </section>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              {submitting ? 'Declaring Incident...' : 'DECLARE INCIDENT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncidentDeclarationForm;
```

### Step 3.3: Update Incident Dashboard

Update `src/components/incident/IncidentDashboard.tsx` to use real data from the store.

### Step 3.4: Create Incident List Component

Create `src/components/incident/IncidentList.tsx` for viewing and managing all incidents.

### Step 3.5: Integrate into Main Dashboard

Add a prominent "DECLARE INCIDENT" button to the main dashboard that opens the declaration form.

### Deliverables

- ✅ Complete Zustand store integration
- ✅ Incident declaration form with validation
- ✅ Updated incident dashboard with real data
- ✅ Incident list component
- ✅ Main dashboard integration

---

## 🔗 PHASE 4: Integration & Testing

### Objective

Ensure all components work together seamlessly and the module is production-ready.

### Step 4.1: Integration Points

1. **Main Dashboard Integration**
   - Add "DECLARE INCIDENT" emergency button
   - Add incident statistics widget
   - Link to incident management module

2. **Sidebar Navigation**
   - Enable "Incident Management" menu item
   - Add sub-menu items (Dashboard, Incident Log, etc.)
   - Update routing

3. **Process Integration**
   - Link incidents to affected processes
   - Display incident count on process cards
   - Enable incident creation from process view

4. **Risk Integration**
   - Link incidents to triggered risk scenarios
   - Update risk register when incidents occur
   - Show related incidents in risk details

### Step 4.2: Testing Checklist

**Functional Testing:**

- [ ] Create incident from dashboard
- [ ] View incident list with filters
- [ ] View incident details
- [ ] Update incident status
- [ ] Add incident updates
- [ ] View statistics dashboard
- [ ] Filter incidents by status/severity/category
- [ ] Search incidents by text
- [ ] Link incidents to processes
- [ ] Verify incident numbering (INC-YYYY-NNNN)

**UI/UX Testing:**

- [ ] Form validation works correctly
- [ ] Error messages are clear
- [ ] Loading states display properly
- [ ] Mobile responsiveness
- [ ] Keyboard navigation
- [ ] Accessibility (ARIA labels, focus management)

**Data Integrity Testing:**

- [ ] Incident numbers are unique
- [ ] Timestamps are recorded correctly
- [ ] Status transitions are valid
- [ ] Related data (updates, decisions) cascade properly
- [ ] Statistics calculations are accurate

**Performance Testing:**

- [ ] Large incident lists load efficiently
- [ ] Pagination works correctly
- [ ] Search is responsive
- [ ] No memory leaks in long sessions

### Step 4.3: Documentation

Create user documentation:

- How to declare an incident
- How to update incident status
- How to add incident updates
- Understanding incident statistics
- Best practices for incident management

### Deliverables

- ✅ Fully integrated incident management module
- ✅ All tests passing
- ✅ User documentation
- ✅ Production-ready code

---

## 📊 Implementation Checklist

### PHASE 1: Database ✅

- [ ] Add Prisma models to schema
- [ ] Create migration
- [ ] Generate Prisma client
- [ ] Test database operations
- [ ] Verify relationships

### PHASE 2: Backend ✅

- [ ] Create type definitions
- [ ] Create incident service
- [ ] Create API routes
- [ ] Register routes in server
- [ ] Test API endpoints with Postman/curl
- [ ] Add error handling
- [ ] Add input validation

### PHASE 3: Frontend ✅

- [ ] Create Zustand store slice
- [ ] Create incident declaration form
- [ ] Update incident dashboard
- [ ] Create incident list component
- [ ] Create incident detail view
- [ ] Update sidebar navigation
- [ ] Test UI components
- [ ] Add loading states
- [ ] Add error handling

### PHASE 4: Integration ✅

- [ ] Connect all components
- [ ] Add to main dashboard
- [ ] Link to processes
- [ ] Link to risks
- [ ] End-to-end testing
- [ ] Fix bugs
- [ ] Performance optimization
- [ ] Documentation

---

## 🎯 Success Criteria

The implementation will be considered successful when:

1. ✅ Users can declare incidents from the dashboard
2. ✅ Incidents are properly stored in the database
3. ✅ Incident list displays all incidents with filtering
4. ✅ Incident details show complete information
5. ✅ Statistics are calculated correctly
6. ✅ Status transitions work as expected
7. ✅ All tests pass
8. ✅ UI is responsive and accessible
9. ✅ Performance is acceptable
10. ✅ Code follows project standards

---

## 📝 Notes

### Out of Scope (Future Enhancements)

- Multi-channel incident registration (email, SMS, etc.)
- Real-time collaboration features
- AI-powered incident classification
- Mobile app integration
- External stakeholder portal
- Advanced analytics and reporting
- Integration with external monitoring systems

### Technical Debt to Address Later

- Add comprehensive unit tests
- Add integration tests
- Implement proper authentication/authorization
- Add audit logging
- Implement file upload for evidence
- Add notification system
- Implement WebSocket for real-time updates

### Dependencies

- Existing Process model
- Existing Risk model (optional integration)
- User authentication system (for reportedBy, assignedTo)
- Notification service (for stakeholder alerts)

---

## 🚀 Next Steps

1. Review this plan with the team
2. Get approval for scope and timeline
3. Begin Phase 1: Database Schema
4. Proceed sequentially through phases
5. Test thoroughly at each phase
6. Deploy to production

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-21  
**Author:** AI Assistant  
**Status:** Ready for Implementation
