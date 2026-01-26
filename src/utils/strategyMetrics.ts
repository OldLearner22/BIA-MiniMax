import {
  Process,
  ImpactAssessment,
  RecoveryObjective,
  Risk,
  Threat,
  RecoveryOption,
  CostBenefitAnalysis,
  RiskTreatment,
} from "../types";

/**
 * Comprehensive metrics for Strategic Resilience Dashboard
 * Aggregates data from all BC modules to provide cross-functional insights
 */

export interface ResilienceMetrics {
  // Coverage Metrics
  processCount: number;
  processesWithImpact: number;
  processesWithObjectives: number;
  processesWithStrategy: number;
  impactCoverage: number; // %
  objectiveCoverage: number; // %
  strategyCoverage: number; // %

  // Risk Metrics
  totalRisks: number;
  openRisks: number;
  mitigatedRisks: number;
  riskMitigation: number; // %
  avgRiskScore: number;

  // Threat Metrics
  totalThreats: number;
  criticalThreats: number;
  addressedThreats: number;
  threatCoverage: number; // %

  // RTO Compliance
  processesWithAdequateStrategy: number;
  rtoCompliance: number; // %
  criticalRTOGaps: string[]; // Process names with gaps

  // Financial Metrics
  totalImplementationCost: number;
  totalOperationalCost: number;
  totalAnnualBenefit: number;
  overallROI: number; // %
  paybackPeriodMonths: number;

  // Readiness Metrics
  avgReadinessScore: number; // 0-100
  strategyTestingCoverage: number; // % of strategies tested
  personCapacityRisk: string; // Low, Medium, High
  technologyReadiness: number; // % of strategies use modern tech

  // Recovery Capability Distribution
  immediateRecovery: number; // % of processes
  rapidRecovery: number; // % of processes
  standardRecovery: number; // % of processes
  extendedRecovery: number; // % of processes

  // Critical Dependencies
  criticalDependenciesUnmitigated: number;
  vendorDependencyRisk: string; // Low, Medium, High

  // Overall Resilience Score (0-100)
  overallResilienceScore: number;
}

