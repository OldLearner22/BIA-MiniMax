import { useState, useEffect, useMemo } from "react";
import { useStore } from "../store/useStore";
import {
  getTimelinePointsFromCustom,
  DEFAULT_IMPACT_CATEGORIES,
} from "../types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import {
  ChevronLeft,
  Save,
  AlertTriangle,
  Info,
  Search,
  Filter,
} from "lucide-react";

interface DynamicTimelinePoint {
  timeOffset: number;
  timeLabel: string;
  [key: string]: number | string;
}

export function TemporalAnalysis() {
  const {
    processes,
    selectedProcessId,
    setSelectedProcessId,
    temporalData,
    updateTemporalData,
    getProcessById,
    settings,
    fetchRecoveryObjectives,
  } = useStore();
  const [localData, setLocalData] = useState<DynamicTimelinePoint[]>([]);
  const [saved, setSaved] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{
    idx: number;
    catId: string;
  } | null>(null);

  const process = selectedProcessId ? getProcessById(selectedProcessId) : null;
  const categories = useMemo(
    () => settings.impactCategories || DEFAULT_IMPACT_CATEGORIES,
    [settings.impactCategories],
  );
  const timelinePoints = useMemo(
    () => settings.customTimelinePoints || [],
    [settings.customTimelinePoints],
  );
  const timelineStructure = useMemo(
    () => getTimelinePointsFromCustom(timelinePoints),
    [timelinePoints],
  );

  useEffect(() => {
    if (selectedProcessId) {
      const existing = temporalData[selectedProcessId];
      // Only set local data if it's drastically different (e.g. initial load or different process)
      // We check length and presence. If length matches, we assume it's the data we want unless we have nothing.
      if (existing && existing.length === timelineStructure.length) {
        // Only initialize if localData is empty or belongs to a different process (checked by structure/length context here)
        // To be safe, we only overwrite if we haven't initialized localData for THIS process yet.
        setLocalData((prev) => {
          if (
            prev.length === existing.length &&
            prev[0]?.timeOffset === existing[0]?.timeOffset
          ) {
            return prev; // Keep current local changes
          }
          return existing as unknown as DynamicTimelinePoint[];
        });
      } else {
        const newData: DynamicTimelinePoint[] = timelineStructure.map((tp) => {
          const point: DynamicTimelinePoint = {
            timeOffset: tp.timeOffset,
            timeLabel: tp.timeLabel,
          };
          categories.forEach((c) => (point[c.id] = 0));
          return point;
        });
        setLocalData(newData);
      }
    } else {
      setLocalData([]);
    }
  }, [selectedProcessId, temporalData, categories, timelineStructure]);

  const handleSliderChange = (idx: number, catId: string, value: number) => {
    const updated = [...localData];
    updated[idx] = { ...updated[idx], [catId]: value };
    setLocalData(updated);
    setSaved(false);
  };

  const handleSave = async () => {
    if (selectedProcessId) {
      updateTemporalData(selectedProcessId, localData as any);
      setSaved(true);

      // Calculate recovery objectives based on temporal data
      try {
        const response = await fetch(
          `/api/recovery-objectives/calculate/${selectedProcessId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              timelineData: localData,
              impactThreshold: settings.impactThreshold || 3,
            }),
          },
        );

        if (response.ok) {
          // Refresh recovery objectives in store
          await fetchRecoveryObjectives();
          console.log(
            "✓ Recovery objectives recalculated from temporal analysis",
          );
        }
      } catch (error) {
        console.error("Failed to recalculate recovery objectives:", error);
      }

      setTimeout(() => setSaved(false), 2000);
    }
  };

  const calculateMTPD = (): number | null => {
    const threshold = settings.impactThreshold;
    for (const point of localData) {
      const maxImpact = Math.max(
        ...categories.map((c) => (point[c.id] as number) || 0),
      );
      if (maxImpact >= threshold) return point.timeOffset;
    }
    return null;
  };

  const getTimeBasedDefinition = (
    categoryId: string,
    timelinePointId: string,
  ): string | null => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return null;
    const def = category.timeBasedDefinitions.find(
      (d) => d.timelinePointId === timelinePointId,
    );
    return def?.description || null;
  };

  // Custom tooltip for the chart with time-based definitions
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    // Find the timeline point ID for this label
    const pointIdx = localData.findIndex((d) => d.timeLabel === label);
    const timelinePointId = timelinePoints[pointIdx]?.id;

    return (
      <div className="bg-slate-800/95 border border-white/10 rounded-lg p-3 shadow-xl max-w-xs">
        <p className="text-white font-semibold mb-2 border-b border-white/10 pb-2">
          {label}
        </p>
        <div className="space-y-2">
          {payload.map((entry: any) => {
            const cat = categories.find((c) => c.id === entry.dataKey);
            const definition = timelinePointId
              ? getTimeBasedDefinition(entry.dataKey, timelinePointId)
              : null;
            return (
              <div key={entry.dataKey} className="text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-white font-medium">
                    {cat?.name || entry.name}:
                  </span>
                  <span className="text-amber-400 font-bold">
                    {entry.value}/5
                  </span>
                </div>
                {definition && (
                  <p className="text-slate-300 text-xs ml-4 mt-1 italic">
                    "{definition}"
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const calculatedMTPD = calculateMTPD();

  // Calculate max impact per category across all timeline points (worst-case)
  const getMaxImpactPerCategory = (processId: string) => {
    const data = temporalData[processId] as unknown as
      | DynamicTimelinePoint[]
      | undefined;
    if (!data) return {};
    const maxImpacts: Record<string, number> = {};
    categories.forEach((cat) => {
      maxImpacts[cat.id] = Math.max(
        ...data.map((d) => (d[cat.id] as number) || 0),
      );
    });
    return maxImpacts;
  };

  // Overall criticality = weighted average of max impacts
  const calculateOverallCriticality = (processId: string): number => {
    const maxImpacts = getMaxImpactPerCategory(processId);
    let total = 0,
      weightSum = 0;
    categories.forEach((cat) => {
      total += (maxImpacts[cat.id] || 0) * cat.weight;
      weightSum += cat.weight;
    });
    return weightSum > 0 ? parseFloat((total / weightSum).toFixed(2)) : 0;
  };

  // Get process impact summary for list view
  const getImpactValueDisplay = (catId: string, value: number) => {
    if (value === 0) return "None";
    const cat = categories.find((c) => c.id === catId);
    // Map numerical level to standard labels or use description if available
    const def = cat?.timeBasedDefinitions.find(
      (d) =>
        d.timelinePointId ===
        `ctp-${Math.min(7, Math.max(1, Math.round(value)))}`,
    );
    if (def) {
      return def.description.split(",")[0];
    }
    const labels = ["None", "Minimal", "Low", "Medium", "High", "Critical"];
    return labels[Math.round(value)] || value.toString();
  };

  const getImpactLabel = (value: number) => {
    if (value >= 4.5) return "Critical";
    if (value >= 3.5) return "High";
    if (value >= 2.5) return "Medium";
    if (value >= 1.5) return "Low";
    if (value >= 0.5) return "Minimal";
    return "None";
  };

  const getProcessImpactSummary = (processId: string) => {
    const score = calculateOverallCriticality(processId);
    const maxImpacts = getMaxImpactPerCategory(processId);
    const highestCat = categories.reduce(
      (max, cat) =>
        (maxImpacts[cat.id] || 0) > (maxImpacts[max.id] || 0) ? cat : max,
      categories[0],
    );
    return { score, highestCat, highestValue: maxImpacts[highestCat?.id] || 0 };
  };

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [criticalityFilter, setCriticalityFilter] = useState("");

  // Get unique departments
  const departments = useMemo(
    () => [...new Set(processes.map((p) => p.department))].sort(),
    [processes],
  );

  // Filtered processes
  const filteredProcesses = useMemo(() => {
    return processes.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = !deptFilter || p.department === deptFilter;
      const matchesCrit =
        !criticalityFilter || p.criticality === criticalityFilter;
      return matchesSearch && matchesDept && matchesCrit;
    });
  }, [processes, searchTerm, deptFilter, criticalityFilter]);

  if (!selectedProcessId) {
    return (
      <div className="animate-fade-in space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-bia-text-primary">
            Business Impact Analysis
          </h1>
          <p className="text-bia-text-secondary mt-1">
            Assess and analyze business impact across processes
          </p>
        </div>

        {/* Filter Bar */}
        <div className="glass-panel p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bia-text-tertiary" />
              <input
                type="text"
                placeholder="Search processes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass-input w-full pl-10"
              />
            </div>
            {/* Department Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-bia-text-tertiary" />
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="glass-input">
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            {/* Criticality Filter */}
            <select
              value={criticalityFilter}
              onChange={(e) => setCriticalityFilter(e.target.value)}
              className="glass-input">
              <option value="">All Criticality</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            {/* Clear Filters */}
            {(searchTerm || deptFilter || criticalityFilter) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setDeptFilter("");
                  setCriticalityFilter("");
                }}
                className="text-sm text-bia-text-tertiary hover:text-bia-text-primary">
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Process List Table */}
        <div className="glass-panel overflow-hidden">
          <table className="w-full">
            <thead className="bg-black/30">
              <tr className="text-left text-xs text-bia-text-secondary uppercase tracking-wider">
                <th className="px-6 py-4">Process Name</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4 text-center">Criticality</th>
                <th className="px-6 py-4 text-center">Impact Score</th>
                <th className="px-6 py-4">Peak Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
              {filteredProcesses.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-bia-text-tertiary">
                    No processes match your filters
                  </td>
                </tr>
              ) : (
                filteredProcesses.map((p, idx) => {
                  const summary = getProcessImpactSummary(p.id);
                  return (
                    <tr
                      key={p.id}
                      onDoubleClick={() => setSelectedProcessId(p.id)}
                      className={`cursor-pointer transition-colors hover:bg-bia-primary/10 ${idx % 2 === 0 ? "bg-white/[0.02]" : ""}`}
                      title="Double-click to assess">
                      <td className="px-6 py-4">
                        <p className="text-bia-text-primary font-medium">
                          {p.name}
                        </p>
                        <p className="text-xs text-bia-text-tertiary">
                          {p.owner}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-bia-text-secondary">
                        {p.department}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium criticality-${p.criticality}`}>
                          {p.criticality}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`text-xl font-bold ${summary.score >= 4 ? "text-bia-critical" : summary.score >= 3 ? "text-bia-warning" : summary.score > 0 ? "text-bia-info" : "text-bia-text-tertiary"}`}>
                          {summary.score}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {summary.highestValue > 0 ? (
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded"
                              style={{
                                backgroundColor: summary.highestCat?.color,
                              }}
                            />
                            <span className="text-bia-text-primary">
                              {summary.highestCat?.name}
                            </span>
                            <span className="text-bia-text-tertiary text-sm">
                              ({summary.highestValue}/5)
                            </span>
                          </div>
                        ) : (
                          <span className="text-bia-text-tertiary text-sm">
                            Not assessed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          {/* Hint */}
          <div className="px-6 py-3 bg-black/20 text-xs text-bia-text-tertiary border-t border-[rgba(255,255,255,0.05)]">
            💡 Double-click a row to open the impact assessment for that process
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSelectedProcessId(null)}
          className="p-2 hover:bg-bia-glass-hover rounded-lg">
          <ChevronLeft className="w-5 h-5 text-bia-text-secondary" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-bia-text-primary">
            Business Impact Analysis
          </h1>
          <p className="text-bia-text-secondary mt-1">
            Process: {process?.name}
          </p>
        </div>
      </div>

      {/* Overall Impact Summary Card */}
      {selectedProcessId && (
        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold text-bia-text-primary mb-4">
            Overall Impact Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {/* Overall Score */}
            <div className="col-span-2 md:col-span-1 p-4 bg-black/30 rounded-lg text-center flex flex-col justify-center">
              <p className="text-xs text-bia-text-tertiary uppercase mb-1">
                Criticality
              </p>
              <p
                className={`text-2xl font-bold tracking-tight ${calculateOverallCriticality(selectedProcessId) >= 4 ? "text-bia-critical" : calculateOverallCriticality(selectedProcessId) >= 3 ? "text-bia-warning" : "text-bia-success"}`}>
                {getImpactLabel(calculateOverallCriticality(selectedProcessId))}
              </p>
              <p className="text-[10px] text-bia-text-tertiary mt-1">
                Score: {calculateOverallCriticality(selectedProcessId)}
              </p>
            </div>
            {/* Per-category max impacts */}
            {categories.map((cat) => {
              const maxVal =
                getMaxImpactPerCategory(selectedProcessId)[cat.id] || 0;
              return (
                <div
                  key={cat.id}
                  className="p-3 bg-black/20 rounded-lg text-center flex flex-col justify-center min-h-[100px]">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <div
                      className="w-2 h-2 rounded"
                      style={{ backgroundColor: cat.color }}
                    />
                    <p className="text-[10px] text-bia-text-tertiary uppercase tracking-wider truncate">
                      {cat.name}
                    </p>
                  </div>
                  <p
                    className={`text-lg font-bold leading-tight mb-1 ${maxVal >= 4 ? "text-bia-critical" : maxVal >= 3 ? "text-bia-warning" : "text-bia-text-primary"}`}>
                    {getImpactValueDisplay(cat.id, maxVal)}
                  </p>
                  <p className="text-[10px] text-bia-text-tertiary">
                    Peak Impact
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {calculatedMTPD !== null && (
        <div className="glass-panel p-4 border-l-4 border-bia-warning flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-bia-warning" />
          <div>
            <span className="text-bia-text-primary font-medium">
              Suggested MTPD:{" "}
            </span>
            <span className="text-bia-warning font-bold">
              {calculatedMTPD} hours
            </span>
            <span className="text-bia-text-tertiary ml-2">
              (Based on impact threshold of {settings.impactThreshold})
            </span>
          </div>
        </div>
      )}

      {/* Timeline Chart */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold text-bia-text-primary mb-2">
          Impact Escalation Over Time
        </h3>
        <p className="text-sm text-bia-text-tertiary mb-4">
          Hover over data points to see impact definitions
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={localData}>
            <XAxis dataKey="timeLabel" stroke="#94A3B8" />
            <YAxis domain={[0, 5]} stroke="#94A3B8" />
            <Tooltip content={<CustomChartTooltip />} />
            <Legend />
            <ReferenceLine
              y={settings.impactThreshold}
              stroke="#F87171"
              strokeDasharray="5 5"
              label={{ value: "Threshold", fill: "#F87171", fontSize: 12 }}
            />
            {categories.map((cat) => (
              <Line
                key={cat.id}
                type="monotone"
                dataKey={cat.id}
                stroke={cat.color}
                strokeWidth={2}
                dot={{ r: 5 }}
                activeDot={{ r: 8 }}
                name={cat.name}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Timeline Point Editor */}
      <div className="glass-panel p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-bia-text-primary">
            Edit Timeline Points
          </h3>
          <p className="text-sm text-bia-text-tertiary mt-1">
            Hover over the <Info className="w-3 h-3 inline" /> icon to see what
            each impact level means at that time
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="text-left text-xs text-bia-text-secondary uppercase">
                <th className="p-2">Time</th>
                {categories.map((cat) => (
                  <th key={cat.id} className="p-2 min-w-[180px]">
                    <div className="flex items-center gap-1">
                      <div
                        className="w-2 h-2 rounded"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {localData.map((point, idx) => {
                const timelinePointId = timelinePoints[idx]?.id;
                const timeLabel = point.timeLabel;
                return (
                  <tr
                    key={idx}
                    className="border-t border-bia-border hover:bg-white/5">
                    <td className="p-2 text-bia-text-primary font-medium whitespace-nowrap">
                      {timeLabel}
                    </td>
                    {categories.map((cat) => {
                      const isHovered =
                        hoveredCell?.idx === idx &&
                        hoveredCell?.catId === cat.id;
                      const definition = timelinePointId
                        ? getTimeBasedDefinition(cat.id, timelinePointId)
                        : null;
                      return (
                        <td
                          key={cat.id}
                          className="p-2 relative min-w-[180px]"
                          onMouseEnter={() =>
                            setHoveredCell({ idx, catId: cat.id })
                          }
                          onMouseLeave={() => setHoveredCell(null)}>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min="0"
                              max="5"
                              value={(point[cat.id] as number) || 0}
                              onChange={(e) =>
                                handleSliderChange(
                                  idx,
                                  cat.id,
                                  parseInt(e.target.value),
                                )
                              }
                              className="w-40 h-1.5 accent-bia-primary bg-white/10 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-bia-text-primary w-4 font-bold">
                              {point[cat.id] || 0}
                            </span>
                            {definition && (
                              <Info className="w-4 h-4 text-bia-info cursor-help shrink-0" />
                            )}
                          </div>
                          {/* Enhanced tooltip with formatted content */}
                          {isHovered && definition && (
                            <div className="absolute z-20 left-0 top-full mt-1 p-3 bg-slate-800/95 border border-white/20 rounded-lg shadow-xl max-w-[280px]">
                              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                                <div
                                  className="w-3 h-3 rounded"
                                  style={{ backgroundColor: cat.color }}
                                />
                                <span className="text-white font-semibold text-sm">
                                  {cat.name}
                                </span>
                                <span className="text-slate-400 text-xs">
                                  at {timeLabel}
                                </span>
                              </div>
                              <p className="text-slate-200 text-sm leading-relaxed">
                                {definition}
                              </p>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <button
          onClick={handleSave}
          className="glass-button-solid flex items-center gap-2">
          <Save className="w-4 h-4" /> {saved ? "Saved!" : "Save Timeline"}
        </button>
      </div>
    </div>
  );
}
