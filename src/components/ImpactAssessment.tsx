import { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { DEFAULT_IMPACT_CATEGORIES } from "../types";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { ChevronLeft, Save } from "lucide-react";

export function ImpactAssessment() {
  const {
    processes,
    selectedProcessId,
    setSelectedProcessId,
    impacts,
    updateImpact,
    updateProcess,
    getProcessById,
    settings,
  } = useStore();
  const [localImpact, setLocalImpact] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const process = selectedProcessId ? getProcessById(selectedProcessId) : null;
  const categories = settings.impactCategories || DEFAULT_IMPACT_CATEGORIES;

  useEffect(() => {
    if (selectedProcessId && impacts[selectedProcessId]) {
      const impact = impacts[selectedProcessId] as unknown as Record<
        string,
        number
      >;
      // Normalize values to 1-5 scale
      const normalized: Record<string, number> = {};
      Object.entries(impact).forEach(([key, value]) => {
        normalized[key] = normalizeValue(value);
      });
      setLocalImpact(normalized);
    } else {
      // Initialize with zeros for all categories
      const initial: Record<string, number> = {};
      categories.forEach((c) => (initial[c.id] = 0));
      setLocalImpact(initial);
    }
  }, [selectedProcessId, impacts, categories]);

  const handleSliderChange = (key: string, value: number) => {
    setLocalImpact({ ...localImpact, [key]: value });
    setSaved(false);
  };

  const calculateCriticality = (
    impacts: Record<string, number>,
  ): "critical" | "high" | "medium" | "low" | "minimal" => {
    const values = Object.values(impacts).filter((v) => v > 0);
    if (values.length === 0) return "minimal";

    const average = values.reduce((sum, v) => sum + v, 0) / values.length;

    if (average >= 4) return "critical";
    if (average >= 3) return "high";
    if (average >= 2) return "medium";
    if (average >= 1) return "low";
    return "minimal";
  };

  const handleSave = async () => {
    if (selectedProcessId) {
      // Ensure all values are integers 0-5
      const integerImpacts: Record<string, number> = {};
      Object.entries(localImpact).forEach(([key, value]) => {
        integerImpacts[key] = Math.round(Math.max(0, Math.min(5, value)));
      });

      updateImpact(selectedProcessId, integerImpacts as any);

      // Update process criticality based on impact scores
      const newCriticality = calculateCriticality(integerImpacts);
      updateProcess(selectedProcessId, { criticality: newCriticality });

      // Persist to database
      try {
        await fetch(
          `http://localhost:3001/api/processes/${selectedProcessId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ criticality: newCriticality }),
          },
        );
      } catch (error) {
        console.error("Failed to save criticality to database:", error);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  // Normalize impact values to 0-5 integer scale (in case they're stored as 0-100)
  const normalizeValue = (value: number): number => {
    if (value === 0) return 0;
    if (value > 5) {
      // If value is > 5, assume it's on 0-100 scale and convert to 0-5
      return Math.round((value / 100) * 5);
    }
    return Math.round(value);
  };

  const radarData = categories.map((c) => ({
    dimension: c.name,
    value: normalizeValue(localImpact[c.id] || 0),
    fullMark: 5,
  }));

  const getScoreColor = (score: number) => {
    if (score >= 4) return "text-bia-critical";
    if (score >= 3) return "text-bia-warning";
    if (score >= 2) return "text-bia-info";
    return "text-bia-success";
  };

  const getTimeBasedHint = (categoryId: string, score: number) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category || score === 0) return null;
    // Find appropriate definition based on score
    const timeline = settings.customTimelinePoints || [];
    const defIndex = Math.min(score, category.timeBasedDefinitions.length - 1);
    return category.timeBasedDefinitions[defIndex]?.description;
  };

  if (!selectedProcessId) {
    return (
      <div className="animate-fade-in space-y-6">
        <h1 className="text-3xl font-bold text-bia-text-primary">
          Impact Assessment
        </h1>
        <p className="text-bia-text-secondary">
          Select a process to assess its business impact
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {processes.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProcessId(p.id)}
              className="glass-panel-hover p-6 text-left">
              <h3 className="text-lg font-semibold text-bia-text-primary">
                {p.name}
              </h3>
              <p className="text-sm text-bia-text-secondary mt-1">
                {p.department}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium criticality-${p.criticality}`}>
                  {p.criticality}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSelectedProcessId(null)}
          className="p-2 hover:bg-bia-glass-hover rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5 text-bia-text-secondary" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-bia-text-primary">
            Impact Assessment
          </h1>
          <p className="text-bia-text-secondary mt-1">
            Assessing: {process?.name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sliders */}
        <div className="glass-panel p-6 space-y-6">
          <h2 className="text-xl font-semibold text-bia-text-primary">
            Impact Dimensions
          </h2>
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="space-y-2"
              onMouseEnter={() => setHoveredCategory(cat.id)}
              onMouseLeave={() => setHoveredCategory(null)}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: cat.color }}
                  />
                  <div>
                    <label className="text-bia-text-primary font-medium">
                      {cat.name}
                    </label>
                    <p className="text-xs text-bia-text-tertiary">
                      {cat.description}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-2xl font-bold ${getScoreColor(localImpact[cat.id] || 0)}`}>
                  {localImpact[cat.id] || 0}
                </span>
              </div>
              <div className="relative">
                {/* Tooltip above slider */}
                {hoveredCategory === cat.id &&
                  getTimeBasedHint(cat.id, localImpact[cat.id] || 0) && (
                    <div className="absolute -top-10 left-0 right-0 bg-bia-info text-white text-xs rounded px-2 py-1 whitespace-nowrap text-center pointer-events-none z-10">
                      {getTimeBasedHint(cat.id, localImpact[cat.id] || 0)}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-bia-info"></div>
                    </div>
                  )}
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="1"
                  value={localImpact[cat.id] || 0}
                  onChange={(e) =>
                    handleSliderChange(cat.id, parseInt(e.target.value))
                  }
                  className="w-full h-2 bg-[rgba(255,255,255,0.1)] rounded-lg appearance-none cursor-pointer accent-bia-primary"
                />
              </div>
              <div className="flex justify-between text-xs text-bia-text-tertiary">
                <span>0</span>
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
              </div>
            </div>
          ))}
          <button
            onClick={handleSave}
            className="glass-button-solid w-full flex items-center justify-center gap-2">
            <Save className="w-4 h-4" />
            {saved ? "Saved!" : "Save Assessment"}
          </button>
        </div>

        {/* Radar Chart */}
        <div className="glass-panel p-6">
          <h2 className="text-xl font-semibold text-bia-text-primary mb-4">
            Impact Profile
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis
                dataKey="dimension"
                stroke="#94A3B8"
                tick={{ fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 5]}
                tick={{ fontSize: 10 }}
                stroke="#64748B"
              />
              <Radar
                name="Impact"
                dataKey="value"
                stroke="#38BDF8"
                fill="#38BDF8"
                fillOpacity={0.4}
                strokeWidth={2}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(30, 41, 59, 0.9)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div key={cat.id} className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <div
                    className="w-2 h-2 rounded"
                    style={{ backgroundColor: cat.color }}
                  />
                  <p className="text-xs text-bia-text-tertiary">{cat.name}</p>
                </div>
                <p
                  className={`text-lg font-bold ${getScoreColor(localImpact[cat.id] || 0)}`}>
                  {localImpact[cat.id] || 0}/5
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
