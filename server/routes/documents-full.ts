import { Router } from "express";


const router = Router();
import { prisma } from "../db";

// ============================================================================
// DOCUMENTATION ROUTES - Full Phase 5 Implementation
// ============================================================================

// ============================================================================
// CORE DOCUMENT CRUD OPERATIONS
// ============================================================================

// GET /api/documents - List all documents with optional filtering
router.get("/documents", async (req, res) => {
  try {
    const { 
      categoryId, 
      status, 
      approvalStatus,
      type, 
      search,
      sortBy = "updatedAt",
      sortOrder = "desc" 
    } = req.query;

    const where: any = {};

    if (categoryId && typeof categoryId === "string") {
      where.categoryId = categoryId;
    }

    if (status && typeof status === "string") {
      where.status = status as any;
    }

    if (approvalStatus && typeof approvalStatus === "string") {
      where.approvalStatus = approvalStatus as any;
    }

    if (type && typeof type === "string") {
      where.type = type as any;
    }

    if (search && typeof search === "string") {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    const documents = await prisma.document.findMany({
      where,
      include: {
        category: true,
        versions: {
          orderBy: { version: "desc" },
          take: 1,
        },
        workflow: {
          include: {
            steps: true,
          },
        },
        _count: {
          select: {
            collaborations: true,
            shares: true,
          },
        },
      },
      orderBy: { [sortBy as string]: sortOrder as "asc" | "desc" },
    });

    res.json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

// GET /api/documents/:id - Get a specific document
router.get("/documents/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        category: true,
        versions: {
          orderBy: { version: "desc" },
        },
        workflow: {
          include: {
            steps: {
              include: {
                actions: true,
              },
            },
          },
        },
        template: true,
        changes: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Log access
    await prisma.documentAccessLog.create({
      data: {
        documentId: id,
        action: "VIEW",
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      },
    });

    res.json(document);
  } catch (error) {
    console.error("Error fetching document:", error);
    res.status(500).json({ error: "Failed to fetch document" });
  }
});

// POST /api/documents - Create a new document
router.post("/documents", async (req, res) => {
  try {
    const { 
      title, 
      content, 
      categoryId, 
      type,
      templateId,
      metadata,
      createdBy 
    } = req.body;

    if (!title || !content || !createdBy) {
      return res
        .status(400)
        .json({ error: "Title, content, and createdBy are required" });
    }

    // Create document and initial version in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const document = await tx.document.create({
        data: {
          title,
          content,
          categoryId,
          type,
          templateId,
          metadata,
          createdBy,
          updatedBy: createdBy,
        },
        include: { category: true, template: true },
      });

      // Create initial version
      await tx.documentVersion.create({
        data: {
          documentId: document.id,
          version: 1,
          title,
          content,
          createdBy,
        },
      });

      // Log access
      await tx.documentAccessLog.create({
        data: {
          documentId: document.id,
          action: "CREATE",
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
        },
      });

      return document;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating document:", error);
    res.status(500).json({ error: "Failed to create document" });
  }
});

