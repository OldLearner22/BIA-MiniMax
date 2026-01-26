import React from "react";
import DocumentVersions from "./DocumentVersions";

export default function VersionControl() {
    const [selectedDocId, setSelectedDocId] = React.useState<string | null>(null);

    const handleEdit = () => {
        console.log("Edit document");
    };

    const handleBack = () => {
        setSelectedDocId(null);
    };

    return (
        <div className="h-full">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-white mb-2">Version Control</h1>
                <p className="text-slate-300">
                    Manage document versions, track changes, and maintain revision history
                </p>
            </div>

            {selectedDocId ? (
                <DocumentVersions
                    docId={selectedDocId}
                    onEdit={handleEdit}
                    onBack={handleBack}
                />
            ) : (
                <div className="bg-slate-800/50 rounded-lg p-8 text-center">
                    <div className="text-6xl mb-4">📑</div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                        Version Control System
                    </h3>
                    <p className="text-slate-400 mb-6">
                        Select a document from the Documentation Hub to view its version
                        history
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                        <div className="bg-slate-700/30 rounded-lg p-4">
                            <div className="text-blue-400 text-2xl mb-2">🔄</div>
                            <h4 className="font-semibold text-white mb-1">
                                Automatic Versioning
                            </h4>
                            <p className="text-sm text-slate-400">
                                Every document change is automatically versioned and tracked
                            </p>
                        </div>
                        <div className="bg-slate-700/30 rounded-lg p-4">
                            <div className="text-green-400 text-2xl mb-2">📊</div>
                            <h4 className="font-semibold text-white mb-1">Change History</h4>
                            <p className="text-sm text-slate-400">
                                View detailed change logs and compare versions side-by-side
                            </p>
                        </div>
                        <div className="bg-slate-700/30 rounded-lg p-4">
                            <div className="text-purple-400 text-2xl mb-2">⏮️</div>
                            <h4 className="font-semibold text-white mb-1">
                                Version Rollback
                            </h4>
                            <p className="text-sm text-slate-400">
                                Restore previous versions when needed with one click
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
