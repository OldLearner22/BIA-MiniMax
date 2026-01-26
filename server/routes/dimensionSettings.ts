import { Router } from "express";


const router = Router();
import { prisma } from "../db";

const DEFAULT_ORG_ID = "00000000-0000-0000-0000-000000000001";

// GET /api/settings/dimensions - Fetch all dimension targets for organization
router.get("/dimensions", async (req, res) => {
  try {
    const organizationId = DEFAULT_ORG_ID;

    const targets = await prisma.dimensionTarget.findMany({
      where: { organizationId },
      orderBy: { dimension: "asc" },
    });

    // Convert to Record<dimension, settings> format
    const dimensionSettings: Record<string, any> = {};
    targets.forEach((target) => {
      dimensionSettings[target.dimension] = {
        targetLevel: target.targetLevel,
        businessContext: target.businessContext,
        successCriteria: target.successCriteria,
        timeline: target.timeline,
        owner: target.owner,
        weight: target.weight,
      };
    });

    res.json(dimensionSettings);
  } catch (error) {
    console.error("Error fetching dimension settings:", error);
    res.status(500).json({ error: "Failed to fetch dimension settings" });
  }
});

// POST /api/settings/dimensions - Create/update all dimension targets
router.post("/dimensions", async (req, res) => {
  try {
    const organizationId = DEFAULT_ORG_ID;
    const dimensionSettings = req.body;
    const createdBy = "system"; // TODO: Get from authenticated user

    const results = await Promise.all(
      Object.entries(dimensionSettings).map(
        async ([dimension, settings]: [string, any]) => {
          return prisma.dimensionTarget.upsert({
            where: {
              organizationId_dimension: {
                organizationId,
                dimension,
              },
            },
            update: {
              targetLevel: settings.targetLevel,
              businessContext: settings.businessContext,
              successCriteria: settings.successCriteria,
              timeline: settings.timeline,
              owner: settings.owner,
              weight: settings.weight,
              updatedAt: new Date(),
            },
            create: {
              organizationId,
              dimension,
              targetLevel: settings.targetLevel,
              businessContext: settings.businessContext,
              successCriteria: settings.successCriteria,
              timeline: settings.timeline,
              owner: settings.owner,
              weight: settings.weight,
              createdBy,
            },
          });
        },
      ),
    );

    res.json({ success: true, count: results.length });
  } catch (error) {
    console.error("Error saving dimension settings:", error);
    res.status(500).json({ error: "Failed to save dimension settings" });
  }
});

// PUT /api/settings/dimensions/:dimension - Update specific dimension
router.put("/dimensions/:dimension", async (req, res) => {
  try {
    const organizationId = DEFAULT_ORG_ID;
    const { dimension } = req.params;
    const settings = req.body;

    const target = await prisma.dimensionTarget.upsert({
      where: {
        organizationId_dimension: {
          organizationId,
          dimension,
        },
      },
      update: {
        ...settings,
        updatedAt: new Date(),
      },
      create: {
        organizationId,
        dimension,
        ...settings,
        createdBy: "system", // TODO: Get from authenticated user
      },
    });

    res.json(target);
  } catch (error) {
    console.error("Error updating dimension setting:", error);
    res.status(500).json({ error: "Failed to update dimension setting" });
  }
});

