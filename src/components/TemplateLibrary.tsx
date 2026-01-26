import React, { useState, useEffect, useCallback } from "react";

interface Template {
  id: string;
  name: string;
  description?: string;
  type: string;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
  };
  placeholders?: any;
  isSystem: boolean;
  createdBy: string;
  createdAt: string;
  _count?: {
    documents: number;
  };
}

interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

interface TemplateLibraryProps {
  onSelectTemplate: (template: Template) => void;
  onGenerateDocument?: (templateId: string, values: any) => void;
}

export default function TemplateLibrary({
  onSelectTemplate,
  onGenerateDocument,
}: TemplateLibraryProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    type: "MANUAL",
    categoryId: "",
    content: "",
    placeholders: [],
  });

  const documentTypes = [
    { value: "MANUAL", label: "Manual Document" },
    { value: "AUTO_GENERATED", label: "Auto-Generated" },
    { value: "TEMPLATE_BASED", label: "Template-Based" },
    { value: "POLICY", label: "Policy Document" },
    { value: "PROCEDURE", label: "Procedure" },
    { value: "PLAYBOOK", label: "Incident Response Playbook" },
    { value: "CHECKLIST", label: "Checklist" },
    { value: "REPORT", label: "Report" },
  ];

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/document-templates?type=${selectedType}&categoryId=${selectedCategory}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch templates");
      }
      const data = await response.json();
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [selectedType, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/document-categories");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchCategories();
  }, [fetchTemplates]);

  const createTemplate = async () => {
    try {
      const response = await fetch("/api/document-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newTemplate,
          createdBy: "system",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create template");
      }

      await fetchTemplates();
      setShowCreateModal(false);
      setNewTemplate({
        name: "",
        description: "",
        type: "MANUAL",
        categoryId: "",
        content: "",
        placeholders: [],
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create template",
      );
    }
  };

  const generateFromTemplate = async (values: any) => {
    if (!selectedTemplate || !onGenerateDocument) return;

    try {
      const response = await fetch(
        `/api/document-templates/${selectedTemplate.id}/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            placeholderValues: values,
            createdBy: "system",
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to generate document");
      }

      const document = await response.json();
      setShowGenerateModal(false);
      if (onGenerateDocument) {
        onGenerateDocument(document);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate document",
      );
    }
  };

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    onSelectTemplate(template);
  };

  const getTypeLabel = (type: string) => {
    const found = documentTypes.find((t) => t.value === type);
    return found ? found.label : type;
  };

  const getSystemBadge = (isSystem: boolean) => {
    return isSystem ? (
      <span className="ml-2 px-2 py-0.5 text-xs bg-blue-500/20 text-blue-300 rounded">
        System
      </span>
    ) : null;
  };

  if (loading) {
    return (
      <div className="glass-panel p-6">
        <div className="text-center py-8">Loading templates...</div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Document Templates</h2>
        <button
          className="glass-btn px-4 py-2"
          onClick={() => setShowCreateModal(true)}>
          + New Template
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded text-red-400">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select
          className="glass-input"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          className="glass-input"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}>
          <option value="">All Types</option>
          {documentTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`p-4 border rounded cursor-pointer transition-all hover:border-bia-bg-end/40 ${
              selectedTemplate?.id === template.id
                ? "border-bia-bg-end bg-bia-bg-end/10"
                : "border-bia-bg-end/20"
            }`}
            onClick={() => handleSelectTemplate(template)}>
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium text-lg">{template.name}</h3>
              {getSystemBadge(template.isSystem)}
            </div>
            {template.description && (
              <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                {template.description}
              </p>
            )}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 bg-bia-bg-end/20 rounded">
                {getTypeLabel(template.type)}
              </span>
              {template.category && (
                <span
                  className="px-2 py-1 rounded"
                  style={{
                    backgroundColor: template.category.color || "#3b82f6",
                    color: "#fff",
                  }}>
                  {template.category.name}
                </span>
              )}
              {template._count && (
                <span className="px-2 py-1 bg-bia-bg-end/20 rounded">
                  {template._count.documents} documents
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No templates found. Create a new template to get started.
        </div>
      )}

      {/* Selected Template Actions */}
      {selectedTemplate && (
        <div className="mt-6 p-4 border border-bia-bg-end/20 rounded">
          <h3 className="font-medium mb-3">{selectedTemplate.name} Selected</h3>
          <div className="flex gap-2">
            <button
              className="glass-btn px-4 py-2"
              onClick={() => setShowGenerateModal(true)}>
              Generate Document
            </button>
            {!selectedTemplate.isSystem && (
              <button className="glass-btn px-4 py-2">Edit Template</button>
            )}
          </div>
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-panel max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Template</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  className="glass-input w-full"
                  value={newTemplate.name}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  className="glass-input w-full"
                  rows={2}
                  value={newTemplate.description}
                  onChange={(e) =>
                    setNewTemplate({
                      ...newTemplate,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    className="glass-input w-full"
                    value={newTemplate.type}
                    onChange={(e) =>
                      setNewTemplate({ ...newTemplate, type: e.target.value })
                    }>
                    {documentTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category
                  </label>
                  <select
                    className="glass-input w-full"
                    value={newTemplate.categoryId}
                    onChange={(e) =>
                      setNewTemplate({
                        ...newTemplate,
                        categoryId: e.target.value,
                      })
                    }>
                    <option value="">No Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Content
                </label>
                <textarea
                  className="glass-input w-full font-mono text-sm"
                  rows={10}
                  placeholder="Template content with placeholders like {{processName}}, {{rto}}, etc."
                  value={newTemplate.content}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, content: e.target.value })
                  }
                />
                <p className="text-xs text-gray-400 mt-1">
                  Use {"{{placeholder}}"} syntax for dynamic content
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Placeholders (JSON)
                </label>
                <textarea
                  className="glass-input w-full font-mono text-sm"
                  rows={4}
                  placeholder='[{"key": "processName", "label": "Process Name", "type": "text"}]'
                  value={JSON.stringify(newTemplate.placeholders, null, 2)}
                  onChange={(e) => {
                    try {
                      setNewTemplate({
                        ...newTemplate,
                        placeholders: JSON.parse(e.target.value),
                      });
                    } catch (err) {
                      // Invalid JSON, ignore
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                className="glass-btn px-4 py-2"
                onClick={createTemplate}
                disabled={!newTemplate.name || !newTemplate.content}>
                Create Template
              </button>
              <button
                className="glass-btn px-4 py-2"
                onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Document Modal */}
      {showGenerateModal && selectedTemplate && (
        <GenerateDocumentModal
          template={selectedTemplate}
          onGenerate={generateFromTemplate}
          onClose={() => setShowGenerateModal(false)}
        />
      )}
    </div>
  );
}

function GenerateDocumentModal({
  template,
  onGenerate,
  onClose,
}: {
  template: Template;
  onGenerate: (values: any) => void;
  onClose: () => void;
}) {
  const [values, setValues] = useState<any>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(values);
  };

  const extractPlaceholders = (content: string): string[] => {
    const matches = content.match(/\{\{(\w+)\}\}/g);
    return matches ? matches.map((m) => m.replace(/[{}]/g, "")) : [];
  };

  const placeholders =
    template.placeholders || extractPlaceholders(template.content);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-panel max-w-md w-full p-6">
        <h2 className="text-xl font-semibold mb-4">Generate Document</h2>
        <p className="text-sm text-gray-400 mb-4">
          Fill in the placeholders to generate document from "{template.name}"
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {placeholders.map((placeholder: any) => {
            const key =
              typeof placeholder === "string" ? placeholder : placeholder.key;
            const label =
              typeof placeholder === "string" ? key : placeholder.label || key;
            return (
              <div key={key}>
                <label className="block text-sm font-medium mb-1">
                  {label}
                </label>
                <input
                  type="text"
                  className="glass-input w-full"
                  value={values[key] || ""}
                  onChange={(e) =>
                    setValues({ ...values, [key]: e.target.value })
                  }
                  required
                />
              </div>
            );
          })}

          <div className="flex gap-2 mt-6">
            <button type="submit" className="glass-btn px-4 py-2 flex-1">
              Generate Document
            </button>
            <button
              type="button"
              className="glass-btn px-4 py-2"
              onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