export function calculateResilienceMetrics(
  processes: Process[],
  impacts: Record<string, ImpactAssessment>,
  recoveryObjectives: Record<string, RecoveryObjective>,
  recoveryOptions: RecoveryOption[],
  costBenefitAnalyses: CostBenefitAnalysis[],
  risks: Risk[],
  threats: Threat[],
  riskTreatments: RiskTreatment[],
): ResilienceMetrics {
  const processCount = processes.length || 1; // Avoid division by zero

  // ========================================
  // COVERAGE METRICS
  // ========================================
  const processesWithImpact = Object.keys(impacts).length;
  const processesWithObjectives = Object.keys(recoveryObjectives).length;
  const processesWithStrategy =
    recoveryOptions.length > 0
      ? [...new Set(recoveryOptions.map((o) => o.processId))].length
      : 0;

  const impactCoverage = (processesWithImpact / processCount) * 100;
  const objectiveCoverage = (processesWithObjectives / processCount) * 100;
  const strategyCoverage = (processesWithStrategy / processCount) * 100;

  // ========================================
  // RISK METRICS
  // ========================================
  const totalRisks = risks.length;
  const openRisks = risks.filter((r) => r.status === "Open").length;
  const mitigatedRisks = riskTreatments.filter(
    (rt) => rt.status === "Completed",
  ).length;
  const riskMitigation =
    totalRisks > 0 ? (mitigatedRisks / totalRisks) * 100 : 0;

  // Calculate average risk score (assume Risk has numeric field or map criticality)
  const avgRiskScore =
    totalRisks > 0
      ? risks.reduce((sum, r) => {
          const score = criticalityToScore(r.criticality || "Medium");
          return sum + score;
        }, 0) / totalRisks
      : 0;

  // ========================================
  // THREAT METRICS
  // ========================================
  const totalThreats = threats.length;
  const criticalThreats = threats.filter(
    (t) => t.riskScore >= 15, // High/Critical threats have risk score >= 15 (3x5 or higher)
  ).length;
  const addressedThreats = riskTreatments.filter(
    (rt) => rt.threatId && rt.status === "Completed",
  ).length;
  const threatCoverage =
    totalThreats > 0 ? (addressedThreats / totalThreats) * 100 : 0;

  // ========================================
  // RTO COMPLIANCE
  // ========================================
  const criticalRTOGaps: string[] = [];
  let processesWithAdequateStrategy = 0;

  processes.forEach((proc) => {
    const objective = recoveryObjectives[proc.id];
    if (!objective) return;

    const strategies = recoveryOptions.filter((o) => o.processId === proc.id);
    if (strategies.length === 0) {
      if (proc.criticality === "critical" || proc.criticality === "high") {
        criticalRTOGaps.push(`${proc.name} (No strategy)`);
      }
      return;
    }

    // Check if any strategy can meet the RTO
    const canMeetRTO = strategies.some((s) => {
      const strategyRTO = timeValueToHours(s.rtoValue, s.rtoUnit);
      return strategyRTO <= objective.rto;
    });

    if (canMeetRTO) {
      processesWithAdequateStrategy++;
    } else if (proc.criticality === "critical" || proc.criticality === "high") {
      criticalRTOGaps.push(`${proc.name} (RTO gap: ${objective.rto}h target)`);
    }
  });

  const rtoCompliance =
    processCount > 0 ? (processesWithAdequateStrategy / processCount) * 100 : 0;

  // ========================================
  // FINANCIAL METRICS
  // ========================================
  let totalImplementationCost = 0;
  let totalOperationalCost = 0;
  let totalAnnualBenefit = 0;
  let overallROI = 0;
  let paybackPeriodMonths = 0;

  if (costBenefitAnalyses.length > 0) {
    const avgCBA = costBenefitAnalyses.reduce(
      (acc, cba) => ({
        implCost: acc.implCost + cba.totalCost,
        opCost:
          acc.opCost +
          (cba.operationalPersonnel +
            cba.operationalTech +
            cba.operationalInfra +
            cba.operationalTraining +
            cba.operationalExternal +
            cba.operationalOther),
        benefit: acc.benefit + cba.totalBenefit,
        roi: acc.roi + cba.roi,
      }),
      { implCost: 0, opCost: 0, benefit: 0, roi: 0 },
    );

    totalImplementationCost = avgCBA.implCost;
    totalOperationalCost = avgCBA.opCost;
    totalAnnualBenefit = avgCBA.benefit;
    overallROI = avgCBA.roi / Math.max(costBenefitAnalyses.length, 1);

    // Payback period: (implementation cost) / (annual benefit)
    paybackPeriodMonths =
      totalAnnualBenefit > 0
        ? Math.round((totalImplementationCost / totalAnnualBenefit) * 12)
        : 999;
  }

  // ========================================
  // READINESS METRICS
  // ========================================
  const avgReadinessScore =
    recoveryOptions.length > 0
      ? recoveryOptions.reduce((sum, o) => sum + (o.readinessScore || 0), 0) /
        recoveryOptions.length
      : 0;

  const testedStrategies = recoveryOptions.filter(
    (o) => o.testingStatus === "pass",
  ).length;
  const strategyTestingCoverage =
    recoveryOptions.length > 0
      ? (testedStrategies / recoveryOptions.length) * 100
      : 0;

  // Person capacity risk based on total people required
  const totalPeopleRequired = recoveryOptions.reduce(
    (sum, o) => sum + (o.peopleRequired || 0),
    0,
  );
  const personCapacityRisk =
    totalPeopleRequired > 500
      ? "High"
      : totalPeopleRequired > 250
        ? "Medium"
        : "Low";

  // Technology readiness: % using cloud or hybrid (modern)
  const modernTechStrategies = recoveryOptions.filter(
    (o) => o.technologyType === "cloud" || o.technologyType === "hybrid",
  ).length;
  const technologyReadiness =
    recoveryOptions.length > 0
      ? (modernTechStrategies / recoveryOptions.length) * 100
      : 0;

  // ========================================
  // RECOVERY CAPABILITY DISTRIBUTION
  // ========================================
  const immediateRecovery = recoveryOptions.filter(
    (o) => o.tier === "immediate",
  ).length;
  const rapidRecovery = recoveryOptions.filter(
    (o) => o.tier === "rapid",
  ).length;
  const standardRecovery = recoveryOptions.filter(
    (o) => o.tier === "standard",
  ).length;
  const extendedRecovery = recoveryOptions.filter(
    (o) => o.tier === "extended",
  ).length;

  // ========================================
  // CRITICAL DEPENDENCIES
  // ========================================
  const vendorDependencies = recoveryOptions.filter(
    (o) => o.technologyType === "external",
  ).length;
  const vendorDependencyRisk =
    vendorDependencies > 10
      ? "High"
      : vendorDependencies > 5
        ? "Medium"
        : "Low";
  const criticalDependenciesUnmitigated = openRisks; // Simplified: open risks = unmitigated dependencies

  // ========================================
  // OVERALL RESILIENCE SCORE
  // ========================================
  const overallResilienceScore = calculateResilienceScore({
    impactCoverage,
    objectiveCoverage,
    strategyCoverage,
    rtoCompliance,
    riskMitigation,
    threatCoverage,
    avgReadinessScore,
    strategyTestingCoverage,
    overallROI,
  });

  return {
    processCount,
    processesWithImpact,
    processesWithObjectives,
    processesWithStrategy,
    impactCoverage: Math.round(impactCoverage),
    objectiveCoverage: Math.round(objectiveCoverage),
    strategyCoverage: Math.round(strategyCoverage),
    totalRisks,
    openRisks,
    mitigatedRisks,
    riskMitigation: Math.round(riskMitigation),
    avgRiskScore: Math.round(avgRiskScore * 100) / 100,
    totalThreats,
    criticalThreats,
    addressedThreats,
    threatCoverage: Math.round(threatCoverage),
    processesWithAdequateStrategy,
    rtoCompliance: Math.round(rtoCompliance),
    criticalRTOGaps,
    totalImplementationCost,
    totalOperationalCost,
    totalAnnualBenefit,
    overallROI: Math.round(overallROI),
    paybackPeriodMonths,
    avgReadinessScore: Math.round(avgReadinessScore),
    strategyTestingCoverage: Math.round(strategyTestingCoverage),
    personCapacityRisk,
    technologyReadiness: Math.round(technologyReadiness),
    immediateRecovery,
    rapidRecovery,
    standardRecovery,
    extendedRecovery,
    criticalDependenciesUnmitigated,
    vendorDependencyRisk,
    overallResilienceScore,
  };
}

