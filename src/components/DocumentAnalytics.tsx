import React, { useState, useEffect, useCallback } from "react";

interface DocumentStatus {
  status: string;
  _count: number;
}

interface DocumentType {
  type: string;
  _count: number;
}

interface CategoryStats {
  id: string;
  name: string;
  description?: string;
  color?: string;
  _count: {
    documents: number;
    templates: number;
  };
}

interface AccessLog {
  id: string;
  action: string;
  accessedAt: string;
  document?: {
    title: string;
  };
}

interface AnalyticsData {
  totalDocuments: number;
  documentsByStatus: DocumentStatus[];
  documentsByType: DocumentType[];
  documentsByCategory: CategoryStats[];
  recentActivity: AccessLog[];
  pendingApprovals: number;
  overdueReviews: number;
}

export default function DocumentAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [accessLogs, setAccessLogs] = useState<any>(null);
  const [versionMetrics, setVersionMetrics] = useState<any>(null);
  const [gaps, setGaps] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "access" | "versions" | "gaps"
  >("overview");
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const [analyticsRes, gapsRes] = await Promise.all([
        fetch("/api/documents/analytics/dashboard"),
        fetch("/api/documents/gaps"),
      ]);

      if (!analyticsRes.ok || !gapsRes.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const [analyticsData, gapsData] = await Promise.all([
        analyticsRes.json(),
        gapsRes.json(),
      ]);

      setAnalytics(analyticsData);
      setGaps(gapsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAccessAnalytics = async () => {
    try {
      const response = await fetch("/api/documents/analytics/access");
      if (!response.ok) {
        throw new Error("Failed to fetch access analytics");
      }
      const data = await response.json();
      setAccessLogs(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch access analytics",
      );
    }
  };

  const fetchVersionAnalytics = async () => {
    try {
      const response = await fetch("/api/documents/analytics/versions");
      if (!response.ok) {
        throw new Error("Failed to fetch version analytics");
      }
      const data = await response.json();
      setVersionMetrics(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch version analytics",
      );
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    if (activeTab === "access") {
      fetchAccessAnalytics();
    } else if (activeTab === "versions") {
      fetchVersionAnalytics();
    }
  }, [activeTab]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: "#f59e0b",
      REVIEW: "#3b82f6",
      APPROVED: "#10b981",
      PUBLISHED: "#8b5cf6",
      ARCHIVED: "#6b7280",
    };
    return colors[status] || "#6b7280";
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      MANUAL: "#6b7280",
      AUTO_GENERATED: "#3b82f6",
      TEMPLATE_BASED: "#10b981",
      POLICY: "#8b5cf6",
      PROCEDURE: "#f59e0b",
      PLAYBOOK: "#ef4444",
      CHECKLIST: "#14b8a6",
      REPORT: "#ec4899",
    };
    return colors[type] || "#6b7280";
  };

  if (loading) {
    return (
      <div className="glass-panel p-6">
        <div className="text-center py-8">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-6">
        <div className="text-center py-8 text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6">
      <h2 className="text-xl font-semibold mb-6">Document Analytics</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {["overview", "access", "versions", "gaps"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded capitalize ${
              activeTab === tab
                ? "bg-bia-bg-end text-white"
                : "hover:bg-bia-bg-end/50"
            }`}
            onClick={() => setActiveTab(tab as any)}>
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && analytics && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 border border-bia-bg-end/20 rounded">
              <div className="text-sm text-gray-400 mb-1">Total Documents</div>
              <div className="text-3xl font-bold">
                {analytics.totalDocuments}
              </div>
            </div>

            <div className="p-4 border border-bia-bg-end/20 rounded">
              <div className="text-sm text-gray-400 mb-1">
                Pending Approvals
              </div>
              <div className="text-3xl font-bold text-yellow-400">
                {analytics.pendingApprovals}
              </div>
            </div>

            <div className="p-4 border border-bia-bg-end/20 rounded">
              <div className="text-sm text-gray-400 mb-1">Overdue Reviews</div>
              <div className="text-3xl font-bold text-red-400">
                {analytics.overdueReviews}
              </div>
            </div>

            <div className="p-4 border border-bia-bg-end/20 rounded">
              <div className="text-sm text-gray-400 mb-1">Categories</div>
              <div className="text-3xl font-bold">
                {analytics.documentsByCategory.length}
              </div>
            </div>
          </div>

          {/* Documents by Status */}
          <div>
            <h3 className="font-medium mb-3">Documents by Status</h3>
            <div className="space-y-2">
              {analytics.documentsByStatus.map((item) => (
                <div key={item.status} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getStatusColor(item.status) }}
                  />
                  <div className="flex-1 flex justify-between">
                    <span>{item.status}</span>
                    <span className="font-medium">{item._count}</span>
                  </div>
                  <div
                    className="h-2 rounded"
                    style={{
                      width: `${(item._count / analytics.totalDocuments) * 100}%`,
                      backgroundColor: getStatusColor(item.status),
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Documents by Type */}
          <div>
            <h3 className="font-medium mb-3">Documents by Type</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {analytics.documentsByType.map((item) => (
                <div
                  key={item.type}
                  className="p-3 border border-bia-bg-end/20 rounded text-center">
                  <div
                    className="w-4 h-4 rounded-full mx-auto mb-2"
                    style={{ backgroundColor: getTypeColor(item.type) }}
                  />
                  <div className="text-xs text-gray-400 mb-1">{item.type}</div>
                  <div className="text-xl font-bold">{item._count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Documents by Category */}
          <div>
            <h3 className="font-medium mb-3">Documents by Category</h3>
            <div className="space-y-2">
              {analytics.documentsByCategory.map((cat) => (
                <div
                  key={cat.id}
                  className="p-3 border border-bia-bg-end/20 rounded flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {cat.color && (
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: cat.color }}
                      />
                    )}
                    <span className="font-medium">{cat.name}</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {cat._count.documents} documents
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h3 className="font-medium mb-3">Recent Activity</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {analytics.recentActivity.map((log) => (
                <div
                  key={log.id}
                  className="p-3 border border-bia-bg-end/20 rounded text-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium">{log.action}</span>
                      {log.document && (
                        <span className="text-gray-400 ml-2">
                          {log.document.title}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(log.accessedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Access Tab */}
      {activeTab === "access" && accessLogs && (
        <div className="space-y-6">
          {/* Most Accessed Documents */}
          <div>
            <h3 className="font-medium mb-3">Most Accessed Documents</h3>
            <div className="space-y-2">
              {accessLogs.mostAccessed?.slice(0, 10).map((item: any) => (
                <div
                  key={item.documentId}
                  className="p-3 border border-bia-bg-end/20 rounded flex justify-between items-center">
                  <span className="font-medium">
                    {item.documentTitle || "Unknown"}
                  </span>
                  <span className="text-lg font-bold text-blue-400">
                    {item._count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Access Logs */}
          <div>
            <h3 className="font-medium mb-3">Recent Access Logs</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {accessLogs.accessLogs?.map((log: AccessLog) => (
                <div
                  key={log.id}
                  className="p-3 border border-bia-bg-end/20 rounded text-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium">{log.action}</span>
                      {log.document && (
                        <span className="text-gray-400 ml-2">
                          {log.document.title}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(log.accessedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Versions Tab */}
      {activeTab === "versions" && versionMetrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-bia-bg-end/20 rounded">
              <div className="text-sm text-gray-400 mb-1">Total Versions</div>
              <div className="text-3xl font-bold">
                {versionMetrics.totalVersions}
              </div>
            </div>

            <div className="p-4 border border-bia-bg-end/20 rounded">
              <div className="text-sm text-gray-400 mb-1">Avg Versions/Doc</div>
              <div className="text-3xl font-bold">
                {versionMetrics.avgVersionsPerDoc?.avg_versions?.toFixed(1) ||
                  "0"}
              </div>
            </div>

            <div className="p-4 border border-bia-bg-end/20 rounded">
              <div className="text-sm text-gray-400 mb-1">Most Versioned</div>
              <div className="text-xl font-bold">
                {versionMetrics.mostVersioned?.[0]?.title || "N/A"}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Recent Changes</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {versionMetrics.recentChanges?.map((change: any) => (
                <div
                  key={change.id}
                  className="p-3 border border-bia-bg-end/20 rounded text-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium">{change.field}</span>
                      {change.document && (
                        <span className="text-gray-400 ml-2">
                          {change.document.title}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(change.createdAt).toLocaleString()}
                    </div>
                  </div>
                  {change.changeReason && (
                    <div className="text-xs text-gray-400 mt-1">
                      {change.changeReason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Gaps Tab */}
      {activeTab === "gaps" && gaps && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Compliance Gaps</h3>
            <div className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm">
              {gaps.total} gaps found
            </div>
          </div>

          {gaps.gaps.length === 0 ? (
            <div className="text-center py-8 text-green-400">
              No compliance gaps detected! All documentation requirements are
              met.
            </div>
          ) : (
            <div className="space-y-3">
              {gaps.gaps.map((gap: any, index: number) => (
                <div
                  key={index}
                  className={`p-4 border rounded ${
                    gap.severity === "critical"
                      ? "border-red-500/50 bg-red-500/10"
                      : gap.severity === "high"
                        ? "border-orange-500/50 bg-orange-500/10"
                        : "border-yellow-500/50 bg-yellow-500/10"
                  }`}>
                  <div className="flex items-start gap-2">
                    <span className="text-lg">
                      {gap.severity === "critical"
                        ? "🔴"
                        : gap.severity === "high"
                          ? "🟠"
                          : "🟡"}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium mb-1">{gap.description}</div>
                      <div className="text-sm text-gray-400 mb-2">
                        Type: {gap.type}
                      </div>
                      {gap.suggestedTemplate && (
                        <div className="text-sm text-blue-400">
                          📄 {gap.suggestedTemplate}
                        </div>
                      )}
                      {gap.suggestedAction && (
                        <div className="text-sm text-blue-400">
                          ⚡ {gap.suggestedAction}
                        </div>
                      )}
                      {gap.documents && (
                        <div className="mt-2 text-sm">
                          {gap.documents.map((doc: any) => (
                            <div key={doc.id} className="text-gray-400">
                              • {doc.title}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
