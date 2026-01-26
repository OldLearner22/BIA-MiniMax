import { Router } from "express";


const router = Router();
import { prisma } from "../db";

// ============================================================================
// DOCUMENT TEMPLATES ROUTES
// ============================================================================

// GET /api/document-templates - List all templates with optional filtering
router.get("/document-templates", async (req, res) => {
  try {
    const { type, categoryId } = req.query;

    const where: any = {};

    if (type && typeof type === "string" && type !== "") {
      where.type = type as any;
    }

    if (categoryId && typeof categoryId === "string" && categoryId !== "") {
      where.categoryId = categoryId;
    }

    const templates = await prisma.documentTemplate.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { name: "asc" },
    });

    res.json(templates);
  } catch (error) {
    console.error("Error fetching document templates:", error);
    res.status(500).json({ error: "Failed to fetch document templates" });
  }
});

// GET /api/document-templates/:id - Get a specific template
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

// POST /api/document-templates - Create a new template
router.post("/document-templates", async (req, res) => {
  try {
    const {
      name,
      description,
      content,
      type,
      categoryId,
      placeholders,
      createdBy,
    } = req.body;

    if (!name || !content || !createdBy) {
      return res
        .status(400)
        .json({ error: "Name, content, and createdBy are required" });
    }

    const template = await prisma.documentTemplate.create({
      data: {
        name,
        description,
        content,
        type: type || "MANUAL",
        categoryId,
        placeholders,
        createdBy,
      },
      include: {
        category: true,
      },
    });

    res.status(201).json(template);
  } catch (error) {
    console.error("Error creating template:", error);
    res.status(500).json({ error: "Failed to create template" });
  }
});

// PUT /api/document-templates/:id - Update a template
router.put("/document-templates/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, content, type, categoryId, placeholders } =
      req.body;

    const template = await prisma.documentTemplate.update({
      where: { id },
      data: {
        name,
        description,
        content,
        type,
        categoryId,
        placeholders,
      },
      include: {
        category: true,
      },
    });

    res.json(template);
  } catch (error) {
    console.error("Error updating template:", error);
    res.status(500).json({ error: "Failed to update template" });
  }
});

// DELETE /api/document-templates/:id - Delete a template
router.delete("/document-templates/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.documentTemplate.delete({
      where: { id },
    });

    res.json({ message: "Template deleted successfully" });
  } catch (error) {
    console.error("Error deleting template:", error);
    res.status(500).json({ error: "Failed to delete template" });
  }
});

// POST /api/document-templates/:id/generate - Generate a document from template
router.post("/document-templates/:id/generate", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, createdBy, variables } = req.body;

    if (!title || !createdBy) {
      return res
        .status(400)
        .json({ error: "Title and createdBy are required" });
    }

    // Get the template
    const template = await prisma.documentTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    // Replace variables in content if provided
    let content = template.content;
    if (variables && typeof variables === "object") {
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, "g");
        content = content.replace(regex, String(value));
      });
    }

    // Create document from template
    const result = await prisma.$transaction(async (tx) => {
      const document = await tx.document.create({
        data: {
          title,
          content,
          type: template.type,
          categoryId: template.categoryId,
          createdBy,
          updatedBy: createdBy,
        },
        include: { category: true },
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

      return document;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Error generating document from template:", error);
    res
      .status(500)
      .json({ error: "Failed to generate document from template" });
  }
});

export default router;