/**
 * Calculate comprehensive resilience score based on multiple dimensions
 */
function calculateResilienceScore(dimensions: {
  impactCoverage: number;
  objectiveCoverage: number;
  strategyCoverage: number;
  rtoCompliance: number;
  riskMitigation: number;
  threatCoverage: number;
  avgReadinessScore: number;
  strategyTestingCoverage: number;
  overallROI: number;
}): number {
  // Weighted scoring
  const weights = {
    impactCoverage: 0.1,
    objectiveCoverage: 0.1,
    strategyCoverage: 0.15,
    rtoCompliance: 0.15,
    riskMitigation: 0.15,
    threatCoverage: 0.1,
    avgReadinessScore: 0.1,
    strategyTestingCoverage: 0.1,
    overallROI: 0.05,
  };

  const roiScore = Math.min((dimensions.overallROI / 100) * 100, 100); // Cap at 100

  const score =
    dimensions.impactCoverage * weights.impactCoverage +
    dimensions.objectiveCoverage * weights.objectiveCoverage +
    dimensions.strategyCoverage * weights.strategyCoverage +
    dimensions.rtoCompliance * weights.rtoCompliance +
    dimensions.riskMitigation * weights.riskMitigation +
    dimensions.threatCoverage * weights.threatCoverage +
    dimensions.avgReadinessScore * weights.avgReadinessScore +
    dimensions.strategyTestingCoverage * weights.strategyTestingCoverage +
    roiScore * weights.overallROI;

  return Math.round(Math.max(0, Math.min(100, score)));
}

/**
 * Convert priority string to numeric score
 */
function criticalityToScore(priority: string): number {
  const map: Record<string, number> = {
    Critical: 5,
    High: 4,
    Medium: 3,
    Low: 2,
    Minimal: 1,
  };
  return map[priority] || 3;
}

/**
 * Convert time value to hours for RTO comparison
 */
function timeValueToHours(value: number, unit: string): number {
  switch (unit.toLowerCase()) {
    case "minutes":
      return value / 60;
    case "hours":
      return value;
    case "days":
      return value * 24;
    default:
      return value;
  }
}

/**
 * Get color for resilience score
 */
export function getResilienceScoreColor(score: number): string {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-yellow-500";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
}

/**
 * Get background color for resilience score
 */
export function getResilienceScoreBg(score: number): string {
  if (score >= 80) return "bg-green-500/20";
  if (score >= 60) return "bg-yellow-500/20";
  if (score >= 40) return "bg-orange-500/20";
  return "bg-red-500/20";
}

/**
 * Get risk level name
 */
export function getRiskLevel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "At Risk";
}

/**
 * Maturity Dimension - Calculated from real module data
 */
export interface MaturityDimension {
  dimension: string;
  currentLevel: number; // 1-5
  description: string;
  score: number; // 0-100
}

/**
 * Calculate BC program maturity dimensions from real module data
 */