// PUT /api/documents/:id - Update a document (creates new version)
router.put("/documents/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      content, 
      categoryId,
      type,
      metadata,
      status,
      updatedBy,
      changeReason 
    } = req.body;

    if (!updatedBy) {
      return res.status(400).json({ error: "updatedBy is required" });
    }

    // Update document and create new version in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get current document to determine next version and track changes
      const currentDoc = await tx.document.findUnique({
        where: { id },
      });

      if (!currentDoc) {
        throw new Error("Document not found");
      }

      const nextVersion = currentDoc.version + 1;
      const changes: any[] = [];

      // Track changes
      if (title && title !== currentDoc.title) {
        changes.push({
          documentId: id,
          version: nextVersion,
          field: "title",
          oldValue: currentDoc.title,
          newValue: title,
          changedBy: updatedBy,
          changeReason,
        });
      }

      if (content && content !== currentDoc.content) {
        changes.push({
          documentId: id,
          version: nextVersion,
          field: "content",
          oldValue: currentDoc.content.substring(0, 1000) + "...",
          newValue: content.substring(0, 1000) + "...",
          changedBy: updatedBy,
          changeReason,
        });
      }

      if (categoryId && categoryId !== currentDoc.categoryId) {
        changes.push({
          documentId: id,
          version: nextVersion,
          field: "categoryId",
          oldValue: currentDoc.categoryId,
          newValue: categoryId,
          changedBy: updatedBy,
          changeReason,
        });
      }

      // Update document
      const document = await tx.document.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(content && { content }),
          ...(categoryId && { categoryId }),
          ...(type && { type }),
          ...(metadata && { metadata }),
          ...(status && { status }),
          version: nextVersion,
          updatedBy,
          updatedAt: new Date(),
        },
        include: { category: true, template: true },
      });

      // Create new version
      await tx.documentVersion.create({
        data: {
          documentId: id,
          version: nextVersion,
          title: title || currentDoc.title,
          content: content || currentDoc.content,
          changeSummary: changes.length > 0 ? { changes } : undefined,
          createdBy: updatedBy,
        },
      });

      // Create change records
      if (changes.length > 0) {
        await tx.documentChange.createMany({
          data: changes,
        });
      }

      // Log access
      await tx.documentAccessLog.create({
        data: {
          documentId: id,
          action: "EDIT",
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
        },
      });

      return document;
    });

    res.json(result);
  } catch (error) {
    console.error("Error updating document:", error);
    res.status(500).json({ error: "Failed to update document" });
  }
});

// DELETE /api/documents/:id - Soft delete a document (archive)
router.delete("/documents/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const document = await prisma.document.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });

    // Log access
    await prisma.documentAccessLog.create({
      data: {
        documentId: id,
        action: "DELETE",
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      },
    });

    res.json({ message: "Document archived successfully" });
  } catch (error) {
    console.error("Error archiving document:", error);
    res.status(500).json({ error: "Failed to archive document" });
  }
});

// ============================================================================
// VERSION MANAGEMENT
// ============================================================================

// GET /api/documents/:id/versions - Get version history
router.get("/documents/:id/versions", async (req, res) => {
  try {
    const { id } = req.params;

    const versions = await prisma.documentVersion.findMany({
      where: { documentId: id },
      orderBy: { version: "desc" },
    });

    res.json(versions);
  } catch (error) {
    console.error("Error fetching document versions:", error);
    res.status(500).json({ error: "Failed to fetch document versions" });
  }
});

// GET /api/documents/:id/versions/:versionId - Get specific version
router.get("/documents/:id/versions/:versionId", async (req, res) => {
  try {
    const { id, versionId } = req.params;

    const version = await prisma.documentVersion.findUnique({
      where: {
        documentId_version: {
          documentId: id,
          version: parseInt(versionId),
        },
      },
    });

    if (!version) {
      return res.status(404).json({ error: "Version not found" });
    }

    // Log access
    await prisma.documentAccessLog.create({
      data: {
        documentId: id,
        action: "VIEW",
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      },
    });

    res.json(version);
  } catch (error) {
    console.error("Error fetching document version:", error);
    res.status(500).json({ error: "Failed to fetch document version" });
  }
});

