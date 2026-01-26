import { Router } from "express";
import { prisma } from "../db";

const router = Router();

// Get all recovery options
router.get("/", async (req, res) => {
  try {
    const options = await prisma.recoveryOption.findMany();
    res.json(options);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Get recovery options by tier
router.get("/tier/:tier", async (req, res) => {
  try {
    const tier = req.params.tier as
      | "immediate"
      | "rapid"
      | "standard"
      | "extended";
    const options = await prisma.recoveryOption.findMany({
      where: { tier },
    });
    res.json(options);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

export default router;
