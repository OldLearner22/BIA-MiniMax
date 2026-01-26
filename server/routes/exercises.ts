import { Router } from "express";
import { prisma } from "../db";

const router = Router();

// Get all exercise records
router.get("/", async (req, res) => {
  try {
    const exercises = await prisma.exerciseRecord.findMany();
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Get single exercise
router.get("/:id", async (req, res) => {
  try {
    const exercise = await prisma.exerciseRecord.findUnique({
      where: { id: req.params.id },
    });
    res.json(exercise);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

export default router;
