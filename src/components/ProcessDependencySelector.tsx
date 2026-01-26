import React from "react";
import { useStore } from "../store/useStore";
import { TrendingUp, Network, ArrowRight } from "lucide-react";

export function ProcessDependencySelector() {
  const { processes, setCurrentView, setSelectedProcessId } = useStore();

  const handleProcessClick = (processId: string) => {
    setSelectedProcessId(processId);
    setCurrentView("dependency-analysis");
  };

  if (processes.length === 0) {
    return (
      <div className="animate-fade-in">
        <div className="text-center py-16">
          <Network className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">
            No business processes found
          </h3>
          <p className="text-gray-400">
            Create some business processes first to start mapping dependencies.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-100">
          Process Dependency Mapping
        </h2>
        <p className="text-gray-400 mt-1">
          Select a process to define and analyze its dependencies
        </p>
      </div>

      {/* Process Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {processes.map((process) => {
          const criticalityColor =
            process.criticality === "high"
              ? "border-red-500 bg-red-950/20"
              : process.criticality === "medium"
                ? "border-orange-500 bg-orange-950/20"
                : "border-green-500 bg-green-950/20";

          const criticalityIcon =
            process.criticality === "high"
              ? "text-red-400"
              : process.criticality === "medium"
                ? "text-orange-400"
                : "text-green-400";

          return (
            <button
              key={process.id}
              onClick={() => handleProcessClick(process.id)}
              className={`p-6 rounded-lg border-2 ${criticalityColor} hover:scale-[1.02] transition-all text-left group`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className={`w-5 h-5 ${criticalityIcon}`} />
                    <h3 className="text-lg font-semibold text-gray-100">
                      {process.name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-400">{process.department}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Criticality:</span>
                  <span className={`font-medium ${criticalityIcon} uppercase`}>
                    {process.criticality}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Department:</span>
                  <span className="text-gray-300">{process.department}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Owner:</span>
                  <span className="text-gray-300">{process.owner}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center gap-2 text-sm text-blue-400">
                  <Network className="w-4 h-4" />
                  <span>Map Dependencies</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
