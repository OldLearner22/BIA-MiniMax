import { useStore } from '../store/useStore';
import { DEFAULT_IMPACT_CATEGORIES } from '../types';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { AlertTriangle, Activity, Shield, TrendingUp } from 'lucide-react';

export function Dashboard() {
  const { processes, temporalData, settings } = useStore();
  const categories = settings.impactCategories || DEFAULT_IMPACT_CATEGORIES;

  // Derive max impact per category from temporal data
  const getMaxImpactPerCategory = (processId: string): Record<string, number> => {
    const data = temporalData[processId] as Record<string, number | string>[] | undefined;
    if (!data || data.length === 0) return {};
    const maxImpacts: Record<string, number> = {};
    categories.forEach(cat => {
      maxImpacts[cat.id] = Math.max(...data.map(d => (d[cat.id] as number) || 0));
    });
    return maxImpacts;
  };

  // Calculate risk score from temporal data (weighted avg of max impacts)
  const calculateRiskScore = (processId: string): number => {
    const maxImpacts = getMaxImpactPerCategory(processId);
    let total = 0, weightSum = 0;
    categories.forEach(cat => {
      total += (maxImpacts[cat.id] || 0) * cat.weight;
      weightSum += cat.weight;
    });
    return weightSum > 0 ? parseFloat((total / weightSum).toFixed(2)) : 0;
  };

  const criticalCount = processes.filter(p => p.criticality === 'critical').length;
  const highCount = processes.filter(p => p.criticality === 'high').length;
  const avgRiskScore = processes.length > 0 
    ? (processes.reduce((acc, p) => acc + calculateRiskScore(p.id), 0) / processes.length).toFixed(2)
    : 0;

  const criticalityData = [
    { name: 'Critical', value: criticalCount, color: '#F87171' },
    { name: 'High', value: highCount, color: '#FBBF24' },
    { name: 'Medium', value: processes.filter(p => p.criticality === 'medium').length, color: '#60A5FA' },
    { name: 'Low', value: processes.filter(p => p.criticality === 'low' || p.criticality === 'minimal').length, color: '#34D399' },
  ].filter(d => d.value > 0);

  const deptRiskData = Object.entries(
    processes.reduce((acc, p) => {
      const dept = p.department;
      if (!acc[dept]) acc[dept] = { department: dept, risk: 0, count: 0 };
      acc[dept].risk += calculateRiskScore(p.id);
      acc[dept].count += 1;
      return acc;
    }, {} as Record<string, { department: string; risk: number; count: number }>)
  ).map(([_, v]) => ({ ...v, avgRisk: parseFloat((v.risk / v.count).toFixed(2)) }));

  // Aggregate max impacts across all processes for radar
  const aggregateMaxImpacts = processes.reduce((acc, p) => {
    const maxImpacts = getMaxImpactPerCategory(p.id);
    categories.forEach(cat => {
      acc[cat.id] = (acc[cat.id] || 0) + (maxImpacts[cat.id] || 0);
    });
    return acc;
  }, {} as Record<string, number>);

  const radarData = categories.map(cat => ({
    dimension: cat.name,
    value: processes.length > 0 ? (aggregateMaxImpacts[cat.id] || 0) / processes.length : 0,
    max: 5,
    color: cat.color
  }));

  const kpis = [
    { label: 'Total Processes', value: processes.length, icon: Activity, color: 'text-bia-primary' },
    { label: 'Critical Processes', value: criticalCount, icon: AlertTriangle, color: 'text-bia-critical' },
    { label: 'Avg Impact Score', value: avgRiskScore, icon: TrendingUp, color: 'text-bia-warning' },
    { label: 'Compliant', value: `${Math.round((processes.filter(p => p.status === 'approved').length / processes.length) * 100) || 0}%`, icon: Shield, color: 'text-bia-success' },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-bia-text-primary">Dashboard</h1>
          <p className="text-bia-text-secondary mt-1">Business Impact Analysis Overview</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="glass-panel-hover p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-bia-text-secondary text-sm">{kpi.label}</p>
                <p className={`text-3xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
              </div>
              <kpi.icon className={`w-10 h-10 ${kpi.color} opacity-50`} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Pie */}
        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold text-bia-text-primary mb-4">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={criticalityData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {criticalityData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Risk by Department */}
        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold text-bia-text-primary mb-4">Impact by Department</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deptRiskData} layout="vertical">
              <XAxis type="number" domain={[0, 5]} stroke="#94A3B8" />
              <YAxis type="category" dataKey="department" stroke="#94A3B8" width={80} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
              <Bar dataKey="avgRisk" fill="#38BDF8" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Impact Radar */}
        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold text-bia-text-primary mb-4">Impact Profile</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="dimension" stroke="#94A3B8" tick={{ fontSize: 10 }} />
              <Radar name="Impact" dataKey="value" stroke="#818CF8" fill="#818CF8" fillOpacity={0.4} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Processes */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold text-bia-text-primary mb-4">Process Impact Summary</h3>
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
                  <tr key={proc.id} className="hover:bg-[rgba(255,255,255,0.02)]">
                    <td className="py-3 text-bia-text-primary font-medium">{proc.name}</td>
                    <td className="py-3 text-bia-text-secondary">{proc.department}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium criticality-${proc.criticality}`}>
                        {proc.criticality}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`font-bold ${score >= 4 ? 'text-bia-critical' : score >= 3 ? 'text-bia-warning' : 'text-bia-text-primary'}`}>
                        {score}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs ${proc.status === 'approved' ? 'bg-bia-success/20 text-bia-success' : proc.status === 'in-review' ? 'bg-bia-warning/20 text-bia-warning' : 'bg-bia-text-tertiary/20 text-bia-text-tertiary'}`}>
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
