import { Router } from "express";


import { prisma } from "../db";
const router = Router();

// GET all risk treatment plans
router.get("/", async (req, res) => {
  try {
    const treatments = await prisma.riskTreatment.findMany({
      orderBy: { updatedAt: "desc" },
    });
    res.json(treatments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch risk treatment plans" });
  }
});

// POST new risk treatment plan
router.post("/", async (req, res) => {
  try {
    const treatment = await prisma.riskTreatment.create({
      data: {
        ...req.body,
        targetDate: req.body.targetDate ? new Date(req.body.targetDate) : null,
      },
    });
    res.json(treatment);
  } catch (error) {
    res.status(500).json({ error: "Failed to create risk treatment plan" });
  }
});

// PUT update risk treatment plan
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const treatment = await prisma.riskTreatment.update({
      where: { id },
      data: {
        ...req.body,
        targetDate: req.body.targetDate ? new Date(req.body.targetDate) : null,
      },
    });
    res.json(treatment);
  } catch (error) {
    res.status(500).json({ error: "Failed to update risk treatment plan" });
  }
});

// DELETE risk treatment plan
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.riskTreatment.delete({
      where: { id },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete risk treatment plan" });
  }
});

export default router;