// POST /api/documents/:id/revert - Revert to previous version
router.post("/documents/:id/revert", async (req, res) => {
  try {
    const { id } = req.params;
    const { versionId, updatedBy } = req.body;

    if (!updatedBy) {
      return res.status(400).json({ error: "updatedBy is required" });
    }

    const version = await prisma.documentVersion.findUnique({
      where: {
        documentId_version: {
          documentId: id,
          version: parseInt(versionId),
        },
      },
    });

    if (!version) {
      return res.status(404).json({ error: "Version not found" });
    }

    // Revert document in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get current document
      const currentDoc = await tx.document.findUnique({
        where: { id },
      });

      if (!currentDoc) {
        throw new Error("Document not found");
      }

      const nextVersion = currentDoc.version + 1;

      // Update document with reverted content
      const document = await tx.document.update({
        where: { id },
        data: {
          title: version.title,
          content: version.content,
          version: nextVersion,
          updatedBy,
          updatedAt: new Date(),
        },
        include: { category: true },
      });

      // Create new version tracking revert
      await tx.documentVersion.create({
        data: {
          documentId: id,
          version: nextVersion,
          title: version.title,
          content: version.content,
          changes: `Reverted to version ${versionId}`,
          createdBy: updatedBy,
        },
      });

      // Log change
      await tx.documentChange.create({
        data: {
          documentId: id,
          version: nextVersion,
          field: "revert",
          oldValue: `Current version ${currentDoc.version}`,
          newValue: `Reverted to version ${versionId}`,
          changedBy: updatedBy,
          changeReason: "Document revert",
        },
      });

      // Log access
      await tx.documentAccessLog.create({
        data: {
          documentId: id,
          action: "EDIT",
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
        },
      });

      return document;
    });

    res.json(result);
  } catch (error) {
    console.error("Error reverting document:", error);
    res.status(500).json({ error: "Failed to revert document" });
  }
});

// ============================================================================
// APPROVAL WORKFLOWS
// ============================================================================

// GET /api/documents/:id/workflow - Get approval workflow status
router.get("/documents/:id/workflow", async (req, res) => {
  try {
    const { id } = req.params;

    const workflow = await prisma.documentApprovalWorkflow.findUnique({
      where: { documentId: id },
      include: {
        steps: {
          include: {
            actions: true,
          },
          orderBy: { stepNumber: "asc" },
        },
      },
    });

    if (!workflow) {
      return res.json({ 
        status: "NOT_STARTED",
        message: "No approval workflow initiated" 
      });
    }

    res.json(workflow);
  } catch (error) {
    console.error("Error fetching workflow:", error);
    res.status(500).json({ error: "Failed to fetch workflow" });
  }
});

// POST /api/documents/:id/workflow/start - Start approval workflow
router.post("/documents/:id/workflow/start", async (req, res) => {
  try {
    const { id } = req.params;
    const { initiatedBy, steps } = req.body;

    if (!initiatedBy) {
      return res.status(400).json({ error: "initiatedBy is required" });
    }

    if (!steps || !Array.isArray(steps) || steps.length === 0) {
      return res.status(400).json({ error: "Workflow steps are required" });
    }

    const workflow = await prisma.$transaction(async (tx) => {
      // Create workflow
      const createdWorkflow = await tx.documentApprovalWorkflow.create({
        data: {
          documentId: id,
          initiatedBy,
          status: "IN_PROGRESS",
          currentStep: 0,
        },
      });

      // Create approval steps
      const approvalSteps = await Promise.all(
        steps.map((step: any, index: number) =>
          tx.approvalStep.create({
            data: {
              workflowId: createdWorkflow.id,
              stepNumber: index + 1,
              title: step.title || `Step ${index + 1}`,
              description: step.description,
              requiredRole: step.requiredRole,
              approvers: step.approvers || [],
              assignedTo: step.approvers?.[0] || null,
            },
          })
        )
      );

      return {
        ...createdWorkflow,
        steps: approvalSteps,
      };
    });

    res.status(201).json(workflow);
  } catch (error) {
    console.error("Error starting workflow:", error);
    res.status(500).json({ error: "Failed to start workflow" });
  }
});

