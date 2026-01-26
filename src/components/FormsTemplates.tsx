import React from "react";
import TemplateLibrary from "./TemplateLibrary";

export default function FormsTemplates() {
    const handleSelectTemplate = (template: any) => {
        console.log("Selected template:", template);
    };

    const handleGenerateDocument = (document: any) => {
        console.log("Generate document from template:", document);
    };

    return (
        <div className="h-full">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-white mb-2">
                    Forms &amp; Templates
                </h1>
                <p className="text-slate-300">
                    Browse and use standardized templates for BCMS documentation, forms,
                    and reports
                </p>
            </div>

            <TemplateLibrary
                onSelectTemplate={handleSelectTemplate}
                onGenerateDocument={handleGenerateDocument}
            />
        </div>
    );
}
