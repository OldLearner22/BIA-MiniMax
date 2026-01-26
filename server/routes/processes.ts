import { Router } from "express";
import { prisma } from "../db";

const router = Router();

// Get all processes
router.get("/", async (req, res) => {
  try {
    console.log("[processes] Fetching all processes...");
    const processes = await prisma.process.findMany({
      include: {
        impactAssessment: true,
        recoveryObjective: true,
        dependenciesAsSource: true,
        dependenciesAsTarget: true,
      },
    });
    console.log(`[processes] Found ${processes.length} processes`);
    res.json(processes);
  } catch (error) {
    console.error("[processes] Error:", error);
    res.status(500).json({ error: String(error) });
  }
});

// Get single process
router.get("/:id", async (req, res) => {
  try {
    const process = await prisma.process.findUnique({
      where: { id: req.params.id },
      include: {
        impactAssessment: true,
        recoveryObjective: true,
        dependenciesAsSource: true,
        dependenciesAsTarget: true,
      },
    });
    res.json(process);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

export default router;
