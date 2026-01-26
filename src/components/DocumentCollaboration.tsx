import React, { useState, useEffect, useCallback } from "react";

interface Collaboration {
  id: string;
  type: "COMMENT" | "SUGGESTION" | "REVIEW" | "QUESTION";
  content: string;
  position?: {
    line?: number;
    offset?: number;
    text?: string;
  };
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface DocumentCollaborationProps {
  documentId: string;
  currentUser?: string;
  showResolved?: boolean;
}

export default function DocumentCollaboration({
  documentId,
  currentUser = "system",
  showResolved = false,
}: DocumentCollaborationProps) {
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddComment, setShowAddComment] = useState(false);
  const [newComment, setNewComment] = useState({
    type: "COMMENT" as const,
    content: "",
    position: null as any,
  });
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const fetchCollaborations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/documents/${documentId}/collaborations?resolved=${showResolved}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch collaborations");
      }
      const data = await response.json();
      setCollaborations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [documentId, showResolved]);

  useEffect(() => {
    fetchCollaborations();
  }, [fetchCollaborations]);

  const addCollaboration = async () => {
    if (!newComment.content.trim()) return;

    try {
      const response = await fetch(
        `/api/documents/${documentId}/collaborations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: newComment.type,
            content: newComment.content,
            position: newComment.position,
            createdBy: currentUser,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      await fetchCollaborations();
      setShowAddComment(false);
      setNewComment({
        type: "COMMENT",
        content: "",
        position: null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add comment");
    }
  };

  const resolveCollaboration = async (collabId: string) => {
    try {
      const response = await fetch(
        `/api/documents/${documentId}/collaborations/${collabId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resolved: true,
            resolvedBy: currentUser,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to resolve comment");
      }

      await fetchCollaborations();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to resolve comment",
      );
    }
  };

  const deleteCollaboration = async (collabId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      const response = await fetch(
        `/api/documents/${documentId}/collaborations/${collabId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      await fetchCollaborations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete comment");
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "COMMENT":
        return "💬";
      case "SUGGESTION":
        return "💡";
      case "REVIEW":
        return "👁️";
      case "QUESTION":
        return "❓";
      default:
        return "💬";
    }
  };

  const getTypeLabel = (type: string) => {
    return type.charAt(0) + type.slice(1).toLowerCase();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "COMMENT":
        return "text-blue-400";
      case "SUGGESTION":
        return "text-yellow-400";
      case "REVIEW":
        return "text-purple-400";
      case "QUESTION":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="glass-panel p-6">
        <div className="text-center py-8">Loading comments...</div>
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

  const unresolvedCount = collaborations.filter((c) => !c.resolved).length;

  return (
    <div className="glass-panel p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Collaboration</h2>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showResolved}
              onChange={(e) => {
                // Toggle would be handled by parent component
              }}
              className="rounded"
            />
            Show Resolved
          </label>
          <button
            className="glass-btn px-4 py-2"
            onClick={() => setShowAddComment(true)}>
            + Add Comment
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded text-red-400">
          {error}
        </div>
      )}

      {/* Unresolved Count Badge */}
      {unresolvedCount > 0 && (
        <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
          <span className="text-yellow-400">
            {unresolvedCount} unresolved{" "}
            {unresolvedCount === 1 ? "comment" : "comments"}
          </span>
        </div>
      )}

      {/* Collaborations List */}
      <div className="space-y-4">
        {collaborations.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No comments yet. Start a conversation about this document.
          </div>
        ) : (
          collaborations.map((collab) => (
            <div
              key={collab.id}
              className={`p-4 border rounded ${
                collab.resolved
                  ? "border-gray-500/20 opacity-60"
                  : "border-bia-bg-end/20"
              }`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">{getTypeIcon(collab.type)}</span>

                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{collab.createdBy}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${getTypeColor(
                          collab.type,
                        )} bg-opacity-10`}>
                        {getTypeLabel(collab.type)}
                      </span>
                      {collab.resolved && (
                        <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-300">
                          Resolved
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(collab.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {collab.position && collab.position.text && (
                    <div className="mb-2 p-2 bg-bia-bg-end/10 rounded text-sm text-gray-400">
                      "{collab.position.text.substring(0, 100)}
                      {collab.position.text.length > 100 ? "..." : ""}"
                    </div>
                  )}

                  <div className="text-gray-300 mb-3">{collab.content}</div>

                  {collab.resolved && collab.resolvedBy && (
                    <div className="text-xs text-green-400 mb-2">
                      Resolved by {collab.resolvedBy} on{" "}
                      {collab.resolvedAt
                        ? new Date(collab.resolvedAt).toLocaleString()
                        : ""}
                    </div>
                  )}

                  {!collab.resolved && collab.createdBy === currentUser && (
                    <div className="flex gap-2">
                      <button
                        className="glass-btn text-sm px-3 py-1 bg-green-500/20 hover:bg-green-500/30"
                        onClick={() => resolveCollaboration(collab.id)}>
                        Resolve
                      </button>
                      <button
                        className="glass-btn text-sm px-3 py-1 bg-red-500/20 hover:bg-red-500/30"
                        onClick={() => deleteCollaboration(collab.id)}>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Modal */}
      {showAddComment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-panel max-w-lg w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Add Comment</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  className="glass-input w-full"
                  value={newComment.type}
                  onChange={(e) =>
                    setNewComment({
                      ...newComment,
                      type: e.target.value as any,
                    })
                  }>
                  <option value="COMMENT">💬 Comment</option>
                  <option value="SUGGESTION">💡 Suggestion</option>
                  <option value="REVIEW">👁️ Review</option>
                  <option value="QUESTION">❓ Question</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Content
                </label>
                <textarea
                  className="glass-input w-full"
                  rows={4}
                  placeholder="Write your comment, suggestion, or question..."
                  value={newComment.content}
                  onChange={(e) =>
                    setNewComment({ ...newComment, content: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-2">
                <button
                  className="glass-btn px-4 py-2"
                  onClick={addCollaboration}
                  disabled={!newComment.content.trim()}>
                  Add Comment
                </button>
                <button
                  className="glass-btn px-4 py-2"
                  onClick={() => setShowAddComment(false)}>
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
