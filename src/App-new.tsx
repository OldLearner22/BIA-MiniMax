import { useEffect, useState } from "react";
import { useStore } from "./store/useStore";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { ProcessRegistry } from "./components/ProcessRegistry";
import { ResourceRegistry } from "./components/ResourceRegistry";
import { ExerciseLog } from "./components/ExerciseLog";
import { ResourceMap } from "./components/ResourceMap";
import { ErrorTest } from "./components/ErrorTest";

import { RecoveryObjectives } from "./components/RecoveryObjectives";
import { Reports } from "./components/Reports";
import { TemporalAnalysis } from "./components/TemporalAnalysis";
import { Settings } from "./components/Settings";
import { ImpactAssessment } from "./components/ImpactAssessment";
import { GlossaryModal } from "./components/GlossaryModal";
import { BCTeamStructure } from "./components/BCTeamStructure";
import { RiskRegister } from "./components/RiskRegister";
import { ThreatAnalysis } from "./components/ThreatAnalysis";
import { StrategicPlanning } from "./components/StrategicPlanning";
import { RiskTreatment } from "./components/RiskTreatment";
import { BCStrategy } from "./components/BCStrategy";
import { IncidentDashboard } from "./components/incident/IncidentDashboard";
import { IncidentDeclarationForm } from "./components/incident/IncidentDeclarationForm";
import { IncidentList } from "./components/incident/IncidentList";

function App() {
  const { currentView, sidebarCollapsed, loadData } = useStore();
  const [showIncidentForm, setShowIncidentForm] = useState(false);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard showIncidentForm={() => setShowIncidentForm(true)} />;
      case "processes":
        return <ProcessRegistry />;
      case "resources":
        return <ResourceRegistry />;
      case "exercises":
        return <ExerciseLog />;
      case "impact-assessment":
        return <ImpactAssessment />;
      case "temporal":
        return <TemporalAnalysis />;
      case "recovery":
        return <RecoveryObjectives />;
      case "resource-map":
        return <ResourceMap />;
      case "bc-team":
        return <BCTeamStructure />;
      case "risk-register":
        return <RiskRegister />;
      case "threat-analysis":
        return <ThreatAnalysis />;
      case "strategic-planning":
        return <StrategicPlanning />;
      case "risk-treatment":
        return <RiskTreatment />;
      case "bc-strategy":
        return <BCStrategy />;
      case "incidents":
        return <IncidentDashboard />;
      case "incident-log":
        return <IncidentList />;
      case "reports":
        return <Reports />;
      case "settings":
        return <Settings />;
      case "error-boundary":
        return <ErrorTest />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bia-bg-start to-bia-bg-end">
      <Sidebar />
      <main
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "ml-16" : "ml-[280px]"
        } p-8`}>
        {renderView()}
      </main>
      <GlossaryModal />
      {showIncidentForm && (
        <IncidentDeclarationForm
          onClose={() => setShowIncidentForm(false)}
          onSuccess={() => setShowIncidentForm(false)}
        />
      )}
    </div>
  );
}

export default App;
