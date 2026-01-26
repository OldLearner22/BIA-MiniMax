import { useStore } from "./store/useStore";
import { useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { ComingSoon } from "./components/ComingSoon";
import { Dashboard } from "./components/Dashboard";
import { ProcessRegistry } from "./components/ProcessRegistry";
import { ResourceRegistry } from "./components/ResourceRegistry";
import { ExerciseLog } from "./components/ExerciseLog";
import { ResourceMap } from "./components/ResourceMapReactFlow";
import { ProcessDependencySelector } from "./components/ProcessDependencySelector";
import { ImpactAssessment } from "./components/ImpactAssessment";
import { RecoveryObjectives } from "./components/RecoveryObjectives";
import { Reports } from "./components/Reports";
import { TemporalAnalysis } from "./components/TemporalAnalysis";
import { Settings } from "./components/Settings";
import { GlossaryModal } from "./components/GlossaryModal";
import BCTeamStructure from "./components/BCTeamStructure";
import { RiskRegister } from "./components/RiskRegister";
import { ThreatAnalysis } from "./components/ThreatAnalysis";
import { StrategicPlanning } from "./components/StrategicPlanning";
import { RiskTreatment } from "./components/RiskTreatment";
import BCStrategy from "./components/BCStrategy";
import BCMSPolicy from "./components/BCMSPolicy";
import ProceduresLibrary from "./components/ProceduresLibrary";
import FormsTemplates from "./components/FormsTemplates";
import DocumentationHubFull from "./components/DocumentationHub-Full";
import DocumentAnalytics from "./components/DocumentAnalytics";
import VersionControl from "./components/VersionControl";
import ComplianceMatrixView from "./components/ComplianceMatrixView";
import RecoveryOptions from "./components/RecoveryOptions";
import CostBenefitAnalysisComponent from "./components/CostBenefitAnalysis";
import StrategyApprovalComponent from "./components/StrategyApproval";
import IncidentManagement from "./components/IncidentManagement";
import RolesResponsibilities from "./components/RolesResponsibilities";
import ContactDirectory from "./components/ContactDirectory";
import TrainingRecords from "./components/TrainingRecords";
import CompetencyMatrix from "./components/CompetencyMatrix";
import TemplateLibraryView from "./components/TemplateLibraryView";
import { DependencyAnalysis } from "./components/DependencyAnalysis";

function App() {
  const { currentView, sidebarCollapsed, initializeDataFromAPI } = useStore();

  // Initialize data from API on mount
  useEffect(() => {
    initializeDataFromAPI().catch((error) =>
      console.error("Failed to initialize data from API:", error),
    );
  }, [initializeDataFromAPI]);

  const viewTitles: Record<string, string> = {
    "context-review": "Context Review",
    "vulnerability-scan": "Vulnerability Scan",
    "risk-monitoring": "Risk Monitoring",
    "recovery-options": "Recovery Options",
    "cost-benefit": "Cost-Benefit Analysis",
    "strategy-approval": "Strategy Approval",
    "test-calendar": "Test Calendar",
    "exercise-planning": "Exercise Planning",
    "results-analysis": "Results Analysis",
    "improvement-actions": "Improvement Actions",
    "incident-log": "Incident Log",
    "crisis-team": "Crisis Team Dashboard",
    "decision-log": "Decision Log",
    "communication-hub": "Communication Hub",
    "recovery-tracking": "Recovery Tracking",
    "external-docs": "External Documents",
    "monitoring-plans": "Monitoring Plans",
    "corrective-actions": "Corrective Actions",
    "review-schedule": "Review Schedule",
    "review-agendas": "Review Agendas",
    "management-reports": "Management Reports",
    "decision-records": "Decision Records",
    "improvement-plans": "Improvement Plans",
    "iso-checklist": "ISO 22301 Checklist",
    "audit-findings": "Audit Findings",
    "gap-analysis": "Gap Analysis",
    "certification-status": "Certification Status",
    "response-procedures": "Response Procedures",
    "recovery-procedures": "Recovery Procedures",
    "communication-plans": "Communication Plans",
    escalation: "Escalation Matrices",
    "roles-responsibilities": "Roles & Responsibilities",
    "contact-directory": "Contact Directory",
    "training-records": "Training Records",
    "competency-matrix": "Competency Matrix",
  };

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard />;
      case "strategic-planning":
        return <StrategicPlanning />;
      case "processes":
        return <ProcessRegistry />;
      case "resource-map":
        return <ProcessDependencySelector />;
      case "dependency-analysis":
        return <ResourceMap />;
      case "impact-assessment":
        return <ImpactAssessment />;
      case "recovery":
        return <RecoveryObjectives />;
      case "risk-register":
        return <RiskRegister />;
      case "threat-analysis":
        return <ThreatAnalysis />;
      case "dependency-analysis":
        return <DependencyAnalysis />;
      case "risk-treatment":
        return <RiskTreatment />;
      case "strategy-framework":
        return <BCStrategy />;
      case "recovery-options":
        return <RecoveryOptions />;
      case "resources":
        return <ResourceRegistry />;
      case "cost-benefit":
        return <CostBenefitAnalysisComponent />;
      case "strategy-approval":
        return <StrategyApprovalComponent />;
      case "exercises":
        return <ExerciseLog />;
      case "incident-log":
        return <IncidentManagement />;
      case "bc-team":
        return <BCTeamStructure />;
      case "roles-responsibilities":
        return <RolesResponsibilities />;
      case "contact-directory":
        return <ContactDirectory />;
      case "training-records":
        return <TrainingRecords />;
      case "competency-matrix":
        return <CompetencyMatrix />;
      case "bcms-policy":
        return <BCMSPolicy />;
      case "procedures-library":
        return <ProceduresLibrary />;
      case "forms-templates":
        return <FormsTemplates />;
      case "procedure-templates":
        return <TemplateLibraryView />;
      case "documentation-hub":
        return <DocumentationHubFull />;
      case "document-analytics":
        return <DocumentAnalytics />;
      case "version-control":
        return <VersionControl />;
      case "compliance-reports":
        return <ComplianceMatrixView />;
      case "temporal":
        return <TemporalAnalysis />;
      case "reports":
        return <Reports />;
      case "management-reports":
        return <Reports />;
      case "settings":
        return <Settings />;
      default:
        return <ComingSoon title={viewTitles[currentView] || "Coming Soon"} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bia-bg-start to-bia-bg-end">
      <Sidebar />
      <main
        className={`transition-all duration-300 ${sidebarCollapsed ? "ml-16" : "ml-[280px]"} p-8`}>
        {renderView()}
      </main>
      <GlossaryModal />
    </div>
  );
}

export default App;
