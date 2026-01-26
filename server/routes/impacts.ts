import { Router } from "express";
import { prisma } from "../db";

const router = Router();

// Get all impacts
router.get("/", async (req, res) => {
  try {
    const impacts = await prisma.impactAssessment.findMany({
      include: { process: true },
    });
    res.json(impacts);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Get impact for specific process
router.get("/process/:processId", async (req, res) => {
  try {
    const impact = await prisma.impactAssessment.findUnique({
      where: { processId: req.params.processId },
      include: { process: true },
    });
    res.json(impact);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

export default router;
