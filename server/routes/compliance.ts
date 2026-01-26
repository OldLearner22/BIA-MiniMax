import { Router } from "express";


const router = Router();
import { prisma } from "../db";

// ============================================================================
// COMPLIANCE FRAMEWORK ROUTES
// ============================================================================

// GET /api/compliance/frameworks - List all frameworks
router.get("/compliance/frameworks", async (req, res) => {
  try {
    const frameworks = await prisma.complianceFramework.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { requirements: true },
        },
      },
      orderBy: { name: "asc" },
    });

    res.json(frameworks);
  } catch (error) {
    console.error("Error fetching compliance frameworks:", error);
    res.status(500).json({ error: "Failed to fetch compliance frameworks" });
  }
});

// POST /api/compliance/frameworks - Create a new framework
router.post("/compliance/frameworks", async (req, res) => {
  try {
    const { code, name, description, version } = req.body;

    if (!code || !name) {
      return res.status(400).json({ error: "Code and name are required" });
    }

    const framework = await prisma.complianceFramework.create({
      data: {
        code,
        name,
        description,
        version,
      },
    });

    res.status(201).json(framework);
  } catch (error) {
    console.error("Error creating compliance framework:", error);
    res.status(500).json({ error: "Failed to create compliance framework" });
  }
});

// ============================================================================
// COMPLIANCE REQUIREMENTS ROUTES
// ============================================================================

// GET /api/compliance/requirements - List all requirements with filtering
router.get("/compliance/requirements", async (req, res) => {
  try {
    const { frameworkId, status, priority } = req.query;

    const where: any = {};

    if (frameworkId && typeof frameworkId === "string") {
      where.frameworkId = frameworkId;
    }

    if (status && typeof status === "string") {
      where.status = status as any;
    }

    if (priority && typeof priority === "string") {
      where.priority = priority as any;
    }

    const requirements = await prisma.complianceRequirement.findMany({
      where,
      include: {
        framework: true,
        document: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: [{ framework: { name: "asc" } }, { clause: "asc" }],
    });

    res.json(requirements);
  } catch (error) {
    console.error("Error fetching compliance requirements:", error);
    res.status(500).json({ error: "Failed to fetch compliance requirements" });
  }
});

// GET /api/compliance/requirements/:id - Get a specific requirement
router.get("/compliance/requirements/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const requirement = await prisma.complianceRequirement.findUnique({
      where: { id },
      include: {
        framework: true,
        document: true,
      },
    });

    if (!requirement) {
      return res.status(404).json({ error: "Requirement not found" });
    }

    res.json(requirement);
  } catch (error) {
    console.error("Error fetching compliance requirement:", error);
    res.status(500).json({ error: "Failed to fetch compliance requirement" });
  }
});

// POST /api/compliance/requirements - Create a new requirement
router.post("/compliance/requirements", async (req, res) => {
  try {
    const {
      frameworkId,
      clause,
      title,
      description,
      requiredDocument,
      priority,
      status,
      documentId,
    } = req.body;

    if (
      !frameworkId ||
      !clause ||
      !title ||
      !description ||
      !requiredDocument
    ) {
      return res.status(400).json({
        error:
          "frameworkId, clause, title, description, and requiredDocument are required",
      });
    }

    const requirement = await prisma.complianceRequirement.create({
      data: {
        frameworkId,
        clause,
        title,
        description,
        requiredDocument,
        priority: priority || "MEDIUM",
        status: status || "NOT_ASSESSED",
        documentId,
      },
      include: {
        framework: true,
        document: true,
      },
    });

    res.status(201).json(requirement);
  } catch (error) {
    console.error("Error creating compliance requirement:", error);
    res.status(500).json({ error: "Failed to create compliance requirement" });
  }
});

