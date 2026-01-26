import React from "react";
import DocumentList from "./DocumentList";
import DocumentEditor from "./DocumentEditor";
import DocumentVersions from "./DocumentVersions";

export default function DocumentationHub() {
  // This is the main container for the documentation module
  // It will route between list, editor, and version views
  const [selectedDocId, setSelectedDocId] = React.useState<string | null>(null);
  const [editMode, setEditMode] = React.useState(false);

  return (
    <div className="glass-panel p-6 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">BCMS Documentation Hub</h2>
      {!selectedDocId ? (
        <DocumentList
          onSelect={(id) => {
            setSelectedDocId(id);
            setEditMode(false);
          }}
          onCreate={() => setEditMode(true)}
        />
      ) : editMode ? (
        <DocumentEditor
          docId={selectedDocId}
          onBack={() => setEditMode(false)}
        />
      ) : (
        <DocumentVersions
          docId={selectedDocId}
          onEdit={() => setEditMode(true)}
          onBack={() => setSelectedDocId(null)}
        />
      )}
    </div>
  );
}
