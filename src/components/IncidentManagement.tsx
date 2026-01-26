import React, { useState } from "react";
import IncidentDashboard from "./incident/IncidentDashboard";
import IncidentList from "./incident/IncidentList";
import { useStore } from "../store/useStore";
import { Incident, IncidentStatus } from "../types/incident";
import { AlertTriangle } from "lucide-react";

const IncidentManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"dashboard" | "log">("dashboard");
  const { incidents, updateIncidentStatus } = useStore();

  const handleIncidentSelect = (incident: Incident) => {
    // TODO: Implement incident details modal or navigation
    console.log("Selected incident:", incident);
  };

  const handleStatusChange = async (
    incidentId: string,
    newStatus: IncidentStatus,
  ) => {
    await updateIncidentStatus(incidentId, newStatus);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            Incident Management
          </h1>
          <p className="text-slate-400 mt-1">
            Monitor and manage business continuity incidents
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === "dashboard"
                ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                : "glass-button hover:bg-red-500/10"
            }`}>
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("log")}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === "log"
                ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                : "glass-button hover:bg-red-500/10"
            }`}>
            Incident Log
          </button>
        </div>
      </div>

      {activeTab === "dashboard" && <IncidentDashboard />}
      {activeTab === "log" && (
        <IncidentList
          incidents={incidents}
          onIncidentSelect={handleIncidentSelect}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

export default IncidentManagement;
