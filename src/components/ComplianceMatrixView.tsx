import React from "react";
import ComplianceMatrix from "./ComplianceMatrix";

export default function ComplianceMatrixView() {
    return (
        <div className="h-full">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-white mb-2">
                    Compliance Matrix
                </h1>
                <p className="text-slate-300">
                    Track compliance requirements and map documentation to regulatory
                    standards
                </p>
            </div>

            <ComplianceMatrix />
        </div>
    );
}
