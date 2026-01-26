import { Router } from "express";


const router = Router();
import { prisma } from "../db";
const organizationId = "00000000-0000-0000-0000-000000000001";

// GET /api/bc-roles - List all roles
router.get("/", async (req, res) => {
  try {
    const roles = await prisma.bCRole.findMany({
      where: { organization_id: organizationId },
      orderBy: { name: "asc" }
    });
    res.json(roles);
  } catch (error: any) {
    console.error("Error fetching BC roles:", error);
    res.status(500).json({ error: "Failed to fetch roles" });
  }
});

// GET /api/bc-roles/:id - Get single role
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const role = await prisma.bCRole.findUnique({
      where: { id },
      include: {
        roleAssignments: {
          include: { person: true, team_structure: true }
        }
      }
    });

    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    res.json(role);
  } catch (error: any) {
    console.error("Error fetching BC role:", error);
    res.status(500).json({ error: "Failed to fetch role" });
  }
});

// POST /api/bc-roles - Create new role
router.post("/", async (req, res) => {
  try {
    const role = await prisma.bCRole.create({
      data: {
        ...req.body,
        organization_id: organizationId
      }
    });
    res.status(201).json(role);
  } catch (error: any) {
    console.error("Error creating BC role:", error);
    res.status(500).json({ error: "Failed to create role" });
  }
});

// PUT /api/bc-roles/:id - Update role
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const role = await prisma.bCRole.update({
      where: { id },
      data: req.body
    });
    res.json(role);
  } catch (error: any) {
    console.error("Error updating BC role:", error);
    res.status(500).json({ error: "Failed to update role" });
  }
});

// DELETE /api/bc-roles/:id - Delete role
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.bCRole.delete({
      where: { id }
    });
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting BC role:", error);
    res.status(500).json({ error: "Failed to delete role" });
  }
});

export default router;
