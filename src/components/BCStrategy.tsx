import React, { useEffect, useState, useMemo } from "react";
import {
  Target,
  Settings,
  Shield,
  AlertCircle,
  RefreshCcw,
  BookOpen,
  ChevronRight,
  ArrowRight,
  X,
  CheckCircle2,
  Activity,
  Users,
  TrendingDown,
  AlertTriangle,
  Zap,
  DollarSign,
  Users2,
  Cpu,
  GitBranch,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";
import { useStore } from "../store/useStore";
import {
  StrategyAssessment,
  StrategyObjective,
  StrategyInitiative,
  DimensionSetting,
} from "../types";
import {
  calculateResilienceMetrics,
  getResilienceScoreColor,
  getResilienceScoreBg,
  getRiskLevel,
  ResilienceMetrics,
  calculateMaturityDimensions,
  getOverallMaturityLevel,
  MaturityDimension,
  calculateDimensionGaps,
  calculateWeightedMaturityScore,
} from "../utils/strategyMetrics";
import DimensionSettings from "./DimensionSettings";
import GapAnalysisSection from "./GapAnalysisSection";
import { dimensionSettingsApi } from "../api/dimensionSettings";

const BCStrategy: React.FC = () => {
  const {
    processes,
    impacts,
    recoveryObjectives,
    recoveryOptions,
    costBenefitAnalyses,
    risks,
    threats,
    riskTreatments,
    strategyAssessments,
    strategyObjectives,
  } = useStore();

  const [activePillar, setActivePillar] = useState<string | null>(null);
  const [showObjectiveModal, setShowObjectiveModal] = useState(false);
  const [showDimensionSettings, setShowDimensionSettings] = useState(false);
  const [dimensionSettings, setDimensionSettings] = useState<Record<string, DimensionSetting>>({});
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // Calculate comprehensive resilience metrics
  const resilienceMetrics = useMemo(
    () =>
      calculateResilienceMetrics(
        processes,
        impacts,
        recoveryObjectives,
        recoveryOptions,
        costBenefitAnalyses,
        risks,
        threats,
        riskTreatments,
      ),
    [
      processes,
      impacts,
      recoveryObjectives,
      recoveryOptions,
      costBenefitAnalyses,
      risks,
      threats,
      riskTreatments,
    ],
  );

  // Calculate Maturity Dimensions from real module data
  const maturityDimensions = useMemo(
    () =>
      calculateMaturityDimensions(
        processes,
        impacts,
        recoveryObjectives,
        recoveryOptions,
        risks,
        riskTreatments,
      ),
    [
      processes,
      impacts,
      recoveryObjectives,
      recoveryOptions,
      risks,
      riskTreatments,
    ],
  );

  const overallMaturity = useMemo(
    () => getOverallMaturityLevel(maturityDimensions),
    [maturityDimensions],
  );

  // Load dimension settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await dimensionSettingsApi.fetchDimensionSettings();
        setDimensionSettings(settings);
      } catch (error) {
        console.error("Failed to load dimension settings:", error);
      } finally {
        setIsLoadingSettings(false);
      }
    };
    loadSettings();
  }, []);

  // Calculate dimension gaps
  const dimensionGaps = useMemo(() => {
    if (maturityDimensions.length === 0) return [];

    const targetLevels: Record<string, number> = {};
    maturityDimensions.forEach((dim) => {
      targetLevels[dim.dimension] = dimensionSettings[dim.dimension]?.targetLevel || 5;
    });

    return calculateDimensionGaps(maturityDimensions, targetLevels);
  }, [maturityDimensions, dimensionSettings]);

  // Update gap analysis in database when it changes
  useEffect(() => {
    if (dimensionGaps.length > 0 && !isLoadingSettings) {
      dimensionSettingsApi.updateDimensionGaps(dimensionGaps).catch((error) => {
        console.error("Failed to update dimension gaps:", error);
      });
    }
  }, [dimensionGaps, isLoadingSettings]);

  // Calculate weighted maturity score using custom weights
  const weightedMaturityScore = useMemo(() => {
    if (maturityDimensions.length === 0) return 0;

    const weights: Record<string, number> = {};
    maturityDimensions.forEach((dim) => {
      weights[dim.dimension] = dimensionSettings[dim.dimension]?.weight || 0.2;
    });

    return calculateWeightedMaturityScore(maturityDimensions, weights);
  }, [maturityDimensions, dimensionSettings]);

  // Calculate Maturity Score (0-100 based on average of all dimensions or weighted)
  const maturityScore = useMemo(
    () => weightedMaturityScore || (
      maturityDimensions.length > 0
        ? Math.round(
          (maturityDimensions.reduce(
            (acc, curr) => acc + curr.currentLevel,
            0,
          ) /
            (maturityDimensions.length * 5)) *
          100,
        )
        : 0
    ),
    [maturityDimensions, weightedMaturityScore],
  );

  // Prepare Radar Data from calculated maturity dimensions with user-defined targets
  const radarData = useMemo(() => {
    if (maturityDimensions.length > 0) {
      return maturityDimensions.map((d) => ({
        dimension: d.dimension,
        current: d.currentLevel,
        target: dimensionSettings[d.dimension]?.targetLevel || 5,
        fullMark: 5,
      }));
    }

    // Fallback data for empty state
    const dimensions = [
      "Coverage Maturity",
      "Capability Maturity",
      "Readiness Maturity",
      "Compliance Maturity",
      "Risk Management",
    ];
    return dimensions.map((d) => ({
      dimension: d,
      current: 0,
      target: dimensionSettings[d]?.targetLevel || 5,
      fullMark: 5,
    }));
  }, [maturityDimensions, dimensionSettings]);

  // Handle dimension settings save
  const handleSaveDimensionSettings = async (settings: Record<string, DimensionSetting>) => {
    try {
      await dimensionSettingsApi.saveDimensionSettings(settings);
      setDimensionSettings(settings);
      setShowDimensionSettings(false);
    } catch (error) {
      console.error("Failed to save dimension settings:", error);
      alert("Failed to save settings. Please try again.");
    }
  };

  const pillars = [
    {
      id: "strategic",
      title: "Strategic Leadership",
      description:
        "Executive commitment and strategic direction for organizational resilience.",
      icon: <Target className="w-6 h-6" />,
      color: "strategy-gold",
      gradient: "from-strategy-gold to-orange-500",
    },
    {
      id: "operational",
      title: "Operational Excellence",
      description:
        "Robust processes and capabilities for continuous business operations.",
      icon: <Activity className="w-6 h-6" />,
      color: "operational-emerald",
      gradient: "from-operational-emerald to-emerald-600",
    },
    {
      id: "tactical",
      title: "Tactical Response",
      description:
        "Agile response capabilities and crisis management procedures.",
      icon: <Shield className="w-6 h-6" />,
      color: "tactical-azure",
      gradient: "from-tactical-azure to-blue-600",
    },
    {
      id: "governance",
      title: "Governance & Oversight",
      description:
        "Comprehensive governance framework and continuous oversight.",
      icon: <Users className="w-6 h-6" />,
      color: "governance-violet",
      gradient: "from-governance-violet to-purple-600",
    },
  ];

  const frameworkComponents = [
    {
      id: "prevention",
      title: "Prevention",
      subtitle: "Proactive Risk Management",
      icon: <Shield className="w-8 h-8 text-operational-emerald" />,
      objectives: [
        "Implement comprehensive risk assessment and management",
        "Establish robust business impact analysis processes",
        "Deploy proactive monitoring and early warning systems",
        "Maintain continuous threat intelligence and scenario planning",
      ],
      borderClass: "border-t-operational-emerald",
    },
    {
      id: "response",
      title: "Response",
      subtitle: "Crisis Management",
      icon: <AlertCircle className="w-8 h-8 text-executive-crimson" />,
      objectives: [
        "Activate emergency response teams and procedures",
        "Execute crisis communication and stakeholder management",
        "Implement immediate containment and stabilization measures",
        "Coordinate with external agencies and support services",
      ],
      borderClass: "border-t-executive-crimson",
    },
    {
      id: "recovery",
      title: "Recovery",
      subtitle: "Business Restoration",
      icon: <RefreshCcw className="w-8 h-8 text-tactical-azure" />,
      objectives: [
        "Execute recovery strategies for critical business functions",
        "Restore IT systems and data integrity",
        "Resume operations at alternate facilities if required",
        "Manage supply chain recovery and vendor relationships",
      ],
      borderClass: "border-t-tactical-azure",
    },
    {
      id: "learning",
      title: "Learning",
      subtitle: "Continuous Improvement",
      icon: <BookOpen className="w-8 h-8 text-governance-violet" />,
      objectives: [
        "Conduct comprehensive post-incident reviews and analysis",
        "Update strategies and procedures based on lessons learned",
        "Enhance training programs and competency development",
        "Benchmark against industry best practices and standards",
      ],
      borderClass: "border-t-governance-violet",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header section */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-strategic bg-clip-text text-transparent italic">
            Strategic Resilience Framework
          </h1>
          <p className="text-slate-400 mt-1">
            ISO 22301 Aligned Business Continuity Strategy
          </p>
        </div>
        <button
          onClick={() => setShowDimensionSettings(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-700 hover:border-blue-500 transition-all"
        >
          <Settings className="w-4 h-4" />
          <span className="text-sm font-medium">Dimension Settings</span>
        </button>
      </div>

      {/* Hero Stats - Resilience Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-8 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-strategic opacity-80" />
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-strategy-gold/5 rounded-full blur-3xl group-hover:bg-strategy-gold/10 transition-all duration-700" />

          <div className="relative z-10">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Strategic Resilience
            </h2>
            <p className="text-slate-300 text-lg max-w-2xl leading-relaxed">
              Comprehensive business continuity strategy designed to ensure
              organizational resilience through prevention, response, recovery,
              and continuous improvement across all operational levels.
            </p>

            <div className="grid grid-cols-3 gap-8 mt-10">
              <div className="text-center">
                <div
                  className={`text-4xl font-bold mb-1 ${getResilienceScoreColor(resilienceMetrics.overallResilienceScore)}`}>
                  {resilienceMetrics.overallResilienceScore}
                </div>
                <div className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                  Resilience Score
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {getRiskLevel(resilienceMetrics.overallResilienceScore)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-strategy-gold mb-1">
                  {strategyObjectives.length}
                </div>
                <div className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                  Key Objectives
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-strategy-gold mb-1">
                  {maturityScore}%
                </div>
                <div className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                  Maturity Score
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Critical Metrics Card */}
        <div className="glass-panel p-6 border-l-4 border-l-strategy-gold overflow-y-auto max-h-80">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-strategy-gold" />
            Critical Metrics
          </h3>
          <div className="space-y-4 text-sm">
            <div>
              <div className="text-slate-400 mb-1">Coverage</div>
              <div className="flex justify-between text-white font-bold">
                <span>Strategies: {resilienceMetrics.strategyCoverage}%</span>
                <span>Objectives: {resilienceMetrics.objectiveCoverage}%</span>
              </div>
            </div>
            <div>
              <div className="text-slate-400 mb-1">RTO Compliance</div>
              <div className="text-white font-bold">
                {resilienceMetrics.rtoCompliance}%
              </div>
              {resilienceMetrics.criticalRTOGaps.length > 0 && (
                <div className="text-xs text-orange-400 mt-1">
                  {resilienceMetrics.criticalRTOGaps.length} gaps detected
                </div>
              )}
            </div>
            <div>
              <div className="text-slate-400 mb-1">Risk Mitigation</div>
              <div className="text-white font-bold">
                {resilienceMetrics.riskMitigation}%
              </div>
            </div>
            <div>
              <div className="text-slate-400 mb-1">Investment ROI</div>
              <div
                className={`font-bold ${resilienceMetrics.overallROI >= 0 ? "text-green-400" : "text-red-400"}`}>
                {resilienceMetrics.overallROI}%
              </div>
            </div>
            <div>
              <div className="text-slate-400 mb-1">Readiness</div>
              <div className="text-white font-bold">
                {resilienceMetrics.avgReadinessScore}/100
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Framework Section */}
      <div>
        <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
          <h2 className="text-2xl font-bold text-white">
            Framework Components
          </h2>
          <button className="text-sm font-bold text-strategy-gold hover:underline flex items-center gap-2">
            View Detailed Architecture <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {frameworkComponents.map((comp) => (
            <div
              key={comp.id}
              className={`glass-panel p-6 border-t-[3px] ${comp.borderClass} hover:-translate-y-2 transition-all group`}>
              <div className="mb-6 flex justify-between items-start">
                {comp.icon}
                <div className="text-[10px] font-bold uppercase tracking-tighter text-slate-500 bg-white/5 py-1 px-2 rounded-full">
                  Clause 8
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-strategy-gold transition-colors">
                {comp.title}
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                {comp.subtitle}
              </p>

              <ul className="space-y-3 mb-8">
                {comp.objectives.map((obj, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-xs text-slate-300 leading-relaxed">
                    <ChevronRight className="w-3 h-3 text-strategy-gold mt-1 shrink-0" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="flex-1 py-2 text-[10px] font-bold uppercase tracking-widest bg-white/5 hover:bg-strategy-gold hover:text-slate-900 rounded-lg transition-all"
                  onClick={() => setShowObjectiveModal(true)}>
                  Edit
                </button>
                <button className="flex-1 py-2 text-[10px] font-bold uppercase tracking-widest bg-white/5 hover:bg-white/10 rounded-lg transition-all">
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comprehensive Resilience Analysis */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            Cross-Module Resilience Analysis
          </h2>
          <div className="text-xs font-bold text-slate-400 bg-white/5 py-2 px-4 rounded-full">
            Data-Driven Insights
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Coverage Analysis */}
          <div className="glass-panel p-6 border-l-4 border-l-operational-emerald">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-white text-sm">
                Coverage Analysis
              </h4>
              <GitBranch className="w-5 h-5 text-operational-emerald" />
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Impact Assessment</span>
                  <span className="text-white font-bold">
                    {resilienceMetrics.impactCoverage}%
                  </span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-operational-emerald"
                    style={{ width: `${resilienceMetrics.impactCoverage}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Recovery Objectives</span>
                  <span className="text-white font-bold">
                    {resilienceMetrics.objectiveCoverage}%
                  </span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-operational-emerald"
                    style={{ width: `${resilienceMetrics.objectiveCoverage}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Recovery Strategies</span>
                  <span className="text-white font-bold">
                    {resilienceMetrics.strategyCoverage}%
                  </span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-operational-emerald"
                    style={{ width: `${resilienceMetrics.strategyCoverage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Status */}
          <div className="glass-panel p-6 border-l-4 border-l-tactical-azure">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-white text-sm">
                Compliance Status
              </h4>
              <Shield className="w-5 h-5 text-tactical-azure" />
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">RTO Compliance</span>
                  <span className="text-white font-bold">
                    {resilienceMetrics.rtoCompliance}%
                  </span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-tactical-azure"
                    style={{ width: `${resilienceMetrics.rtoCompliance}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Risk Mitigation</span>
                  <span className="text-white font-bold">
                    {resilienceMetrics.riskMitigation}%
                  </span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-tactical-azure"
                    style={{ width: `${resilienceMetrics.riskMitigation}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Threat Coverage</span>
                  <span className="text-white font-bold">
                    {resilienceMetrics.threatCoverage}%
                  </span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-tactical-azure"
                    style={{ width: `${resilienceMetrics.threatCoverage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Financial Analysis */}
          <div className="glass-panel p-6 border-l-4 border-l-strategy-gold">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-white text-sm">
                Financial Analysis
              </h4>
              <DollarSign className="w-5 h-5 text-strategy-gold" />
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-slate-400 mb-1">
                  Implementation Cost
                </div>
                <div className="text-lg font-bold text-white">
                  $
                  {(resilienceMetrics.totalImplementationCost / 1000).toFixed(
                    1,
                  )}
                  K
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">
                  Annual Benefit
                </div>
                <div className="text-lg font-bold text-green-400">
                  ${(resilienceMetrics.totalAnnualBenefit / 1000).toFixed(1)}K
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">ROI</div>
                <div
                  className={`text-lg font-bold ${resilienceMetrics.overallROI >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {resilienceMetrics.overallROI}%
                </div>
              </div>
            </div>
          </div>

          {/* Readiness Assessment */}
          <div className="glass-panel p-6 border-l-4 border-l-governance-violet">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-white text-sm">
                Readiness Assessment
              </h4>
              <Zap className="w-5 h-5 text-governance-violet" />
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Overall Readiness</span>
                  <span className="text-white font-bold">
                    {resilienceMetrics.avgReadinessScore}%
                  </span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-governance-violet"
                    style={{ width: `${resilienceMetrics.avgReadinessScore}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Testing Coverage</span>
                  <span className="text-white font-bold">
                    {resilienceMetrics.strategyTestingCoverage}%
                  </span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-governance-violet"
                    style={{
                      width: `${resilienceMetrics.strategyTestingCoverage}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Modern Tech Adoption</span>
                  <span className="text-white font-bold">
                    {resilienceMetrics.technologyReadiness}%
                  </span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-governance-violet"
                    style={{
                      width: `${resilienceMetrics.technologyReadiness}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recovery Capability Distribution */}
        {recoveryOptions.length > 0 && (
          <div className="glass-panel p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-white">
                  Recovery Capability Distribution
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Distribution of strategies across recovery tiers
                </p>
              </div>
              <Activity className="w-6 h-6 text-strategy-gold" />
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      name: "Recovery Tiers",
                      "Immediate (< 1h)": resilienceMetrics.immediateRecovery,
                      "Rapid (1-4h)": resilienceMetrics.rapidRecovery,
                      "Standard (4-24h)": resilienceMetrics.standardRecovery,
                      "Extended (> 24h)": resilienceMetrics.extendedRecovery,
                    },
                  ]}>
                  <CartesianGrid stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "rgba(148,163,184,1)", fontSize: 12 }}
                  />
                  <YAxis
                    tick={{ fill: "rgba(148,163,184,0.5)", fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0F172A",
                      borderColor: "rgba(255,255,255,0.1)",
                      color: "#F8FAFC",
                    }}
                  />
                  <Bar dataKey="Immediate (< 1h)" fill="#00C896" />
                  <Bar dataKey="Rapid (1-4h)" fill="#4F46E5" />
                  <Bar dataKey="Standard (4-24h)" fill="#FFD700" />
                  <Bar dataKey="Extended (> 24h)" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Critical Gaps & Risks */}
        {(resilienceMetrics.criticalRTOGaps.length > 0 ||
          resilienceMetrics.openRisks > 0) && (
            <div className="glass-panel p-8 border-l-4 border-l-executive-crimson">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-executive-crimson" />
                  Critical Gaps & Risks
                </h3>
                <span className="text-xs font-bold text-executive-crimson bg-executive-crimson/10 py-2 px-3 rounded-full">
                  {resilienceMetrics.criticalRTOGaps.length +
                    resilienceMetrics.openRisks}{" "}
                  Items
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {resilienceMetrics.criticalRTOGaps.length > 0 && (
                  <div>
                    <h4 className="font-bold text-white mb-3 text-sm">
                      RTO Compliance Gaps
                    </h4>
                    <ul className="space-y-2">
                      {resilienceMetrics.criticalRTOGaps.map((gap, idx) => (
                        <li
                          key={idx}
                          className="flex gap-2 text-xs text-slate-300">
                          <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                          <span>{gap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-white mb-3 text-sm">
                    Risk Indicators
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex gap-2 text-xs text-slate-300">
                      <Zap className="w-4 h-4 text-strategy-gold mt-0.5 shrink-0" />
                      <span>Open Risks: {resilienceMetrics.openRisks}</span>
                    </li>
                    <li className="flex gap-2 text-xs text-slate-300">
                      <Users2 className="w-4 h-4 text-strategy-gold mt-0.5 shrink-0" />
                      <span>
                        Personnel Capacity: {resilienceMetrics.personCapacityRisk}
                      </span>
                    </li>
                    <li className="flex gap-2 text-xs text-slate-300">
                      <Cpu className="w-4 h-4 text-strategy-gold mt-0.5 shrink-0" />
                      <span>
                        Vendor Dependency:{" "}
                        {resilienceMetrics.vendorDependencyRisk}
                      </span>
                    </li>
                    <li className="flex gap-2 text-xs text-slate-300">
                      <TrendingDown className="w-4 h-4 text-strategy-gold mt-0.5 shrink-0" />
                      <span>
                        Critical Threats: {resilienceMetrics.criticalThreats}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-white">Maturity Radar</h3>
              <p className="text-xs text-slate-400">
                Current state across key capability areas
              </p>
            </div>
            <Activity className="w-6 h-6 text-strategy-gold" />
          </div>

          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{
                    fill: "rgba(148,163,184,1)",
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 5]}
                  tick={{ fill: "rgba(148,163,184,0.5)", fontSize: 10 }}
                  axisLine={false}
                />
                <Radar
                  name="Current Maturity"
                  dataKey="current"
                  stroke="#FFD700"
                  fill="#FFD700"
                  fillOpacity={0.2}
                  strokeWidth={3}
                />
                <Radar
                  name="Target Maturity"
                  dataKey="target"
                  stroke="#00C896"
                  fill="#00C896"
                  fillOpacity={0.1}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    borderColor: "rgba(255,255,255,0.1)",
                    color: "#F8FAFC",
                  }}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white">
              Overall Maturity: Level {overallMaturity.level} -{" "}
              {overallMaturity.name}
            </h3>
            <div className="text-[10px] font-bold text-slate-400 uppercase bg-white/5 py-1 px-3 rounded-full">
              Based on Real Module Data
            </div>
          </div>

          <div className="space-y-4">
            {[
              {
                level: 1,
                name: "Initial",
                desc: "Ad-hoc processes with minimal documentation.",
                color: "executive-crimson",
              },
              {
                level: 2,
                name: "Managed",
                desc: "Basic processes established and documented.",
                color: "priority-high",
              },
              {
                level: 3,
                name: "Defined",
                desc: "Standardized processes across the organization.",
                color: "priority-medium",
              },
              {
                level: 4,
                name: "Quantitatively Managed",
                desc: "Processes measured and controlled using metrics.",
                color: "tactical-azure",
              },
              {
                level: 5,
                name: "Optimizing",
                desc: "Focus on continuous process improvement.",
                color: "strategy-gold",
              },
            ].map((lvl) => (
              <div
                key={lvl.level}
                className={`flex gap-4 p-4 rounded-xl transition-all cursor-default ${overallMaturity.level === lvl.level
                  ? "bg-white/10 border border-white/20"
                  : "bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10"
                  }`}>
                <div
                  className={`w-3 h-3 rounded-full mt-1 shrink-0 bg-${lvl.color} shadow-[0_0_10px_rgba(255,255,255,0.2)]`}
                />
                <div className="flex-1">
                  <div className="text-sm font-bold text-white">
                    Level {lvl.level} - {lvl.name}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{lvl.desc}</p>
                </div>
                {overallMaturity.level === lvl.level && (
                  <div className="flex flex-col items-end gap-1">
                    <CheckCircle2 className="w-4 h-4 text-operational-emerald" />
                    <span className="text-xs font-semibold text-operational-emerald">
                      Current
                    </span>
                  </div>
                )}
              </div>
            ))}

            {maturityDimensions.length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <h4 className="text-sm font-semibold text-slate-300 mb-3">
                  Dimension Breakdown
                </h4>
                <div className="space-y-2">
                  {maturityDimensions.map((dim) => (
                    <div
                      key={dim.dimension}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-white">
                          {dim.dimension}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {dim.description}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <div className="text-right">
                          <div className="text-sm font-bold text-white">
                            Level {dim.currentLevel}
                          </div>
                          <div className="text-xs text-slate-500">
                            {dim.score}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gap Analysis Section */}
      {dimensionGaps.length > 0 && (
        <GapAnalysisSection
          gaps={dimensionGaps}
          onDimensionClick={(dimension) => {
            // Could open settings modal focused on that dimension
            setShowDimensionSettings(true);
          }}
        />
      )}

      {/* Dimension Settings Modal */}
      <DimensionSettings
        isOpen={showDimensionSettings}
        onClose={() => setShowDimensionSettings(false)}
        onSave={handleSaveDimensionSettings}
        currentSettings={dimensionSettings}
      />
    </div>
  );
};

export default BCStrategy;
