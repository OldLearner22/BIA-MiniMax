import React, { useState } from "react";
import DocumentList from "./DocumentList";
import DocumentEditor from "./DocumentEditor";

type View = "list" | "create" | "edit";

interface Document {
    id: string;
    title: string;
    content: string;
    categoryId?: string;
    status: string;
    version: number;
}

export default function ProceduresLibrary() {
    const [currentView, setCurrentView] = useState<View>("list");
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(
        null,
    );

    const handleSelect = async (id: string) => {
        try {
            // Fetch the document
            const response = await fetch(`/api/documents/${id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch document");
            }
            const document = await response.json();
            setSelectedDocument(document);
            setCurrentView("edit");
        } catch (error) {
            console.error("Error fetching document:", error);
            // TODO: Show error toast/notification
        }
    };

    const handleCreate = () => {
        setSelectedDocument(null);
        setCurrentView("create");
    };

    const handleBack = () => {
        setCurrentView("list");
        setSelectedDocument(null);
    };

    const handleSave = (document: any) => {
        console.log("Document saved:", document);
        setCurrentView("list");
        setSelectedDocument(null);
    };

    if (currentView === "create" || currentView === "edit") {
        return (
            <div className="h-full">
                <DocumentEditor
                    docId={selectedDocument?.id}
                    onBack={handleBack}
                />
            </div>
        );
    }

    return (
        <div className="h-full">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-white mb-2">
                    Procedures Library
                </h1>
                <p className="text-slate-300">
                    Access and manage business continuity procedures, response plans, and
                    operational guidelines
                </p>
            </div>

            <DocumentList onSelect={handleSelect} onCreate={handleCreate} />
        </div>
    );
}
