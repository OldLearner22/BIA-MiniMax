import React from "react";

interface Document {
  id: string;
  title: string;
  status: string;
  updatedAt: string;
  category?: {
    name: string;
  };
}

interface DocumentListProps {
  onSelect: (id: string) => void;
  onCreate: () => void;
}

export default function DocumentList({
  onSelect,
  onCreate,
}: DocumentListProps) {
  const [documents, setDocuments] = React.useState<Document[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/documents");
      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }
      const data = await response.json();
      setDocuments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-panel p-4">
        <div className="text-center py-8">Loading documents...</div>
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
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Documents</h3>
        <button className="glass-btn px-4 py-2" onClick={onCreate}>
          New Document
        </button>
      </div>
      <div className="glass-panel p-4">
        {documents.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No documents found. Create your first document to get started.
          </div>
        ) : (
          <ul className="space-y-2">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="flex justify-between items-center py-3 px-4 border-b border-bia-bg-end/20 hover:bg-bia-bg-end/10 rounded">
                <div>
                  <div className="font-medium">{doc.title}</div>
                  <div className="text-sm text-gray-400">
                    {doc.category?.name && (
                      <span className="mr-2">📁 {doc.category.name}</span>
                    )}
                    <span>
                      📅 {new Date(doc.updatedAt).toLocaleDateString()}
                    </span>
                    <span
                      className={`ml-2 px-2 py-1 text-xs rounded ${
                        doc.status === "PUBLISHED"
                          ? "bg-green-500/20 text-green-300"
                          : doc.status === "DRAFT"
                            ? "bg-yellow-500/20 text-yellow-300"
                            : "bg-gray-500/20 text-gray-300"
                      }`}>
                      {doc.status}
                    </span>
                  </div>
                </div>
                <button
                  className="glass-btn text-xs px-3 py-1"
                  onClick={() => onSelect(doc.id)}>
                  View
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
