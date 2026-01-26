import { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import {
  Plus,
  Search,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Trash2,
  Edit2,
  Save,
  X,
  Target,
  Users,
  Check,
  ListTodo,
  AlertCircle,
} from "lucide-react";
import {
  ExerciseRecord,
  ExerciseStatus,
  ExerciseType,
  FollowUpAction,
} from "../types";
import { format } from "date-fns";

const EXERCISE_TYPES: { value: ExerciseType; label: string }[] = [
  { value: "tabletop", label: "Tabletop" },
  { value: "walkthrough", label: "Walkthrough" },
  { value: "simulation", label: "Simulation" },
  { value: "full-scale", label: "Full Scale" },
];

const STATUS_OPTS: { value: ExerciseStatus; label: string }[] = [
  { value: "planned", label: "Planned" },
  { value: "scheduled", label: "Scheduled" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function ExerciseLog() {
  const {
    exerciseRecords,
    addExerciseRecord,
    updateExerciseRecord,
    deleteExerciseRecord,
    processes,
    businessResources,
    fetchExerciseRecords,
  } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ExerciseRecord | null>(
    null,
  );
  const [scopeType, setScopeType] = useState<"processes" | "resources">(
    "processes",
  );

  // Form State
  const [formData, setFormData] = useState<Partial<ExerciseRecord>>({
    title: "",
    type: "tabletop",
    status: "planned",
    scheduledDate: new Date().toISOString().split("T")[0],
    description: "",
    scope: { processIds: [], resourceIds: [] },
    participants: [],
    findings: "",
    followUpActions: [],
  });

  const [newAction, setNewAction] = useState({
    description: "",
    owner: "",
    dueDate: "",
  });

  const [participantInput, setParticipantInput] = useState("");

  // Fetch exercise records on mount
  useEffect(() => {
    fetchExerciseRecords();
  }, [fetchExerciseRecords]);

  const filteredRecords = exerciseRecords.filter(
    (rec) =>
      rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleOpenModal = (record?: ExerciseRecord) => {
    if (record) {
      setEditingRecord(record);
      setFormData({ ...record });
    } else {
      setEditingRecord(null);
      setFormData({
        title: "",
        type: "tabletop",
        status: "planned",
        scheduledDate: new Date().toISOString().split("T")[0],
        description: "",
        scope: { processIds: [], resourceIds: [] },
        participants: [],
        findings: "",
        followUpActions: [],
      });
    }
    setParticipantInput("");
    setNewAction({ description: "", owner: "", dueDate: "" });
    setIsModalOpen(true);
  };

  const handleAddParticipant = () => {
    if (!participantInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      participants: [...(prev.participants || []), participantInput.trim()],
    }));
    setParticipantInput("");
  };

  const handleRemoveParticipant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      participants: prev.participants?.filter((_, i) => i !== index),
    }));
  };

  const handleAddAction = () => {
    if (!newAction.description || !newAction.owner || !newAction.dueDate)
      return;
    const action: FollowUpAction = {
      id: crypto.randomUUID(),
      description: newAction.description,
      owner: newAction.owner,
      dueDate: newAction.dueDate,
      status: "open",
    };
    setFormData((prev) => ({
      ...prev,
      followUpActions: [...(prev.followUpActions || []), action],
    }));
    setNewAction({ description: "", owner: "", dueDate: "" });
  };

  const handleRemoveAction = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      followUpActions: prev.followUpActions?.filter((a) => a.id !== id),
    }));
  };

  const toggleScopeItem = (id: string, type: "processes" | "resources") => {
    setFormData((prev) => {
      const currentIds =
        type === "processes"
          ? prev.scope?.processIds || []
          : prev.scope?.resourceIds || [];
      const newIds = currentIds.includes(id)
        ? currentIds.filter((i) => i !== id)
        : [...currentIds, id];

      return {
        ...prev,
        scope: {
          ...(prev.scope || { processIds: [], resourceIds: [] }),
          [type === "processes" ? "processIds" : "resourceIds"]: newIds,
        },
      };
    });
  };

  const handleSave = () => {
    if (!formData.title || !formData.scheduledDate) return;

    const recordData = {
      ...formData,
      id: editingRecord ? editingRecord.id : crypto.randomUUID(),
      createdAt: editingRecord
        ? editingRecord.createdAt
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as ExerciseRecord;

    if (editingRecord) {
      updateExerciseRecord(editingRecord.id, recordData);
    } else {
      addExerciseRecord(recordData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this exercise record?")) {
      deleteExerciseRecord(id);
    }
  };

  const getStatusColor = (status: ExerciseStatus) => {
    switch (status) {
      case "completed":
        return "text-bia-success";
      case "in-progress":
        return "text-bia-primary";
      case "scheduled":
        return "text-bia-text-secondary";
      case "cancelled":
        return "text-bia-critical";
      default:
        return "text-bia-text-tertiary";
    }
  };

  const getStatusIcon = (status: ExerciseStatus) => {
    switch (status) {
      case "completed":
        return CheckCircle;
      case "in-progress":
        return Clock;
      case "cancelled":
        return XCircle;
      case "scheduled":
        return Calendar;
      default:
        return AlertTriangle;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-bia-text-primary">
            Exercise & Testing Log
          </h2>
          <p className="text-bia-text-tertiary">
            Track business continuity exercises, tests, and simulations
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-bia-primary text-white rounded-lg hover:bg-bia-primary/90 transition-colors shadow-lg shadow-bia-primary/20">
          <Plus className="w-4 h-4" />
          <span>Log Exercise</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-bia-text-tertiary" />
        <input
          type="text"
          placeholder="Search exercises..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-bia-text-primary placeholder:text-bia-text-tertiary focus:outline-none focus:ring-2 focus:ring-bia-primary/50"
        />
      </div>

      {/* Exercise List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-12 glass-panel">
            <Target className="w-12 h-12 text-bia-text-tertiary mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-bia-text-secondary">
              No exercises recorded
            </h3>
            <p className="text-bia-text-tertiary max-w-md mx-auto mt-2">
              Regular testing validates your recovery plans. Log your first
              exercise to start tracking preparedness.
            </p>
          </div>
        ) : (
          filteredRecords.map((record) => {
            const StatusIcon = getStatusIcon(record.status);
            const statusColor = getStatusColor(record.status);

            return (
              <div
                key={record.id}
                className="glass-panel p-5 hover:border-bia-primary/30 transition-colors group relative">
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenModal(record)}
                    className="p-2 hover:bg-white/10 rounded-lg text-bia-text-secondary hover:text-white transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(record.id)}
                    className="p-2 hover:bg-bia-critical/20 rounded-lg text-bia-text-secondary hover:text-bia-critical transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-white/5 ${statusColor}`}>
                      <StatusIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-bia-text-primary">
                        {record.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-bia-text-secondary">
                        <span className="capitalize">{record.type}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span>
                          {record.scheduledDate
                            ? format(
                                new Date(record.scheduledDate),
                                "MMM d, yyyy",
                              )
                            : "TBD"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 capitalize ${statusColor}`}>
                    {record.status}
                  </div>
                </div>

                <p className="text-bia-text-secondary text-sm mb-4 line-clamp-2 pl-[52px]">
                  {record.description}
                </p>

                <div className="pl-[52px] flex flex-wrap gap-2">
                  {(record.scope?.processIds?.length ?? 0) > 0 && (
                    <div className="px-2 py-1 bg-white/5 rounded text-xs text-bia-text-tertiary flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {record.scope?.processIds?.length ?? 0} Process(es)
                    </div>
                  )}
                  {(record.scope?.resourceIds?.length ?? 0) > 0 && (
                    <div className="px-2 py-1 bg-white/5 rounded text-xs text-bia-text-tertiary flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {record.scope?.resourceIds?.length ?? 0} Resource(s)
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl glass-panel p-6 max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-bia-text-primary">
                {editingRecord ? "Edit Exercise" : "Log New Exercise"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-bia-text-tertiary hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-bia-text-secondary">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-bia-text-primary focus:outline-none focus:border-bia-primary"
                    placeholder="e.g. Annual DR Test"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-bia-text-secondary">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scheduledDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-bia-text-primary focus:outline-none focus:border-bia-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-bia-text-secondary">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as ExerciseType,
                      })
                    }
                    className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-bia-text-primary focus:outline-none focus:border-bia-primary">
                    {EXERCISE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-bia-text-secondary">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as ExerciseStatus,
                      })
                    }
                    className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-bia-text-primary focus:outline-none focus:border-bia-primary">
                    {STATUS_OPTS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-bia-text-secondary">
                  Description & Objectives
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-bia-text-primary focus:outline-none focus:border-bia-primary h-24 resize-none"
                  placeholder="Describe the exercise scope and objectives..."
                />
              </div>

              {/* Enhanced Scope Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-bia-text-secondary mb-1 block">
                  Exercise Scope
                </label>
                <div className="bg-black/20 border border-white/10 rounded-lg overflow-hidden">
                  <div className="flex border-b border-white/10">
                    <button
                      onClick={() => setScopeType("processes")}
                      className={`flex-1 py-2 text-xs font-medium uppercase tracking-wider transition-colors ${scopeType === "processes" ? "bg-bia-primary/20 text-bia-primary" : "text-bia-text-tertiary hover:bg-white/5"}`}>
                      Processes ({formData.scope?.processIds.length})
                    </button>
                    <button
                      onClick={() => setScopeType("resources")}
                      className={`flex-1 py-2 text-xs font-medium uppercase tracking-wider transition-colors ${scopeType === "resources" ? "bg-bia-primary/20 text-bia-primary" : "text-bia-text-tertiary hover:bg-white/5"}`}>
                      Resources ({formData.scope?.resourceIds.length})
                    </button>
                  </div>
                  <div className="h-40 overflow-y-auto p-2 space-y-1">
                    {scopeType === "processes" ? (
                      processes.length === 0 ? (
                        <p className="text-xs text-bia-text-tertiary text-center py-4">
                          No processes found.
                        </p>
                      ) : (
                        processes.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => toggleScopeItem(p.id, "processes")}
                            className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${formData.scope?.processIds.includes(p.id) ? "bg-bia-primary/10 border border-bia-primary/30" : "hover:bg-white/5 border border-transparent"}`}>
                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center ${formData.scope?.processIds.includes(p.id) ? "bg-bia-primary border-bia-primary" : "border-white/20"}`}>
                              {formData.scope?.processIds.includes(p.id) && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <span className="text-sm text-bia-text-primary">
                              {p.name}
                            </span>
                          </div>
                        ))
                      )
                    ) : businessResources.length === 0 ? (
                      <p className="text-xs text-bia-text-tertiary text-center py-4">
                        No resources found.
                      </p>
                    ) : (
                      businessResources.map((r) => (
                        <div
                          key={r.id}
                          onClick={() => toggleScopeItem(r.id, "resources")}
                          className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${formData.scope?.resourceIds.includes(r.id) ? "bg-bia-primary/10 border border-bia-primary/30" : "hover:bg-white/5 border border-transparent"}`}>
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center ${formData.scope?.resourceIds.includes(r.id) ? "bg-bia-primary border-bia-primary" : "border-white/20"}`}>
                            {formData.scope?.resourceIds.includes(r.id) && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <span className="text-sm text-bia-text-primary">
                            {r.name}
                          </span>
                          <span className="text-xs text-bia-text-tertiary ml-auto uppercase">
                            {r.type}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-bia-text-secondary">
                    Participants
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={participantInput}
                      onChange={(e) => setParticipantInput(e.target.value)}
                      className="flex-1 px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-bia-text-primary focus:outline-none focus:border-bia-primary"
                      placeholder="Add participant"
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleAddParticipant()
                      }
                    />
                    <button
                      onClick={handleAddParticipant}
                      className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-bia-text-primary text-sm">
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.participants?.map((p, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1 px-2 py-1 bg-bia-primary/20 text-bia-primary rounded-md text-xs">
                        <span>{p}</span>
                        <button
                          onClick={() => handleRemoveParticipant(i)}
                          className="hover:text-white">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Findings & Actions (Conditional) */}
                <div className="border-t border-white/10 pt-4 space-y-4 col-span-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-bia-text-secondary">
                      Key Findings / Observations
                    </label>
                    <textarea
                      value={formData.findings}
                      onChange={(e) =>
                        setFormData({ ...formData, findings: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-bia-text-primary focus:outline-none focus:border-bia-primary min-h-[80px]"
                      placeholder="What went well? What failed? Key learnings..."
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-bia-text-secondary flex items-center gap-2">
                        <ListTodo className="w-4 h-4" />
                        Action Tracking
                      </label>
                      <div className="text-xs text-bia-text-tertiary">
                        {formData.followUpActions?.length || 0} Actions Pending
                      </div>
                    </div>

                    {/* Action List */}
                    <div className="space-y-2">
                      {formData.followUpActions?.map((action) => (
                        <div
                          key={action.id}
                          className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-start justify-between group">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`w-2 h-2 rounded-full ${action.status === "completed" ? "bg-bia-success" : "bg-bia-primary"}`}
                              />
                              <p className="text-sm text-bia-text-primary font-medium">
                                {action.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-bia-text-tertiary pl-4">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" /> {action.owner}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> Due:{" "}
                                {action.dueDate}
                              </span>
                              <span className="uppercase px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px]">
                                {action.status}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveAction(action.id)}
                            className="p-1.5 text-bia-text-tertiary hover:text-bia-critical opacity-0 group-hover:opacity-100 transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {(!formData.followUpActions ||
                        formData.followUpActions.length === 0) && (
                        <div className="text-center py-4 border border-dashed border-white/10 rounded-lg text-sm text-bia-text-tertiary">
                          No follow-up actions logged.
                        </div>
                      )}
                    </div>

                    {/* Add Action Form */}
                    <div className="bg-black/20 p-3 rounded-lg border border-white/10 space-y-3">
                      <input
                        type="text"
                        value={newAction.description}
                        onChange={(e) =>
                          setNewAction({
                            ...newAction,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded text-sm text-bia-text-primary focus:outline-none focus:border-bia-primary"
                        placeholder="Action description..."
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newAction.owner}
                          onChange={(e) =>
                            setNewAction({
                              ...newAction,
                              owner: e.target.value,
                            })
                          }
                          className="flex-1 px-3 py-2 bg-black/20 border border-white/10 rounded text-sm text-bia-text-primary focus:outline-none focus:border-bia-primary"
                          placeholder="Owner (e.g. IT Team)"
                        />
                        <input
                          type="date"
                          value={newAction.dueDate}
                          onChange={(e) =>
                            setNewAction({
                              ...newAction,
                              dueDate: e.target.value,
                            })
                          }
                          className="w-32 px-3 py-2 bg-black/20 border border-white/10 rounded text-sm text-bia-text-primary focus:outline-none focus:border-bia-primary"
                        />
                        <button
                          onClick={handleAddAction}
                          disabled={
                            !newAction.description ||
                            !newAction.owner ||
                            !newAction.dueDate
                          }
                          className="px-3 py-2 bg-bia-primary text-white rounded hover:bg-bia-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end gap-3 mt-auto">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-bia-text-secondary hover:text-white transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-2 bg-bia-primary text-white rounded-lg hover:bg-bia-primary/90 transition-colors shadow-lg shadow-bia-primary/20">
                  <Save className="w-4 h-4" />
                  <span>Save Record</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
