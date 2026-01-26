import {
  Process,
  ImpactAssessment,
  RecoveryObjective,
  RecoveryOption,
  Risk,
} from "../types";

/**
 * Detailed gap analysis providing actionable insights
 */

export interface GapInsight {
  type: "coverage" | "compliance" | "readiness" | "financial" | "risk";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  affectedCount: number;
  recommendation: string;
  affectedItems?: string[];
}

export function identifyResilienceGaps(
  processes: Process[],
  impacts: Record<string, ImpactAssessment>,
  recoveryObjectives: Record<string, RecoveryObjective>,
  recoveryOptions: RecoveryOption[],
  risks: Risk[],
): GapInsight[] {
  const gaps: GapInsight[] = [];

  // Identify critical processes without impact assessments
  const criticalWithoutImpact = processes.filter(
    (p) =>
      (p.criticality === "critical" || p.criticality === "high") &&
      !impacts[p.id],
  );

  if (criticalWithoutImpact.length > 0) {
    gaps.push({
      type: "coverage",
      severity: "critical",
      title: "Critical Processes Missing Impact Assessments",
      description: `${criticalWithoutImpact.length} critical/high priority processes lack impact assessment documentation required for ISO 22301 compliance.`,
      affectedCount: criticalWithoutImpact.length,
      affectedItems: criticalWithoutImpact.map((p) => p.name),
      recommendation:
        "Complete impact assessments for all critical processes immediately. This is a mandatory compliance requirement.",
    });
  }

  // Identify critical processes without recovery objectives
  const criticalWithoutObjectives = processes.filter(
    (p) =>
      (p.criticality === "critical" || p.criticality === "high") &&
      !recoveryObjectives[p.id],
  );

  if (criticalWithoutObjectives.length > 0) {
    gaps.push({
      type: "coverage",
      severity: "critical",
      title: "Critical Processes Missing Recovery Objectives",
      description: `${criticalWithoutObjectives.length} critical/high priority processes lack defined RTO/RPO targets.`,
      affectedCount: criticalWithoutObjectives.length,
      affectedItems: criticalWithoutObjectives.map((p) => p.name),
      recommendation:
        "Define RTO, RPO, and MTPD for all critical processes based on impact assessment results.",
    });
  }

  // Identify RTO compliance gaps
  const rtoGaps = processes.filter((proc) => {
    const objective = recoveryObjectives[proc.id];
    if (!objective) return false;

    const strategies = recoveryOptions.filter((o) => o.processId === proc.id);
    if (strategies.length === 0) return true;

    return !strategies.some((s) => {
      const strategyRTO = timeValueToHours(s.rtoValue, s.rtoUnit);
      return strategyRTO <= objective.rto;
    });
  });

  if (rtoGaps.length > 0) {
    gaps.push({
      type: "compliance",
      severity: rtoGaps.some((p) => p.criticality === "critical")
        ? "critical"
        : "high",
      title: "RTO Compliance Gaps - Strategy Inadequacy",
      description: `${rtoGaps.length} processes have defined RTO targets but no recovery strategy can meet them within the required timeframe.`,
      affectedCount: rtoGaps.length,
      affectedItems: rtoGaps.map((p) => p.name),
      recommendation:
        "Upgrade recovery strategies to meet RTO targets. Consider cloud-based or high-availability solutions for critical processes.",
    });
  }

  // Identify processes without strategies
  const processesWithoutStrategy = processes.filter(
    (p) => recoveryOptions.filter((o) => o.processId === p.id).length === 0,
  );

  if (processesWithoutStrategy.length > 0) {
    const criticalCount = processesWithoutStrategy.filter(
      (p) => p.criticality === "critical" || p.criticality === "high",
    ).length;

    gaps.push({
      type: "coverage",
      severity: criticalCount > 0 ? "critical" : "medium",
      title: "Processes Missing Recovery Strategies",
      description: `${processesWithoutStrategy.length} processes (${criticalCount} critical) lack defined recovery strategies.`,
      affectedCount: processesWithoutStrategy.length,
      affectedItems: processesWithoutStrategy.slice(0, 5).map((p) => p.name),
      recommendation:
        "Develop and document recovery strategies for all business processes, prioritizing critical processes.",
    });
  }

  // Identify untested strategies
  const untested = recoveryOptions.filter(
    (o) => o.testingStatus === "not-tested" || o.testingStatus === "pending",
  );
  if (untested.length > 0) {
    gaps.push({
      type: "readiness",
      severity: "high",
      title: "Recovery Strategies Not Tested",
      description: `${untested.length} recovery strategies have not been tested or have pending test results. Untested strategies carry execution risk.`,
      affectedCount: untested.length,
      recommendation:
        "Schedule and conduct recovery testing for all strategies. Document test results and remediate failures.",
    });
  }

  // Identify low readiness strategies
  const lowReadiness = recoveryOptions.filter(
    (o) => o.readinessScore && o.readinessScore < 50,
  );
  if (lowReadiness.length > 0) {
    gaps.push({
      type: "readiness",
      severity: "medium",
      title: "Low Readiness Scores in Recovery Strategies",
      description: `${lowReadiness.length} recovery strategies have readiness scores below 50%, indicating implementation concerns.`,
      affectedCount: lowReadiness.length,
      recommendation:
        "Review and improve readiness for low-scoring strategies. Address resource constraints and documentation gaps.",
    });
  }

  // Identify open risks
  const openRisks = risks.filter((r) => r.status === "Open");
  if (openRisks.length > 0) {
    const criticalOpenRisks = openRisks.filter(
      (r) => r.criticality === "Extreme" || r.criticality === "High",
    );

    gaps.push({
      type: "risk",
      severity: criticalOpenRisks.length > 0 ? "critical" : "high",
      title: "Open Risk Items",
      description: `${openRisks.length} risks remain open (${criticalOpenRisks.length} critical). Risk mitigation treatments need completion.`,
      affectedCount: openRisks.length,
      recommendation:
        "Assign owners and complete risk treatment actions. Escalate critical risks to management.",
    });
  }

  // Identify high cost strategies
  const highCostStrategies = recoveryOptions.filter(
    (o) => o.implementationCost + o.operationalCost > 500000,
  );

  if (highCostStrategies.length > 0) {
    gaps.push({
      type: "financial",
      severity: "medium",
      title: "High-Cost Recovery Strategies",
      description: `${highCostStrategies.length} recovery strategies exceed $500K in combined implementation and operational costs.`,
      affectedCount: highCostStrategies.length,
      recommendation:
        "Conduct cost-benefit analysis to validate ROI. Consider phased implementation or alternative approaches.",
    });
  }

  return gaps.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

/**
 * Convert time value to hours for comparison
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
 * Get summary statistics about gap prevalence
 */
export function getGapSummary(gaps: GapInsight[]) {
  return {
    total: gaps.length,
    critical: gaps.filter((g) => g.severity === "critical").length,
    high: gaps.filter((g) => g.severity === "high").length,
    medium: gaps.filter((g) => g.severity === "medium").length,
    low: gaps.filter((g) => g.severity === "low").length,
    affectedProcessCount: new Set(gaps.flatMap((g) => g.affectedItems || []))
      .size,
  };
}

/**
 * Generate prioritized remediation plan
 */
export function generateRemediationPlan(gaps: GapInsight[]): string[] {
  const plan: string[] = [];
  const bySeverity = {
    critical: gaps.filter((g) => g.severity === "critical"),
    high: gaps.filter((g) => g.severity === "high"),
    medium: gaps.filter((g) => g.severity === "medium"),
  };

  if (bySeverity.critical.length > 0) {
    plan.push("🔴 CRITICAL PHASE (Immediate - Next 30 days)");
    bySeverity.critical.forEach((g) => {
      plan.push(`  - ${g.title}: ${g.recommendation}`);
    });
  }

  if (bySeverity.high.length > 0) {
    plan.push("\n🟠 HIGH PRIORITY PHASE (1-3 months)");
    bySeverity.high.forEach((g) => {
      plan.push(`  - ${g.title}: ${g.recommendation}`);
    });
  }

  if (bySeverity.medium.length > 0) {
    plan.push("\n🟡 MEDIUM PRIORITY PHASE (3-6 months)");
    bySeverity.medium.forEach((g) => {
      plan.push(`  - ${g.title}: ${g.recommendation}`);
    });
  }

  return plan;
}
