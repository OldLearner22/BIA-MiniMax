import { Router } from "express";


const router = Router();
import { prisma } from "../db";

// GET /api/bc-training-records - List all training records (with optional personId filter)
router.get("/", async (req, res) => {
  try {
    const { personId, status } = req.query;
    const where: any = {};

    if (personId) where.person_id = personId as string;
    if (status) where.status = status as string;

    const records = await prisma.bCTrainingRecord.findMany({
      where,
      orderBy: { completion_date: "desc" },
      include: { person: true }
    });

    res.json(records);
  } catch (error: any) {
    console.error("Error fetching training records:", error);
    res.status(500).json({ error: "Failed to fetch training records" });
  }
});

// GET /api/bc-training-records/:id - Get single training record
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const record = await prisma.bCTrainingRecord.findUnique({
      where: { id },
      include: { person: true }
    });

    if (!record) {
      return res.status(404).json({ error: "Training record not found" });
    }

    res.json(record);
  } catch (error: any) {
    console.error("Error fetching training record:", error);
    res.status(500).json({ error: "Failed to fetch training record" });
  }
});

// POST /api/bc-training-records - Create new training record
router.post("/", async (req, res) => {
  try {
    const {
      person_id,
      training_type,
      training_title,
      provider,
      completion_date,
      expiry_date,
      certificate_number,
      certificate_url,
      score,
      status = "completed",
      renewal_required = false,
      renewal_reminder_days = 30
    } = req.body;

    if (!person_id || !training_type || !training_title || !completion_date) {
      return res.status(400).json({ 
        error: "Missing required fields: person_id, training_type, training_title, completion_date" 
      });
    }

    const record = await prisma.bCTrainingRecord.create({
      data: {
        person_id,
        training_type,
        training_title,
        provider,
        completion_date: new Date(completion_date),
        expiry_date: expiry_date ? new Date(expiry_date) : null,
        certificate_number,
        certificate_url,
        score: score ? parseInt(score) : null,
        status,
        renewal_required,
        renewal_reminder_days
      },
      include: { person: true }
    });

    res.status(201).json(record);
  } catch (error: any) {
    console.error("Error creating training record:", error);
    res.status(500).json({ error: "Failed to create training record" });
  }
});

// PUT /api/bc-training-records/:id - Update training record
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { completion_date, expiry_date, score, ...data } = req.body;

    const updateData: any = { ...data };
    if (completion_date) updateData.completion_date = new Date(completion_date);
    if (expiry_date) updateData.expiry_date = new Date(expiry_date);
    if (score) updateData.score = parseInt(score);

    const record = await prisma.bCTrainingRecord.update({
      where: { id },
      data: updateData,
      include: { person: true }
    });

    res.json(record);
  } catch (error: any) {
    console.error("Error updating training record:", error);
    res.status(500).json({ error: "Failed to update training record" });
  }
});

// DELETE /api/bc-training-records/:id - Delete training record
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.bCTrainingRecord.delete({
      where: { id }
    });
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting training record:", error);
    res.status(500).json({ error: "Failed to delete training record" });
  }
});

// GET /api/bc-training-records/expiring/soon - Get records expiring soon
router.get("/expiring/soon", async (req, res) => {
  try {
    const { days = "30" } = req.query;
    const daysNum = parseInt(days as string);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysNum);

    const records = await prisma.bCTrainingRecord.findMany({
      where: {
        status: "completed",
        expiry_date: {
          lte: futureDate,
          gte: new Date()
        }
      },
      orderBy: { expiry_date: "asc" },
      include: { person: true }
    });

    res.json(records);
  } catch (error: any) {
    console.error("Error fetching expiring training records:", error);
    res.status(500).json({ error: "Failed to fetch expiring records" });
  }
});

export default router;
