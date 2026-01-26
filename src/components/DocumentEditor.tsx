import React from "react";

interface DocumentEditorProps {
  docId?: string;
  onBack: () => void;
}

export default function DocumentEditor({ docId, onBack }: DocumentEditorProps) {
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const fetchDocument = React.useCallback(async () => {
    if (!docId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/documents/${docId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch document");
      }
      const data = await response.json();
      setTitle(data.title);
      setContent(data.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [docId]);

  React.useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const method = docId ? "PUT" : "POST";
      const url = docId ? `/api/documents/${docId}` : "/api/documents";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          createdBy: "system", // TODO: Replace with actual user ID from auth
          updatedBy: "system", // TODO: Replace with actual user ID from auth
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save document");
      }

      onBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-panel p-4">
        <div className="text-center py-8">Loading document...</div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-4">
      <button className="glass-btn mb-2" onClick={onBack}>
        Back
      </button>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded text-red-300">
          {error}
        </div>
      )}

      <div className="mb-4">
        <input
          className="glass-input w-full mb-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Document Title"
          disabled={saving}
        />
        <textarea
          className="glass-input w-full h-64"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Document Content (Markdown supported)"
          disabled={saving}
        />
      </div>

      <div className="flex gap-2">
        <button
          className="glass-btn px-4 py-2"
          onClick={handleSave}
          disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          className="glass-btn px-4 py-2"
          onClick={onBack}
          disabled={saving}>
          Cancel
        </button>
      </div>
    </div>
  );
}
