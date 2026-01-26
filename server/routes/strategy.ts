import { Router } from "express";


const router = Router();
import { prisma } from "../db";

// Strategy Assessments
router.get("/assessments", async (req, res) => {
  try {
    const assessments = await prisma.strategyAssessment.findMany({
      orderBy: { assessmentDate: "desc" },
    });
    res.json(assessments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch strategy assessments" });
  }
});

router.post("/assessments", async (req, res) => {
  try {
    const assessment = await prisma.strategyAssessment.create({
      data: req.body,
    });
    res.json(assessment);
  } catch (error) {
    res.status(500).json({ error: "Failed to create strategy assessment" });
  }
});

router.put("/assessments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const assessment = await prisma.strategyAssessment.update({
      where: { id },
      data: req.body,
    });
    res.json(assessment);
  } catch (error) {
    res.status(500).json({ error: "Failed to update strategy assessment" });
  }
});

router.delete("/assessments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.strategyAssessment.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete strategy assessment" });
  }
});

// Strategy Objectives
router.get("/objectives", async (req, res) => {
  try {
    const objectives = await prisma.strategyObjective.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(objectives);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch strategy objectives" });
  }
});

router.post("/objectives", async (req, res) => {
  try {
    const objective = await prisma.strategyObjective.create({
      data: req.body,
    });
    res.json(objective);
  } catch (error) {
    res.status(500).json({ error: "Failed to create strategy objective" });
  }
});

router.put("/objectives/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const objective = await prisma.strategyObjective.update({
      where: { id },
      data: req.body,
    });
    res.json(objective);
  } catch (error) {
    res.status(500).json({ error: "Failed to update strategy objective" });
  }
});

router.delete("/objectives/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.strategyObjective.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete strategy objective" });
  }
});

// Strategy Initiatives
router.get("/initiatives", async (req, res) => {
  try {
    const initiatives = await prisma.strategyInitiative.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(initiatives);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch strategy initiatives" });
  }
});

router.post("/initiatives", async (req, res) => {
  try {
    const initiative = await prisma.strategyInitiative.create({
      data: req.body,
    });
    res.json(initiative);
  } catch (error) {
    res.status(500).json({ error: "Failed to create strategy initiative" });
  }
});

router.put("/initiatives/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const initiative = await prisma.strategyInitiative.update({
      where: { id },
      data: req.body,
    });
    res.json(initiative);
  } catch (error) {
    res.status(500).json({ error: "Failed to update strategy initiative" });
  }
});

router.delete("/initiatives/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.strategyInitiative.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete strategy initiative" });
  }
});

// ============================================================================
// RECOVERY OPTIONS ENDPOINTS
// ============================================================================

router.get("/recovery-options", async (req, res) => {
  try {
    const options = await prisma.recoveryOption.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(options);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch recovery options" });
  }
});

router.post("/recovery-options", async (req, res) => {
  try {
    const option = await prisma.recoveryOption.create({
      data: req.body,
    });
    res.json(option);
  } catch (error) {
    res.status(500).json({ error: "Failed to create recovery option" });
  }
});

router.put("/recovery-options/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const option = await prisma.recoveryOption.update({
      where: { id },
      data: req.body,
    });
    res.json(option);
  } catch (error) {
    res.status(500).json({ error: "Failed to update recovery option" });
  }
});

router.delete("/recovery-options/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.recoveryOption.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete recovery option" });
  }
});

// ============================================================================
// COST-BENEFIT ANALYSIS ENDPOINTS
// ============================================================================

router.get("/cost-benefit", async (req, res) => {
  try {
    const analyses = await prisma.costBenefitAnalysis.findMany({
      include: {
        recoveryOptions: {
          include: { recoveryOption: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(analyses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch cost-benefit analyses" });
  }
});

router.post("/cost-benefit", async (req, res) => {
  try {
    const analysis = await prisma.costBenefitAnalysis.create({
      data: req.body,
    });
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: "Failed to create cost-benefit analysis" });
  }
});

router.put("/cost-benefit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const analysis = await prisma.costBenefitAnalysis.update({
      where: { id },
      data: req.body,
    });
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: "Failed to update cost-benefit analysis" });
  }
});

router.delete("/cost-benefit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.costBenefitAnalysis.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete cost-benefit analysis" });
  }
});

