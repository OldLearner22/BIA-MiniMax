import React, { useState, useEffect, useCallback } from "react";

interface ApprovalStep {
  id: string;
  stepNumber: number;
  title: string;
  description?: string;
  requiredRole?: string;
  approvers: string[];
  status: "PENDING" | "IN_REVIEW" | "APPROVED" | "REJECTED" | "SKIPPED";
  assignedTo?: string;
  comments?: string;
  approvedAt?: string;
}

interface Workflow {
  id: string;
  documentId: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "APPROVED" | "REJECTED" | "CANCELLED";
  currentStep: number;
  initiatedBy: string;
  initiatedAt: string;
  completedAt?: string;
  rejectionReason?: string;
  steps: ApprovalStep[];
}

interface ApprovalWorkflowProps {
  documentId: string;
  documentTitle: string;
  currentUser?: string;
  onWorkflowUpdate?: () => void;
}

export default function ApprovalWorkflow({
  documentId,
  documentTitle,
  currentUser = "system",
  onWorkflowUpdate,
}: ApprovalWorkflowProps) {
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStartWorkflow, setShowStartWorkflow] = useState(false);
  const [newWorkflowSteps, setNewWorkflowSteps] = useState<
    Array<{ title: string; approvers: string[] }>
  >([]);
  const [rejectionReason, setRejectionReason] = useState("");
  const [comments, setComments] = useState("");

  const fetchWorkflow = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/documents/${documentId}/workflow`);
      if (!response.ok) {
        throw new Error("Failed to fetch workflow");
      }
      const data = await response.json();
      setWorkflow(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    fetchWorkflow();
  }, [fetchWorkflow]);

  const startWorkflow = async () => {
    try {
      const response = await fetch(
        `/api/documents/${documentId}/workflow/start`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            initiatedBy: currentUser,
            steps: newWorkflowSteps,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to start workflow");
      }

      await fetchWorkflow();
      setShowStartWorkflow(false);
      setNewWorkflowSteps([]);
      if (onWorkflowUpdate) onWorkflowUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start workflow");
    }
  };

  const approveStep = async (stepId: string) => {
    try {
      const response = await fetch(
        `/api/documents/${documentId}/workflow/approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stepId,
            approvedBy: currentUser,
            comments,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to approve step");
      }

      await fetchWorkflow();
      setComments("");
      if (onWorkflowUpdate) onWorkflowUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve step");
    }
  };

  const rejectWorkflow = async (stepId: string) => {
    try {
      const response = await fetch(
        `/api/documents/${documentId}/workflow/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stepId,
            rejectedBy: currentUser,
            comments,
            rejectionReason,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to reject workflow");
      }

      await fetchWorkflow();
      setRejectionReason("");
      setComments("");
      if (onWorkflowUpdate) onWorkflowUpdate();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reject workflow",
      );
    }
  };

  const addWorkflowStep = () => {
    setNewWorkflowSteps([
      ...newWorkflowSteps,
      { title: "", approvers: [currentUser] },
    ]);
  };

  const updateWorkflowStep = (index: number, field: string, value: any) => {
    const updated = [...newWorkflowSteps];
    updated[index] = { ...updated[index], [field]: value };
    setNewWorkflowSteps(updated);
  };

  const removeWorkflowStep = (index: number) => {
    setNewWorkflowSteps(newWorkflowSteps.filter((_, i) => i !== index));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "text-yellow-400";
      case "IN_REVIEW":
        return "text-blue-400";
      case "APPROVED":
        return "text-green-400";
      case "REJECTED":
        return "text-red-400";
      case "SKIPPED":
        return "text-gray-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      NOT_STARTED: "bg-gray-500/20 text-gray-300",
      IN_PROGRESS: "bg-blue-500/20 text-blue-300",
      APPROVED: "bg-green-500/20 text-green-300",
      REJECTED: "bg-red-500/20 text-red-300",
      CANCELLED: "bg-gray-500/20 text-gray-300",
    };
    return colors[status as keyof typeof colors] || colors.NOT_STARTED;
  };

  if (loading) {
    return (
      <div className="glass-panel p-4">
        <div className="text-center py-8">Loading workflow...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-4">
        <div className="text-center py-8 text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Approval Workflow</h2>
        {!workflow || workflow.status === "NOT_STARTED" ? (
          <button
            className="glass-btn px-4 py-2"
            onClick={() => setShowStartWorkflow(true)}>
            Start Workflow
          </button>
        ) : null}
      </div>

      {showStartWorkflow && (
        <div className="mb-6 p-4 border border-bia-bg-end/20 rounded">
          <h3 className="font-medium mb-4">Configure Approval Steps</h3>
          {newWorkflowSteps.map((step, index) => (
            <div key={index} className="mb-3 p-3 bg-bia-bg-end/10 rounded">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium">Step {index + 1}</span>
                <button
                  className="text-red-400 text-sm hover:text-red-300"
                  onClick={() => removeWorkflowStep(index)}>
                  Remove
                </button>
              </div>
              <input
                type="text"
                className="glass-input w-full mb-2"
                placeholder="Step title (e.g., Manager Review)"
                value={step.title}
                onChange={(e) =>
                  updateWorkflowStep(index, "title", e.target.value)
                }
              />
              <input
                type="text"
                className="glass-input w-full"
                placeholder="Approvers (comma-separated emails)"
                value={step.approvers.join(", ")}
                onChange={(e) =>
                  updateWorkflowStep(
                    index,
                    "approvers",
                    e.target.value.split(",").map((s) => s.trim()),
                  )
                }
              />
            </div>
          ))}
          <button
            className="glass-btn text-sm px-3 py-1 mb-3"
            onClick={addWorkflowStep}>
            + Add Step
          </button>
          <div className="flex gap-2">
            <button
              className="glass-btn px-4 py-2"
              onClick={startWorkflow}
              disabled={newWorkflowSteps.length === 0}>
              Start Workflow
            </button>
            <button
              className="glass-btn px-4 py-2"
              onClick={() => {
                setShowStartWorkflow(false);
                setNewWorkflowSteps([]);
              }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {workflow && workflow.status !== "NOT_STARTED" && (
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div
              className={`px-3 py-1 rounded-full text-sm ${getStatusBadge(workflow.status)}`}>
              {workflow.status}
            </div>
            <div className="text-sm text-gray-400">
              Started by {workflow.initiatedBy} on{" "}
              {new Date(workflow.initiatedAt).toLocaleString()}
            </div>
            {workflow.completedAt && (
              <div className="text-sm text-gray-400">
                Completed on {new Date(workflow.completedAt).toLocaleString()}
              </div>
            )}
          </div>

          {workflow.rejectionReason && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded mb-4">
              <div className="text-sm font-medium text-red-400 mb-1">
                Rejection Reason
              </div>
              <div className="text-sm">{workflow.rejectionReason}</div>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="font-medium">Approval Steps</h3>
            {workflow.steps.map((step, index) => (
              <div
                key={step.id}
                className={`p-4 border rounded ${
                  step.status === "PENDING" || step.status === "IN_REVIEW"
                    ? "border-bia-bg-end/20"
                    : step.status === "APPROVED"
                      ? "border-green-500/30"
                      : "border-red-500/30"
                }`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium">
                      Step {step.stepNumber}: {step.title}
                    </div>
                    {step.description && (
                      <div className="text-sm text-gray-400">
                        {step.description}
                      </div>
                    )}
                  </div>
                  <div className={getStatusColor(step.status)}>
                    {step.status}
                  </div>
                </div>

                {step.requiredRole && (
                  <div className="text-sm text-gray-400 mb-2">
                    Required Role: {step.requiredRole}
                  </div>
                )}

                {step.assignedTo && (
                  <div className="text-sm mb-2">
                    Assigned to:{" "}
                    <span className="text-blue-300">{step.assignedTo}</span>
                  </div>
                )}

                {step.approvedAt && (
                  <div className="text-sm text-green-400 mb-2">
                    Approved on {new Date(step.approvedAt).toLocaleString()}
                  </div>
                )}

                {step.comments && (
                  <div className="text-sm text-gray-300 mb-3 bg-bia-bg-end/10 p-2 rounded">
                    {step.comments}
                  </div>
                )}

                {(step.status === "PENDING" || step.status === "IN_REVIEW") &&
                  step.assignedTo === currentUser && (
                    <div className="space-y-2">
                      <textarea
                        className="glass-input w-full"
                        rows={2}
                        placeholder="Add comments (optional)"
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button
                          className="glass-btn bg-green-500/20 hover:bg-green-500/30 px-3 py-1"
                          onClick={() => approveStep(step.id)}>
                          Approve
                        </button>
                        <button
                          className="glass-btn bg-red-500/20 hover:bg-red-500/30 px-3 py-1"
                          onClick={() => {
                            const reason = prompt("Rejection reason:");
                            if (reason) {
                              setRejectionReason(reason);
                              rejectWorkflow(step.id);
                            }
                          }}>
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
