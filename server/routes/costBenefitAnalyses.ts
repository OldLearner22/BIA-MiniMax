import { Router } from "express";
import { prisma } from "../db";

const router = Router();

// Get all cost-benefit analyses
router.get("/", async (req, res) => {
  try {
    const analyses = await prisma.costBenefitAnalysis.findMany({
      orderBy: { createdAt: "desc" },
    });
    // Ensure all values default to 0 if not filled
    const withDefaults = analyses.map((a) => ({
      ...a,
      implementationPersonnel: a.implementationPersonnel ?? 0,
      implementationTech: a.implementationTech ?? 0,
      implementationInfra: a.implementationInfra ?? 0,
      implementationTraining: a.implementationTraining ?? 0,
      implementationExternal: a.implementationExternal ?? 0,
      implementationOther: a.implementationOther ?? 0,
      operationalPersonnel: a.operationalPersonnel ?? 0,
      operationalTech: a.operationalTech ?? 0,
      operationalInfra: a.operationalInfra ?? 0,
      operationalTraining: a.operationalTraining ?? 0,
      operationalExternal: a.operationalExternal ?? 0,
      operationalOther: a.operationalOther ?? 0,
      maintenancePersonnel: a.maintenancePersonnel ?? 0,
      maintenanceTech: a.maintenanceTech ?? 0,
      maintenanceInfra: a.maintenanceInfra ?? 0,
      maintenanceTraining: a.maintenanceTraining ?? 0,
      maintenanceExternal: a.maintenanceExternal ?? 0,
      maintenanceOther: a.maintenanceOther ?? 0,
      avoidedFinancial: a.avoidedFinancial ?? 0,
      avoidedOperational: a.avoidedOperational ?? 0,
      avoidedReputational: a.avoidedReputational ?? 0,
      avoidedLegal: a.avoidedLegal ?? 0,
      totalCost: a.totalCost ?? 0,
      totalBenefit: a.totalBenefit ?? 0,
      netBenefit: a.netBenefit ?? 0,
      roi: a.roi ?? 0,
      paybackPeriod: a.paybackPeriod ?? 0,
      bcRatio: a.bcRatio ?? 0,
      riskReduction: a.riskReduction ?? 0,
      bestCaseRoi: a.bestCaseRoi ?? 0,
      bestCaseNetBenefit: a.bestCaseNetBenefit ?? 0,
      worstCaseRoi: a.worstCaseRoi ?? 0,
      worstCaseNetBenefit: a.worstCaseNetBenefit ?? 0,
    }));
    res.json(withDefaults);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Get single analysis
router.get("/:id", async (req, res) => {
  try {
    const analysis = await prisma.costBenefitAnalysis.findUnique({
      where: { id: req.params.id },
    });
    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }
    // Ensure all values default to 0 if not filled
    const withDefaults = {
      ...analysis,
      implementationPersonnel: analysis.implementationPersonnel ?? 0,
      implementationTech: analysis.implementationTech ?? 0,
      implementationInfra: analysis.implementationInfra ?? 0,
      implementationTraining: analysis.implementationTraining ?? 0,
      implementationExternal: analysis.implementationExternal ?? 0,
      implementationOther: analysis.implementationOther ?? 0,
      operationalPersonnel: analysis.operationalPersonnel ?? 0,
      operationalTech: analysis.operationalTech ?? 0,
      operationalInfra: analysis.operationalInfra ?? 0,
      operationalTraining: analysis.operationalTraining ?? 0,
      operationalExternal: analysis.operationalExternal ?? 0,
      operationalOther: analysis.operationalOther ?? 0,
      maintenancePersonnel: analysis.maintenancePersonnel ?? 0,
      maintenanceTech: analysis.maintenanceTech ?? 0,
      maintenanceInfra: analysis.maintenanceInfra ?? 0,
      maintenanceTraining: analysis.maintenanceTraining ?? 0,
      maintenanceExternal: analysis.maintenanceExternal ?? 0,
      maintenanceOther: analysis.maintenanceOther ?? 0,
      avoidedFinancial: analysis.avoidedFinancial ?? 0,
      avoidedOperational: analysis.avoidedOperational ?? 0,
      avoidedReputational: analysis.avoidedReputational ?? 0,
      avoidedLegal: analysis.avoidedLegal ?? 0,
      totalCost: analysis.totalCost ?? 0,
      totalBenefit: analysis.totalBenefit ?? 0,
      netBenefit: analysis.netBenefit ?? 0,
      roi: analysis.roi ?? 0,
      paybackPeriod: analysis.paybackPeriod ?? 0,
      bcRatio: analysis.bcRatio ?? 0,
      riskReduction: analysis.riskReduction ?? 0,
      bestCaseRoi: analysis.bestCaseRoi ?? 0,
      bestCaseNetBenefit: analysis.bestCaseNetBenefit ?? 0,
      worstCaseRoi: analysis.worstCaseRoi ?? 0,
      worstCaseNetBenefit: analysis.worstCaseNetBenefit ?? 0,
    };
    res.json(withDefaults);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Create a new cost-benefit analysis
router.post("/", async (req, res) => {
  try {
    const analysis = await prisma.costBenefitAnalysis.create({
      data: {
        title: req.body.title || "Untitled Analysis",
        description: req.body.description || "",
        analysisDate: req.body.analysisDate || new Date(),
        // Implementation costs - default to 0 if not provided
        implementationPersonnel: req.body.implementationPersonnel ?? 0,
        implementationTech: req.body.implementationTech ?? 0,
        implementationInfra: req.body.implementationInfra ?? 0,
        implementationTraining: req.body.implementationTraining ?? 0,
        implementationExternal: req.body.implementationExternal ?? 0,
        implementationOther: req.body.implementationOther ?? 0,
        // Operational costs - default to 0 if not provided
        operationalPersonnel: req.body.operationalPersonnel ?? 0,
        operationalTech: req.body.operationalTech ?? 0,
        operationalInfra: req.body.operationalInfra ?? 0,
        operationalTraining: req.body.operationalTraining ?? 0,
        operationalExternal: req.body.operationalExternal ?? 0,
        operationalOther: req.body.operationalOther ?? 0,
        // Maintenance costs - default to 0 if not provided
        maintenancePersonnel: req.body.maintenancePersonnel ?? 0,
        maintenanceTech: req.body.maintenanceTech ?? 0,
        maintenanceInfra: req.body.maintenanceInfra ?? 0,
        maintenanceTraining: req.body.maintenanceTraining ?? 0,
        maintenanceExternal: req.body.maintenanceExternal ?? 0,
        maintenanceOther: req.body.maintenanceOther ?? 0,
        // Avoided losses - default to 0 if not provided
        avoidedFinancial: req.body.avoidedFinancial ?? 0,
        avoidedOperational: req.body.avoidedOperational ?? 0,
        avoidedReputational: req.body.avoidedReputational ?? 0,
        avoidedLegal: req.body.avoidedLegal ?? 0,
        // Calculated metrics - default to 0
        totalCost: req.body.totalCost ?? 0,
        totalBenefit: req.body.totalBenefit ?? 0,
        netBenefit: req.body.netBenefit ?? 0,
        roi: req.body.roi ?? 0,
        paybackPeriod: req.body.paybackPeriod ?? 0,
        bcRatio: req.body.bcRatio ?? 0,
        riskReduction: req.body.riskReduction ?? 0,
        // Scenario analysis - default to 0
        bestCaseRoi: req.body.bestCaseRoi ?? 0,
        bestCaseNetBenefit: req.body.bestCaseNetBenefit ?? 0,
        worstCaseRoi: req.body.worstCaseRoi ?? 0,
        worstCaseNetBenefit: req.body.worstCaseNetBenefit ?? 0,
        // Other fields
        intangibleBenefits: req.body.intangibleBenefits ?? [],
        recommendation: req.body.recommendation || "",
        recommendationNotes: req.body.recommendationNotes || "",
        status: req.body.status || "draft",
        createdBy: req.body.createdBy || "system",
        organizationId:
          req.body.organizationId || "00000000-0000-0000-0000-000000000001",
      },
    });
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Update cost-benefit analysis
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const analysis = await prisma.costBenefitAnalysis.update({
      where: { id },
      data: {
        title: req.body.title,
        description: req.body.description,
        analysisDate: req.body.analysisDate,
        implementationPersonnel: req.body.implementationPersonnel ?? 0,
        implementationTech: req.body.implementationTech ?? 0,
        implementationInfra: req.body.implementationInfra ?? 0,
        implementationTraining: req.body.implementationTraining ?? 0,
        implementationExternal: req.body.implementationExternal ?? 0,
        implementationOther: req.body.implementationOther ?? 0,
        operationalPersonnel: req.body.operationalPersonnel ?? 0,
        operationalTech: req.body.operationalTech ?? 0,
        operationalInfra: req.body.operationalInfra ?? 0,
        operationalTraining: req.body.operationalTraining ?? 0,
        operationalExternal: req.body.operationalExternal ?? 0,
        operationalOther: req.body.operationalOther ?? 0,
        maintenancePersonnel: req.body.maintenancePersonnel ?? 0,
        maintenanceTech: req.body.maintenanceTech ?? 0,
        maintenanceInfra: req.body.maintenanceInfra ?? 0,
        maintenanceTraining: req.body.maintenanceTraining ?? 0,
        maintenanceExternal: req.body.maintenanceExternal ?? 0,
        maintenanceOther: req.body.maintenanceOther ?? 0,
        avoidedFinancial: req.body.avoidedFinancial ?? 0,
        avoidedOperational: req.body.avoidedOperational ?? 0,
        avoidedReputational: req.body.avoidedReputational ?? 0,
        avoidedLegal: req.body.avoidedLegal ?? 0,
        totalCost: req.body.totalCost ?? 0,
        totalBenefit: req.body.totalBenefit ?? 0,
        netBenefit: req.body.netBenefit ?? 0,
        roi: req.body.roi ?? 0,
        paybackPeriod: req.body.paybackPeriod ?? 0,
        bcRatio: req.body.bcRatio ?? 0,
        riskReduction: req.body.riskReduction ?? 0,
        bestCaseRoi: req.body.bestCaseRoi ?? 0,
        bestCaseNetBenefit: req.body.bestCaseNetBenefit ?? 0,
        worstCaseRoi: req.body.worstCaseRoi ?? 0,
        worstCaseNetBenefit: req.body.worstCaseNetBenefit ?? 0,
        intangibleBenefits: req.body.intangibleBenefits ?? [],
        recommendation: req.body.recommendation,
        recommendationNotes: req.body.recommendationNotes,
        status: req.body.status,
      },
    });
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Delete cost-benefit analysis
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.costBenefitAnalysis.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

export default router;