export function calculateMaturityDimensions(
  processes: Process[],
  impacts: Record<string, ImpactAssessment>,
  recoveryObjectives: Record<string, RecoveryObjective>,
  recoveryOptions: RecoveryOption[],
  risks: Risk[],
  riskTreatments: RiskTreatment[],
): MaturityDimension[] {
  const processCount = Math.max(processes.length, 1);

  // 1. COVERAGE MATURITY - Based on documentation completeness
  const coveragePercent = (Object.keys(impacts).length / processCount) * 100;
  const coverageLevel = calculateLevel(coveragePercent);
  const coverageDimension: MaturityDimension = {
    dimension: "Coverage Maturity",
    currentLevel: coverageLevel,
    description: getMaturityDescription("Coverage", coverageLevel),
    score: Math.round(coveragePercent),
  };

  // 2. CAPABILITY MATURITY - Based on recovery strategy tier distribution
  const capabilityScore = calculateCapabilityScore(recoveryOptions);
  const capabilityLevel = Math.max(
    1,
    Math.min(5, Math.ceil(capabilityScore / 20)),
  );
  const capabilityDimension: MaturityDimension = {
    dimension: "Capability Maturity",
    currentLevel: capabilityLevel,
    description: getMaturityDescription("Capability", capabilityLevel),
    score: capabilityScore,
  };

  // 3. READINESS MATURITY - Based on strategy testing & readiness scores
  const readinessScore = calculateReadinessScore(recoveryOptions);
  const readinessLevel = Math.max(
    1,
    Math.min(5, Math.ceil(readinessScore / 20)),
  );
  const readinessDimension: MaturityDimension = {
    dimension: "Readiness Maturity",
    currentLevel: readinessLevel,
    description: getMaturityDescription("Readiness", readinessLevel),
    score: readinessScore,
  };

  // 4. COMPLIANCE MATURITY - Based on RTO compliance rate
  const rtoCompliantCount = processes.filter((proc) => {
    const objective = recoveryObjectives[proc.id];
    if (!objective) return false;
    const strategies = recoveryOptions.filter((o) => o.processId === proc.id);
    return strategies.some(
      (s) => timeValueToHours(s.rtoValue, s.rtoUnit) <= objective.rto,
    );
  }).length;
  const compliancePercent = (rtoCompliantCount / processCount) * 100;
  const complianceLevel = calculateLevel(compliancePercent);
  const complianceDimension: MaturityDimension = {
    dimension: "Compliance Maturity",
    currentLevel: complianceLevel,
    description: getMaturityDescription("Compliance", complianceLevel),
    score: Math.round(compliancePercent),
  };

  // 5. RISK MANAGEMENT MATURITY - Based on risk mitigation rate
  const mitigatedCount = riskTreatments.filter(
    (rt) => rt.status === "Completed",
  ).length;
  const totalRisks = Math.max(risks.length, 1);
  const riskMitigationPercent = (mitigatedCount / totalRisks) * 100;
  const riskLevel = calculateLevel(riskMitigationPercent);
  const riskDimension: MaturityDimension = {
    dimension: "Risk Management",
    currentLevel: riskLevel,
    description: getMaturityDescription("Risk Management", riskLevel),
    score: Math.round(riskMitigationPercent),
  };

  return [
    coverageDimension,
    capabilityDimension,
    readinessDimension,
    complianceDimension,
    riskDimension,
  ];
}

/**
 * Calculate capability score based on recovery tier distribution
 * Higher tier = higher score
 */
function calculateCapabilityScore(recoveryOptions: RecoveryOption[]): number {
  if (recoveryOptions.length === 0) return 0;

  const tierScores: Record<string, number> = {
    immediate: 5,
    rapid: 4,
    standard: 3,
    extended: 2,
  };

  const avgTierScore =
    recoveryOptions.reduce((sum, o) => sum + (tierScores[o.tier] || 1), 0) /
    recoveryOptions.length;

  return Math.round((avgTierScore / 5) * 100);
}

/**
 * Calculate readiness score based on testing and readiness ratings
 */
function calculateReadinessScore(recoveryOptions: RecoveryOption[]): number {
  if (recoveryOptions.length === 0) return 0;

  const testedCount = recoveryOptions.filter(
    (o) => o.testingStatus === "pass",
  ).length;
  const testingPercent = (testedCount / recoveryOptions.length) * 100;

  const avgReadiness =
    recoveryOptions.reduce((sum, o) => sum + (o.readinessScore || 0), 0) /
    recoveryOptions.length;

  // Combined: 50% testing coverage + 50% readiness score
  return Math.round((testingPercent * 0.5 + avgReadiness * 0.5) / 100);
}

