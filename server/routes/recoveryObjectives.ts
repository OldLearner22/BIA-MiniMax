import { Router } from "express";
import { prisma } from "../db";

const router = Router();

// Temporal data point structure
interface TimelinePoint {
  timeOffset: number;
  timeLabel: string;
  [key: string]: number | string;
}

// Calculate recovery objectives based on temporal analysis
function calculateRecoveryObjectivesFromTemporal(
  criticality: string,
  timelineData: TimelinePoint[],
  impactThreshold: number = 3, // Default threshold: moderate impact
) {
  // Calculate MTPD based on when impacts cross threshold
  let mtpd = 72; // Default maximum

  for (const point of timelineData) {
    // Get all impact values (exclude timeOffset and timeLabel)
    const impactValues = Object.entries(point)
      .filter(([key]) => key !== "timeOffset" && key !== "timeLabel")
      .map(([, value]) => (typeof value === "number" ? value : 0));

    // Find max impact at this time point
    const maxImpact = Math.max(...impactValues, 0);

    // If max impact exceeds threshold, this is our MTPD
    if (maxImpact >= impactThreshold) {
      mtpd = point.timeOffset;
      break;
    }
  }

  // Adjust MTPD based on criticality if needed
  if (criticality === "critical" && mtpd > 8) {
    mtpd = Math.min(mtpd, 8); // Cap at 8 hours for critical processes
  } else if (criticality === "high" && mtpd > 16) {
    mtpd = Math.min(mtpd, 16); // Cap at 16 hours for high criticality
  }

  // Calculate RTO (Recovery Time Objective)
  // RTO should be 50-75% of MTPD depending on impact severity
  const maxImpactInTimeline = Math.max(
    ...timelineData.map((p) =>
      Math.max(
        ...Object.entries(p)
          .filter(([key]) => key !== "timeOffset" && key !== "timeLabel")
          .map(([, value]) => (typeof value === "number" ? value : 0)),
        0,
      ),
    ),
  );

  const rtoPercentage =
    maxImpactInTimeline > 3.5 ? 0.5 : maxImpactInTimeline > 2.5 ? 0.65 : 0.8;
  const rto = Math.max(1, Math.floor(mtpd * rtoPercentage));

  // Calculate RPO (Recovery Point Objective)
  // RPO is typically 50-75% of RTO
  const rpoPercentage = maxImpactInTimeline > 3.5 ? 0.5 : 0.75;
  const rpo = Math.max(0.5, Math.floor((rto * rpoPercentage * 10) / 10));

  return {
    mtpd: Math.max(1, mtpd),
    rto,
    rpo,
  };
}

// Get all recovery objectives
router.get("/", async (req, res) => {
  try {
    const objectives = await prisma.recoveryObjective.findMany({
      include: { process: true },
    });
    res.json(objectives);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Get recovery objective for specific process
router.get("/process/:processId", async (req, res) => {
  try {
    const objective = await prisma.recoveryObjective.findUnique({
      where: { processId: req.params.processId },
      include: { process: true },
    });
    res.json(objective);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Calculate and update recovery objectives based on temporal analysis data
router.post("/calculate/:processId", async (req, res) => {
  try {
    const { processId } = req.params;
    const { timelineData, impactThreshold } = req.body;

    // Validate temporal data
    if (!Array.isArray(timelineData) || timelineData.length === 0) {
      return res
        .status(400)
        .json({ error: "Valid timelineData array is required" });
    }

    // Get the process to retrieve criticality
    const process = await prisma.process.findUnique({
      where: { id: processId },
    });

    if (!process) {
      return res.status(404).json({ error: "Process not found" });
    }

    // Calculate new objectives based on temporal data
    const calculated = calculateRecoveryObjectivesFromTemporal(
      process.criticality,
      timelineData as TimelinePoint[],
      impactThreshold || 3,
    );

    // Update or create recovery objective
    const objective = await prisma.recoveryObjective.upsert({
      where: { processId },
      update: {
        mtpd: calculated.mtpd,
        rto: calculated.rto,
        rpo: calculated.rpo,
        mbco: process.criticality === "critical" || calculated.mtpd <= 4,
      },
      create: {
        processId,
        mtpd: calculated.mtpd,
        rto: calculated.rto,
        rpo: calculated.rpo,
        mbco: process.criticality === "critical" || calculated.mtpd <= 4,
        recoveryStrategy: "warm_standby",
        strategyNotes: `Calculated recovery strategy for ${process.name} based on temporal analysis`,
      },
    });

    res.json(objective);
  } catch (error) {
    console.error("Error calculating recovery objectives:", error);
    res.status(500).json({ error: String(error) });
  }
});

export default router;
