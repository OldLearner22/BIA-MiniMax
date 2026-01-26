import { Router } from "express";


const router = Router();
import { prisma } from "../db";

// ============================================================================
// DOCUMENT ANALYTICS ROUTES
// ============================================================================

// GET /api/documents/analytics/dashboard - Get dashboard analytics
router.get("/documents/analytics/dashboard", async (req, res) => {
  try {
    // Get total documents count
    const totalDocuments = await prisma.document.count({
      where: { status: { not: "ARCHIVED" } },
    });

    // Get documents by status
    const documentsByStatus = await prisma.document.groupBy({
      by: ["status"],
      _count: true,
      where: { status: { not: "ARCHIVED" } },
    });

    // Get documents by type
    const documentsByType = await prisma.document.groupBy({
      by: ["type"],
      _count: true,
      where: { status: { not: "ARCHIVED" } },
    });

    // Get documents by category
    const documentsByCategory = await prisma.documentCategory.findMany({
      include: {
        _count: {
          select: {
            documents: true,
            templates: true,
          },
        },
      },
    });

    // Get recent activity (last 20 access logs)
    const recentActivity = await prisma.documentAccessLog.findMany({
      take: 20,
      orderBy: { accessedAt: "desc" },
      include: {
        document: {
          select: { title: true },
        },
      },
    });

    // Get pending approvals count
    const pendingApprovals = await prisma.document.count({
      where: { status: "REVIEW" },
    });

    // Get overdue reviews count (documents not updated in 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const overdueReviews = await prisma.document.count({
      where: {
        status: "PUBLISHED",
        updatedAt: { lt: ninetyDaysAgo },
      },
    });

    res.json({
      totalDocuments,
      documentsByStatus,
      documentsByType,
      documentsByCategory,
      recentActivity,
      pendingApprovals,
      overdueReviews,
    });
  } catch (error) {
    console.error("Error fetching analytics dashboard:", error);
    res.status(500).json({ error: "Failed to fetch analytics dashboard" });
  }
});

// GET /api/documents/analytics/access - Get access analytics
router.get("/documents/analytics/access", async (req, res) => {
  try {
    // Get most accessed documents
    const mostAccessed = await prisma.documentAccessLog.groupBy({
      by: ["documentId"],
      _count: true,
      orderBy: { _count: { documentId: "desc" } },
      take: 10,
    });

    // Enrich with document titles
    const enrichedMostAccessed = await Promise.all(
      mostAccessed.map(async (item) => {
        const document = await prisma.document.findUnique({
          where: { id: item.documentId },
          select: { title: true },
        });
        return {
          documentId: item.documentId,
          documentTitle: document?.title || "Unknown",
          _count: item._count,
        };
      }),
    );

    // Get recent access logs
    const accessLogs = await prisma.documentAccessLog.findMany({
      take: 50,
      orderBy: { accessedAt: "desc" },
      include: {
        document: {
          select: { title: true },
        },
      },
    });

    res.json({
      mostAccessed: enrichedMostAccessed,
      accessLogs,
    });
  } catch (error) {
    console.error("Error fetching access analytics:", error);
    res.status(500).json({ error: "Failed to fetch access analytics" });
  }
});

// GET /api/documents/analytics/versions - Get version analytics
router.get("/documents/analytics/versions", async (req, res) => {
  try {
    // Get total versions count
    const totalVersions = await prisma.documentVersion.count();

    // Get average versions per document
    const avgVersionsPerDoc = await prisma.documentVersion.groupBy({
      by: ["documentId"],
      _count: true,
    });

    const avgVersions =
      avgVersionsPerDoc.length > 0
        ? avgVersionsPerDoc.reduce((sum, item) => sum + item._count, 0) /
          avgVersionsPerDoc.length
        : 0;

    // Get most versioned documents
    const mostVersioned = await prisma.document.findMany({
      orderBy: { version: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        version: true,
      },
    });

    // Get recent version changes
    const recentChanges = await prisma.documentVersion.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        document: {
          select: { title: true },
        },
      },
    });

    res.json({
      totalVersions,
      avgVersionsPerDoc: { avg_versions: avgVersions },
      mostVersioned,
      recentChanges: recentChanges.map((change) => ({
        id: change.id,
        field: `Version ${change.version}`,
        document: change.document,
        createdAt: change.createdAt,
        changeReason: change.changes || "No description provided",
      })),
    });
  } catch (error) {
    console.error("Error fetching version analytics:", error);
    res.status(500).json({ error: "Failed to fetch version analytics" });
  }
});

