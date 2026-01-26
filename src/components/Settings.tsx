import { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import {
  Settings as SettingsType,
  DEFAULT_SETTINGS,
  CustomTimelinePoint,
  DEFAULT_CUSTOM_TIMELINE_POINTS,
  ImpactCategory,
  DEFAULT_IMPACT_CATEGORIES,
  BusinessResource,
  RESOURCE_TYPES,
  DEFAULT_BUSINESS_RESOURCES,
  TimeValue,
  TimeUnit,
} from "../types";

// Fallback in case RESOURCE_TYPES is undefined
const SAFE_RESOURCE_TYPES = RESOURCE_TYPES || [
  { value: "personnel" as const, label: "Personnel" },
  { value: "systems" as const, label: "Systems/Applications" },
  { value: "equipment" as const, label: "Equipment" },
  { value: "facilities" as const, label: "Facilities" },
  { value: "vendors" as const, label: "Vendors/Suppliers" },
  { value: "data" as const, label: "Data/Records" },
];
import {
  Save,
  RotateCcw,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  HelpCircle,
  BookOpen,
  Plus,
  Clock,
  Edit2,
  X,
  Layers,
  ChevronDown,
  ChevronUp,
  Package,
} from "lucide-react";

export function Settings() {
  const {
    settings,
    updateSettings,
    exportData,
    importData,
    clearAllData,
    toggleGlossary,
  } = useStore();
  const [localSettings, setLocalSettings] = useState<SettingsType>(settings);
  const [saved, setSaved] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState(false);

  // Load impact categories from database on mount
  useEffect(() => {
    const loadImpactCategories = async () => {
      try {
        const response = await fetch(
          "http://localhost:3001/api/impact-categories",
        );
        if (response.ok) {
          const categories = await response.json();
          if (categories.length > 0) {
            // Map database format to app format
            const mappedCategories = categories.map((cat: any) => ({
              id: cat.id,
              name: cat.name,
              description: cat.description,
              weight: cat.weight,
              color: cat.color,
              timeBasedDefinitions: cat.timeBasedDefinitions || [],
            }));
            setLocalSettings((prev) => ({
              ...prev,
              impactCategories: mappedCategories,
            }));
            updateSettings({ impactCategories: mappedCategories });
          }
        }
      } catch (error) {
        console.error("Error loading impact categories:", error);
        // Fall back to default categories if database load fails
      }
    };

    loadImpactCategories();
  }, [updateSettings]);

  const handleSave = async () => {
    // Validate impact category weights must sum to 100%
    const totalWeight = (
      localSettings.impactCategories || DEFAULT_IMPACT_CATEGORIES
    ).reduce((sum, cat) => sum + (cat.weight || 0), 0);

    if (totalWeight !== 100) {
      alert(
        `Impact dimension weights must total 100%. Current total: ${totalWeight}%`,
      );
      return;
    }

    try {
      // Save impact categories to database
      const response = await fetch(
        "http://localhost:3001/api/impact-categories/bulk",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            categories:
              localSettings.impactCategories || DEFAULT_IMPACT_CATEGORIES,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to save to database: ${error.error}`);
        return;
      }

      updateSettings(localSettings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings to database");
    }
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_SETTINGS);
    updateSettings(DEFAULT_SETTINGS);
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bia-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (importData(result)) {
        setImportSuccess(true);
        setImportError("");
        setTimeout(() => setImportSuccess(false), 3000);
      } else {
        setImportError(
          "Invalid file format. Please use a valid BIA export file.",
        );
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    clearAllData();
    setShowClearConfirm(false);
  };

  const weights = localSettings.impactWeights;
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const [editingPoint, setEditingPoint] = useState<CustomTimelinePoint | null>(
    null,
  );
  const [newPoint, setNewPoint] = useState<Omit<CustomTimelinePoint, "id">>({
    label: "",
    value: 1,
    unit: "hours",
  });
  const [showAddPoint, setShowAddPoint] = useState(false);

  const handleAddTimelinePoint = () => {
    if (!newPoint.label.trim()) return;
    const point: CustomTimelinePoint = { ...newPoint, id: `ctp-${Date.now()}` };
    setLocalSettings({
      ...localSettings,
      customTimelinePoints: [
        ...(localSettings.customTimelinePoints || []),
        point,
      ],
    });
    setNewPoint({ label: "", value: 1, unit: "hours" });
    setShowAddPoint(false);
  };

  const handleUpdateTimelinePoint = (updated: CustomTimelinePoint) => {
    setLocalSettings({
      ...localSettings,
      customTimelinePoints: localSettings.customTimelinePoints.map((p) =>
        p.id === updated.id ? updated : p,
      ),
    });
    setEditingPoint(null);
  };

  const handleDeleteTimelinePoint = (id: string) => {
    setLocalSettings({
      ...localSettings,
      customTimelinePoints: localSettings.customTimelinePoints.filter(
        (p) => p.id !== id,
      ),
    });
  };

  const handleResetTimelinePoints = () => {
    setLocalSettings({
      ...localSettings,
      customTimelinePoints: DEFAULT_CUSTOM_TIMELINE_POINTS,
    });
  };

  // Impact Categories state
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<ImpactCategory | null>(
    null,
  );
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState<
    Omit<ImpactCategory, "id" | "timeBasedDefinitions">
  >({ name: "", description: "", weight: 10, color: "#818CF8" });

  const impactCategories =
    localSettings.impactCategories || DEFAULT_IMPACT_CATEGORIES;
  const timelinePoints =
    localSettings.customTimelinePoints || DEFAULT_CUSTOM_TIMELINE_POINTS;

  // Calculate total impact weight
  const totalImpactWeight = impactCategories.reduce(
    (sum, cat) => sum + (cat.weight || 0),
    0,
  );
  const hasWeightError = totalImpactWeight !== 100;

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) return;
    const cat: ImpactCategory = {
      ...newCategory,
      id: `cat-${Date.now()}`,
      timeBasedDefinitions: timelinePoints.map((tp) => ({
        timelinePointId: tp.id,
        description: "",
      })),
    };
    setLocalSettings({
      ...localSettings,
      impactCategories: [...impactCategories, cat],
    });
    setNewCategory({ name: "", description: "", weight: 10, color: "#818CF8" });
    setShowAddCategory(false);
  };

  const handleUpdateCategory = (updated: ImpactCategory) => {
    setLocalSettings({
      ...localSettings,
      impactCategories: impactCategories.map((c) =>
        c.id === updated.id ? updated : c,
      ),
    });
    setEditingCategory(null);
  };

  const handleDeleteCategory = (id: string) => {
    setLocalSettings({
      ...localSettings,
      impactCategories: impactCategories.filter((c) => c.id !== id),
    });
  };

  const handleUpdateDefinition = (
    categoryId: string,
    timelinePointId: string,
    description: string,
  ) => {
    setLocalSettings({
      ...localSettings,
      impactCategories: impactCategories.map((c) => {
        if (c.id !== categoryId) return c;
        const defs = c.timeBasedDefinitions.map((d) =>
          d.timelinePointId === timelinePointId ? { ...d, description } : d,
        );
        // Add missing timeline points
        timelinePoints.forEach((tp) => {
          if (!defs.find((d) => d.timelinePointId === tp.id)) {
            defs.push({ timelinePointId: tp.id, description: "" });
          }
        });
        return { ...c, timeBasedDefinitions: defs };
      }),
    });
  };

  const handleResetCategories = () => {
    setLocalSettings({
      ...localSettings,
      impactCategories: DEFAULT_IMPACT_CATEGORIES,
    });
  };

  // Business Resources state
  const [editingResource, setEditingResource] =
    useState<BusinessResource | null>(null);
  const [showAddResource, setShowAddResource] = useState(false);
  const [expandedResourceId, setExpandedResourceId] = useState<string | null>(
    null,
  );
  const [newResource, setNewResource] = useState<Omit<BusinessResource, "id">>({
    name: "",
    type: "systems",
    description: "",
    rto: { value: 4, unit: "hours" },
    rpo: { value: 1, unit: "hours" },
    quantityAtIntervals: {},
  });

  const formatTimeValue = (tv?: TimeValue) =>
    tv ? `${tv.value} ${tv.unit}` : "-";

  const businessResources =
    localSettings.businessResources || DEFAULT_BUSINESS_RESOURCES;

  const handleAddResource = () => {
    if (!newResource.name.trim()) return;
    const resource: BusinessResource = {
      ...newResource,
      id: `res-${Date.now()}`,
    };
    setLocalSettings({
      ...localSettings,
      businessResources: [...businessResources, resource],
    });
    setNewResource({ name: "", type: "systems", description: "" });
    setShowAddResource(false);
  };

  const handleUpdateResource = (updated: BusinessResource) => {
    setLocalSettings({
      ...localSettings,
      businessResources: businessResources.map((r) =>
        r.id === updated.id ? updated : r,
      ),
    });
    setEditingResource(null);
  };

  const handleDeleteResource = (id: string) => {
    setLocalSettings({
      ...localSettings,
      businessResources: businessResources.filter((r) => r.id !== id),
    });
  };

  const handleResetResources = () => {
    setLocalSettings({
      ...localSettings,
      businessResources: DEFAULT_BUSINESS_RESOURCES,
    });
  };

  const getResourceTypeLabel = (type: string) =>
    (SAFE_RESOURCE_TYPES &&
      SAFE_RESOURCE_TYPES.find((t) => t && t.value === type)?.label) ||
    type;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-bia-text-primary">Settings</h1>
          <p className="text-bia-text-secondary mt-1">
            Configure BIA Tool preferences and manage data
          </p>
        </div>
        <button
          onClick={toggleGlossary}
          className="glass-button flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> Open Glossary
        </button>
      </div>

      {/* Impact Weights - Note: Now managed via Impact Categories below */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-bia-text-primary">
            Impact Dimension Weights Summary
          </h3>
          <span
            className={`text-sm font-semibold ${totalImpactWeight === 100 ? "text-bia-success" : "text-bia-critical"}`}>
            Total: {totalImpactWeight}%
          </span>
        </div>
        {hasWeightError && (
          <div className="flex items-center gap-2 text-sm text-bia-critical bg-bia-critical/10 px-3 py-2 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
            <span>
              Impact dimension weights must total exactly 100%. Current total:{" "}
              {totalImpactWeight}%
            </span>
          </div>
        )}
        <p className="text-sm text-bia-text-tertiary">
          Weights are configured in the Impact Categories section below
        </p>
        <div className="flex flex-wrap gap-3">
          {impactCategories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-2 px-3 py-2 bg-black/20 rounded-lg">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-bia-text-primary text-sm">{cat.name}</span>
              <span className="text-bia-text-tertiary text-sm">
                ({cat.weight}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Threshold */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="text-lg font-semibold text-bia-text-primary">
          Impact Threshold
        </h3>
        <p className="text-sm text-bia-text-tertiary">
          When any impact dimension reaches this level, it triggers MTPD
          calculation
        </p>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max="5"
            value={localSettings.impactThreshold}
            onChange={(e) =>
              setLocalSettings({
                ...localSettings,
                impactThreshold: parseInt(e.target.value),
              })
            }
            className="w-48 accent-bia-primary"
          />
          <span className="text-2xl font-bold text-bia-warning">
            {localSettings.impactThreshold}
          </span>
          <span className="text-bia-text-tertiary">
            (1=Minor to 5=Catastrophic)
          </span>
        </div>
      </div>

      {/* Custom Timeline Points */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-bia-text-primary flex items-center gap-2">
              <Clock className="w-5 h-5" /> Custom Timeline Points
            </h3>
            <p className="text-sm text-bia-text-tertiary mt-1">
              Define time intervals for temporal impact analysis
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleResetTimelinePoints}
              className="glass-button text-sm">
              Reset to Default
            </button>
            <button
              onClick={() => setShowAddPoint(true)}
              className="glass-button-solid text-sm flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Point
            </button>
          </div>
        </div>

        {/* Timeline Points List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(localSettings.customTimelinePoints || []).map((point) => (
            <div
              key={point.id}
              className="p-3 bg-black/20 rounded-lg border border-bia-border flex items-center justify-between">
              {editingPoint?.id === point.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={editingPoint.label}
                    onChange={(e) =>
                      setEditingPoint({
                        ...editingPoint,
                        label: e.target.value,
                      })
                    }
                    className="glass-input w-24 text-sm py-1"
                    placeholder="Label"
                  />
                  <input
                    type="number"
                    min="0"
                    value={editingPoint.value}
                    onChange={(e) =>
                      setEditingPoint({
                        ...editingPoint,
                        value: parseInt(e.target.value) || 0,
                      })
                    }
                    className="glass-input w-16 text-sm py-1"
                  />
                  <select
                    value={editingPoint.unit}
                    onChange={(e) =>
                      setEditingPoint({
                        ...editingPoint,
                        unit: e.target.value as "hours" | "days" | "weeks",
                      })
                    }
                    className="glass-input text-sm py-1">
                    <option value="hours">hours</option>
                    <option value="days">days</option>
                    <option value="weeks">weeks</option>
                  </select>
                  <button
                    onClick={() => handleUpdateTimelinePoint(editingPoint)}
                    className="text-bia-success hover:opacity-80">
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingPoint(null)}
                    className="text-bia-text-tertiary hover:opacity-80">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <span className="text-bia-text-primary font-medium">
                      {point.label}
                    </span>
                    <span className="text-bia-text-tertiary text-sm ml-2">
                      ({point.value} {point.unit})
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingPoint(point)}
                      className="p-1 text-bia-text-tertiary hover:text-bia-primary">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTimelinePoint(point.id)}
                      className="p-1 text-bia-text-tertiary hover:text-bia-critical">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Add New Point Form */}
        {showAddPoint && (
          <div className="p-4 bg-black/30 rounded-lg border border-bia-primary/30 space-y-3">
            <h4 className="text-sm font-medium text-bia-text-primary">
              Add New Timeline Point
            </h4>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={newPoint.label}
                onChange={(e) =>
                  setNewPoint({ ...newPoint, label: e.target.value })
                }
                className="glass-input flex-1"
                placeholder="Label (e.g., '12 hours', '2 days')"
              />
              <input
                type="number"
                min="0"
                value={newPoint.value}
                onChange={(e) =>
                  setNewPoint({
                    ...newPoint,
                    value: parseInt(e.target.value) || 0,
                  })
                }
                className="glass-input w-20"
              />
              <select
                value={newPoint.unit}
                onChange={(e) =>
                  setNewPoint({
                    ...newPoint,
                    unit: e.target.value as "hours" | "days" | "weeks",
                  })
                }
                className="glass-input">
                <option value="hours">hours</option>
                <option value="days">days</option>
                <option value="weeks">weeks</option>
              </select>
              <button
                onClick={handleAddTimelinePoint}
                className="glass-button-solid">
                Add
              </button>
              <button
                onClick={() => setShowAddPoint(false)}
                className="glass-button">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Impact Categories */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-bia-text-primary flex items-center gap-2">
              <Layers className="w-5 h-5" /> Impact Categories
            </h3>
            <p className="text-sm text-bia-text-tertiary mt-1">
              Define impact dimensions with time-based severity definitions
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleResetCategories}
              className="glass-button text-sm">
              Reset to Default
            </button>
            <button
              onClick={() => setShowAddCategory(true)}
              className="glass-button-solid text-sm flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Category
            </button>
          </div>
        </div>

        {/* Add New Category Form */}
        {showAddCategory && (
          <div className="p-4 bg-black/30 rounded-lg border border-bia-primary/30 space-y-3">
            <h4 className="text-sm font-medium text-bia-text-primary">
              Add New Impact Category
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
                className="glass-input"
                placeholder="Category Name"
              />
              <input
                type="text"
                value={newCategory.description}
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    description: e.target.value,
                  })
                }
                className="glass-input"
                placeholder="Description"
              />
              <div className="flex items-center gap-2">
                <label className="text-sm text-bia-text-secondary">
                  Weight:
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={newCategory.weight}
                  onChange={(e) =>
                    setNewCategory({
                      ...newCategory,
                      weight: parseInt(e.target.value) || 10,
                    })
                  }
                  className="glass-input w-20"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-bia-text-secondary">
                  Color:
                </label>
                <input
                  type="color"
                  value={newCategory.color}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, color: e.target.value })
                  }
                  className="w-10 h-8 rounded cursor-pointer"
                />
                <button
                  onClick={handleAddCategory}
                  className="glass-button-solid flex-1">
                  Add
                </button>
                <button
                  onClick={() => setShowAddCategory(false)}
                  className="glass-button">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Categories List */}
        <div className="space-y-3">
          {impactCategories.map((cat) => (
            <div
              key={cat.id}
              className="bg-black/20 rounded-lg border border-bia-border overflow-hidden">
              {/* Category Header */}
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5"
                onClick={() =>
                  setExpandedCategory(
                    expandedCategory === cat.id ? null : cat.id,
                  )
                }>
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: cat.color }}
                  />
                  {editingCategory?.id === cat.id ? (
                    <div
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editingCategory.name}
                        onChange={(e) =>
                          setEditingCategory({
                            ...editingCategory,
                            name: e.target.value,
                          })
                        }
                        className="glass-input text-sm py-1 w-32"
                      />
                      <input
                        type="text"
                        value={editingCategory.description}
                        onChange={(e) =>
                          setEditingCategory({
                            ...editingCategory,
                            description: e.target.value,
                          })
                        }
                        className="glass-input text-sm py-1 w-48"
                        placeholder="Description"
                      />
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={editingCategory.weight}
                        onChange={(e) =>
                          setEditingCategory({
                            ...editingCategory,
                            weight: parseInt(e.target.value) || 10,
                          })
                        }
                        className="glass-input text-sm py-1 w-16"
                      />
                      <input
                        type="color"
                        value={editingCategory.color}
                        onChange={(e) =>
                          setEditingCategory({
                            ...editingCategory,
                            color: e.target.value,
                          })
                        }
                        className="w-8 h-6 rounded cursor-pointer"
                      />
                      <button
                        onClick={() => handleUpdateCategory(editingCategory)}
                        className="text-bia-success">
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingCategory(null)}
                        className="text-bia-text-tertiary">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <span className="text-bia-text-primary font-medium">
                        {cat.name}
                      </span>
                      <span className="text-bia-text-tertiary text-sm ml-2">
                        ({cat.weight}%)
                      </span>
                      <p className="text-xs text-bia-text-tertiary">
                        {cat.description}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingCategory(cat);
                    }}
                    className="p-1 text-bia-text-tertiary hover:text-bia-primary">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(cat.id);
                    }}
                    className="p-1 text-bia-text-tertiary hover:text-bia-critical">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {expandedCategory === cat.id ? (
                    <ChevronUp className="w-4 h-4 text-bia-text-tertiary" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-bia-text-tertiary" />
                  )}
                </div>
              </div>

              {/* Time-Based Definitions (Expanded) */}
              {expandedCategory === cat.id && (
                <div className="p-4 pt-0 border-t border-bia-border/50 mt-2">
                  <h5 className="text-sm font-medium text-bia-text-secondary mb-3">
                    Time-Based Impact Definitions
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {timelinePoints.map((tp) => {
                      const def = cat.timeBasedDefinitions.find(
                        (d) => d.timelinePointId === tp.id,
                      );
                      return (
                        <div key={tp.id} className="flex items-center gap-2">
                          <span className="text-xs text-bia-text-tertiary w-24 shrink-0">
                            {tp.label}:
                          </span>
                          <input
                            type="text"
                            value={def?.description || ""}
                            onChange={(e) =>
                              handleUpdateDefinition(
                                cat.id,
                                tp.id,
                                e.target.value,
                              )
                            }
                            className="glass-input text-sm py-1 flex-1"
                            placeholder={`Impact at ${tp.label}...`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Business Resources */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-bia-text-primary flex items-center gap-2">
              <Package className="w-5 h-5" /> Business Resources
            </h3>
            <p className="text-sm text-bia-text-tertiary mt-1">
              Define resources that business processes depend on
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleResetResources}
              className="glass-button text-sm">
              Reset to Default
            </button>
            <button
              onClick={() => setShowAddResource(true)}
              className="glass-button-solid text-sm flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Resource
            </button>
          </div>
        </div>

        {/* Add New Resource Form */}
        {showAddResource && (
          <div className="p-4 bg-black/30 rounded-lg border border-bia-primary/30 space-y-3">
            <h4 className="text-sm font-medium text-bia-text-primary">
              Add New Business Resource
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                value={newResource.name}
                onChange={(e) =>
                  setNewResource({ ...newResource, name: e.target.value })
                }
                className="glass-input"
                placeholder="Resource Name"
              />
              <select
                value={newResource.type}
                onChange={(e) =>
                  setNewResource({
                    ...newResource,
                    type: e.target.value as any,
                  })
                }
                className="glass-input">
                {SAFE_RESOURCE_TYPES && SAFE_RESOURCE_TYPES.length > 0 ? (
                  SAFE_RESOURCE_TYPES.map((rt) =>
                    rt && rt.value ? (
                      <option key={rt.value} value={rt.value}>
                        {rt.label}
                      </option>
                    ) : null,
                  )
                ) : (
                  <option value="systems">Systems/Applications</option>
                )}
              </select>
              <input
                type="text"
                value={newResource.description}
                onChange={(e) =>
                  setNewResource({
                    ...newResource,
                    description: e.target.value,
                  })
                }
                className="glass-input"
                placeholder="Description"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-bia-text-tertiary block mb-1">
                  RTO (Recovery Time Objective)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    value={newResource.rto?.value || 0}
                    onChange={(e) =>
                      setNewResource({
                        ...newResource,
                        rto: {
                          ...newResource.rto!,
                          value: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="glass-input w-20"
                  />
                  <select
                    value={newResource.rto?.unit || "hours"}
                    onChange={(e) =>
                      setNewResource({
                        ...newResource,
                        rto: {
                          ...newResource.rto!,
                          unit: e.target.value as TimeUnit,
                        },
                      })
                    }
                    className="glass-input">
                    <option value="minutes">minutes</option>
                    <option value="hours">hours</option>
                    <option value="days">days</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-bia-text-tertiary block mb-1">
                  RPO (Recovery Point Objective)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    value={newResource.rpo?.value || 0}
                    onChange={(e) =>
                      setNewResource({
                        ...newResource,
                        rpo: {
                          ...newResource.rpo!,
                          value: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="glass-input w-20"
                  />
                  <select
                    value={newResource.rpo?.unit || "hours"}
                    onChange={(e) =>
                      setNewResource({
                        ...newResource,
                        rpo: {
                          ...newResource.rpo!,
                          unit: e.target.value as TimeUnit,
                        },
                      })
                    }
                    className="glass-input">
                    <option value="minutes">minutes</option>
                    <option value="hours">hours</option>
                    <option value="days">days</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowAddResource(false)}
                className="glass-button">
                Cancel
              </button>
              <button
                onClick={handleAddResource}
                className="glass-button-solid">
                Add Resource
              </button>
            </div>
          </div>
        )}

        {/* Resources List */}
        <div className="space-y-3">
          {businessResources.map((resource) => (
            <div
              key={resource.id}
              className="bg-black/20 rounded-lg border border-bia-border overflow-hidden">
              {editingResource?.id === resource.id ? (
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={editingResource.name}
                      onChange={(e) =>
                        setEditingResource({
                          ...editingResource,
                          name: e.target.value,
                        })
                      }
                      className="glass-input text-sm"
                      placeholder="Name"
                    />
                    <select
                      value={editingResource.type}
                      onChange={(e) =>
                        setEditingResource({
                          ...editingResource,
                          type: e.target.value as any,
                        })
                      }
                      className="glass-input text-sm">
                      {SAFE_RESOURCE_TYPES && SAFE_RESOURCE_TYPES.length > 0 ? (
                        SAFE_RESOURCE_TYPES.map((rt) =>
                          rt && rt.value ? (
                            <option key={rt.value} value={rt.value}>
                              {rt.label}
                            </option>
                          ) : null,
                        )
                      ) : (
                        <option value="systems">Systems/Applications</option>
                      )}
                    </select>
                    <input
                      type="text"
                      value={editingResource.description}
                      onChange={(e) =>
                        setEditingResource({
                          ...editingResource,
                          description: e.target.value,
                        })
                      }
                      className="glass-input text-sm"
                      placeholder="Description"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-bia-text-tertiary block mb-1">
                        RTO (Recovery Time Objective)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="0"
                          value={editingResource.rto?.value || 0}
                          onChange={(e) =>
                            setEditingResource({
                              ...editingResource,
                              rto: {
                                value: parseInt(e.target.value) || 0,
                                unit: editingResource.rto?.unit || "hours",
                              },
                            })
                          }
                          className="glass-input w-20 text-sm"
                        />
                        <select
                          value={editingResource.rto?.unit || "hours"}
                          onChange={(e) =>
                            setEditingResource({
                              ...editingResource,
                              rto: {
                                value: editingResource.rto?.value || 0,
                                unit: e.target.value as TimeUnit,
                              },
                            })
                          }
                          className="glass-input text-sm">
                          <option value="minutes">minutes</option>
                          <option value="hours">hours</option>
                          <option value="days">days</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-bia-text-tertiary block mb-1">
                        RPO (Recovery Point Objective)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="0"
                          value={editingResource.rpo?.value || 0}
                          onChange={(e) =>
                            setEditingResource({
                              ...editingResource,
                              rpo: {
                                value: parseInt(e.target.value) || 0,
                                unit: editingResource.rpo?.unit || "hours",
                              },
                            })
                          }
                          className="glass-input w-20 text-sm"
                        />
                        <select
                          value={editingResource.rpo?.unit || "hours"}
                          onChange={(e) =>
                            setEditingResource({
                              ...editingResource,
                              rpo: {
                                value: editingResource.rpo?.value || 0,
                                unit: e.target.value as TimeUnit,
                              },
                            })
                          }
                          className="glass-input text-sm">
                          <option value="minutes">minutes</option>
                          <option value="hours">hours</option>
                          <option value="days">days</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  {/* Quantity at Intervals */}
                  <div>
                    <label className="text-xs text-bia-text-tertiary block mb-2">
                      Quantity Required at Timeline Points
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                      {timelinePoints.map((tp) => (
                        <div key={tp.id} className="text-center">
                          <span className="text-xs text-bia-text-tertiary block mb-1">
                            {tp.label}
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={
                              editingResource.quantityAtIntervals?.[tp.id] || 0
                            }
                            onChange={(e) =>
                              setEditingResource({
                                ...editingResource,
                                quantityAtIntervals: {
                                  ...editingResource.quantityAtIntervals,
                                  [tp.id]: parseInt(e.target.value) || 0,
                                },
                              })
                            }
                            className="glass-input w-full text-sm text-center py-1"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingResource(null)}
                      className="glass-button text-sm">
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdateResource(editingResource)}
                      className="glass-button-solid text-sm">
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div
                    className="p-3 flex items-center justify-between cursor-pointer hover:bg-white/5"
                    onClick={() =>
                      setExpandedResourceId(
                        expandedResourceId === resource.id ? null : resource.id,
                      )
                    }>
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-bia-text-primary font-medium">
                          {resource.name}
                        </span>
                        <span className="ml-2 px-2 py-0.5 text-xs rounded bg-bia-primary/20 text-bia-primary">
                          {getResourceTypeLabel(resource.type)}
                        </span>
                      </div>
                      <div className="flex gap-4 text-xs text-bia-text-tertiary">
                        <span>
                          RTO:{" "}
                          <span className="text-bia-warning">
                            {formatTimeValue(resource.rto)}
                          </span>
                        </span>
                        <span>
                          RPO:{" "}
                          <span className="text-bia-secondary">
                            {formatTimeValue(resource.rpo)}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingResource(resource);
                        }}
                        className="p-1 text-bia-text-tertiary hover:text-bia-primary">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteResource(resource.id);
                        }}
                        className="p-1 text-bia-text-tertiary hover:text-bia-critical">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {expandedResourceId === resource.id ? (
                        <ChevronUp className="w-4 h-4 text-bia-text-tertiary" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-bia-text-tertiary" />
                      )}
                    </div>
                  </div>
                  {expandedResourceId === resource.id && (
                    <div className="px-3 pb-3 pt-0 border-t border-bia-border/50">
                      <p className="text-xs text-bia-text-tertiary mt-2 mb-2">
                        {resource.description}
                      </p>
                      {resource.quantityAtIntervals &&
                        Object.keys(resource.quantityAtIntervals).length >
                          0 && (
                          <div>
                            <span className="text-xs text-bia-text-tertiary">
                              Quantity at Intervals:
                            </span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {timelinePoints.map((tp) => {
                                const qty =
                                  resource.quantityAtIntervals?.[tp.id];
                                if (!qty) return null;
                                return (
                                  <span
                                    key={tp.id}
                                    className="px-2 py-1 bg-black/30 rounded text-xs text-bia-text-secondary">
                                    {tp.label}:{" "}
                                    <span className="text-bia-primary font-medium">
                                      {qty}
                                    </span>
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Save/Reset */}
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          disabled={hasWeightError}
          className="glass-button-solid flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          title={
            hasWeightError ? "Cannot save: Impact weights must total 100%" : ""
          }>
          <Save className="w-4 h-4" /> {saved ? "Saved!" : "Save Settings"}
        </button>
        <button
          onClick={handleReset}
          className="glass-button flex items-center gap-2">
          <RotateCcw className="w-4 h-4" /> Reset to Defaults
        </button>
      </div>

      {/* Data Management */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="text-lg font-semibold text-bia-text-primary">
          Data Management
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Export */}
          <div className="p-4 rounded-bia-md border border-bia-border space-y-2">
            <h4 className="font-medium text-bia-text-primary flex items-center gap-2">
              <Download className="w-4 h-4" /> Export Data
            </h4>
            <p className="text-xs text-bia-text-tertiary">
              Download all BIA data as JSON
            </p>
            <button onClick={handleExport} className="glass-button w-full">
              Export JSON
            </button>
          </div>

          {/* Import */}
          <div className="p-4 rounded-bia-md border border-bia-border space-y-2">
            <h4 className="font-medium text-bia-text-primary flex items-center gap-2">
              <Upload className="w-4 h-4" /> Import Data
            </h4>
            <p className="text-xs text-bia-text-tertiary">
              Load data from JSON file
            </p>
            <label className="glass-button w-full block text-center cursor-pointer">
              Import JSON
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImport}
              />
            </label>
            {importError && (
              <p className="text-xs text-bia-critical">{importError}</p>
            )}
            {importSuccess && (
              <p className="text-xs text-bia-success">
                Data imported successfully!
              </p>
            )}
          </div>

          {/* Clear */}
          <div className="p-4 rounded-bia-md border border-bia-critical/30 space-y-2">
            <h4 className="font-medium text-bia-critical flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Clear All Data
            </h4>
            <p className="text-xs text-bia-text-tertiary">
              Permanently delete all data
            </p>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full px-4 py-2 bg-bia-critical/20 text-bia-critical rounded-bia-sm hover:bg-bia-critical/30 transition-colors">
              Clear Data
            </button>
          </div>
        </div>
      </div>

      {/* ISO Reference */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="text-lg font-semibold text-bia-text-primary flex items-center gap-2">
          <HelpCircle className="w-5 h-5" /> ISO 22301:2019 Reference
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-black/20 rounded">
            <p className="text-bia-primary font-medium">
              Clause 8.2.2 - Business Impact Analysis
            </p>
            <p className="text-bia-text-tertiary mt-1">
              Organizations shall identify and document prioritized timeframes
              for resumption of activities, their dependencies, and supporting
              resources.
            </p>
          </div>
          <div className="p-3 bg-black/20 rounded">
            <p className="text-bia-primary font-medium">
              Clause 8.2.3 - Risk Assessment
            </p>
            <p className="text-bia-text-tertiary mt-1">
              Organizations shall identify risks of disruption to prioritized
              activities and assess impact severity.
            </p>
          </div>
        </div>
      </div>

      {/* Clear Confirm Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="glass-panel p-6 max-w-md animate-scale-in">
            <div className="flex items-center gap-3 text-bia-critical mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Confirm Clear All Data</h3>
            </div>
            <p className="text-bia-text-secondary mb-6">
              This will permanently delete all processes, impacts, recovery
              objectives, and dependencies. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="glass-button">
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 bg-bia-critical text-white rounded-bia-sm hover:bg-bia-critical/90">
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
