import React, { useState, useEffect } from "react";

interface ComplianceRequirement {
  id: string;
  frameworkId: string;
  clause: string;
  title: string;
  description: string;
  requiredDocument: string;
  priority: string;
  status: "NOT_ASSESSED" | "NON_COMPLIANT" | "PARTIAL" | "COMPLIANT" | "NOT_APPLICABLE";
  documentId?: string;
  lastReviewed?: string;
  reviewedBy?: string;
  framework: {
    id: string;
    code: string;
    name: string;
  };
  document?: {
    id: string;
    title: string;
    status: string;
  };
}

interface ComplianceFramework {
  id: string;
  code: string;
  name: string;
  description?: string;
  version?: string;
  requirements: ComplianceRequirement[];
}

interface ComplianceMatrixProps {
  documentId?: string;
}

export default function ComplianceMatrix({ documentId }: ComplianceMatrixProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [requirements, setRequirements] = useState<ComplianceRequirement[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const fetchComplianceData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/compliance/matrix");
      if (!response.ok) {
        throw new Error("Failed to fetch compliance matrix");
      }
      const data = await response.json();
      setFrameworks(data.frameworks);

      // Flatten requirements from all frameworks
      const allRequirements: ComplianceRequirement[] = [];
      data.frameworks.forEach((fw: ComplianceFramework) => {
        fw.requirements.forEach((req: any) => {
          allRequirements.push({
            ...req,
            framework: {
              id: fw.id,
              code: fw.code,
              name: fw.name,
            },
          });
        });
      });
      setRequirements(allRequirements);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLIANT":
        return (
          <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
            ✅ Compliant
          </span>
        );
      case "NON_COMPLIANT":
        return (
          <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs">
            ❌ Non-Compliant
          </span>
        );
      case "PARTIAL":
        return (
          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs">
            ⚠️ Partial
          </span>
        );
      case "NOT_ASSESSED":
        return (
          <span className="px-2 py-1 bg-gray-500/20 text-gray-300 rounded text-xs">
            ⏳ Not Assessed
          </span>
        );
      case "NOT_APPLICABLE":
        return (
          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
            ℹ️ N/A
          </span>
        );
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLIANT":
        return "border-green-500/30";
      case "NON_COMPLIANT":
        return "border-red-500/30";
      case "PARTIAL":
        return "border-yellow-500/30";
      case "NOT_ASSESSED":
        return "border-gray-500/30";
      case "NOT_APPLICABLE":
        return "border-blue-500/30";
      default:
        return "border-gray-500/30";
    }
  };

  const filteredRequirements = requirements.filter((req) => {
    const frameworkMatch =
      selectedFramework === "all" || req.framework.code === selectedFramework;
    const statusMatch = selectedStatus === "all" || req.status === selectedStatus;
    return frameworkMatch && statusMatch;
  });

  const complianceStats = {
    total: requirements.length,
    compliant: requirements.filter((r) => r.status === "COMPLIANT").length,
    partial: requirements.filter((r) => r.status === "PARTIAL").length,
    nonCompliant: requirements.filter((r) => r.status === "NON_COMPLIANT").length,
    notAssessed: requirements.filter((r) => r.status === "NOT_ASSESSED").length,
    compliancePercentage:
      requirements.length > 0
        ? Math.round(
          (requirements.filter((r) => r.status === "COMPLIANT").length /
            requirements.length) *
          100
        )
        : 0,
  };

  if (loading) {
    return (
      <div className="glass-panel p-6">
        <div className="text-center py-8">Loading compliance matrix...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-6">
        <div className="text-center py-8 text-red-400">Error: {error}</div>
        <div className="text-center mt-4">
          <button
            className="glass-btn px-4 py-2"
            onClick={fetchComplianceData}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Compliance Matrix</h2>
        <button
          className="glass-btn px-4 py-2"
          onClick={fetchComplianceData}
        >
          Refresh
        </button>
      </div>

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="p-4 border border-bia-bg-end/20 rounded">
          <div className="text-sm text-gray-400 mb-1">Total Requirements</div>
          <div className="text-3xl font-bold">{complianceStats.total}</div>
        </div>

        <div className="p-4 border border-green-500/30 rounded">
          <div className="text-sm text-gray-400 mb-1">Compliant</div>
          <div className="text-3xl font-bold text-green-400">
            {complianceStats.compliant}
          </div>
        </div>

        <div className="p-4 border border-yellow-500/30 rounded">
          <div className="text-sm text-gray-400 mb-1">Partial</div>
          <div className="text-3xl font-bold text-yellow-400">
            {complianceStats.partial}
          </div>
        </div>

        <div className="p-4 border border-red-500/30 rounded">
          <div className="text-sm text-gray-400 mb-1">Non-Compliant</div>
          <div className="text-3xl font-bold text-red-400">
            {complianceStats.nonCompliant}
          </div>
        </div>

        <div className="p-4 border border-gray-500/30 rounded">
          <div className="text-sm text-gray-400 mb-1">Not Assessed</div>
          <div className="text-3xl font-bold text-gray-400">
            {complianceStats.notAssessed}
          </div>
        </div>
      </div>

      {/* Compliance Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Overall Compliance</span>
          <span className="text-lg font-bold text-green-400">
            {complianceStats.compliancePercentage}%
          </span>
        </div>
        <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all"
            style={{ width: `${complianceStats.compliancePercentage}%` }}
          />
        </div>
      </div>

      {/* Framework Breakdown */}
      <div className="mb-6">
        <h3 className="font-medium mb-3">Compliance by Framework</h3>
        <div className="space-y-2">
          {frameworks.map((framework) => {
            const frameworkRequirements = requirements.filter(
              (r) => r.framework.code === framework.code
            );
            const compliantCount = frameworkRequirements.filter(
              (r) => r.status === "COMPLIANT"
            ).length;
            const percentage =
              frameworkRequirements.length > 0
                ? Math.round(
                  (compliantCount / frameworkRequirements.length) * 100
                )
                : 0;

            return (
              <div key={framework.id}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">{framework.name}</span>
                  <span className="text-sm font-medium">{percentage}%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${percentage >= 80
                        ? "bg-green-500"
                        : percentage >= 50
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select
          className="glass-input"
          title="Select framework"
          value={selectedFramework}
          onChange={(e) => setSelectedFramework(e.target.value)}
        >
          <option value="all">All Frameworks</option>
          {frameworks.map((framework) => (
            <option key={framework.id} value={framework.code}>
              {framework.name}
            </option>
          ))}
        </select>

        <select
          className="glass-input"
          title="Select status"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="COMPLIANT">Compliant</option>
          <option value="PARTIAL">Partial</option>
          <option value="NON_COMPLIANT">Non-Compliant</option>
          <option value="NOT_ASSESSED">Not Assessed</option>
          <option value="NOT_APPLICABLE">Not Applicable</option>
        </select>
      </div>

      {/* Requirements Table */}
      <div className="space-y-3">
        {filteredRequirements.map((req) => (
          <div
            key={req.id}
            className={`p-4 border rounded ${getStatusColor(req.status)}`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{req.framework.name}</span>
                  <span className="text-sm text-gray-400">{req.clause}</span>
                  {getStatusBadge(req.status)}
                </div>
                <div className="font-semibold text-white mb-1">{req.title}</div>
                <div className="text-sm text-gray-300">{req.description}</div>
              </div>
            </div>

            <div className="mt-3 space-y-1 text-sm">
              <div>
                <span className="text-gray-400">Required Document: </span>
                <span className="font-medium">{req.requiredDocument}</span>
              </div>
              {req.document && (
                <div>
                  <span className="text-gray-400">Linked Document: </span>
                  <span className="text-blue-400 hover:underline cursor-pointer">
                    {req.document.title}
                  </span>
                </div>
              )}
              {req.lastReviewed && (
                <div>
                  <span className="text-gray-400">Last Reviewed: </span>
                  <span>
                    {new Date(req.lastReviewed).toLocaleDateString()}
                  </span>
                  {req.reviewedBy && (
                    <span className="text-gray-400"> by {req.reviewedBy}</span>
                  )}
                </div>
              )}
            </div>

            {req.status !== "COMPLIANT" && req.status !== "NOT_APPLICABLE" && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <button className="glass-btn text-sm px-3 py-1">
                  Link Document
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredRequirements.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No compliance requirements match the selected filters.
        </div>
      )}
    </div>
  );
}
