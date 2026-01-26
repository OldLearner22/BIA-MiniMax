import { Router } from "express";


import { prisma } from "../db";
const router = Router();

// GET all strategic planning items
router.get("/", async (req, res) => {
  try {
    const items = await prisma.strategicPlanning.findMany({
      orderBy: { updatedAt: "desc" },
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch strategic planning items" });
  }
});

// POST a new strategic planning item
router.post("/", async (req, res) => {
  try {
    const {
      type,
      title,
      description,
      source,
      impact,
      actionPlan,
      priority,
      status,
      owner,
    } = req.body;
    const item = await prisma.strategicPlanning.create({
      data: {
        type,
        title,
        description,
        source,
        impact,
        actionPlan,
        priority,
        status,
        owner,
      },
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to create strategic planning item" });
  }
});

// PUT (update) a strategic planning item
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      type,
      title,
      description,
      source,
      impact,
      actionPlan,
      priority,
      status,
      owner,
    } = req.body;
    const item = await prisma.strategicPlanning.update({
      where: { id },
      data: {
        type,
        title,
        description,
        source,
        impact,
        actionPlan,
        priority,
        status,
        owner,
      },
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to update strategic planning item" });
  }
});

// DELETE a strategic planning item
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.strategicPlanning.delete({
      where: { id },
    });
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete strategic planning item" });
  }
});

export default router;
