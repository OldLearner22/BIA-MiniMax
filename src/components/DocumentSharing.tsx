import React, { useState, useEffect, useCallback } from "react";

interface Share {
  id: string;
  documentId: string;
  sharedBy: string;
  shareType: "DIRECT_LINK" | "USER" | "GROUP" | "PUBLIC";
  permission: "VIEW" | "COMMENT" | "EDIT" | "FULL_ACCESS";
  sharedWith?: string;
  expiresAt?: string;
  accessCount: number;
  lastAccessed?: string;
  createdAt: string;
}

interface DocumentSharingProps {
  documentId: string;
  documentTitle: string;
  currentUser?: string;
}

export default function DocumentSharing({
  documentId,
  documentTitle,
  currentUser = "system",
}: DocumentSharingProps) {
  const [shares, setShares] = useState<Share[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateShare, setShowCreateShare] = useState(false);
  const [newShare, setNewShare] = useState({
    shareType: "USER" as const,
    permission: "VIEW" as const,
    sharedWith: "",
    expiresAt: "",
  });

  const fetchShares = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/documents/${documentId}/shares`);
      if (!response.ok) {
        throw new Error("Failed to fetch shares");
      }
      const data = await response.json();
      setShares(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    fetchShares();
  }, [fetchShares]);

  const createShare = async () => {
    try {
      const response = await fetch(`/api/documents/${documentId}/shares`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newShare,
          sharedBy: currentUser,
          expiresAt: newShare.expiresAt ? new Date(newShare.expiresAt) : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create share");
      }

      await fetchShares();
      setShowCreateShare(false);
      setNewShare({
        shareType: "USER",
        permission: "VIEW",
        sharedWith: "",
        expiresAt: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create share");
    }
  };

  const deleteShare = async (shareId: string) => {
    if (!confirm("Are you sure you want to revoke this share?")) return;

    try {
      const response = await fetch(
        `/api/documents/${documentId}/shares/${shareId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete share");
      }

      await fetchShares();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete share");
    }
  };

  const copyShareLink = (shareId: string) => {
    const link = `${window.location.origin}/share/${shareId}`;
    navigator.clipboard.writeText(link);
    alert("Share link copied to clipboard!");
  };

  const getShareTypeLabel = (type: string) => {
    switch (type) {
      case "DIRECT_LINK":
        return "🔗 Direct Link";
      case "USER":
        return "👤 User";
      case "GROUP":
        return "👥 Group";
      case "PUBLIC":
        return "🌐 Public";
      default:
        return type;
    }
  };

  const getPermissionLabel = (permission: string) => {
    switch (permission) {
      case "VIEW":
        return "👁️ View";
      case "COMMENT":
        return "💬 Comment";
      case "EDIT":
        return "✏️ Edit";
      case "FULL_ACCESS":
        return "🔓 Full Access";
      default:
        return permission;
    }
  };

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case "VIEW":
        return "text-green-400";
      case "COMMENT":
        return "text-blue-400";
      case "EDIT":
        return "text-yellow-400";
      case "FULL_ACCESS":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const isExpired = (expiresAt?: string) => {
    return expiresAt && new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="glass-panel p-6">
        <div className="text-center py-8">Loading shares...</div>
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Document Sharing</h2>
        <button
          className="glass-btn px-4 py-2"
          onClick={() => setShowCreateShare(true)}>
          + Share Document
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded text-red-400">
          {error}
        </div>
      )}

      {/* Shares List */}
      <div className="space-y-3">
        {shares.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            This document is not shared with anyone. Click "Share Document" to
            create a share.
          </div>
        ) : (
          shares.map((share) => (
            <div
              key={share.id}
              className={`p-4 border rounded ${
                isExpired(share.expiresAt)
                  ? "border-red-500/30 bg-red-500/5"
                  : "border-bia-bg-end/20"
              }`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {getShareTypeLabel(share.shareType)}
                  </span>
                  <span
                    className={`font-medium ${getPermissionColor(
                      share.permission,
                    )}`}>
                    {getPermissionLabel(share.permission)}
                  </span>
                  {isExpired(share.expiresAt) && (
                    <span className="text-xs px-2 py-1 bg-red-500/20 text-red-300 rounded">
                      Expired
                    </span>
                  )}
                </div>
                <button
                  className="text-red-400 hover:text-red-300 text-sm"
                  onClick={() => deleteShare(share.id)}>
                  Revoke
                </button>
              </div>

              <div className="space-y-2 text-sm">
                {share.sharedWith && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Shared with:</span>
                    <span className="font-medium">{share.sharedWith}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-400">Shared by:</span>
                  <span>{share.sharedBy}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Created:</span>
                  <span>{new Date(share.createdAt).toLocaleString()}</span>
                </div>

                {share.expiresAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">
                      {isExpired(share.expiresAt) ? "Expired:" : "Expires:"}
                    </span>
                    <span
                      className={
                        isExpired(share.expiresAt) ? "text-red-400" : ""
                      }>
                      {new Date(share.expiresAt).toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-400">Access count:</span>
                  <span className="font-medium">{share.accessCount}</span>
                </div>

                {share.lastAccessed && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last accessed:</span>
                    <span>{new Date(share.lastAccessed).toLocaleString()}</span>
                  </div>
                )}
              </div>

              {share.shareType === "DIRECT_LINK" &&
                !isExpired(share.expiresAt) && (
                  <button
                    className="mt-3 glass-btn text-sm px-3 py-1 w-full"
                    onClick={() => copyShareLink(share.id)}>
                    Copy Share Link
                  </button>
                )}
            </div>
          ))
        )}
      </div>

      {/* Create Share Modal */}
      {showCreateShare && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-panel max-w-lg w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Share Document</h2>
            <p className="text-sm text-gray-400 mb-4">
              Share "{documentTitle}" with others
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Share Type
                </label>
                <select
                  className="glass-input w-full"
                  value={newShare.shareType}
                  onChange={(e) =>
                    setNewShare({
                      ...newShare,
                      shareType: e.target.value as any,
                    })
                  }>
                  <option value="DIRECT_LINK">🔗 Direct Link</option>
                  <option value="USER">👤 Specific User</option>
                  <option value="GROUP">👥 Group</option>
                  <option value="PUBLIC">🌐 Public</option>
                </select>
              </div>

              {(newShare.shareType === "USER" ||
                newShare.shareType === "GROUP") && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {newShare.shareType === "USER"
                      ? "User Email"
                      : "Group Name"}
                  </label>
                  <input
                    type="text"
                    className="glass-input w-full"
                    placeholder={
                      newShare.shareType === "USER"
                        ? "user@example.com"
                        : "Group name"
                    }
                    value={newShare.sharedWith}
                    onChange={(e) =>
                      setNewShare({ ...newShare, sharedWith: e.target.value })
                    }
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Permission
                </label>
                <select
                  className="glass-input w-full"
                  value={newShare.permission}
                  onChange={(e) =>
                    setNewShare({
                      ...newShare,
                      permission: e.target.value as any,
                    })
                  }>
                  <option value="VIEW">👁️ View Only</option>
                  <option value="COMMENT">💬 View & Comment</option>
                  <option value="EDIT">✏️ Edit</option>
                  <option value="FULL_ACCESS">🔓 Full Access</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Expires At (optional)
                </label>
                <input
                  type="datetime-local"
                  className="glass-input w-full"
                  value={newShare.expiresAt}
                  onChange={(e) =>
                    setNewShare({ ...newShare, expiresAt: e.target.value })
                  }
                />
                <p className="text-xs text-gray-400 mt-1">
                  Leave empty for no expiration
                </p>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  className="glass-btn px-4 py-2"
                  onClick={createShare}
                  disabled={
                    (newShare.shareType === "USER" ||
                      newShare.shareType === "GROUP") &&
                    !newShare.sharedWith.trim()
                  }>
                  Create Share
                </button>
                <button
                  className="glass-btn px-4 py-2"
                  onClick={() => setShowCreateShare(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