// POST /api/documents/:id/workflow/approve - Approve current step
router.post("/documents/:id/workflow/approve", async (req, res) => {
  try {
    const { id } = req.params;
    const { stepId, approvedBy, comments } = req.body;

    if (!stepId || !approvedBy) {
      return res.status(400).json({ error: "stepId and approvedBy are required" });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Get current workflow and step
      const workflow = await tx.documentApprovalWorkflow.findUnique({
        where: { documentId: id },
        include: {
          steps: {
            orderBy: { stepNumber: "asc" },
          },
        },
      });

      if (!workflow) {
        throw new Error("Workflow not found");
      }

      const currentStep = workflow.steps.find((s: any) => s.id === stepId);
      if (!currentStep) {
        throw new Error("Step not found");
      }

      // Create approval action
      await tx.approvalAction.create({
        data: {
          stepId,
          action: "APPROVE",
          comments,
          takenBy: approvedBy,
        },
      });

      // Update step status
      const updatedStep = await tx.approvalStep.update({
        where: { id: stepId },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
          comments,
        },
      });

      // Check if workflow is complete
      const allStepsApproved = workflow.steps.every((s: any) => 
        s.id === stepId || s.status === "APPROVED"
      );

      if (allStepsApproved) {
        // Update workflow status
        await tx.documentApprovalWorkflow.update({
          where: { documentId: id },
          data: {
            status: "APPROVED",
            completedAt: new Date(),
          },
        });

        // Update document status
        await tx.document.update({
          where: { id },
          data: {
            approvalStatus: "APPROVED",
            status: "PUBLISHED",
            approvedBy,
            publishedAt: new Date(),
          },
        });
      } else {
        // Move to next step
        const nextStep = workflow.steps.find((s: any) => s.status === "PENDING");
        if (nextStep) {
          await tx.approvalStep.update({
            where: { id: nextStep.id },
            data: {
              assignedTo: nextStep.approvers?.[0] || null,
            },
          });

          await tx.documentApprovalWorkflow.update({
            where: { documentId: id },
            data: {
              currentStep: workflow.currentStep + 1,
            },
          });
        }
      }

      return { step: updatedStep, workflowComplete: allStepsApproved };
    });

    res.json(result);
  } catch (error) {
    console.error("Error approving workflow:", error);
    res.status(500).json({ error: "Failed to approve workflow" });
  }
});

// POST /api/documents/:id/workflow/reject - Reject document
router.post("/documents/:id/workflow/reject", async (req, res) => {
  try {
    const { id } = req.params;
    const { stepId, rejectedBy, comments, rejectionReason } = req.body;

    if (!stepId || !rejectedBy) {
      return res.status(400).json({ error: "stepId and rejectedBy are required" });
    }

    await prisma.$transaction(async (tx) => {
      // Create rejection action
      await tx.approvalAction.create({
        data: {
          stepId,
          action: "REJECT",
          comments,
          takenBy: rejectedBy,
        },
      });

      // Update step status
      await tx.approvalStep.update({
        where: { id: stepId },
        data: {
          status: "REJECTED",
          comments,
        },
      });

      // Update workflow status
      await tx.documentApprovalWorkflow.update({
        where: { documentId: id },
        data: {
          status: "REJECTED",
          rejectionReason,
        },
      });

      // Update document status
      await tx.document.update({
        where: { id },
        data: {
          approvalStatus: "REJECTED",
          status: "DRAFT",
        },
      });
    });

    res.json({ message: "Document rejected" });
  } catch (error) {
    console.error("Error rejecting workflow:", error);
    res.status(500).json({ error: "Failed to reject workflow" });
  }
});

// ============================================================================
// TEMPLATES
// ============================================================================

// GET /api/document-templates - List all templates
router.get("/document-templates", async (req, res) => {
  try {
    const { type, categoryId, includeSystem = "false" } = req.query;

    const where: any = {};

    if (type && typeof type === "string") {
      where.type = type as any;
    }

    if (categoryId && typeof categoryId === "string") {
      where.categoryId = categoryId;
    }

    if (includeSystem === "false") {
      where.isSystem = false;
    }

    const templates = await prisma.documentTemplate.findMany({
      where,
      include: {
        category: true,
        _count: {
          select: { documents: true },
        },
      },
      orderBy: { name: "asc" },
    });

    res.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).json({ error: "Failed to fetch templates" });
  }
});