/**
 * Calculate maturity level (1-5) from percentage (0-100)
 */
function calculateLevel(percent: number): number {
  if (percent >= 90) return 5; // Optimizing
  if (percent >= 75) return 4; // Quantitatively Managed
  if (percent >= 50) return 3; // Defined
  if (percent >= 25) return 2; // Managed
  return 1; // Initial
}

/**
 * Get maturity level description
 */
function getMaturityDescription(dimension: string, level: number): string {
  const descriptions: Record<string, Record<number, string>> = {
    Coverage: {
      1: "< 25% of processes documented",
      2: "25-50% of processes documented",
      3: "50-75% of processes documented",
      4: "75-90% of processes documented",
      5: "90%+ of processes documented",
    },
    Capability: {
      1: "Manual processes only",
      2: "Cold backup available",
      3: "Warm standby deployed",
      4: "Cloud/hot-site implemented",
      5: "Multi-region active-active",
    },
    Readiness: {
      1: "< 20% tested and ready",
      2: "20-40% tested and ready",
      3: "40-60% tested and ready",
      4: "60-80% tested and ready",
      5: "80%+ tested and validated",
    },
    Compliance: {
      1: "< 25% RTO compliant",
      2: "25-50% RTO compliant",
      3: "50-75% RTO compliant",
      4: "75-90% RTO compliant",
      5: "90%+ RTO compliant",
    },
    "Risk Management": {
      1: "> 75% open risks",
      2: "50-75% open risks",
      3: "25-50% open risks",
      4: "10-25% open risks",
      5: "< 10% open risks",
    },
  };

  return descriptions[dimension]?.[level] || "Unknown";
}

/**
 * Get overall maturity level (average of all dimensions)
 */
export function getOverallMaturityLevel(dimensions: MaturityDimension[]): {
  level: number;
  name: string;
} {
  if (dimensions.length === 0) return { level: 1, name: "Initial" };

  const avgLevel =
    dimensions.reduce((sum, d) => sum + d.currentLevel, 0) / dimensions.length;
  const level = Math.round(avgLevel);

  const levelNames: Record<number, string> = {
    1: "Initial",
    2: "Managed",
    3: "Defined",
    4: "Quantitatively Managed",
    5: "Optimizing",
  };

  return { level, name: levelNames[level] || "Unknown" };
}

/**
 * Calculate dimension gaps between current and target levels
 */
export function calculateDimensionGaps(
  maturityDimensions: MaturityDimension[],
  targetLevels: Record<string, number>,
): Array<{
  dimension: string;
  currentLevel: number;
  targetLevel: number;
  currentScore: number;
  gapPercentage: number;
  status: "on-track" | "at-risk" | "complete";
}> {
  return maturityDimensions.map((dim) => {
    const targetLevel = targetLevels[dim.dimension] || 5;
    const currentLevel = dim.currentLevel;
    const currentScore = dim.score;

    // Calculate gap percentage (how far from target)
    const targetScore = (targetLevel / 5) * 100;
    const gapPercentage = Math.round(
      ((targetScore - currentScore) / targetScore) * 100,
    );

    // Determine status
    let status: "on-track" | "at-risk" | "complete";
    if (currentLevel >= targetLevel) {
      status = "complete";
    } else if (currentLevel >= targetLevel - 1) {
      status = "on-track";
    } else {
      status = "at-risk";
    }

    return {
      dimension: dim.dimension,
      currentLevel,
      targetLevel,
      currentScore,
      gapPercentage,
      status,
    };
  });
}

/**
 * Calculate weighted maturity score based on custom dimension weights
 */
export function calculateWeightedMaturityScore(
  dimensions: MaturityDimension[],
  weights: Record<string, number> = {},
): number {
  if (dimensions.length === 0) return 0;

  // Default equal weights if not provided
  const defaultWeight = 1 / dimensions.length;

  const weightedSum = dimensions.reduce((sum, dim) => {
    const weight = weights[dim.dimension] ?? defaultWeight;
    return sum + dim.score * weight;
  }, 0);

  return Math.round(weightedSum);
}

/**
 * Default dimension weights (equal distribution)
 */
export const DEFAULT_WEIGHTS: Record<string, number> = {
  "Coverage Maturity": 0.2,
  "Capability Maturity": 0.2,
  "Readiness Maturity": 0.2,
  "Compliance Maturity": 0.2,
  "Risk Management": 0.2,
};

/**
 * Industry-specific preset weights
 */
export const INDUSTRY_PRESETS: Record<string, Record<string, number>> = {
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
