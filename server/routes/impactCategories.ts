import { Router } from "express";
import { prisma } from "../db";

const router = Router();

// GET /api/impact-categories - Get all impact categories for organization
router.get("/", async (req, res) => {
  try {
    const organizationId = "00000000-0000-0000-0000-000000000001";

    const categories = await prisma.impactCategory.findMany({
      where: { organizationId },
      include: {
        timeBasedDefinitions: {
          orderBy: { timelinePointId: "asc" },
        },
      },
      orderBy: { displayOrder: "asc" },
    });

    res.json(categories);
  } catch (error) {
    console.error("Error fetching impact categories:", error);
    res.status(500).json({ error: "Failed to fetch impact categories" });
  }
});

// POST /api/impact-categories/bulk - Create or update all impact categories
router.post("/bulk", async (req, res) => {
  try {
    const { categories } = req.body;
    const organizationId = "00000000-0000-0000-0000-000000000001";

    if (!categories || !Array.isArray(categories)) {
      return res.status(400).json({ error: "Invalid categories data" });
    }

    // Validate total weight equals 100%
    const totalWeight = categories.reduce(
      (sum, cat) => sum + (cat.weight || 0),
      0,
    );
    if (totalWeight !== 100) {
      return res.status(400).json({
        error: "Impact category weights must total 100%",
        currentTotal: totalWeight,
      });
    }

    // Delete all existing categories for this organization
    await prisma.impactCategory.deleteMany({
      where: { organizationId },
    });

    // Create new categories
    const results = await Promise.all(
      categories.map(async (cat, index) => {
        const category = await prisma.impactCategory.create({
          data: {
            name: cat.name,
            description: cat.description || "",
            weight: cat.weight,
            color: cat.color,
            displayOrder: index,
            organizationId,
            timeBasedDefinitions: {
              create: (cat.timeBasedDefinitions || []).map((def: any) => ({
                timelinePointId: def.timelinePointId,
                description: def.description || "",
                organizationId,
              })),
            },
          },
          include: {
            timeBasedDefinitions: true,
          },
        });
        return category;
      }),
    );

    res.json({ success: true, categories: results });
  } catch (error) {
    console.error("Error saving impact categories:", error);
    res.status(500).json({ error: "Failed to save impact categories" });
  }
});

// PUT /api/impact-categories/:id - Update a single category
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, weight, color } = req.body;
    const organizationId = "00000000-0000-0000-0000-000000000001";

    const category = await prisma.impactCategory.update({
      where: { id },
      data: {
        name,
        description,
        weight,
        color,
        updatedAt: new Date(),
      },
      include: {
        timeBasedDefinitions: true,
      },
    });

    res.json(category);
  } catch (error) {
    console.error("Error updating impact category:", error);
    res.status(500).json({ error: "Failed to update impact category" });
  }
});

// DELETE /api/impact-categories/:id - Delete a category
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.impactCategory.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting impact category:", error);
    res.status(500).json({ error: "Failed to delete impact category" });
  }
});

export default router;
