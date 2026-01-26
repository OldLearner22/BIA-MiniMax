import { useState } from "react";
import { useStore } from "../store/useStore";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  AlertTriangle,
  Package,
  Server,
  Users,
  HardDrive,
  Building,
  FileText,
  Globe,
  Shield,
  Shuffle,
  List,
  Link as LinkIcon,
} from "lucide-react";
import {
  BusinessResource,
  RESOURCE_TYPES,
  ResourceType,
  WorkaroundProcedure,
  VendorDetails,
  ResourceDependency,
  DependencyType,
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

export function ResourceRegistry() {
  let storeData;
  try {
    storeData = useStore();
    if (!storeData) {
      return (
        <div className="text-red-500">
          Error: Store not initialized (useStore returned undefined)
        </div>
      );
    }
  } catch (error) {
    console.error("Error initializing ResourceRegistry store:", error);
    return (
      <div className="text-red-500">
        Error loading Resource Registry: {String(error)}
      </div>
    );
  }

  const {
    businessResources = [],
    addBusinessResource,
    updateBusinessResource,
    deleteBusinessResource,
    resourceDependencies = [],
    setResourceDependencies,
    settings,
  } = storeData || {};
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] =
    useState<BusinessResource | null>(null);

  const [activeTab, setActiveTab] = useState<
    "details" | "workarounds" | "vendor" | "dependencies"
  >("details");
  const [localDependencies, setLocalDependencies] = useState<
    ResourceDependency[]
  >([]);
  const [newDepTarget, setNewDepTarget] = useState("");
  const [newDepDesc, setNewDepDesc] = useState("");
  const [newDepType, setNewDepType] = useState<DependencyType>("technical");
  const [newDepBlocking, setNewDepBlocking] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<BusinessResource>>({
    name: "",
    type: "systems",
    description: "",
    rto: { value: 4, unit: "hours" },
    rpo: { value: 1, unit: "hours" },
    redundancy: "none",
    workarounds: [],
    vendorDetails: {
      name: "",
      contractReference: "",
      contactPerson: "",
      contactEmail: "",
      contactPhone: "",
      sla: {
        guaranteedRto: 0,
        availability: 99.9,
        supportHours: "24/7",
      },
    },
  });

  const filteredResources = businessResources.filter(
    (res) =>
      res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleOpenModal = (resource?: BusinessResource) => {
    setActiveTab("details");
    setNewDepTarget("");
    setNewDepDesc("");
    setNewDepType("technical");
    setNewDepBlocking(false);

    if (resource) {
      setEditingResource(resource);
      setFormData({ ...resource, workarounds: resource.workarounds || [] });
      setLocalDependencies(
        resourceDependencies.filter((d) => d.sourceResourceId === resource.id),
      );
    } else {
      setEditingResource(null);
      setFormData({
        name: "",
        type: "systems",
        description: "",
        rto: { value: 4, unit: "hours" },
        rpo: { value: 1, unit: "hours" },
        redundancy: "none",
        workarounds: [],
        vendorDetails: {
          name: "",
          contractReference: "",
          contactPerson: "",
          contactEmail: "",
          contactPhone: "",
          sla: {
            guaranteedRto: 0,
            availability: 99.9,
            supportHours: "24/7",
          },
        },
      });
      setLocalDependencies([]);
    }
    setIsModalOpen(true);
  };

  const handleAddDependency = () => {
    if (!newDepTarget) return;
    const newDep: ResourceDependency = {
      id: crypto.randomUUID(),
      sourceResourceId: editingResource?.id || "", // Will be updated on save
      targetResourceId: newDepTarget,
      description: newDepDesc,
      type: newDepType,
      isBlocking: newDepBlocking,
    };
    setLocalDependencies([...localDependencies, newDep]);
    setNewDepTarget("");
    setNewDepDesc("");
    setNewDepType("technical");
    setNewDepBlocking(false);
  };

  const handleRemoveDependency = (id: string) => {
    setLocalDependencies(localDependencies.filter((d) => d.id !== id));
  };

  const handleAddWorkaround = () => {
    const newWa: WorkaroundProcedure = {
      id: crypto.randomUUID(),
      title: "New Workaround",
      description: "",
      rtoImpact: 0,
      activationTime: 0,
      steps: [],
    };
    setFormData((prev) => ({
      ...prev,
      workarounds: [...(prev.workarounds || []), newWa],
    }));
  };

  const handleUpdateWorkaround = (
    id: string,
    updates: Partial<WorkaroundProcedure>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      workarounds: prev.workarounds?.map((wa) =>
        wa.id === id ? { ...wa, ...updates } : wa,
      ),
    }));
  };

  const handleDeleteWorkaround = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      workarounds: prev.workarounds?.filter((wa) => wa.id !== id),
    }));
  };

  const handleSave = () => {
    if (!formData.name || !formData.type || !formData.rto) return; // Basic validation

    const resourceId = editingResource
      ? editingResource.id
      : crypto.randomUUID();

    const resourceData = {
      ...formData,
      id: resourceId,
    } as BusinessResource;

    if (editingResource) {
      updateBusinessResource(editingResource.id, resourceData);
    } else {
      addBusinessResource(resourceData);
    }

    // Save Dependencies
    const finalDependencies = localDependencies.map((d) => ({
      ...d,
      sourceResourceId: resourceId,
    }));
    setResourceDependencies(resourceId, finalDependencies);

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (
      confirm(
        "Are you sure you want to delete this resource? This cannot be undone.",
      )
    ) {
      deleteBusinessResource(id);
    }
  };

  const getIconForType = (type: ResourceType) => {
    switch (type) {
      case "personnel":
        return Users;
      case "systems":
        return Server;
      case "equipment":
        return HardDrive;
      case "facilities":
        return Building;
      case "data":
        return FileText;
      case "vendors":
        return Globe;
      default:
        return Package;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-bia-text-primary">
            Business Resources
          </h2>
          <p className="text-bia-text-tertiary">
            Manage supporting resources, systems, and personnel
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-bia-primary text-white rounded-lg hover:bg-bia-primary/90 transition-colors shadow-lg shadow-bia-primary/20">
          <Plus className="w-4 h-4" />
          <span>Add Resource</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-bia-text-tertiary" />
        <input
          type="text"
          placeholder="Search resources..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-bia-text-primary placeholder:text-bia-text-tertiary focus:outline-none focus:ring-2 focus:ring-bia-primary/50"
        />
      </div>

      {/* Resources List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.length === 0 ? (
          <div className="col-span-full text-center py-12 glass-panel">
            <Package className="w-12 h-12 text-bia-text-tertiary mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-bia-text-secondary">
              No resources found
            </h3>
            <p className="text-bia-text-tertiary max-w-md mx-auto mt-2">
              Start by defining the critical assets, systems, and teams your
              business depends on.
            </p>
          </div>
        ) : (
          filteredResources.map((resource) => {
            const Icon = getIconForType(resource.type);
            return (
              <div
                key={resource.id}
                className="glass-panel p-5 hover:border-bia-primary/30 transition-colors group relative">
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenModal(resource)}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-bia-text-secondary hover:text-bia-primary transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(resource.id)}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-bia-text-secondary hover:text-bia-critical transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-bia-primary/10 text-bia-primary">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-bia-text-primary">
                      {resource.name}
                    </h3>
                    <span className="text-xs uppercase tracking-wider font-semibold text-bia-text-tertiary">
                      {SAFE_RESOURCE_TYPES &&
                        SAFE_RESOURCE_TYPES.find(
                          (t) => t && t.value === resource.type,
                        )?.label}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-bia-text-secondary mb-4 line-clamp-2 h-10">
                  {resource.description || "No description provided."}
                </p>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 rounded bg-white/5 border border-white/5">
                    <span className="block text-xs text-bia-text-tertiary mb-1">
                      Target RTO
                    </span>
                    <span className="font-medium text-bia-text-primary">
                      {resource.rto.value} {resource.rto.unit}
                    </span>
                  </div>
                  {resource.rpo && (
                    <div className="p-2 rounded bg-white/5 border border-white/5">
                      <span className="block text-xs text-bia-text-tertiary mb-1">
                        Target RPO
                      </span>
                      <span className="font-medium text-bia-text-primary">
                        {resource.rpo.value} {resource.rpo.unit}
                      </span>
                    </div>
                  )}
                </div>

                {resource.quantityAtIntervals &&
                  Object.keys(resource.quantityAtIntervals).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <span className="text-xs text-bia-text-tertiary block mb-1">
                        Quantity Profile
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(settings.customTimelinePoints || []).map((tp) => {
                          const qty = resource.quantityAtIntervals?.[tp.id];
                          if (!qty) return null;
                          return (
                            <span
                              key={tp.id}
                              className="px-1.5 py-0.5 bg-white/5 rounded text-[10px] text-bia-text-secondary border border-white/5">
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

                {resource.redundancy !== "none" && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-bia-success">
                    <Shield className="w-3 h-3" />
                    <span className="capitalize">
                      {resource.redundancy} Redundancy
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-panel p-0 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="text-lg font-medium text-bia-text-primary">
                {editingResource ? "Edit Resource" : "Add Business Resource"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-bia-text-tertiary hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex border-b border-white/10 mb-4 px-4">
              <button
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "details" ? "border-bia-primary text-bia-primary" : "border-transparent text-bia-text-secondary hover:text-white"}`}
                onClick={() => setActiveTab("details")}>
                Details
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "workarounds" ? "border-bia-primary text-bia-primary" : "border-transparent text-bia-text-secondary hover:text-white"}`}
                onClick={() => setActiveTab("workarounds")}>
                Workarounds ({formData.workarounds?.length || 0})
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "vendor" ? "border-bia-primary text-bia-primary" : "border-transparent text-bia-text-secondary hover:text-white"}`}
                onClick={() => setActiveTab("vendor")}>
                Vendor & SLA
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "dependencies" ? "border-bia-primary text-bia-primary" : "border-transparent text-bia-text-secondary hover:text-white"}`}
                onClick={() => setActiveTab("dependencies")}>
                Dependencies ({localDependencies.length})
              </button>
            </div>

            <div className="p-6 pt-2 space-y-4 max-h-[70vh] overflow-y-auto">
              {activeTab === "details" && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-bia-text-secondary">
                      Resource Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-bia-text-primary focus:outline-none focus:border-bia-primary"
                      placeholder="e.g., Primary ERP Server"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-bia-text-secondary">
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type: e.target.value as ResourceType,
                        })
                      }
                      className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-bia-text-primary focus:outline-none focus:border-bia-primary">
                      {SAFE_RESOURCE_TYPES && SAFE_RESOURCE_TYPES.length > 0 ? (
                        SAFE_RESOURCE_TYPES.map((type) =>
                          type && type.value ? (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ) : null,
                        )
                      ) : (
                        <>
                          <option value="personnel">Personnel</option>
                          <option value="systems">Systems/Applications</option>
                          <option value="equipment">Equipment</option>
                          <option value="facilities">Facilities</option>
                          <option value="vendors">Vendors/Suppliers</option>
                          <option value="data">Data/Records</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-bia-text-secondary">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-bia-text-primary focus:outline-none focus:border-bia-primary min-h-[80px]"
                      placeholder="Describe the resource and its function..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-bia-text-secondary">
                        Recovery Time (RTO)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="0"
                          value={formData.rto?.value}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              rto: {
                                ...formData.rto!,
                                value: parseInt(e.target.value) || 0,
                              },
                            })
                          }
                          className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-bia-text-primary focus:outline-none focus:border-bia-primary"
                        />
                        <select
                          value={formData.rto?.unit}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              rto: {
                                ...formData.rto!,
                                unit: e.target.value as any,
                              },
                            })
                          }
                          className="w-24 px-2 py-2 bg-black/20 border border-white/10 rounded-lg text-bia-text-primary focus:outline-none focus:border-bia-primary">
                          <option value="minutes">Mins</option>
                          <option value="hours">Hours</option>
                          <option value="days">Days</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-bia-text-secondary">
                        Data Loss (RPO)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="0"
                          value={formData.rpo?.value}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              rpo: {
                                ...formData.rpo!,
                                value: parseInt(e.target.value) || 0,
                              },
                            })
                          }
                          className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-bia-text-primary focus:outline-none focus:border-bia-primary"
                        />
                        <select
                          value={formData.rpo?.unit}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              rpo: {
                                ...formData.rpo!,
                                unit: e.target.value as any,
                              },
                            })
                          }
                          className="w-24 px-2 py-2 bg-black/20 border border-white/10 rounded-lg text-bia-text-primary focus:outline-none focus:border-bia-primary">
                          <option value="minutes">Mins</option>
                          <option value="hours">Hours</option>
                          <option value="days">Days</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Quantity at Intervals */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-bia-text-secondary">
                      Quantity Required at Timeline Points
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {(settings.customTimelinePoints || []).map((tp) => (
                        <div
                          key={tp.id}
                          className="bg-black/20 rounded p-2 text-center border border-white/5">
                          <span className="text-[10px] text-bia-text-tertiary block mb-1 uppercase tracking-wider">
                            {tp.label}
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={formData.quantityAtIntervals?.[tp.id] || 0}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                quantityAtIntervals: {
                                  ...formData.quantityAtIntervals,
                                  [tp.id]: parseInt(e.target.value) || 0,
                                },
                              })
                            }
                            className="w-full bg-white/5 rounded px-2 py-1 text-sm text-center text-bia-text-primary focus:outline-none focus:ring-1 focus:ring-bia-primary/50"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-bia-text-secondary">
                      Redundancy Level
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {["none", "partial", "full"].map((level) => (
                        <button
                          key={level}
                          onClick={() =>
                            setFormData({
                              ...formData,
                              redundancy: level as any,
                            })
                          }
                          className={`px-3 py-2 rounded-lg border text-sm font-medium capitalize transition-all ${
                            formData.redundancy === level
                              ? "bg-bia-primary/20 border-bia-primary text-bia-primary"
                              : "bg-black/20 border-white/10 text-bia-text-secondary hover:bg-white/5"
                          }`}>
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {activeTab === "workarounds" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-bia-text-tertiary">
                      Define alternative procedures if this resource is
                      unavailable.
                    </p>
                    <button
                      onClick={handleAddWorkaround}
                      className="text-xs flex items-center gap-1 bg-bia-primary/20 hover:bg-bia-primary/30 text-bia-primary px-3 py-1.5 rounded-lg transition-colors">
                      <Plus className="w-3 h-3" /> Add Procedure
                    </button>
                  </div>

                  {(!formData.workarounds ||
                    formData.workarounds.length === 0) && (
                    <div className="text-center py-8 border-2 border-dashed border-white/10 rounded-xl">
                      <Shuffle className="w-8 h-8 text-bia-text-tertiary mx-auto mb-2 opacity-50" />
                      <p className="text-sm text-bia-text-secondary">
                        No workarounds defined
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {formData.workarounds?.map((wa, idx) => (
                      <div
                        key={wa.id}
                        className="p-3 bg-black/20 rounded-lg border border-white/5 space-y-3">
                        <div className="flex justify-between items-start">
                          <input
                            type="text"
                            value={wa.title}
                            onChange={(e) =>
                              handleUpdateWorkaround(wa.id, {
                                title: e.target.value,
                              })
                            }
                            className="bg-transparent font-medium text-bia-text-primary text-sm focus:outline-none border-b border-transparent focus:border-bia-primary w-full mr-2"
                            placeholder="Workaround Title"
                          />
                          <button
                            onClick={() => handleDeleteWorkaround(wa.id)}
                            className="text-bia-text-tertiary hover:text-bia-critical">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <textarea
                          value={wa.description}
                          onChange={(e) =>
                            handleUpdateWorkaround(wa.id, {
                              description: e.target.value,
                            })
                          }
                          className="w-full bg-white/5 rounded p-2 text-xs text-bia-text-secondary focus:outline-none focus:ring-1 focus:ring-bia-primary/50"
                          placeholder="Description of the workaround..."
                          rows={2}
                        />
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <label className="text-[10px] text-bia-text-tertiary uppercase">
                              Activation Time (min)
                            </label>
                            <input
                              type="number"
                              value={wa.activationTime}
                              onChange={(e) =>
                                handleUpdateWorkaround(wa.id, {
                                  activationTime: parseInt(e.target.value) || 0,
                                })
                              }
                              className="w-full bg-white/5 rounded px-2 py-1 text-xs text-bia-text-primary mt-1"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-[10px] text-bia-text-tertiary uppercase">
                              RTO Impact (min)
                            </label>
                            <input
                              type="number"
                              value={wa.rtoImpact}
                              onChange={(e) =>
                                handleUpdateWorkaround(wa.id, {
                                  rtoImpact: parseInt(e.target.value) || 0,
                                })
                              }
                              className="w-full bg-white/5 rounded px-2 py-1 text-xs text-bia-text-primary mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "vendor" && (
                <div className="space-y-4">
                  {/* Vendor Form */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-bia-text-secondary">
                        Vendor Name
                      </label>
                      <input
                        type="text"
                        value={formData.vendorDetails?.name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            vendorDetails: {
                              ...formData.vendorDetails!,
                              name: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-bia-text-primary focus:outline-none focus:border-bia-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-bia-text-secondary">
                        Contract Ref
                      </label>
                      <input
                        type="text"
                        value={formData.vendorDetails?.contractReference}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            vendorDetails: {
                              ...formData.vendorDetails!,
                              contractReference: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-bia-text-primary focus:outline-none focus:border-bia-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-bia-text-secondary uppercase mt-2">
                      SLA Details
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-bia-text-tertiary">
                          Guaranteed RTO (min)
                        </label>
                        <input
                          type="number"
                          value={formData.vendorDetails?.sla?.guaranteedRto}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              vendorDetails: {
                                ...formData.vendorDetails!,
                                sla: {
                                  ...formData.vendorDetails!.sla,
                                  guaranteedRto: parseInt(e.target.value) || 0,
                                },
                              },
                            })
                          }
                          className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-bia-text-primary focus:outline-none focus:border-bia-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-bia-text-tertiary">
                          Availability (%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.vendorDetails?.sla?.availability}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              vendorDetails: {
                                ...formData.vendorDetails!,
                                sla: {
                                  ...formData.vendorDetails!.sla,
                                  availability: parseFloat(e.target.value) || 0,
                                },
                              },
                            })
                          }
                          className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-bia-text-primary focus:outline-none focus:border-bia-primary"
                        />
                      </div>
                    </div>
                    <div className="space-y-1 mt-2">
                      <label className="text-[10px] text-bia-text-tertiary">
                        Support Hours
                      </label>
                      <input
                        type="text"
                        value={formData.vendorDetails?.sla?.supportHours}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            vendorDetails: {
                              ...formData.vendorDetails!,
                              sla: {
                                ...formData.vendorDetails!.sla,
                                supportHours: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-bia-text-primary focus:outline-none focus:border-bia-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-bia-text-secondary uppercase mt-2">
                      Contact Info
                    </h4>
                    <input
                      type="text"
                      placeholder="Contact Person"
                      value={formData.vendorDetails?.contactPerson}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vendorDetails: {
                            ...formData.vendorDetails!,
                            contactPerson: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-bia-text-primary mb-2"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Email"
                        value={formData.vendorDetails?.contactEmail}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            vendorDetails: {
                              ...formData.vendorDetails!,
                              contactEmail: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-bia-text-primary"
                      />
                      <input
                        type="text"
                        placeholder="Phone"
                        value={formData.vendorDetails?.contactPhone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            vendorDetails: {
                              ...formData.vendorDetails!,
                              contactPhone: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-bia-text-primary"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "dependencies" && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-semibold text-bia-text-secondary uppercase">
                        Depends On
                      </h4>
                    </div>

                    {localDependencies.length === 0 ? (
                      <div className="text-center py-6 border-2 border-dashed border-white/10 rounded-xl">
                        <LinkIcon className="w-8 h-8 text-bia-text-tertiary mx-auto mb-2 opacity-50" />
                        <p className="text-sm text-bia-text-secondary">
                          No dependencies defined
                        </p>
                        <p className="text-xs text-bia-text-tertiary">
                          This resource operates independently
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {localDependencies.map((dep) => {
                          const targetRes = businessResources.find(
                            (r) => r.id === dep.targetResourceId,
                          );
                          return (
                            <div
                              key={dep.id}
                              className="p-3 bg-black/20 rounded-lg border border-white/5 flex justify-between items-center group">
                              <div>
                                <div className="flex items-center gap-2">
                                  <LinkIcon className="w-3 h-3 text-bia-primary" />
                                  <span className="text-sm font-medium text-bia-text-primary">
                                    {targetRes?.name || "Unknown Resource"}
                                  </span>
                                  <span
                                    className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ${
                                      dep.type === "technical"
                                        ? "bg-blue-500/20 text-blue-400"
                                        : dep.type === "operational"
                                          ? "bg-yellow-500/20 text-yellow-400"
                                          : "bg-purple-500/20 text-purple-400"
                                    }`}>
                                    {dep.type}
                                  </span>
                                  {dep.isBlocking && (
                                    <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                      Blocking
                                    </span>
                                  )}
                                </div>
                                {dep.description && (
                                  <p className="text-xs text-bia-text-tertiary mt-1 pl-5">
                                    {dep.description}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => handleRemoveDependency(dep.id)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white/10 rounded-lg text-bia-text-secondary hover:text-bia-critical transition-all">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-white/10 pt-4 space-y-3">
                    <h4 className="text-xs font-semibold text-bia-text-secondary uppercase">
                      Add Critical Dependency
                    </h4>
                    <div className="space-y-2">
                      <div className="space-y-2">
                        <select
                          value={newDepTarget}
                          onChange={(e) => setNewDepTarget(e.target.value)}
                          className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-bia-text-primary focus:outline-none focus:border-bia-primary text-sm">
                          <option value="">Select a resource...</option>
                          {businessResources
                            .filter((r) => r.id !== editingResource?.id)
                            .map((res) => (
                              <option key={res.id} value={res.id}>
                                {res.name} ({res.rto.value} {res.rto.unit})
                              </option>
                            ))}
                        </select>

                        <div className="flex gap-2">
                          <select
                            value={newDepType}
                            onChange={(e) =>
                              setNewDepType(e.target.value as any)
                            }
                            className="w-1/3 px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-bia-text-primary focus:outline-none focus:border-bia-primary text-sm capitalize">
                            <option value="technical">Technical</option>
                            <option value="operational">Operational</option>
                            <option value="resource">Resource</option>
                          </select>

                          <div className="flex items-center gap-2 px-3 py-2 bg-black/20 border border-white/10 rounded-lg">
                            <input
                              type="checkbox"
                              id="isBlocking"
                              checked={newDepBlocking}
                              onChange={(e) =>
                                setNewDepBlocking(e.target.checked)
                              }
                              className="w-4 h-4 rounded border-gray-300 text-bia-primary focus:ring-bia-primary"
                            />
                            <label
                              htmlFor="isBlocking"
                              className="text-sm text-bia-text-secondary select-none cursor-pointer">
                              Blocking?
                            </label>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newDepDesc}
                            onChange={(e) => setNewDepDesc(e.target.value)}
                            placeholder="Describe dependency (optional)..."
                            className="flex-1 px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-bia-text-primary focus:outline-none focus:border-bia-primary text-sm"
                          />
                          <button
                            onClick={handleAddDependency}
                            disabled={!newDepTarget}
                            className="px-3 py-2 bg-bia-primary/20 text-bia-primary rounded-lg text-sm font-medium hover:bg-bia-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-bia-text-secondary hover:text-white transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2 bg-bia-primary text-white rounded-lg hover:bg-bia-primary/90 transition-colors shadow-lg shadow-bia-primary/20">
                <Save className="w-4 h-4" />
                <span>Save Resource</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
