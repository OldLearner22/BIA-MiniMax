import { Router } from "express";


const router = Router();
import { prisma } from "../db";

// Get all risks
router.get("/", async (req, res) => {
  try {
    const risks = await prisma.risk.findMany({
      orderBy: { criticality: "desc" },
    });
    res.json(risks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create a risk
router.post("/", async (req, res) => {
  try {
    const risk = await prisma.risk.create({
      data: req.body,
    });
    res.json(risk);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update a risk
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const risk = await prisma.risk.update({
      where: { id },
      data: req.body,
    });
    res.json(risk);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a risk
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.risk.delete({
      where: { id },
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
