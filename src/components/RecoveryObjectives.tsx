import { useState, useEffect, useMemo } from "react";
import { useStore } from "../store/useStore";
import { RecoveryObjective, RecoveryStrategy } from "../types";
import {
  Clock,
  Target,
  Database,
  Save,
  ChevronLeft,
  AlertCircle,
  Lightbulb,
  DollarSign,
} from "lucide-react";
import { Tooltip } from "./Tooltip";

const STRATEGY_OPTIONS: {
  value: RecoveryStrategy;
  label: string;
  description: string;
  maxRTO: number;
  cost: number;
}[] = [
  {
    value: "high-availability",
    label: "High Availability",
    description: "Active-active with automatic failover",
    maxRTO: 1,
    cost: 5,
  },
  {
    value: "warm-standby",
    label: "Warm Standby",
    description: "Secondary system with quick activation",
    maxRTO: 8,
    cost: 3,
  },
  {
    value: "cloud-based",
    label: "Cloud-Based",
    description: "Cloud infrastructure for rapid recovery",
    maxRTO: 4,
    cost: 3,
  },
  {
    value: "cold-backup",
    label: "Cold Backup",
    description: "Backup available for manual recovery",
    maxRTO: 24,
    cost: 2,
  },
  {
    value: "manual",
    label: "Manual Workaround",
    description: "Manual processes as fallback",
    maxRTO: 72,
    cost: 1,
  },
];

