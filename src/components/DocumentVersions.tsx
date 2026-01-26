import React from "react";

interface DocumentVersion {
  id: string;
  version: number;
  title: string;
  content: string;
  createdBy: string;
  createdAt: string;
  changes?: string;
}

interface DocumentVersionsProps {
  docId: string;
  onEdit: () => void;
  onBack: () => void;
}

export default function DocumentVersions({
  docId,
  onEdit,
  onBack,
}: DocumentVersionsProps) {
  const [versions, setVersions] = React.useState<DocumentVersion[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] =
    React.useState<DocumentVersion | null>(null);

  const fetchVersions = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/documents/${docId}/versions`);
      if (!response.ok) {
        throw new Error("Failed to fetch document versions");
      }
      const data = await response.json();
      setVersions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [docId]);

  React.useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  const viewVersion = (version: DocumentVersion) => {
    setSelectedVersion(version);
  };

  const closeVersionView = () => {
    setSelectedVersion(null);
  };

  if (loading) {
    return (
      <div className="glass-panel p-4">
        <div className="text-center py-8">Loading version history...</div>
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
    <div className="glass-panel p-4">
      <div className="flex justify-between items-center mb-4">
        <button className="glass-btn" onClick={onBack}>
          Back
        </button>
        <button className="glass-btn" onClick={onEdit}>
          Edit Document
        </button>
      </div>

      <h3 className="text-lg font-semibold mb-4">Version History</h3>

      {selectedVersion ? (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">Version {selectedVersion.version}</h4>
            <button className="glass-btn text-xs" onClick={closeVersionView}>
              Close
            </button>
          </div>
          <div className="text-sm text-gray-400 mb-2">
            Created by {selectedVersion.createdBy} on{" "}
            {new Date(selectedVersion.createdAt).toLocaleString()}
          </div>
          {selectedVersion.changes && (
            <div className="text-sm text-gray-300 mb-2">
              <strong>Changes:</strong> {selectedVersion.changes}
            </div>
          )}
          <div className="bg-bia-bg-end/20 p-3 rounded text-sm">
            <div className="font-medium mb-1">{selectedVersion.title}</div>
            <div className="whitespace-pre-wrap">{selectedVersion.content}</div>
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        {versions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No version history available.
          </div>
        ) : (
          versions.map((version) => (
            <div
              key={version.id}
              className="flex justify-between items-center py-3 px-4 border border-bia-bg-end/20 rounded hover:bg-bia-bg-end/10 cursor-pointer"
              onClick={() => viewVersion(version)}>
              <div>
                <div className="font-medium">Version {version.version}</div>
                <div className="text-sm text-gray-400">
                  {version.createdBy} •{" "}
                  {new Date(version.createdAt).toLocaleString()}
                </div>
                {version.changes && (
                  <div className="text-sm text-gray-300 mt-1">
                    {version.changes}
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-400">
                📅 {new Date(version.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
