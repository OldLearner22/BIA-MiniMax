import { Router } from "express";


import { prisma } from "../db";
const router = Router();

// GET all threats
router.get("/", async (req, res) => {
  try {
    const threats = await prisma.threat.findMany({
      orderBy: { updatedAt: "desc" },
    });
    res.json(threats);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch threats" });
  }
});

// POST a new threat
router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      source,
      likelihood,
      impact,
      status,
      owner,
    } = req.body;
    const riskScore = likelihood * impact;
    const threat = await prisma.threat.create({
      data: {
        title,
        description,
        category,
        source,
        likelihood,
        impact,
        riskScore,
        status,
        owner,
      },
    });
    res.json(threat);
  } catch (error) {
    res.status(500).json({ error: "Failed to create threat" });
  }
});

// PUT (update) a threat
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      source,
      likelihood,
      impact,
      status,
      owner,
    } = req.body;
    const riskScore = likelihood * impact;
    const threat = await prisma.threat.update({
      where: { id },
      data: {
        title,
        description,
        category,
        source,
        likelihood,
        impact,
        riskScore,
        status,
        owner,
      },
    });
    res.json(threat);
  } catch (error) {
    res.status(500).json({ error: "Failed to update threat" });
  }
});

// DELETE a threat
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.threat.delete({
      where: { id },
    });
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete threat" });
  }
});

export default router;
