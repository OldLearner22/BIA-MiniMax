import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { IncidentStatistics } from "../../types/incident";
import { useStore } from "../../store/useStore";

const IncidentDashboard: React.FC = () => {
  const statistics = useStore((state) => state.incidentStatistics);
  const fetchIncidentStatistics = useStore(
    (state) => state.fetchIncidentStatistics,
  );

  useEffect(() => {
    fetchIncidentStatistics();
  }, [fetchIncidentStatistics]);
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d">("30d");

  const severityColors = {
    LOW: "#10B981",
    MEDIUM: "#F59E0B",
    HIGH: "#EF4444",
    CRITICAL: "#7C3AED",
  };

  const statusColors = {
    REPORTED: "#6B7280",
    ASSESSED: "#3B82F6",
    RESPONDING: "#F59E0B",
    ESCALATED: "#EF4444",
    RESOLVED: "#10B981",
    CLOSED: "#1F2937",
    CANCELLED: "#9CA3AF",
  };

  const prepareSeverityData = () => {
    return Object.entries(statistics.bySeverity)
      .filter(([_, count]) => count > 0)
      .map(([severity, count]) => ({
        name: severity,
        value: count,
        color: severityColors[severity as keyof typeof severityColors],
      }));
  };

  const prepareTrendData = () => {
    // This would typically come from API
    return [
      { date: "2024-01", incidents: 12 },
      { date: "2024-02", incidents: 18 },
      { date: "2024-03", incidents: 15 },
      { date: "2024-04", incidents: 22 },
      { date: "2024-05", incidents: 19 },
      { date: "2024-06", incidents: 24 },
    ];
  };

  if (!statistics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-bia-text-secondary">
            Loading incident statistics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel-hover p-6 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/10 blur-3xl rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
          <div className="relative flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-400/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl text-blue-400">📈</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-bia-text-primary">
                {statistics.total}
              </h3>
              <p className="text-sm text-bia-text-secondary">Total Incidents</p>
            </div>
          </div>
        </div>

        <div className="glass-panel-hover p-6 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-400/10 blur-3xl rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
          <div className="relative flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-400/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl text-red-400">⚠️</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-bia-text-primary">
                {statistics.unresolved}
              </h3>
              <p className="text-sm text-bia-text-secondary">
                Active Incidents
              </p>
            </div>
          </div>
        </div>

        <div className="glass-panel-hover p-6 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400/10 blur-3xl rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
          <div className="relative flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-yellow-400/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl text-yellow-400">🚨</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-bia-text-primary">
                {statistics.escalated}
              </h3>
              <p className="text-sm text-bia-text-secondary">Escalated</p>
            </div>
          </div>
        </div>

        <div className="glass-panel-hover p-6 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-400/10 blur-3xl rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
          <div className="relative flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-400/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl text-green-400">⏱️</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-bia-text-primary">
                {statistics.mttr}h
              </h3>
              <p className="text-sm text-bia-text-secondary">
                Mean Time to Resolve
              </p>
            </div>
          </div>
        </div>

        <div className="glass-panel-hover p-6 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-400/10 blur-3xl rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
          <div className="relative flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-400/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl text-purple-400">✅</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-bia-text-primary">
                {statistics.resolvedLast30Days}
              </h3>
              <p className="text-sm text-bia-text-secondary">
                Resolved Last 30 Days
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Distribution */}
        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold text-bia-text-primary mb-4">
            Incidents by Severity
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={prepareSeverityData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value">
                {prepareSeverityData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Trend Analysis */}
        <div className="glass-panel p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-bia-text-primary">
              Incident Trends
            </h3>
            <div className="flex space-x-2">
              {(["7d", "30d", "90d"] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    timeframe === tf
                      ? "bg-blue-600 text-white"
                      : "glass-button hover:bg-blue-500/10"
                  }`}>
                  {tf}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={prepareTrendData()}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
              />
              <XAxis dataKey="date" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15,23,42,0.9)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="incidents"
                stroke="#3B82F6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold text-bia-text-primary mb-4">
          Incidents by Status
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={Object.entries(statistics.byStatus).map(
              ([status, count]) => ({ status, count }),
            )}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8">
              {Object.entries(statistics.byStatus).map(([status], index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={statusColors[status as keyof typeof statusColors]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default IncidentDashboard;
