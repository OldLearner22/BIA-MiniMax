import { Router } from "express";


const router = Router();
import { prisma } from "../db";
const organizationId = "00000000-0000-0000-0000-000000000001";

// ============================================================
// PERSON COMPETENCY ROUTES (MUST BE BEFORE /:id ROUTES)
// ============================================================

// GET /api/bc-competencies/person-competencies - List all person competencies (with optional personId filter)
router.get("/person-competencies", async (req, res) => {
  try {
    const { personId } = req.query;

    const where = personId ? { person_id: personId as string } : {};
    const competencies = await prisma.bCPersonCompetency.findMany({
      where,
      include: {
        competency: true,
        person: true
      },
      orderBy: { assessment_date: "desc" }
    });

    res.json(competencies);
  } catch (error: any) {
    console.error("Error fetching person competencies:", error);
    res.status(500).json({ error: "Failed to fetch person competencies" });
  }
});

// POST /api/bc-competencies/person-competencies - Create or update person competency assessment
router.post("/person-competencies", async (req, res) => {
  try {
    const {
      person_id,
      competency_id,
      proficiency_level,
      assessor_id,
      assessment_method,
      evidence,
      next_assessment_date
    } = req.body;

    if (!person_id || !competency_id || !proficiency_level || !assessment_method) {
      return res.status(400).json({
        error: "Missing required fields: person_id, competency_id, proficiency_level, assessment_method"
      });
    }

    if (proficiency_level < 1 || proficiency_level > 5) {
      return res.status(400).json({ error: "Proficiency level must be between 1 and 5" });
    }

    // Try to update existing, if not found create new
    let assessment = await prisma.bCPersonCompetency.findUnique({
      where: {
        person_id_competency_id: {
          person_id,
          competency_id
        }
      }
    });

    if (assessment) {
      // Update existing assessment
      assessment = await prisma.bCPersonCompetency.update({
        where: { id: assessment.id },
        data: {
          proficiency_level,
          assessor_id,
          assessment_method,
          evidence,
          next_assessment_date: next_assessment_date ? new Date(next_assessment_date) : null,
          assessment_date: new Date()
        },
        include: { competency: true, person: true }
      });
    } else {
      // Create new assessment
      assessment = await prisma.bCPersonCompetency.create({
        data: {
          person_id,
          competency_id,
          proficiency_level,
          assessor_id,
          assessment_method,
          evidence,
          next_assessment_date: next_assessment_date ? new Date(next_assessment_date) : null
        },
        include: { competency: true, person: true }
      });
    }

    res.status(201).json(assessment);
  } catch (error: any) {
    console.error("Error assessing competency:", error);
    res.status(500).json({ error: "Failed to assess competency" });
  }
});

// PUT /api/bc-competencies/person-competencies/:id - Update person competency assessment
router.put("/person-competencies/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { next_assessment_date, ...data } = req.body;

    const assessment = await prisma.bCPersonCompetency.update({
      where: { id },
      data: {
        ...data,
        ...(next_assessment_date && { next_assessment_date: new Date(next_assessment_date) }),
        assessment_date: new Date()
      },
      include: { competency: true, person: true }
    });

    res.json(assessment);
  } catch (error: any) {
    console.error("Error updating competency assessment:", error);
    res.status(500).json({ error: "Failed to update assessment" });
  }
});

// DELETE /api/bc-competencies/person-competencies/:id - Delete person competency assessment
router.delete("/person-competencies/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.bCPersonCompetency.delete({
      where: { id }
    });
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting competency assessment:", error);
    res.status(500).json({ error: "Failed to delete assessment" });
  }
});

// ============================================================
// COMPETENCY ROUTES
// ============================================================

// GET /api/bc-competencies - List all competencies
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    const where = category ? { competency_category: category as string } : { organization_id: organizationId };

    const competencies = await prisma.bCCompetency.findMany({
      where,
      orderBy: { name: "asc" }
    });

    res.json(competencies);
  } catch (error: any) {
    console.error("Error fetching competencies:", error);
    res.status(500).json({ error: "Failed to fetch competencies" });
  }
});

// POST /api/bc-competencies - Create new competency
router.post("/", async (req, res) => {
  try {
    const {
      name,
      description,
      competency_category,
      required_for_roles = [],
      assessment_criteria,
      proficiency_levels
    } = req.body;

    if (!name || !competency_category) {
      return res.status(400).json({ error: "Missing required fields: name, competency_category" });
    }

    const competency = await prisma.bCCompetency.create({
      data: {
        name,
        description,
        competency_category,
        required_for_roles,
        assessment_criteria,
        proficiency_levels,
        organization_id: organizationId
      }
    });

    res.status(201).json(competency);
  } catch (error: any) {
    console.error("Error creating competency:", error);
    res.status(500).json({ error: "Failed to create competency" });
  }
});

// GET /api/bc-competencies/:id - Get single competency
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const competency = await prisma.bCCompetency.findUnique({
      where: { id },
      include: {
        personCompetencies: {
          include: { person: true }
        }
      }
    });

    if (!competency) {
      return res.status(404).json({ error: "Competency not found" });
    }

    res.json(competency);
  } catch (error: any) {
    console.error("Error fetching competency:", error);
    res.status(500).json({ error: "Failed to fetch competency" });
  }
});

// PUT /api/bc-competencies/:id - Update competency
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const competency = await prisma.bCCompetency.update({
      where: { id },
      data: req.body
    });
    res.json(competency);
  } catch (error: any) {
    console.error("Error updating competency:", error);
    res.status(500).json({ error: "Failed to update competency" });
  }
});

// DELETE /api/bc-competencies/:id - Delete competency
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.bCCompetency.delete({
      where: { id }
    });
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting competency:", error);
    res.status(500).json({ error: "Failed to delete competency" });
  }
});

export default router;