// DELETE /api/settings/dimensions/:dimension - Remove custom target (revert to defaults)
router.delete("/dimensions/:dimension", async (req, res) => {
  try {
    const organizationId = DEFAULT_ORG_ID;
    const { dimension } = req.params;

    await prisma.dimensionTarget.delete({
      where: {
        organizationId_dimension: {
          organizationId,
          dimension,
        },
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting dimension setting:", error);
    res.status(500).json({ error: "Failed to delete dimension setting" });
  }
});

// GET /api/settings/dimensions/gaps - Get calculated gap analysis
router.get("/dimensions/gaps", async (req, res) => {
  try {
    const organizationId = DEFAULT_ORG_ID;

    const gaps = await prisma.dimensionGapAnalysis.findMany({
      where: { organizationId },
      orderBy: { dimension: "asc" },
    });

    // Convert to Record<dimension, gap> format
    const dimensionGaps: Record<string, any> = {};
    gaps.forEach((gap) => {
      dimensionGaps[gap.dimension] = {
        currentLevel: gap.currentLevel,
        targetLevel: gap.targetLevel,
        currentScore: gap.currentScore,
        gapPercentage: gap.gapPercentage,
        status: gap.status,
      };
    });

    res.json(dimensionGaps);
  } catch (error) {
    console.error("Error fetching dimension gaps:", error);
    res.status(500).json({ error: "Failed to fetch dimension gaps" });
  }
});

// POST /api/settings/dimensions/gaps - Update gap analysis (calculated from current data)
router.post("/dimensions/gaps", async (req, res) => {
  try {
    const organizationId = DEFAULT_ORG_ID;
    const gaps = req.body; // Array of gap objects

    const results = await Promise.all(
      gaps.map(async (gap: any) => {
        return prisma.dimensionGapAnalysis.upsert({
          where: {
            organizationId_dimension: {
              organizationId,
              dimension: gap.dimension,
            },
          },
          update: {
            currentLevel: gap.currentLevel,
            targetLevel: gap.targetLevel,
            currentScore: gap.currentScore,
            gapPercentage: gap.gapPercentage,
            status: gap.status,
            lastUpdated: new Date(),
          },
          create: {
            organizationId,
            dimension: gap.dimension,
            currentLevel: gap.currentLevel,
            targetLevel: gap.targetLevel,
            currentScore: gap.currentScore,
            gapPercentage: gap.gapPercentage,
            status: gap.status,
          },
        });
      }),
    );

    res.json({ success: true, count: results.length });
  } catch (error) {
    console.error("Error updating dimension gaps:", error);
    res.status(500).json({ error: "Failed to update dimension gaps" });
  }
});

// POST /api/settings/industry-presets/:industry - Apply industry-standard weighting
router.post("/industry-presets/:industry", async (req, res) => {
  try {
    const organizationId = DEFAULT_ORG_ID;
    const { industry } = req.params;

    // Industry preset weights
    const presets: Record<string, Record<string, number>> = {
      financial: {
        "Compliance Maturity": 0.25,
        "Risk Management": 0.25,
        "Coverage Maturity": 0.2,
        "Readiness Maturity": 0.15,
        "Capability Maturity": 0.15,
      },
      healthcare: {
        "Compliance Maturity": 0.25,
        "Readiness Maturity": 0.25,
        "Coverage Maturity": 0.2,
        "Risk Management": 0.2,
        "Capability Maturity": 0.1,
      },
      ecommerce: {
        "Readiness Maturity": 0.3,
        "Capability Maturity": 0.25,
        "Coverage Maturity": 0.2,
        "Risk Management": 0.15,
        "Compliance Maturity": 0.1,
      },
      manufacturing: {
        "Capability Maturity": 0.25,
        "Readiness Maturity": 0.25,
        "Risk Management": 0.2,
        "Coverage Maturity": 0.15,
        "Compliance Maturity": 0.15,
      },
      government: {
        "Compliance Maturity": 0.3,
        "Coverage Maturity": 0.25,
        "Risk Management": 0.2,
        "Readiness Maturity": 0.15,
        "Capability Maturity": 0.1,
      },
    };

    const weights = presets[industry] || presets.financial;

    // Update weights for all dimensions
    const results = await Promise.all(
      Object.entries(weights).map(async ([dimension, weight]) => {
        return prisma.dimensionTarget.update({
          where: {
            organizationId_dimension: {
              organizationId,
              dimension,
            },
          },
          data: {
            weight,
            updatedAt: new Date(),
          },
        });
      }),
    );

    res.json({ success: true, industry, weights, count: results.length });
  } catch (error) {
    console.error("Error applying industry preset:", error);
    res.status(500).json({ error: "Failed to apply industry preset" });
  }
});

export default router;
