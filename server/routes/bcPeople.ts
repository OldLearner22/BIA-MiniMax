import { Router } from "express";


const router = Router();
import { prisma } from "../db";
const organizationId = "00000000-0000-0000-0000-000000000001";

// GET /api/bc-people - List all active people
router.get("/", async (req, res) => {
  try {
    const people = await prisma.bCPerson.findMany({
      where: {
        organization_id: organizationId,
        employment_status: "active",
      },
      orderBy: [{ last_name: "asc" }, { first_name: "asc" }],
    });
    res.json(people);
  } catch (error: any) {
    console.error("Error fetching BC people:", error);
    res.status(500).json({ error: "Failed to fetch people" });
  }
});

// GET /api/bc-people/:id - Get single person
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const person = await prisma.bCPerson.findUnique({
      where: { id },
      include: {
        contactMethods: true,
        trainingRecords: true,
        roleAssignments: {
          include: {
            role: true,
            team_structure: true,
          },
        },
      },
    });

    if (!person) {
      return res.status(404).json({ error: "Person not found" });
    }

    res.json(person);
  } catch (error: any) {
    console.error("Error fetching BC person:", error);
    res.status(500).json({ error: "Failed to fetch person" });
  }
});

// POST /api/bc-people - Create new person
router.post("/", async (req, res) => {
  try {
    const person = await prisma.bCPerson.create({
      data: {
        ...req.body,
        organization_id: organizationId,
        employment_status: req.body.employment_status || "active",
      },
    });
    res.json(person);
  } catch (error: any) {
    console.error("Error creating BC person:", error);
    res.status(500).json({ error: "Failed to create person" });
  }
});

// PUT /api/bc-people/:id - Update person
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const person = await prisma.bCPerson.update({
      where: { id },
      data: req.body,
    });
    res.json(person);
  } catch (error: any) {
    console.error("Error updating BC person:", error);
    res.status(500).json({ error: "Failed to update person" });
  }
});

// DELETE /api/bc-people/:id - Soft delete (set to inactive)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.bCPerson.update({
      where: { id },
      data: { employment_status: "inactive" },
    });
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting BC person:", error);
    res.status(500).json({ error: "Failed to delete person" });
  }
});

export default router;
