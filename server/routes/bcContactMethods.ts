import { Router } from "express";


const router = Router();
import { prisma } from "../db";

// GET /api/bc-contact-methods - List all contact methods (with optional personId filter)
router.get("/", async (req, res) => {
  try {
    const { personId } = req.query;
    const where = personId ? { person_id: personId as string } : {};

    const methods = await prisma.bCContactMethod.findMany({
      where,
      orderBy: [{ is_primary: "desc" }, { priority_order: "asc" }],
      include: { person: true }
    });

    res.json(methods);
  } catch (error: any) {
    console.error("Error fetching contact methods:", error);
    res.status(500).json({ error: "Failed to fetch contact methods" });
  }
});

// GET /api/bc-contact-methods/:id - Get single contact method
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const method = await prisma.bCContactMethod.findUnique({
      where: { id },
      include: { person: true }
    });

    if (!method) {
      return res.status(404).json({ error: "Contact method not found" });
    }

    res.json(method);
  } catch (error: any) {
    console.error("Error fetching contact method:", error);
    res.status(500).json({ error: "Failed to fetch contact method" });
  }
});

// POST /api/bc-contact-methods - Create new contact method
router.post("/", async (req, res) => {
  try {
    const {
      person_id,
      contact_type,
      contact_value,
      priority_order = 1,
      is_primary = false,
      is_24_7_available = false,
      preferred_for_alerts = false,
      notes
    } = req.body;

    if (!person_id || !contact_type || !contact_value) {
      return res.status(400).json({ error: "Missing required fields: person_id, contact_type, contact_value" });
    }

    // If marking as primary, unmark others
    if (is_primary) {
      await prisma.bCContactMethod.updateMany({
        where: { person_id, is_primary: true },
        data: { is_primary: false }
      });
    }

    const method = await prisma.bCContactMethod.create({
      data: {
        person_id,
        contact_type,
        contact_value,
        priority_order,
        is_primary,
        is_24_7_available,
        preferred_for_alerts,
        notes
      },
      include: { person: true }
    });

    res.status(201).json(method);
  } catch (error: any) {
    console.error("Error creating contact method:", error);
    res.status(500).json({ error: "Failed to create contact method" });
  }
});

// PUT /api/bc-contact-methods/:id - Update contact method
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { is_primary, ...data } = req.body;

    // If marking as primary, unmark others for same person
    if (is_primary) {
      const method = await prisma.bCContactMethod.findUnique({ where: { id } });
      if (method) {
        await prisma.bCContactMethod.updateMany({
          where: { person_id: method.person_id, is_primary: true },
          data: { is_primary: false }
        });
      }
    }

    const method = await prisma.bCContactMethod.update({
      where: { id },
      data: { ...data, ...(is_primary !== undefined && { is_primary }) },
      include: { person: true }
    });

    res.json(method);
  } catch (error: any) {
    console.error("Error updating contact method:", error);
    res.status(500).json({ error: "Failed to update contact method" });
  }
});

// DELETE /api/bc-contact-methods/:id - Delete contact method
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.bCContactMethod.delete({
      where: { id }
    });
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting contact method:", error);
    res.status(500).json({ error: "Failed to delete contact method" });
  }
});

export default router;
