import { useStore } from "../store/useStore";
import { DEFAULT_IMPACT_CATEGORIES, ImpactAssessment } from "../types";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import { AlertTriangle, Activity, Shield, TrendingUp } from "lucide-react";

export function Dashboard() {
  const { processes, impacts, settings } = useStore();
  const categories = settings.impactCategories || DEFAULT_IMPACT_CATEGORIES;

  // Derive max impact per category from impact assessment data (database)
  const getMaxImpactPerCategory = (
    processId: string,
  ): Record<string, number> => {
    const impact = impacts[processId];
    if (!impact) return {};

    const maxImpacts: Record<string, number> = {};
    categories.forEach((cat) => {
      // Map category IDs to impact assessment fields
      const impactField = cat.id as keyof ImpactAssessment;
      maxImpacts[cat.id] = (impact[impactField] as number) || 0;
    });
    return maxImpacts;
  };

  // Calculate risk score from impact assessment data (weighted avg of impacts)
  const calculateRiskScore = (processId: string): number => {
    const maxImpacts = getMaxImpactPerCategory(processId);
    let total = 0,
      weightSum = 0;
    categories.forEach((cat) => {
      total += (maxImpacts[cat.id] || 0) * cat.weight;
      weightSum += cat.weight;
    });
    return weightSum > 0 ? parseFloat((total / weightSum).toFixed(2)) : 0;
  };

  const criticalCount = processes.filter(
    (p) => p.criticality === "critical",
  ).length;
  const highCount = processes.filter((p) => p.criticality === "high").length;
  const avgRiskScore =
    processes.length > 0
      ? (
          processes.reduce((acc, p) => acc + calculateRiskScore(p.id), 0) /
          processes.length
        ).toFixed(2)
      : 0;

  const criticalityData = [
    { name: "Critical", value: criticalCount, color: "#F87171" },
    { name: "High", value: highCount, color: "#FBBF24" },
    {
      name: "Medium",
      value: processes.filter((p) => p.criticality === "medium").length,
      color: "#60A5FA",
    },
    {
      name: "Low",
      value: processes.filter(
        (p) => p.criticality === "low" || p.criticality === "minimal",
      ).length,
      color: "#34D399",
    },
  ].filter((d) => d.value > 0);

  const deptRiskData = Object.entries(
    processes.reduce(
      (acc, p) => {
        const dept = p.department;
        if (!acc[dept]) acc[dept] = { department: dept, risk: 0, count: 0 };
        acc[dept].risk += calculateRiskScore(p.id);
        acc[dept].count += 1;
        return acc;
      },
      {} as Record<string, { department: string; risk: number; count: number }>,
    ),
  ).map(([_, v]) => ({
    ...v,
    avgRisk: parseFloat((v.risk / v.count).toFixed(2)),
  }));

  // Aggregate max impacts across all processes for radar
  const aggregateMaxImpacts = processes.reduce(
    (acc, p) => {
      const maxImpacts = getMaxImpactPerCategory(p.id);
      categories.forEach((cat) => {
        acc[cat.id] = (acc[cat.id] || 0) + (maxImpacts[cat.id] || 0);
      });
      return acc;
    },
    {} as Record<string, number>,
  );

  const radarData = categories.map((cat) => ({
    dimension: cat.name,
    value:
      processes.length > 0
        ? (aggregateMaxImpacts[cat.id] || 0) / processes.length
        : 0,
    max: 5,
  }));

  const kpis = [
    {
      label: "Total Processes",
      value: processes.length,
      icon: Activity,
      color: "text-bia-primary",
      trend: "+2 this week",
    },
    {
      label: "Critical Processes",
      value: criticalCount,
      icon: AlertTriangle,
      color: "text-bia-critical",
      trend: "High Priority",
    },
    {
      label: "Avg Impact Score",
      value: avgRiskScore,
      icon: TrendingUp,
      color: "text-bia-warning",
      trend: "Weighted Avg",
    },
    {
      label: "Compliant",
      value: `${Math.round((processes.filter((p) => p.status === "approved").length / processes.length) * 100) || 0}%`,
      icon: Shield,
      color: "text-bia-success",
      trend: "Target: 95%",
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-xl">
          <p className="text-white font-medium text-sm mb-1">
            {label || payload[0].name}
          </p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color || entry.fill }}
                />
                <span className="text-slate-300 text-xs">
                  {entry.name}:{" "}
                  <span className="text-white font-bold">{entry.value}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Chart Gradients */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="gradientPrimary" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity={0.2} />
          </linearGradient>
          <linearGradient id="gradientSecondary" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818CF8" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#818CF8" stopOpacity={0.2} />
          </linearGradient>
          <linearGradient id="gradientCritical" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#F87171" stopOpacity={1} />
            <stop offset="100%" stopColor="#EF4444" stopOpacity={0.8} />
          </linearGradient>
        </defs>
      </svg>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-bia-text-primary tracking-tight">
            Executive Dashboard
          </h1>
          <p className="text-bia-text-secondary mt-1">
            Real-time Business Impact Analysis Intelligence
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="glass-panel-hover p-6 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-bia-text-secondary text-sm font-medium">
                  {kpi.label}
                </p>
                <p
                  className={`text-4xl font-bold mt-2 tracking-tighter ${kpi.color}`}>
                  {kpi.value}
                </p>
                <p className="text-[10px] text-bia-text-tertiary mt-2 uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  {kpi.trend}
                </p>
              </div>
              <div
                className={`p-3 rounded-bia-md bg-white/5 group-hover:bg-white/10 transition-colors`}>
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Pie */}
        <div className="glass-panel p-6">
          <h3 className="text-sm font-bold text-bia-text-secondary uppercase tracking-widest mb-6">
            Criticality Distribution
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={criticalityData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                stroke="none">
                {criticalityData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {criticalityData.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-[10px] text-bia-text-secondary font-medium">
                  {d.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk by Department */}
        <div className="glass-panel p-6">
          <h3 className="text-sm font-bold text-bia-text-secondary uppercase tracking-widest mb-6">
            Impact by Department
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={deptRiskData}
              layout="vertical"
              margin={{ left: -20, right: 20 }}>
              <XAxis type="number" domain={[0, 5]} hide />
              <YAxis
                type="category"
                dataKey="department"
                stroke="#64748B"
                width={100}
                tick={{ fontSize: 11, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
              />
              <Bar
                dataKey="avgRisk"
                fill="url(#gradientPrimary)"
                radius={[0, 4, 4, 0]}
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Impact Radar */}
        <div className="glass-panel p-6">
          <h3 className="text-sm font-bold text-bia-text-secondary uppercase tracking-widest mb-6">
            Impact Profile
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.05)" />
              <PolarAngleAxis
                dataKey="dimension"
                stroke="#64748B"
                tick={{ fontSize: 10, fontWeight: 600 }}
              />
              <Radar
                name="Impact"
                dataKey="value"
                stroke="#818CF8"
                fill="url(#gradientSecondary)"
                fillOpacity={0.6}
                strokeWidth={2}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Processes */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold text-bia-text-primary mb-4">
          Process Impact Summary
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-bia-text-secondary uppercase tracking-wider">
                <th className="pb-3">Process</th>
                <th className="pb-3">Department</th>
                <th className="pb-3">Criticality</th>
                <th className="pb-3">Impact Score</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
              {processes.slice(0, 5).map((proc) => {
                const score = calculateRiskScore(proc.id);
                return (
                  <tr
                    key={proc.id}
                    className="hover:bg-[rgba(255,255,255,0.02)]">
                    <td className="py-3 text-bia-text-primary font-medium">
                      {proc.name}
                    </td>
                    <td className="py-3 text-bia-text-secondary">
                      {proc.department}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium criticality-${proc.criticality}`}>
                        {proc.criticality}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`font-bold ${score >= 4 ? "text-bia-critical" : score >= 3 ? "text-bia-warning" : "text-bia-text-primary"}`}>
                        {score}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs ${proc.status === "approved" ? "bg-bia-success/20 text-bia-success" : proc.status === "in-review" ? "bg-bia-warning/20 text-bia-warning" : "bg-bia-text-tertiary/20 text-bia-text-tertiary"}`}>
                        {proc.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