router.post("/cost-benefit/:id/calculate", async (req, res) => {
  try {
    const { id } = req.params;
    const analysis = await prisma.costBenefitAnalysis.findUnique({
      where: { id },
    });

    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    // Calculate totals
    const totalCost =
      analysis.implementationPersonnel +
      analysis.implementationTech +
      analysis.implementationInfra +
      analysis.implementationTraining +
      analysis.implementationExternal +
      analysis.implementationOther +
      analysis.operationalPersonnel +
      analysis.operationalTech +
      analysis.operationalInfra +
      analysis.operationalTraining +
      analysis.operationalExternal +
      analysis.operationalOther +
      analysis.maintenancePersonnel +
      analysis.maintenanceTech +
      analysis.maintenanceInfra +
      analysis.maintenanceTraining +
      analysis.maintenanceExternal +
      analysis.maintenanceOther;

    const totalBenefit =
      analysis.avoidedFinancial +
      analysis.avoidedOperational +
      analysis.avoidedReputational +
      analysis.avoidedLegal;

    const netBenefit = totalBenefit - totalCost;
    const roi = totalCost > 0 ? (netBenefit / totalCost) * 100 : 0;
    const bcRatio = totalCost > 0 ? totalBenefit / totalCost : 0;
    const paybackPeriod =
      totalBenefit > 0 ? (totalCost / (totalBenefit / 36)) : 0;

    const updated = await prisma.costBenefitAnalysis.update({
      where: { id },
      data: {
        totalCost,
        totalBenefit,
        netBenefit,
        roi,
        bcRatio,
        paybackPeriod,
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to calculate metrics" });
  }
});

// ============================================================================
// STRATEGY APPROVALS ENDPOINTS
// ============================================================================

router.get("/approvals", async (req, res) => {
  try {
    const approvals = await prisma.strategyApproval.findMany({
      include: { steps: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(approvals);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch approvals" });
  }
});

router.post("/approvals", async (req, res) => {
  try {
    const { steps, ...approvalData } = req.body;

    const approval = await prisma.strategyApproval.create({
      data: {
        ...approvalData,
        steps: {
          create: steps || [],
        },
      },
      include: { steps: true },
    });
    res.json(approval);
  } catch (error) {
    res.status(500).json({ error: "Failed to create approval" });
  }
});

router.put("/approvals/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const approval = await prisma.strategyApproval.update({
      where: { id },
      data: req.body,
      include: { steps: true },
    });
    res.json(approval);
  } catch (error) {
    res.status(500).json({ error: "Failed to update approval" });
  }
});

router.delete("/approvals/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.strategyApproval.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete approval" });
  }
});