// PUT /api/compliance/requirements/:id - Update a requirement
router.put("/compliance/requirements/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      clause,
      title,
      description,
      requiredDocument,
      priority,
      status,
      documentId,
      lastReviewed,
      reviewedBy,
      reviewNotes,
      nextReviewDate,
      evidenceNotes,
      implementationNotes,
    } = req.body;

    const requirement = await prisma.complianceRequirement.update({
      where: { id },
      data: {
        clause,
        title,
        description,
        requiredDocument,
        priority,
        status,
        documentId,
        lastReviewed: lastReviewed ? new Date(lastReviewed) : undefined,
        reviewedBy,
        reviewNotes,
        nextReviewDate: nextReviewDate ? new Date(nextReviewDate) : undefined,
        evidenceNotes,
        implementationNotes,
      },
      include: {
        framework: true,
        document: true,
      },
    });

    res.json(requirement);
  } catch (error) {
    console.error("Error updating compliance requirement:", error);
    res.status(500).json({ error: "Failed to update compliance requirement" });
  }
});

// DELETE /api/compliance/requirements/:id - Delete a requirement
router.delete("/compliance/requirements/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.complianceRequirement.delete({
      where: { id },
    });

    res.json({ message: "Requirement deleted successfully" });
  } catch (error) {
    console.error("Error deleting compliance requirement:", error);
    res.status(500).json({ error: "Failed to delete compliance requirement" });
  }
});

// GET /api/compliance/matrix - Get compliance matrix overview
router.get("/compliance/matrix", async (req, res) => {
  try {
    const frameworks = await prisma.complianceFramework.findMany({
      where: { isActive: true },
      include: {
        requirements: {
          include: {
            document: {
              select: {
                id: true,
                title: true,
                status: true,
              },
            },
          },
        },
      },
    });

    // Calculate statistics
    const stats = {
      totalRequirements: 0,
      byStatus: {
        NOT_ASSESSED: 0,
        NON_COMPLIANT: 0,
        PARTIAL: 0,
        COMPLIANT: 0,
        NOT_APPLICABLE: 0,
      },
      byPriority: {
        CRITICAL: 0,
        HIGH: 0,
        MEDIUM: 0,
        LOW: 0,
      },
      byFramework: {} as Record<string, any>,
    };

    frameworks.forEach((framework) => {
      const frameworkStats = {
        total: framework.requirements.length,
        compliant: 0,
        partial: 0,
        nonCompliant: 0,
        notAssessed: 0,
        notApplicable: 0,
      };

      framework.requirements.forEach((req) => {
        stats.totalRequirements++;
        stats.byStatus[req.status]++;
        stats.byPriority[req.priority]++;

        if (req.status === "COMPLIANT") frameworkStats.compliant++;
        else if (req.status === "PARTIAL") frameworkStats.partial++;
        else if (req.status === "NON_COMPLIANT") frameworkStats.nonCompliant++;
        else if (req.status === "NOT_ASSESSED") frameworkStats.notAssessed++;
        else if (req.status === "NOT_APPLICABLE")
          frameworkStats.notApplicable++;
      });

      stats.byFramework[framework.code] = frameworkStats;
    });

    res.json({
      frameworks,
      stats,
    });
  } catch (error) {
    console.error("Error fetching compliance matrix:", error);
    res.status(500).json({ error: "Failed to fetch compliance matrix" });
  }
});

// POST /api/compliance/requirements/:id/link-document - Link a document to a requirement
router.post("/compliance/requirements/:id/link-document", async (req, res) => {
  try {
    const { id } = req.params;
    const { documentId, reviewedBy, reviewNotes } = req.body;

    if (!documentId) {
      return res.status(400).json({ error: "documentId is required" });
    }

    const requirement = await prisma.complianceRequirement.update({
      where: { id },
      data: {
        documentId,
        lastReviewed: new Date(),
        reviewedBy,
        reviewNotes,
        status: "COMPLIANT", // Auto-set to compliant when document is linked
      },
      include: {
        framework: true,
        document: true,
      },
    });

    res.json(requirement);
  } catch (error) {
    console.error("Error linking document to requirement:", error);
    res.status(500).json({ error: "Failed to link document to requirement" });
  }
});

export default router;
