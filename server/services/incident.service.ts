import { prisma } from "../db";
import type {
  CreateIncidentDTO,
  UpdateIncidentDTO,
  CreateIncidentUpdateDTO,
  IncidentStatistics,
  IncidentSearchCriteria,
} from "../../src/types/incident";

export class IncidentService {
  /**
   * Create a new incident with auto-generated incident number
   */
  async createIncident(data: CreateIncidentDTO) {
    // Generate incident number: INC-YYYY-NNNN
    const count = await prisma.incident.count();
    const year = new Date().getFullYear();
    const incidentNumber = `INC-${year}-${String(count + 1).padStart(4, "0")}`;

    return await prisma.incident.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category as any,
        severity: data.severity as any,
        status: "REPORTED",
        impactAreas: data.impactAreas as any,
        businessImpact: data.businessImpact,
        estimatedFinancialImpact: data.estimatedFinancialImpact,
        affectedProcessIds: data.affectedProcessIds || [],
        affectedLocations: data.affectedLocations || [],
        affectedSystems: data.affectedSystems || [],
        incidentNumber,
        initialResponseActions: data.initialResponseActions,
        reportedBy: data.reportedBy,
        detectionTime: data.detectionTime || new Date(),
        organizationId: "00000000-0000-0000-0000-000000000001",
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
    if (status?.length) {
      where.status = { in: status };
    }
    if (severity?.length) {
      where.severity = { in: severity };
    }
    if (category?.length) {
      where.category = { in: category };
    }

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
        incidentId,
        updateType: updateData.updateType as any,
        title: updateData.title,
        description: updateData.description,
        previousStatus: updateData.previousStatus as any,
        newStatus: updateData.newStatus as any,
        actionsTaken: updateData.actionsTaken || [],
        createdBy: updateData.createdBy,
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