// GET /api/document-templates/:id - Get template details
router.get("/document-templates/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const template = await prisma.documentTemplate.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    res.json(template);
  } catch (error) {
    console.error("Error fetching template:", error);
    res.status(500).json({ error: "Failed to fetch template" });
  }
});

// POST /api/document-templates - Create new template
router.post("/document-templates", async (req, res) => {
  try {
    const { name, description, categoryId, type, content, placeholders, createdBy } = req.body;

    if (!name || !type || !content || !createdBy) {
      return res.status(400).json({ 
        error: "name, type, content, and createdBy are required" 
      });
    }

    const template = await prisma.documentTemplate.create({
      data: {
        name,
        description,
        categoryId,
        type,
        content,
        placeholders,
        isSystem: false,
        createdBy,
      },
      include: { category: true },
    });

    res.status(201).json(template);
  } catch (error) {
    console.error("Error creating template:", error);
    res.status(500).json({ error: "Failed to create template" });
  }
});

// PUT /api/document-templates/:id - Update template
router.put("/document-templates/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, categoryId, content, placeholders } = req.body;

    const template = await prisma.documentTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    if (template.isSystem) {
      return res.status(403).json({ error: "Cannot modify system templates" });
    }

    const updated = await prisma.documentTemplate.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(categoryId && { categoryId }),
        ...(content && { content }),
        ...(placeholders && { placeholders }),
      },
      include: { category: true },
    });

    res.json(updated);
  } catch (error) {
    console.error("Error updating template:", error);
    res.status(500).json({ error: "Failed to update template" });
  }
});

// DELETE /api/document-templates/:id - Delete template
router.delete("/document-templates/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const template = await prisma.documentTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    if (template.isSystem) {
      return res.status(403).json({ error: "Cannot delete system templates" });
    }

    await prisma.documentTemplate.delete({
      where: { id },
    });

    res.json({ message: "Template deleted successfully" });
  } catch (error) {
    console.error("Error deleting template:", error);
    res.status(500).json({ error: "Failed to delete template" });
  }
});

// POST /api/document-templates/:id/generate - Generate document from template
router.post("/document-templates/:id/generate", async (req, res) => {
  try {
    const { id } = req.params;
    const { placeholderValues, categoryId, createdBy } = req.body;

    const template = await prisma.documentTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    // Replace placeholders in content
    let content = template.content;
    let title = template.name;

    if (placeholderValues) {
      Object.entries(placeholderValues).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        content = content.replace(new RegExp(placeholder, "g"), String(value));
        title = title.replace(new RegExp(placeholder, "g"), String(value));
      });
    }

    // Create document from template
    const document = await prisma.$transaction(async (tx) => {
      const doc = await tx.document.create({
        data: {
          title,
          content,
          categoryId,
          type: "TEMPLATE_BASED",
          templateId: id,
          metadata: {
            generatedFromTemplate: template.name,
            placeholderValues,
          },
          createdBy,
          updatedBy: createdBy,
        },
        include: { category: true, template: true },
      });

      await tx.documentVersion.create({
        data: {
          documentId: doc.id,
          version: 1,
          title,
          content,
          changes: `Generated from template: ${template.name}`,
          createdBy,
        },
      });

      await tx.documentAccessLog.create({
        data: {
          documentId: doc.id,
          action: "CREATE",
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
        },
      });

      return doc;
    });

    res.status(201).json(document);
  } catch (error) {
    console.error("Error generating document from template:", error);
    res.status(500).json({ error: "Failed to generate document from template" });
  }
});

// ============================================================================
// COLLABORATION
// ============================================================================

// GET /api/documents/:id/collaborations - Get comments and suggestions
router.get("/documents/:id/collaborations", async (req, res) => {
  try {
    const { id } = req.params;
    const { type, resolved } = req.query;

    const where: any = { documentId: id };

    if (type && typeof type === "string") {
      where.type = type as any;
    }

    if (resolved !== undefined) {
      where.resolved = resolved === "true";
    }

    const collaborations = await prisma.documentCollaboration.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json(collaborations);
  } catch (error) {
    console.error("Error fetching collaborations:", error);
    res.status(500).json({ error: "Failed to fetch collaborations" });
  }
});

