import { Router } from "express";
import { prisma } from "../db";

const router = Router();

// Get all dependencies
router.get("/", async (req, res) => {
  try {
    const dependencies = await prisma.dependency.findMany({
      include: {
        sourceProcess: true,
        targetProcess: true,
      },
    });
    res.json(dependencies);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Get dependencies for a process
router.get("/process/:processId", async (req, res) => {
  try {
    const dependencies = await prisma.dependency.findMany({
      where: {
        OR: [
          { sourceProcessId: req.params.processId },
          { targetProcessId: req.params.processId },
        ],
      },
      include: {
        sourceProcess: true,
        targetProcess: true,
      },
    });
    res.json(dependencies);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

export default router;
