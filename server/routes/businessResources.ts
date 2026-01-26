import { Router } from "express";
import { prisma } from "../db";

const router = Router();

// Get all business resources
router.get("/", async (req, res) => {
  try {
    const resources = await prisma.businessResource.findMany();
    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Get single resource
router.get("/:id", async (req, res) => {
  try {
    const resource = await prisma.businessResource.findUnique({
      where: { id: req.params.id },
    });
    res.json(resource);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

export default router;