// POST /api/documents/:id/collaborations - Add comment/suggestion
router.post("/documents/:id/collaborations", async (req, res) => {
  try {
    const { id } = req.params;
    const { type, content, position, createdBy } = req.body;

    if (!type || !content || !createdBy) {
      return res.status(400).json({ 
        error: "type, content, and createdBy are required" 
      });
    }

    const collaboration = await prisma.documentCollaboration.create({
      data: {
        documentId: id,
        type,
        content,
        position,
        resolved: false,
        createdBy,
      },
    });

    res.status(201).json(collaboration);
  } catch (error) {
    console.error("Error creating collaboration:", error);
    res.status(500).json({ error: "Failed to create collaboration" });
  }
});

// PUT /api/documents/:id/collaborations/:collabId - Resolve/resolve comment
router.put("/documents/:id/collaborations/:collabId", async (req, res) => {
  try {
    const { collabId } = req.params;
    const { resolved, resolvedBy } = req.body;

    const collaboration = await prisma.documentCollaboration.update({
      where: { id: collabId },
      data: {
        resolved,
        resolvedBy: resolved ? resolvedBy : null,
        resolvedAt: resolved ? new Date() : null,
      },
    });

    res.json(collaboration);
  } catch (error) {
    console.error("Error updating collaboration:", error);
    res.status(500).json({ error: "Failed to update collaboration" });
  }
});

// DELETE /api/documents/:id/collaborations/:collabId - Delete comment
router.delete("/documents/:id/collaborations/:collabId", async (req, res) => {
  try {
    const { collabId } = req.params;

    await prisma.documentCollaboration.delete({
      where: { id: collabId },
    });

    res.json({ message: "Collaboration deleted successfully" });
  } catch (error) {
    console.error("Error deleting collaboration:", error);
    res.status(500).json({ error: "Failed to delete collaboration" });
  }
});

// ============================================================================
// DOCUMENT SHARING
// ============================================================================

// GET /api/documents/:id/shares - Get document shares
router.get("/documents/:id/shares", async (req, res) => {
  try {
    const { id } = req.params;

    const shares = await prisma.documentShare.findMany({
      where: { documentId: id },
      orderBy: { createdAt: "desc" },
    });

    res.json(shares);
  } catch (error) {
    console.error("Error fetching shares:", error);
    res.status(500).json({ error: "Failed to fetch shares" });
  }
});