export function RecoveryObjectives() {
  const {
    processes,
    selectedProcessId,
    setSelectedProcessId,
    recoveryObjectives,
    updateRecoveryObjective,
    getProcessById,
    impacts,
    calculateRiskScore,
  } = useStore();
  const [local, setLocal] = useState<RecoveryObjective>({
    mtpd: 24,
    rto: 12,
    rpo: 4,
    mbco: false,
    recoveryStrategy: "warm-standby",
    strategyNotes: "",
  });
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const process = selectedProcessId ? getProcessById(selectedProcessId) : null;
  const impact = selectedProcessId ? impacts[selectedProcessId] : null;
  const riskScore = selectedProcessId
    ? calculateRiskScore(selectedProcessId)
    : 0;

  useEffect(() => {
    if (selectedProcessId && recoveryObjectives[selectedProcessId]) {
      setLocal(recoveryObjectives[selectedProcessId]);
    }
  }, [selectedProcessId, recoveryObjectives]);

  const recommendedStrategy = useMemo(() => {
    if (local.rto <= 1) return "high-availability";
    if (local.rto <= 4) return "cloud-based";
    if (local.rto <= 8) return "warm-standby";
    if (local.rto <= 24) return "cold-backup";
    return "manual";
  }, [local.rto]);

  const strategyGap = useMemo(() => {
    const current = STRATEGY_OPTIONS.find(
      (s) => s.value === local.recoveryStrategy,
    );
    if (!current) return null;
    if (local.rto < current.maxRTO) return null;
    return `Current strategy may not meet RTO of ${local.rto}h. Consider ${recommendedStrategy}.`;
  }, [local.rto, local.recoveryStrategy, recommendedStrategy]);

  const validate = (): boolean => {
    const errs: string[] = [];
    // Only validate strategy notes - MTPD, RTO, RPO are calculated and read-only
    setErrors(errs);
    return errs.length === 0;
  };

  const handleSave = () => {
    if (validate() && selectedProcessId) {
      updateRecoveryObjective(selectedProcessId, local);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  if (!selectedProcessId) {
    return (
      <div className="animate-fade-in space-y-6">
        <h1 className="text-3xl font-bold text-bia-text-primary">
          Recovery Objectives
        </h1>
        <p className="text-bia-text-secondary">
          Select a process to configure recovery objectives
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
              {recoveryObjectives[p.id] && (
                <div className="flex gap-4 mt-3 text-xs">
                  <span className="text-bia-primary">
                    MTPD: {recoveryObjectives[p.id].mtpd}h
                  </span>
                  <span className="text-bia-secondary">
                    RTO: {recoveryObjectives[p.id].rto}h
                  </span>
                  <span className="text-bia-info">
                    RPO: {recoveryObjectives[p.id].rpo}h
                  </span>
                </div>
              )}
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
            Recovery Objectives
          </h1>
          <p className="text-bia-text-secondary mt-1">
            Configuring: {process?.name}
          </p>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="glass-panel p-4 border-l-4 border-bia-critical bg-bia-critical/10">
          <div className="flex items-center gap-2 text-bia-critical">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Validation Errors</span>
          </div>
          <ul className="mt-2 text-sm text-bia-critical/80 list-disc list-inside">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Strategy Recommendation */}
      {strategyGap && (
        <div className="glass-panel p-4 border-l-4 border-bia-warning bg-bia-warning/10">
          <div className="flex items-center gap-2 text-bia-warning">
            <Lightbulb className="w-5 h-5" />
            <span className="font-medium">Strategy Recommendation</span>
          </div>
          <p className="mt-2 text-sm text-bia-text-secondary">{strategyGap}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MTPD */}
        <div className="glass-panel p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-bia-md bg-bia-critical/20">
              <Clock className="w-6 h-6 text-bia-critical" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-bia-text-primary">
                  MTPD
                </h3>
                <Tooltip content="Maximum Tolerable Period of Disruption: Calculated from temporal analysis. Edit values in the Temporal Analysis tab to recalculate." />
              </div>
              <p className="text-xs text-bia-text-tertiary">
                Maximum Tolerable Period (Calculated)
              </p>
            </div>
          </div>
          <div className="text-2xl font-bold text-center text-bia-critical py-3">
            {local.mtpd}
          </div>
          <p className="text-center text-bia-text-secondary mt-2">hours</p>
        </div>

        {/* RTO */}
        <div className="glass-panel p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-bia-md bg-bia-warning/20">
              <Target className="w-6 h-6 text-bia-warning" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-bia-text-primary">
                  RTO
                </h3>
                <Tooltip content="Recovery Time Objective: Calculated from temporal analysis. Edit values in the Temporal Analysis tab to recalculate." />
              </div>
              <p className="text-xs text-bia-text-tertiary">
                Recovery Time Objective (Calculated)
              </p>
            </div>
          </div>
          <div className="text-2xl font-bold text-center text-bia-warning py-3">
            {local.rto}
          </div>
          <p className="text-center text-bia-text-secondary mt-2">hours</p>
        </div>

        {/* RPO */}
        <div className="glass-panel p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-bia-md bg-bia-info/20">
              <Database className="w-6 h-6 text-bia-info" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-bia-text-primary">
                  RPO
                </h3>
                <Tooltip content="Recovery Point Objective: Calculated from temporal analysis. Edit values in the Temporal Analysis tab to recalculate." />
              </div>
              <p className="text-xs text-bia-text-tertiary">
                Recovery Point Objective (Calculated)
              </p>
            </div>
          </div>
          <div className="text-2xl font-bold text-center text-bia-info py-3">
            {local.rpo}
          </div>
          <p className="text-center text-bia-text-secondary mt-2">hours</p>
        </div>
      </div>

      {/* Strategy */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-bia-text-primary">
            Recovery Strategy
          </h3>
          <span className="text-sm text-bia-text-tertiary">
            Recommended:{" "}
            <span className="text-bia-primary capitalize">
              {recommendedStrategy.replace("-", " ")}
            </span>
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {STRATEGY_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => setLocal({ ...local, recoveryStrategy: s.value })}
              className={`p-4 rounded-bia-md border text-left transition-all ${local.recoveryStrategy === s.value ? "border-bia-primary bg-bia-glass-active" : "border-bia-border hover:border-bia-primary/50"} ${s.value === recommendedStrategy ? "ring-1 ring-bia-success/50" : ""}`}>
              <h4 className="font-medium text-bia-text-primary">{s.label}</h4>
              <p className="text-xs text-bia-text-tertiary mt-1">
                {s.description}
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="text-bia-text-tertiary">
                  RTO: &lt;{s.maxRTO}h
                </span>
                <div className="flex items-center gap-1 text-bia-warning">
                  <DollarSign className="w-3 h-3" />
                  <span>{"$".repeat(s.cost)}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div>
          <label className="block text-sm text-bia-text-secondary mb-2">
            Strategy Notes
          </label>
          <textarea
            className="glass-input w-full h-24 resize-none"
            value={local.strategyNotes}
            onChange={(e) =>
              setLocal({ ...local, strategyNotes: e.target.value })
            }
            placeholder="Additional notes about the recovery strategy..."
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="mbco"
            checked={local.mbco}
            onChange={(e) => setLocal({ ...local, mbco: e.target.checked })}
            className="w-4 h-4 rounded accent-bia-primary"
          />
          <label htmlFor="mbco" className="text-bia-text-primary">
            Minimum Business Continuity Objective (MBCO) Applicable
          </label>
          <Tooltip content="MBCO indicates this process requires minimum functionality during disruption" />
        </div>

        <button
          onClick={handleSave}
          className="glass-button-solid w-full flex items-center justify-center gap-2 mt-4">
          <Save className="w-4 h-4" />
          {saved ? "Saved!" : "Save Strategy"}
        </button>
      </div>
    </div>
  );
}