router.post("/approvals/:id/approve-step", async (req, res) => {
  try {
    const { id } = req.params;
    const { stepId, comments, approvedBy } = req.body;

    await prisma.strategyApprovalStep.update({
      where: { id: stepId },
      data: {
        status: "APPROVED",
        decision: "approve",
        decidedBy: approvedBy,
        decidedAt: new Date(),
        comments,
      },
    });

    const approval = await prisma.strategyApproval.findUnique({
      where: { id },
      include: { steps: true },
    });

    // Check if all steps approved
    const allApproved = approval?.steps.every((s) => s.status === "APPROVED");
    if (allApproved) {
      await prisma.strategyApproval.update({
        where: { id },
        data: {
          status: "APPROVED",
          finalDecision: "approved",
          finalDecisionDate: new Date(),
          finalDecisionBy: approvedBy,
        },
      });
    }

    const updated = await prisma.strategyApproval.findUnique({
      where: { id },
      include: { steps: true },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to approve step" });
  }
});

router.post("/approvals/:id/reject-step", async (req, res) => {
  try {
    const { id } = req.params;
    const { stepId, reason, rejectedBy } = req.body;

    await prisma.strategyApprovalStep.update({
      where: { id: stepId },
      data: {
        status: "REJECTED",
        decision: "reject",
        decidedBy: rejectedBy,
        decidedAt: new Date(),
        comments: reason,
      },
    });

    await prisma.strategyApproval.update({
      where: { id },
      data: {
        status: "REJECTED",
        finalDecision: "rejected",
        finalDecisionDate: new Date(),
        finalDecisionBy: rejectedBy,
        finalDecisionNotes: reason,
      },
    });

    const updated = await prisma.strategyApproval.findUnique({
      where: { id },
      include: { steps: true },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to reject step" });
  }
});

// ============================================================================
// EXPORT ENDPOINTS FOR AUDIT DOCUMENTATION
// ============================================================================

router.get("/export/strategy-decision/:approvalId", async (req, res) => {
  try {
    const { approvalId } = req.params;

    const approval = await prisma.strategyApproval.findUnique({
      where: { id: approvalId },
      include: { steps: true },
    });

    if (!approval) {
      return res.status(404).json({ error: "Approval not found" });
    }

    // Get the referenced strategy details
    let strategyDetails: any = null;
    if (approval.strategyType === "recovery_option") {
      strategyDetails = await prisma.recoveryOption.findUnique({
        where: { id: approval.strategyId },
      });
    } else if (approval.strategyType === "cost_benefit") {
      strategyDetails = await prisma.costBenefitAnalysis.findUnique({
        where: { id: approval.strategyId },
      });
    }

    // Build the decision document
    const document = {
      title: `Strategy Decision Documentation - ${approval.strategyTitle}`,
      documentType: "Strategy Selection & Approval Record",
      isoClause: "8.3.3 Selection of Strategies and Solutions",
      generatedDate: new Date().toISOString(),
      approvalId: approval.id,

      // Strategy Information Section
      strategySection: {
        strategyType: approval.strategyType,
        title: approval.strategyTitle,
        id: approval.strategyId,
        details: strategyDetails,
      },

      // Selection Criteria Section
      selectionCriteria: {
        riskAppetite: "Documented in Risk Assessment module",
        costBenefitAnalysis: strategyDetails?.netBenefit
          ? {
              totalCost: strategyDetails.totalCost,
              totalBenefit: strategyDetails.totalBenefit,
              netBenefit: strategyDetails.netBenefit,
              roi: strategyDetails.roi,
              bcRatio: strategyDetails.bcRatio,
              paybackPeriod: strategyDetails.paybackPeriod,
            }
          : null,
        feasibility: strategyDetails?.readinessScore
          ? { readinessScore: strategyDetails.readinessScore }
          : null,
      },

      // Approval Workflow Section
      approvalWorkflow: {
        status: approval.status,
        submittedBy: approval.submittedBy,
        submittedAt: approval.submittedAt,
        submissionNotes: approval.submissionNotes,
        approvalSteps: approval.steps.map((step) => ({
          stepNumber: step.stepNumber,
          title: step.title,
          description: step.description,
          status: step.status,
          decision: step.decision,
          decidedBy: step.decidedBy,
          decidedAt: step.decidedAt,
          comments: step.comments,
        })),
        finalDecision: approval.finalDecision,
        finalDecisionDate: approval.finalDecisionDate,
        finalDecisionBy: approval.finalDecisionBy,
        finalDecisionNotes: approval.finalDecisionNotes,
      },

      // Resource Requirements Section
      resourceRequirements: strategyDetails
        ? {
            peopleRequired: strategyDetails.peopleRequired,
            technologyType: strategyDetails.technologyType,
            facilityType: strategyDetails.facilityType,
            implementationCost: strategyDetails.implementationCost,
            operationalCost: strategyDetails.operationalCost,
          }
        : null,

      // Recovery Objectives Section
      recoveryObjectives: strategyDetails
        ? {
            recoveryStrategyType: strategyDetails.strategyType,
            rto: {
              value: strategyDetails.rtoValue,
              unit: strategyDetails.rtoUnit,
            },
            rpo: {
              value: strategyDetails.rpoValue,
              unit: strategyDetails.rpoUnit,
            },
            recoveryCapacity: strategyDetails.recoveryCapacity,
          }
        : null,

      // Compliance Section
      compliance: {
        isoClauses: [
          "8.3.1 General - Strategy identification and selection",
          "8.3.2 Identification of Strategies and Solutions",
          "8.3.3 Selection of Strategies and Solutions",
          "8.3.4 Resource Requirements",
          "8.3.5 Implementation of Solutions",
        ],
        auditReady: true,
      },
    };

    res.json(document);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate strategy decision document" });
  }
});

router.get("/export/strategy-comparison/:analysisId", async (req, res) => {
  try {
    const { analysisId } = req.params;

    const analysis = await prisma.costBenefitAnalysis.findUnique({
      where: { id: analysisId },
      include: {
        recoveryOptions: {
          include: { recoveryOption: true },
        },
      },
    });

    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    // Build strategy comparison matrix
    const document = {
      title: `Cost-Benefit Analysis & Strategy Comparison - ${analysis.title}`,
      documentType: "Strategy Selection Comparison Matrix",
      isoClause: "8.3.3 Selection of Strategies and Solutions",
      generatedDate: new Date().toISOString(),
      analysisId: analysis.id,

      executiveSummary: {
        analysisTitle: analysis.title,
        description: analysis.description,
        analysisDate: analysis.analysisDate,
        recommendation: analysis.recommendation,
        recommendationNotes: analysis.recommendationNotes,
      },

      financialAnalysis: {
        costs: {
          implementation: {
            personnel: analysis.implementationPersonnel,
            technology: analysis.implementationTech,
            infrastructure: analysis.implementationInfra,
            training: analysis.implementationTraining,
            external: analysis.implementationExternal,
            other: analysis.implementationOther,
          },
          operational: {
            personnel: analysis.operationalPersonnel,
            technology: analysis.operationalTech,
            infrastructure: analysis.operationalInfra,
            training: analysis.operationalTraining,
            external: analysis.operationalExternal,
            other: analysis.operationalOther,
          },
          maintenance: {
            personnel: analysis.maintenancePersonnel,
            technology: analysis.maintenanceTech,
            infrastructure: analysis.maintenanceInfra,
            training: analysis.maintenanceTraining,
            external: analysis.maintenanceExternal,
            other: analysis.maintenanceOther,
          },
          totalCost: analysis.totalCost,
        },
        benefits: {
          avoidedFinancialLosses: analysis.avoidedFinancial,
          avoidedOperationalImpact: analysis.avoidedOperational,
          avoidedReputationalDamage: analysis.avoidedReputational,
          avoidedLegalCosts: analysis.avoidedLegal,
          totalBenefit: analysis.totalBenefit,
        },
        metrics: {
          netBenefit: analysis.netBenefit,
          roi: analysis.roi,
          bcRatio: analysis.bcRatio,
          paybackPeriodMonths: analysis.paybackPeriod,
        },
        scenarioAnalysis: {
          bestCase: {
            roi: analysis.bestCaseRoi,
            netBenefit: analysis.bestCaseNetBenefit,
          },
          worstCase: {
            roi: analysis.worstCaseRoi,
            netBenefit: analysis.worstCaseNetBenefit,
          },
        },
      },

      strategiesEvaluated: analysis.recoveryOptions.map((roa) => ({
        id: roa.recoveryOption.id,
        title: roa.recoveryOption.title,
        strategyType: roa.recoveryOption.strategyType,
        tier: roa.recoveryOption.tier,
        rto: {
          value: roa.recoveryOption.rtoValue,
          unit: roa.recoveryOption.rtoUnit,
        },
        rpo: {
          value: roa.recoveryOption.rpoValue,
          unit: roa.recoveryOption.rpoUnit,
        },
        recoveryCapacity: roa.recoveryOption.recoveryCapacity,
        implementationCost: roa.recoveryOption.implementationCost,
        operationalCost: roa.recoveryOption.operationalCost,
        readinessScore: roa.recoveryOption.readinessScore,
      })),

      intangibleBenefits: analysis.intangibleBenefits,

      riskReduction: {
        residualRiskReduction: analysis.riskReduction,
        notes: "Risk reduction values linked to Risk Assessment module",
      },

      approvalConditions: analysis.intangibleBenefits || [],

      compliance: {
        isoClauses: [
          "8.3.2 Identification of Strategies and Solutions - Options identified meet RTOs and protect activities",
          "8.3.3 Selection of Strategies and Solutions - Considers risk appetite, cost-benefit, and feasibility",
          "8.3.4 Resource Requirements - Defines resources needed for selected strategy",
        ],
        evidenceForAudit: true,
        exportFormat: "ISO 22301:2019 Compliant Decision Documentation",
      },
    };

    res.json(document);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate strategy comparison document" });
  }
});

export default router;