// POST /api/documents/:id/shares - Create share link
router.post("/documents/:id/shares", async (req, res) => {
  try {
    const { id } = req.params;
    const { sharedBy, shareType, permission, sharedWith, expiresAt } = req.body;

    if (!sharedBy || !shareType || !permission) {
      return res.status(400).json({ 
        error: "sharedBy, shareType, and permission are required" 
      });
    }

    const share = await prisma.documentShare.create({
      data: {
        documentId: id,
        sharedBy,
        shareType,
        permission,
        sharedWith,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    res.status(201).json(share);
  } catch (error) {
    console.error("Error creating share:", error);
    res.status(500).json({ error: "Failed to create share" });
  }
});

// DELETE /api/documents/:id/shares/:shareId - Delete share
router.delete("/api/documents/:id/shares/:shareId", async (req, res) => {
  try {
    const { shareId } = req.params;

    await prisma.documentShare.delete({
      where: { id: shareId },
    });

    res.json({ message: "Share deleted successfully" });
  } catch (error) {
    console.error("Error deleting share:", error);
    res.status(500).json({ error: "Failed to delete share" });
  }
});

// ============================================================================
// CATEGORIES
// ============================================================================

// GET /api/document-categories - List all document categories
router.get("/document-categories", async (req, res) => {
  try {
    const categories = await prisma.documentCategory.findMany({
      include: {
        _count: {
          select: { 
            documents: true,
            templates: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    res.json(categories);
  } catch (error) {
    console.error("Error fetching document categories:", error);
    res.status(500).json({ error: "Failed to fetch document categories" });
  }
});

// POST /api/document-categories - Create a new category
router.post("/document-categories", async (req, res) => {
  try {
    const { name, description, color } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const category = await prisma.documentCategory.create({
      data: { name, description, color },
    });

    res.status(201).json(category);
  } catch (error) {
    console.error("Error creating document category:", error);
    res.status(500).json({ error: "Failed to create document category" });
  }
});

// ============================================================================
// ANALYTICS
// ============================================================================

// GET /api/documents/analytics/dashboard - Document analytics dashboard
router.get("/documents/analytics/dashboard", async (req, res) => {
  try {
    const [
      totalDocuments,
      documentsByStatus,
      documentsByType,
      documentsByCategory,
      recentActivity,
      pendingApprovals,
      overdueReviews,
    ] = await Promise.all([
      prisma.document.count(),
      prisma.document.groupBy({
        by: ["status"],
        _count: true,
      }),
      prisma.document.groupBy({
        by: ["type"],
        _count: true,
        where: {
          type: { not: null },
        },
      }),
      prisma.documentCategory.findMany({
        include: {
          _count: {
            select: { documents: true },
          },
        },
      }),
      prisma.documentAccessLog.findMany({
        orderBy: { accessedAt: "desc" },
        take: 20,
        include: {
          document: {
            select: {
              title: true,
            },
          },
        },
      }),
      prisma.document.count({
        where: {
          approvalStatus: "IN_PROGRESS",
        },
      }),
      prisma.document.count({
        where: {
          expiresAt: {
            lt: new Date(),
          },
          status: { not: "ARCHIVED" },
        },
      }),
    ]);

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
    console.error("Error fetching analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// GET /api/documents/analytics/access - Access patterns
router.get("/documents/analytics/access", async (req, res) => {
  try {
    const { documentId, userId, startDate, endDate } = req.query;

    const where: any = {};

    if (documentId && typeof documentId === "string") {
      where.documentId = documentId;
    }

    if (userId && typeof userId === "string") {
      where.userId = userId;
    }

    if (startDate && typeof startDate === "string") {
      where.accessedAt = {
        ...where.accessedAt,
        gte: new Date(startDate),
      };
    }

    if (endDate && typeof endDate === "string") {
      where.accessedAt = {
        ...where.accessedAt,
        lte: new Date(endDate),
      };
    }

    const [accessLogs, mostAccessed, userActivity] = await Promise.all([
      prisma.documentAccessLog.findMany({
        where,
        orderBy: { accessedAt: "desc" },
        take: 100,
        include: {
          document: {
            select: {
              title: true,
            },
          },
        },
      }),
      prisma.documentAccessLog.groupBy({
        by: ["documentId"],
        _count: true,
        orderBy: {
          _count: {
            documentId: "desc",
          },
        },
        take: 10,
      }),
      prisma.documentAccessLog.groupBy({
        by: ["userId", "action"],
        _count: true,
        where: {
          userId: { not: null },
        },
      }),
    ]);

    // Get document titles for most accessed
    const mostAccessedDocuments = await Promise.all(
      mostAccessed.map(async (item: any) => {
        const doc = await prisma.document.findUnique({
          where: { id: item.documentId },
          select: { title: true },
        });
        return {
          ...item,
          documentTitle: doc?.title,
        };
      })
    );

    res.json({
      accessLogs,
      mostAccessed: mostAccessedDocuments,
      userActivity,
    });
  } catch (error) {
    console.error("Error fetching access analytics:", error);
    res.status(500).json({ error: "Failed to fetch access analytics" });
  }
});

// GET /api/documents/analytics/versions - Version metrics
router.get("/documents/analytics/versions", async (req, res) => {
  try {
    const [totalVersions, allDocuments, recentChanges] = await Promise.all([
      prisma.documentVersion.count(),
      prisma.document.findMany({
        include: {
          _count: {
            select: { versions: true },
          },
        },
        orderBy: {
          versions: {
            _count: "desc",
          },
        },
        take: 10,
      }),
      prisma.documentChange.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          document: {
            select: {
              title: true,
            },
          },
        },
      }),
    ]);

    const avgVersionsPerDoc =
      allDocuments.length > 0
        ? allDocuments.reduce((sum: any, doc: any) => sum + doc._count.versions, 0) /
            allDocuments.length
        : 0;

    const mostVersioned = allDocuments
      .map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        versionCount: doc._count.versions,
      }))
      .sort((a: any, b: any) => b.versionCount - a.versionCount);

    res.json({
      totalVersions,
      avgVersionsPerDoc: { avg_versions: avgVersionsPerDoc },
      mostVersioned,
      recentChanges,
    });
  } catch (error) {
    console.error("Error fetching version analytics:", error);
    res.status(500).json({ error: "Failed to fetch version analytics" });
  }
});

// ============================================================================
// GAP ANALYSIS
// ============================================================================

// GET /api/documents/gaps - Identify missing documentation
router.get("/documents/gaps", async (req, res) => {
  try {
    const gaps = [];

    // Check for BCMS Policy
    const bcmsPolicy = await prisma.document.findFirst({
      where: { type: "POLICY" },
    });
    if (!bcmsPolicy) {
      gaps.push({
        type: "missing_document",
        severity: "critical",
        description: "BCMS Policy document is required for compliance",
        suggestedTemplate: "BCMS Policy Template",
      });
    }

    // Check for incident procedures
    const incidentProcedures = await prisma.document.findMany({
      where: { type: "PLAYBOOK" },
    });
    if (incidentProcedures.length === 0) {
      gaps.push({
        type: "missing_document",
        severity: "critical",
        description: "Incident Response Playbooks are required for compliance",
        suggestedTemplate: "Incident Response Playbook Template",
      });
    }

    // Check for contact directory
    const contactDirectory = await prisma.document.findFirst({
      where: { 
        OR: [
          { title: { contains: "Contact", mode: "insensitive" } },
          { title: { contains: "Directory", mode: "insensitive" } },
        ],
      },
    });
    if (!contactDirectory) {
      gaps.push({
        type: "missing_document",
        severity: "high",
        description: "Contact Directory should be generated from BC Team structure",
        suggestedAction: "Generate from BC Team data",
      });
    }

    // Check for testing procedures
    const testProcedures = await prisma.document.findMany({
      where: { type: "PROCEDURE" },
    });
    if (testProcedures.length === 0) {
      gaps.push({
        type: "missing_document",
        severity: "medium",
        description: "Testing and Exercise Procedures are recommended",
        suggestedTemplate: "Testing Procedure Template",
      });
    }

    // Check for unapproved documents
    const unapprovedDocs = await prisma.document.findMany({
      where: {
        status: { in: ["DRAFT", "REVIEW"] },
      },
      select: { id: true, title: true, status: true },
    });
    if (unapprovedDocs.length > 0) {
      gaps.push({
        type: "pending_approval",
        severity: "medium",
        description: `${unapprovedDocs.length} documents pending approval`,
        documents: unapprovedDocs,
      });
    }

    // Check for expired documents
    const expiredDocs = await prisma.document.findMany({
      where: {
        expiresAt: { lt: new Date() },
        status: { not: "ARCHIVED" },
      },
      select: { id: true, title: true, expiresAt: true },
    });
    if (expiredDocs.length > 0) {
      gaps.push({
        type: "expired_documents",
        severity: "high",
        description: `${expiredDocs.length} documents have expired and need review`,
        documents: expiredDocs,
      });
    }

    res.json({ gaps, total: gaps.length });
  } catch (error) {
    console.error("Error performing gap analysis:", error);
    res.status(500).json({ error: "Failed to perform gap analysis" });
  }
});

export default router;