// GET /api/documents/gaps - Get compliance gaps analysis
router.get("/documents/gaps", async (req, res) => {
  try {
    const gaps: any[] = [];

    // Check for missing critical document types
    const criticalTypes = [
      "POLICY",
      "PROCEDURE",
      "PLAYBOOK",
      "CHECKLIST",
      "REPORT",
    ];

    for (const type of criticalTypes) {
      const count = await prisma.document.count({
        where: {
          type: type as any,
          status: { not: "ARCHIVED" },
        },
      });

      if (count === 0) {
        gaps.push({
          type: "MISSING_DOCUMENT_TYPE",
          severity: "high",
          description: `No ${type.toLowerCase()} documents found`,
          suggestedAction: `Create at least one ${type.toLowerCase()} document`,
          suggestedTemplate: `${type} Template`,
        });
      }
    }

    // Check for documents in draft status for too long (30+ days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const staleDrafts = await prisma.document.findMany({
      where: {
        status: "DRAFT",
        createdAt: { lt: thirtyDaysAgo },
      },
      select: { id: true, title: true },
    });

    if (staleDrafts.length > 0) {
      gaps.push({
        type: "STALE_DRAFTS",
        severity: "medium",
        description: `${staleDrafts.length} draft document(s) older than 30 days`,
        suggestedAction: "Review and publish or archive stale drafts",
        documents: staleDrafts,
      });
    }

    // Check for documents pending review for too long (14+ days)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const pendingReviews = await prisma.document.findMany({
      where: {
        status: "REVIEW",
        updatedAt: { lt: fourteenDaysAgo },
      },
      select: { id: true, title: true },
    });

    if (pendingReviews.length > 0) {
      gaps.push({
        type: "PENDING_REVIEWS",
        severity: "high",
        description: `${pendingReviews.length} document(s) pending review for over 14 days`,
        suggestedAction: "Complete pending document reviews",
        documents: pendingReviews,
      });
    }

    // Check for outdated published documents (90+ days without update)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const outdatedDocs = await prisma.document.findMany({
      where: {
        status: "PUBLISHED",
        updatedAt: { lt: ninetyDaysAgo },
      },
      select: { id: true, title: true },
    });

    if (outdatedDocs.length > 0) {
      gaps.push({
        type: "OUTDATED_DOCUMENTS",
        severity: "medium",
        description: `${outdatedDocs.length} published document(s) not updated in 90+ days`,
        suggestedAction: "Review and update outdated documents",
        documents: outdatedDocs,
      });
    }

    // Check if any categories have no documents
    const emptyCategories = await prisma.documentCategory.findMany({
      where: {
        documents: {
          none: {},
        },
      },
      select: { id: true, name: true },
    });

    if (emptyCategories.length > 0) {
      gaps.push({
        type: "EMPTY_CATEGORIES",
        severity: "low",
        description: `${emptyCategories.length} document categor${emptyCategories.length === 1 ? "y has" : "ies have"} no documents`,
        suggestedAction:
          "Add documents to empty categories or remove unused categories",
      });
    }

    res.json({
      total: gaps.length,
      gaps,
    });
  } catch (error) {
    console.error("Error fetching compliance gaps:", error);
    res.status(500).json({ error: "Failed to fetch compliance gaps" });
  }
});

export default router;
