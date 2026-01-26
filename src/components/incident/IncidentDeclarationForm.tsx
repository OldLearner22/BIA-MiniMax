import React, { useState } from "react";
import { X, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { useStore } from "../../store/useStore";
import {
  IncidentCategory,
  IncidentSeverity,
  ImpactArea,
} from "../../types/incident";

interface IncidentDeclarationFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const IncidentDeclarationForm: React.FC<IncidentDeclarationFormProps> = ({
  onClose,
  onSuccess,
}) => {
  const createIncident = useStore((state) => state.createIncident);
  const processes = useStore((state) => state.processes);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "TECHNICAL_FAILURE" as IncidentCategory,
    severity: "MEDIUM" as IncidentSeverity,
    impactAreas: [] as ImpactArea[],
    businessImpact: "",
    affectedProcessIds: [] as string[],
    affectedLocations: [] as string[],
    affectedSystems: [] as string[],
    initialResponseActions: "",
    estimatedFinancialImpact: undefined as number | undefined,
    reportedBy: "Current User", // TODO: Get from auth context
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const severityConfig = {
    CRITICAL: {
      color: "bg-red-500/20 hover:bg-red-500/30 border-red-500/40 text-red-300",
      icon: AlertTriangle,
      label: "Critical",
      description: "Catastrophic disruption, severe impact",
    },
    HIGH: {
      color:
        "bg-orange-500/20 hover:bg-orange-500/30 border-orange-500/40 text-orange-300",
      icon: AlertCircle,
      label: "High",
      description: "Major disruption, substantial impact",
    },
    MEDIUM: {
      color:
        "bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500/40 text-yellow-300",
      icon: Info,
      label: "Medium",
      description: "Significant disruption, some impact",
    },
    LOW: {
      color:
        "bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/40 text-blue-300",
      icon: Info,
      label: "Low",
      description: "Minor disruption, minimal impact",
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.businessImpact.trim())
      newErrors.businessImpact = "Business impact is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      await createIncident(formData);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to create incident:", error);
      setErrors({
        submit: "Failed to create incident. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleImpactArea = (area: ImpactArea) => {
    setFormData((prev) => ({
      ...prev,
      impactAreas: prev.impactAreas.includes(area)
        ? prev.impactAreas.filter((a) => a !== area)
        : [...prev.impactAreas, area],
    }));
  };

  const toggleProcess = (processId: string) => {
    setFormData((prev) => ({
      ...prev,
      affectedProcessIds: prev.affectedProcessIds.includes(processId)
        ? prev.affectedProcessIds.filter((id) => id !== processId)
        : [...prev.affectedProcessIds, processId],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-panel max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-red-600/20 backdrop-blur-md text-bia-text-primary px-6 py-4 flex items-center justify-between z-10 border-b border-white/10">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 animate-pulse text-red-400" />
            <h2 className="text-xl font-bold">🚨 DECLARE INCIDENT</h2>
          </div>
          <button
            onClick={onClose}
            className="text-bia-text-primary hover:bg-white/10 rounded p-1 transition-colors"
            disabled={submitting}
            title="Close form"
            aria-label="Close form">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded">
              {errors.submit}
            </div>
          )}

          {/* Critical Information */}
          <section className="border-l-4 border-red-500 pl-4 bg-red-500/10 p-4 rounded-r">
            <h3 className="text-lg font-semibold mb-4 text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Critical Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Severity Selection */}
              <div>
                <label className="block text-sm font-medium text-bia-text-secondary mb-2">
                  Severity Level *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(severityConfig).map(([key, config]) => (
                    <button
                      key={key}
                      type="button"
                      title={`Severity: ${config.label}`}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          severity: key as IncidentSeverity,
                        })
                      }
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.severity === key
                          ? `${config.color} border-current`
                          : "glass-button border-white/20 hover:border-white/30"
                      }`}>
                      <config.icon className="w-6 h-6 mx-auto mb-1" />
                      <div className="font-semibold text-bia-text-primary">
                        {config.label}
                      </div>
                      <div className="text-xs text-bia-text-secondary opacity-75">
                        {config.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Selection */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-bia-text-secondary mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  title="Incident category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as IncidentCategory,
                    })
                  }
                  className="w-full glass-input">
                  <option value={IncidentCategory.TECHNICAL_FAILURE}>
                    Technical Failure
                  </option>
                  <option value={IncidentCategory.HUMAN_ERROR}>
                    Human Error
                  </option>
                  <option value={IncidentCategory.NATURAL_DISASTER}>
                    Natural Disaster
                  </option>
                  <option value={IncidentCategory.MALICIOUS_ACTIVITY}>
                    Malicious Activity
                  </option>
                  <option value={IncidentCategory.SUPPLY_CHAIN_DISRUPTION}>
                    Supply Chain Disruption
                  </option>
                  <option value={IncidentCategory.UTILITY_OUTAGE}>
                    Utility Outage
                  </option>
                  <option value={IncidentCategory.HEALTH_EMERGENCY}>
                    Health Emergency
                  </option>
                  <option value={IncidentCategory.OTHER}>Other</option>
                </select>
              </div>
            </div>
          </section>

          {/* Detailed Information */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-bia-text-primary">
              Incident Details
            </h3>
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-bia-text-secondary mb-1">
                  Incident Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full glass-input"
                  placeholder="Brief description of the incident"
                />
                {errors.title && (
                  <p className="text-red-400 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-bia-text-secondary mb-1">
                  Detailed Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full glass-input"
                  placeholder="Describe what happened, when, and where"
                />
                {errors.description && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Initial Response Actions */}
              <div>
                <label className="block text-sm font-medium text-bia-text-secondary mb-1">
                  Immediate Actions Taken *
                </label>
                <textarea
                  value={formData.initialResponseActions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      initialResponseActions: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full glass-input"
                  placeholder="Immediate response actions taken"
                />
              </div>
            </div>
          </section>

          {/* Impact Areas */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-bia-text-primary">
              Impact Assessment
            </h3>
            <div>
              <label className="block text-sm font-medium text-bia-text-secondary mb-2">
                Affected Areas *
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.values(ImpactArea).map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => toggleImpactArea(area)}
                    className={`px-4 py-2 rounded-md border-2 transition-all ${
                      formData.impactAreas.includes(area)
                        ? "bg-blue-500/20 border-blue-400 text-blue-300"
                        : "glass-button hover:bg-blue-500/10"
                    }`}>
                    {area.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Business Impact */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-bia-text-secondary mb-1">
                Business Impact Description *
              </label>
              <textarea
                value={formData.businessImpact}
                onChange={(e) =>
                  setFormData({ ...formData, businessImpact: e.target.value })
                }
                rows={3}
                className="w-full glass-input"
                placeholder="Describe the impact on business operations"
              />
              {errors.businessImpact && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.businessImpact}
                </p>
              )}
            </div>

            {/* Estimated Financial Impact */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-bia-text-secondary mb-1">
                Estimated Financial Impact ($)
              </label>
              <input
                type="number"
                value={formData.estimatedFinancialImpact || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimatedFinancialImpact: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
                className="w-full glass-input"
                placeholder="0.00"
              />
            </div>
          </section>

          {/* Affected Processes */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-bia-text-primary">
              Affected Processes
            </h3>
            <div>
              <label className="block text-sm font-medium text-bia-text-secondary mb-2">
                Select Affected Processes
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {processes.map((process) => (
                  <button
                    key={process.id}
                    type="button"
                    onClick={() => toggleProcess(process.id)}
                    className={`p-3 rounded-md border-2 text-left transition-all ${
                      formData.affectedProcessIds.includes(process.id)
                        ? "bg-blue-500/20 border-blue-400"
                        : "glass-button hover:bg-blue-500/10"
                    }`}>
                    <div className="font-medium text-sm text-bia-text-primary">
                      {process.name}
                    </div>
                    <div className="text-xs text-bia-text-tertiary mt-1">
                      {process.department}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Affected Locations and Systems */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Affected Locations */}
            <div>
              <label className="block text-sm font-medium text-bia-text-secondary mb-1">
                Affected Locations
              </label>
              <textarea
                value={formData.affectedLocations.join("\n")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    affectedLocations: e.target.value
                      .split("\n")
                      .filter(Boolean),
                  })
                }
                rows={4}
                className="w-full glass-input"
                placeholder="One location per line"
              />
            </div>

            {/* Affected Systems */}
            <div>
              <label className="block text-sm font-medium text-bia-text-secondary mb-1">
                Affected Systems
              </label>
              <textarea
                value={formData.affectedSystems.join("\n")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    affectedSystems: e.target.value.split("\n").filter(Boolean),
                  })
                }
                rows={4}
                className="w-full glass-input"
                placeholder="One system per line"
              />
            </div>
          </section>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="glass-button"
              disabled={submitting}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-6 py-2 rounded-md text-white font-medium transition-colors ${
                submitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }`}>
              {submitting ? "Declaring..." : "🚨 Declare Incident"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncidentDeclarationForm;
