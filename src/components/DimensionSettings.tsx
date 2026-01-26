import React, { useState, useEffect } from "react";
import { X, Save, RotateCcw, TrendingUp } from "lucide-react";
import { DimensionSetting, DEFAULT_DIMENSION_TARGETS, INDUSTRY_PRESETS } from "../types";

interface DimensionSettingsProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (settings: Record<string, DimensionSetting>) => void;
    currentSettings?: Record<string, DimensionSetting>;
}

const DIMENSIONS = [
    "Coverage Maturity",
    "Capability Maturity",
    "Readiness Maturity",
    "Compliance Maturity",
    "Risk Management",
];

export default function DimensionSettings({
    isOpen,
    onClose,
    onSave,
    currentSettings = {},
}: DimensionSettingsProps) {
    const [settings, setSettings] = useState<Record<string, DimensionSetting>>({});
    const [activeTab, setActiveTab] = useState<"targets" | "weighting">("targets");
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        // Initialize with current settings or defaults
        const initialSettings: Record<string, DimensionSetting> = {};
        DIMENSIONS.forEach((dim) => {
            initialSettings[dim] = currentSettings[dim] || {
                targetLevel: DEFAULT_DIMENSION_TARGETS[dim]?.targetLevel || 5,
                businessContext: DEFAULT_DIMENSION_TARGETS[dim]?.businessContext || "",
                timeline: DEFAULT_DIMENSION_TARGETS[dim]?.timeline || "Q4 2026",
                owner: DEFAULT_DIMENSION_TARGETS[dim]?.owner || "",
                successCriteria: DEFAULT_DIMENSION_TARGETS[dim]?.successCriteria || "",
                weight: DEFAULT_DIMENSION_TARGETS[dim]?.weight || 0.2,
            };
        });
        setSettings(initialSettings);
    }, [currentSettings, isOpen]);

    const handleSave = () => {
        onSave(settings);
        setHasChanges(false);
    };

    const handleReset = () => {
        const defaultSettings: Record<string, DimensionSetting> = {};
        DIMENSIONS.forEach((dim) => {
            defaultSettings[dim] = {
                targetLevel: DEFAULT_DIMENSION_TARGETS[dim]?.targetLevel || 5,
                businessContext: DEFAULT_DIMENSION_TARGETS[dim]?.businessContext || "",
                timeline: DEFAULT_DIMENSION_TARGETS[dim]?.timeline || "Q4 2026",
                owner: DEFAULT_DIMENSION_TARGETS[dim]?.owner || "",
                successCriteria: DEFAULT_DIMENSION_TARGETS[dim]?.successCriteria || "",
                weight: DEFAULT_DIMENSION_TARGETS[dim]?.weight || 0.2,
            };
        });
        setSettings(defaultSettings);
        setHasChanges(true);
    };

    const handleApplyPreset = (industry: string) => {
        const weights = INDUSTRY_PRESETS[industry] || INDUSTRY_PRESETS.default;
        const updatedSettings = { ...settings };
        Object.entries(weights).forEach(([dim, weight]) => {
            if (updatedSettings[dim]) {
                updatedSettings[dim] = { ...updatedSettings[dim], weight };
            }
        });
        setSettings(updatedSettings);
        setHasChanges(true);
    };

    const updateDimension = (dimension: string, field: keyof DimensionSetting, value: any) => {
        setSettings((prev) => ({
            ...prev,
            [dimension]: {
                ...prev[dimension],
                [field]: value,
            },
        }));
        setHasChanges(true);
    };

    const totalWeight = Object.values(settings).reduce((sum, s) => sum + (s.weight || 0), 0);
    const weightError = Math.abs(totalWeight - 1.0) > 0.01;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <TrendingUp className="w-6 h-6 text-blue-400" />
                            Maturity Dimension Settings
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">
                            Define your organization's maturity targets and business context
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-800 px-6">
                    <button
                        onClick={() => setActiveTab("targets")}
                        className={`px-4 py-3 font-medium transition-colors border-b-2 ${activeTab === "targets"
                                ? "text-blue-400 border-blue-400"
                                : "text-gray-400 border-transparent hover:text-gray-300"
                            }`}
                    >
                        Dimension Targets
                    </button>
                    <button
                        onClick={() => setActiveTab("weighting")}
                        className={`px-4 py-3 font-medium transition-colors border-b-2 ${activeTab === "weighting"
                                ? "text-blue-400 border-blue-400"
                                : "text-gray-400 border-transparent hover:text-gray-300"
                            }`}
                    >
                        Weighting
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === "targets" && (
                        <div className="space-y-6">
                            {DIMENSIONS.map((dimension) => (
                                <div
                                    key={dimension}
                                    className="bg-gray-800 rounded-lg p-6 border border-gray-700"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-white">{dimension}</h3>
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm text-gray-400">Target Level:</label>
                                            <select
                                                value={settings[dimension]?.targetLevel || 5}
                                                onChange={(e) =>
                                                    updateDimension(dimension, "targetLevel", parseInt(e.target.value))
                                                }
                                                className="bg-gray-700 text-white rounded px-3 py-1 border border-gray-600 focus:border-blue-500 focus:outline-none"
                                            >
                                                {[1, 2, 3, 4, 5].map((level) => (
                                                    <option key={level} value={level}>
                                                        Level {level}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Timeline
                                            </label>
                                            <input
                                                type="text"
                                                value={settings[dimension]?.timeline || ""}
                                                onChange={(e) => updateDimension(dimension, "timeline", e.target.value)}
                                                placeholder="e.g., Q4 2026"
                                                className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Owner
                                            </label>
                                            <input
                                                type="text"
                                                value={settings[dimension]?.owner || ""}
                                                onChange={(e) => updateDimension(dimension, "owner", e.target.value)}
                                                placeholder="e.g., BC Coordinator"
                                                className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            Business Context
                                        </label>
                                        <textarea
                                            value={settings[dimension]?.businessContext || ""}
                                            onChange={(e) =>
                                                updateDimension(dimension, "businessContext", e.target.value)
                                            }
                                            placeholder="Why this dimension matters to your organization..."
                                            rows={2}
                                            className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                                        />
                                    </div>

                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            Success Criteria
                                        </label>
                                        <textarea
                                            value={settings[dimension]?.successCriteria || ""}
                                            onChange={(e) =>
                                                updateDimension(dimension, "successCriteria", e.target.value)
                                            }
                                            placeholder="How will you measure success..."
                                            rows={2}
                                            className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === "weighting" && (
                        <div className="space-y-6">
                            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                                <h3 className="text-lg font-semibold text-white mb-4">Industry Presets</h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    Apply industry-standard weights based on your sector
                                </p>
                                <div className="grid grid-cols-3 gap-3">
                                    {Object.keys(INDUSTRY_PRESETS).map((industry) => (
                                        <button
                                            key={industry}
                                            onClick={() => handleApplyPreset(industry)}
                                            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors capitalize"
                                        >
                                            {industry}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                                <h3 className="text-lg font-semibold text-white mb-4">Custom Weights</h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    Adjust the importance of each dimension (must total 100%)
                                </p>

                                <div className="space-y-4">
                                    {DIMENSIONS.map((dimension) => (
                                        <div key={dimension}>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-sm font-medium text-gray-300">{dimension}</label>
                                                <span className="text-sm text-gray-400">
                                                    {Math.round((settings[dimension]?.weight || 0) * 100)}%
                                                </span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={Math.round((settings[dimension]?.weight || 0) * 100)}
                                                onChange={(e) =>
                                                    updateDimension(dimension, "weight", parseInt(e.target.value) / 100)
                                                }
                                                className="w-full"
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 p-4 bg-gray-700 rounded">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-300">Total Weight:</span>
                                        <span
                                            className={`text-sm font-bold ${weightError ? "text-red-400" : "text-green-400"
                                                }`}
                                        >
                                            {Math.round(totalWeight * 100)}%
                                        </span>
                                    </div>
                                    {weightError && (
                                        <p className="text-xs text-red-400 mt-2">
                                            Weights must total 100%. Please adjust.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-800">
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset to Defaults
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={weightError}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white px-6 py-2 rounded transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            Save Settings
                        </button>
                    </div>
                </div>

                {hasChanges && (
                    <div className="absolute top-4 right-20 bg-yellow-600 text-white px-3 py-1 rounded text-sm">
                        Unsaved changes
                    </div>
                )}
            </div>
        </div>
    );
}
