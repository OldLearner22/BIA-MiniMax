import React, { useState } from "react";
import DocumentList from "./DocumentList";
import DocumentEditor from "./DocumentEditor";
import DocumentVersions from "./DocumentVersions";
import ApprovalWorkflow from "./ApprovalWorkflow";
import TemplateLibrary from "./TemplateLibrary";
import DocumentAnalytics from "./DocumentAnalytics";
import DocumentCollaboration from "./DocumentCollaboration";
import DocumentSharing from "./DocumentSharing";
import ComplianceMatrix from "./ComplianceMatrix";

type View =
  | "list"
  | "create"
  | "edit"
  | "versions"
  | "workflow"
  | "templates"
  | "analytics"
  | "compliance"
  | "collaboration"
  | "sharing";

interface SelectedDocument {
  id: string;
  title: string;
  content: string;
  categoryId?: string;
  status: string;
  version: number;
}

export default function DocumentationHubFull() {
  const [currentView, setCurrentView] = useState<View>("list");
  const [selectedDocument, setSelectedDocument] =
    useState<SelectedDocument | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const handleSelectDocument = (document: SelectedDocument) => {
    setSelectedDocument(document);
    setCurrentView("edit");
  };

  const handleCreateDocument = () => {
    setSelectedDocument(null);
    setCurrentView("create");
  };

  const handleViewVersions = (document: SelectedDocument) => {
    setSelectedDocument(document);
    setCurrentView("versions");
  };

  const handleViewWorkflow = (document: SelectedDocument) => {
    setSelectedDocument(document);
    setCurrentView("workflow");
  };

  const handleBack = () => {
    setCurrentView("list");
    setSelectedDocument(null);
  };

  const handleDocumentCreated = (document: any) => {
    setSelectedDocument(document);
    setCurrentView("edit");
  };

  const handleDocumentUpdated = () => {
    setCurrentView("list");
    setSelectedDocument(null);
  };

  const handleGenerateFromTemplate = (document: any) => {
    setSelectedDocument(document);
    setCurrentView("edit");
  };

  return (
    <div className="flex h-full">
      {/* Sidebar Navigation */}
      <div className="w-64 border-r border-bia-bg-end/20 p-4 flex flex-col">
        <h2 className="text-lg font-semibold mb-4">Documentation</h2>

        <nav className="space-y-1 flex-1">
          <button
            className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 ${
              currentView === "list"
                ? "bg-bia-bg-end text-white"
                : "hover:bg-bia-bg-end/50"
            }`}
            onClick={() => setCurrentView("list")}>
            <span>📄</span>
            <span>All Documents</span>
          </button>

          <button
            className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 ${
              currentView === "create"
                ? "bg-bia-bg-end text-white"
                : "hover:bg-bia-bg-end/50"
            }`}
            onClick={handleCreateDocument}>
            <span>➕</span>
            <span>Create Document</span>
          </button>

          <div className="border-t border-bia-bg-end/20 my-2" />

          <button
            className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 ${
              currentView === "templates"
                ? "bg-bia-bg-end text-white"
                : "hover:bg-bia-bg-end/50"
            }`}
            onClick={() => setCurrentView("templates")}>
            <span>📋</span>
            <span>Templates</span>
          </button>

          <button
            className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 ${
              currentView === "analytics"
                ? "bg-bia-bg-end text-white"
                : "hover:bg-bia-bg-end/50"
            }`}
            onClick={() => setCurrentView("analytics")}>
            <span>📊</span>
            <span>Analytics</span>
          </button>

          <button
            className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 ${
              currentView === "compliance"
                ? "bg-bia-bg-end text-white"
                : "hover:bg-bia-bg-end/50"
            }`}
            onClick={() => setCurrentView("compliance")}>
            <span>✅</span>
            <span>Compliance Matrix</span>
          </button>

          {selectedDocument && (
            <>
              <div className="border-t border-bia-bg-end/20 my-2" />
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-2 px-3">
                Current Document
              </div>

              <div className="px-3 mb-2 text-sm font-medium truncate">
                {selectedDocument.title}
              </div>

              <button
                className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 ${
                  currentView === "edit"
                    ? "bg-bia-bg-end text-white"
                    : "hover:bg-bia-bg-end/50"
                }`}
                onClick={() => setCurrentView("edit")}>
                <span>✏️</span>
                <span>Edit</span>
              </button>

              <button
                className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 ${
                  currentView === "versions"
                    ? "bg-bia-bg-end text-white"
                    : "hover:bg-bia-bg-end/50"
                }`}
                onClick={() => setCurrentView("versions")}>
                <span>📑</span>
                <span>Versions</span>
              </button>

              <button
                className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 ${
                  currentView === "workflow"
                    ? "bg-bia-bg-end text-white"
                    : "hover:bg-bia-bg-end/50"
                }`}
                onClick={() => setCurrentView("workflow")}>
                <span>🔄</span>
                <span>Workflow</span>
              </button>

              <button
                className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 ${
                  currentView === "collaboration"
                    ? "bg-bia-bg-end text-white"
                    : "hover:bg-bia-bg-end/50"
                }`}
                onClick={() => setCurrentView("collaboration")}>
                <span>💬</span>
                <span>Collaboration</span>
              </button>

              <button
                className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 ${
                  currentView === "sharing"
                    ? "bg-bia-bg-end text-white"
                    : "hover:bg-bia-bg-end/50"
                }`}
                onClick={() => setCurrentView("sharing")}>
                <span>🔗</span>
                <span>Sharing</span>
              </button>
            </>
          )}
        </nav>

        <div className="border-t border-bia-bg-end/20 pt-4 text-xs text-gray-400">
          <p>BCMS Documentation System</p>
          <p className="mt-1">Phase 5 Implementation</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {currentView === "list" && (
          <DocumentList
            onSelectDocument={handleSelectDocument}
            onCreateDocument={handleCreateDocument}
            onViewVersions={handleViewVersions}
            onViewWorkflow={handleViewWorkflow}
          />
        )}

        {currentView === "create" && (
          <DocumentEditor
            document={null}
            onSave={handleDocumentCreated}
            onCancel={handleBack}
          />
        )}

        {(currentView === "edit" || currentView === "create") &&
          selectedDocument && (
            <DocumentEditor
              document={selectedDocument}
              onSave={handleDocumentUpdated}
              onCancel={handleBack}
            />
          )}

        {currentView === "versions" && selectedDocument && (
          <DocumentVersions
            docId={selectedDocument.id}
            onEdit={() => setCurrentView("edit")}
            onBack={handleBack}
          />
        )}

        {currentView === "workflow" && selectedDocument && (
          <ApprovalWorkflow
            documentId={selectedDocument.id}
            documentTitle={selectedDocument.title}
            onWorkflowUpdate={() => setCurrentView("list")}
          />
        )}

        {currentView === "templates" && (
          <TemplateLibrary
            onSelectTemplate={setSelectedTemplate}
            onGenerateDocument={handleGenerateFromTemplate}
          />
        )}

        {currentView === "analytics" && <DocumentAnalytics />}

        {currentView === "compliance" && <ComplianceMatrix />}

        {currentView === "collaboration" && selectedDocument && (
          <DocumentCollaboration
            documentId={selectedDocument.id}
            documentTitle={selectedDocument.title}
          />
        )}

        {currentView === "sharing" && selectedDocument && (
          <DocumentSharing
            documentId={selectedDocument.id}
            documentTitle={selectedDocument.title}
          />
        )}
      </div>
    </div>
  );
}
