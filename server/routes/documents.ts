import { Router } from "express";


const router = Router();
import { prisma } from "../db";

// ============================================================================
// DOCUMENTATION ROUTES - Phase 4.5 MVP
// ============================================================================

// GET /api/documents - List all documents with optional filtering
router.get("/documents", async (req, res) => {
  try {
    const { categoryId, status, search } = req.query;

    const where: any = {};

    if (categoryId && typeof categoryId === "string") {
      where.categoryId = categoryId;
    }

    if (status && typeof status === "string") {
      where.status = status as any;
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
      },
      orderBy: { updatedAt: "desc" },
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
    const { title, content, categoryId, createdBy } = req.body;

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
    const { title, content, updatedBy } = req.body;

    if (!title || !content || !updatedBy) {
      return res
        .status(400)
        .json({ error: "Title, content, and updatedBy are required" });
    }

    // Update document and create new version in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get current document to determine next version
      const currentDoc = await tx.document.findUnique({
        where: { id },
        select: { version: true },
      });

      if (!currentDoc) {
        throw new Error("Document not found");
      }

      const nextVersion = currentDoc.version + 1;

      // Update document
      const document = await tx.document.update({
        where: { id },
        data: {
          title,
          content,
          version: nextVersion,
          updatedBy,
          updatedAt: new Date(),
        },
        include: { category: true },
      });

      // Create new version
      await tx.documentVersion.create({
        data: {
          documentId: id,
          version: nextVersion,
          title,
          content,
          createdBy: updatedBy,
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

    res.json(version);
  } catch (error) {
    console.error("Error fetching document version:", error);
    res.status(500).json({ error: "Failed to fetch document version" });
  }
});

// GET /api/document-categories - List all document categories
router.get("/document-categories", async (req, res) => {
  try {
    const categories = await prisma.documentCategory.findMany({
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

export default router;
