import { useState } from "react";
import { useStore } from "../store/useStore";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Briefcase,
  Calculator,
  Calendar,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Database,
  FileBarChart,
  FileText,
  FlaskConical,
  GitBranch,
  GraduationCap,
  Layers,
  LayoutDashboard,
  LineChart,
  MessageCircle,
  Network,
  Phone,
  Settings,
  Shield,
  Table,
  Target,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";

const navSections = [
  {
    title: "Context & Planning",
    items: [
      { id: "strategic-planning", label: "Strategic Planning", icon: Target },
      { id: "bcms-policy", label: "BCMS Policy", icon: FileText },
      {
        id: "context-review",
        label: "Context Review",
        icon: ClipboardList,
        comingSoon: true,
      },
    ],
  },
  {
    title: "Dashboard",
    items: [
      {
        id: "dashboard",
        label: "Executive KPI Overview",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Business Impact Analysis",
    items: [
      { id: "processes", label: "Process Inventory", icon: Database },
      { id: "resource-map", label: "Dependency Mapping", icon: Network },
      { id: "impact-assessment", label: "Impact Assessment", icon: Activity },
      { id: "recovery", label: "Recovery Requirements", icon: Clock },
      {
        id: "temporal",
        label: "Business Impact Assessments",
        icon: TrendingUp,
      },
    ],
  },
  {
    title: "Risk Assessment",
    items: [
      { id: "risk-register", label: "Risk Register", icon: AlertTriangle },
      { id: "threat-analysis", label: "Threat Analysis", icon: Shield },
      {
        id: "dependency-analysis",
        label: "Dependency Analysis",
        icon: Network,
      },
      {
        id: "vulnerability-scan",
        label: "Vulnerability Scan",
        icon: ClipboardList,
        comingSoon: true,
      },
      {
        id: "risk-treatment",
        label: "Risk Treatment Plans",
        icon: CheckCircle2,
      },
      {
        id: "risk-monitoring",
        label: "Risk Monitoring",
        icon: LineChart,
        comingSoon: true,
      },
    ],
  },
  {
    title: "BC Strategy",
    items: [
      { id: "strategy-framework", label: "Strategy Framework", icon: Layers },
      { id: "recovery-options", label: "Recovery Options", icon: Shield },
      { id: "resources", label: "Resource Requirements", icon: Briefcase },
      { id: "cost-benefit", label: "Cost-Benefit Analysis", icon: Calculator },
      {
        id: "strategy-approval",
        label: "Strategy Approval",
        icon: CheckSquare,
      },
    ],
  },
  {
    title: "BC Procedures",
    items: [
      { id: "procedures-library", label: "Procedures Library", icon: BookOpen },
      {
        id: "response-procedures",
        label: "Response Procedures",
        icon: BookOpen,
        comingSoon: true,
      },
      {
        id: "recovery-procedures",
        label: "Recovery Procedures",
        icon: BookOpen,
        comingSoon: true,
      },
      {
        id: "communication-plans",
        label: "Communication Plans",
        icon: MessageCircle,
        comingSoon: true,
      },
      {
        id: "escalation",
        label: "Escalation Matrices",
        icon: AlertOctagon,
        comingSoon: true,
      },
      {
        id: "procedure-templates",
        label: "Procedure Templates",
        icon: FileText,
      },
    ],
  },
  {
    title: "Testing & Exercises",
    items: [
      {
        id: "test-calendar",
        label: "Test Calendar",
        icon: Calendar,
        comingSoon: true,
      },
      {
        id: "exercise-planning",
        label: "Exercise Planning",
        icon: ClipboardList,
        comingSoon: true,
      },
      { id: "exercises", label: "Test Execution", icon: FlaskConical },
      {
        id: "results-analysis",
        label: "Results Analysis",
        icon: BarChart3,
        comingSoon: true,
      },
      {
        id: "improvement-actions",
        label: "Improvement Actions",
        icon: Wrench,
        comingSoon: true,
      },
    ],
  },
  {
    title: "Incident Management",
    items: [
      { id: "incident-log", label: "Incident Log", icon: AlertOctagon },
      {
        id: "crisis-team",
        label: "Crisis Team Dashboard",
        icon: Users,
        comingSoon: true,
      },
      {
        id: "decision-log",
        label: "Decision Log",
        icon: ClipboardCheck,
        comingSoon: true,
      },
      {
        id: "communication-hub",
        label: "Communication Hub",
        icon: MessageCircle,
        comingSoon: true,
      },
      {
        id: "recovery-tracking",
        label: "Recovery Tracking",
        icon: Activity,
        comingSoon: true,
      },
    ],
  },
  {
    title: "Documentation",
    items: [
      { id: "documentation-hub", label: "Documentation Hub", icon: BookOpen },
      {
        id: "document-analytics",
        label: "Document Analytics",
        icon: BarChart3,
      },
      { id: "forms-templates", label: "Forms & Templates", icon: FileText },
      {
        id: "external-docs",
        label: "External Documents",
        icon: FileText,
        comingSoon: true,
      },
      { id: "version-control", label: "Version Control", icon: GitBranch },
    ],
  },
  {
    title: "People & Roles",
    items: [
      { id: "bc-team", label: "BC Team Structure", icon: Users },
      {
        id: "roles-responsibilities",
        label: "Roles & Responsibilities",
        icon: Users,
      },
      { id: "contact-directory", label: "Contact Directory", icon: Phone },
      {
        id: "training-records",
        label: "Training Records",
        icon: GraduationCap,
      },
      { id: "competency-matrix", label: "Competency Matrix", icon: Table },
    ],
  },
  {
    title: "Performance Monitoring",
    items: [
      { id: "reports", label: "Performance Reports", icon: FileBarChart },
      {
        id: "monitoring-plans",
        label: "Monitoring Plans",
        icon: LineChart,
        comingSoon: true,
      },
      { id: "temporal", label: "Trend Analysis", icon: TrendingUp },
      {
        id: "corrective-actions",
        label: "Corrective Actions",
        icon: Wrench,
        comingSoon: true,
      },
    ],
  },
  {
    title: "Management Review",
    items: [
      {
        id: "review-schedule",
        label: "Review Schedule",
        icon: Calendar,
        comingSoon: true,
      },
      {
        id: "review-agendas",
        label: "Review Agendas",
        icon: ClipboardList,
        comingSoon: true,
      },
      {
        id: "management-reports",
        label: "Management Reports",
        icon: FileBarChart,
        comingSoon: true,
      },
      {
        id: "decision-records",
        label: "Decision Records",
        icon: ClipboardCheck,
        comingSoon: true,
      },
      {
        id: "improvement-plans",
        label: "Improvement Plans",
        icon: Wrench,
        comingSoon: true,
      },
    ],
  },
  {
    title: "Compliance Center",
    items: [
      {
        id: "iso-checklist",
        label: "ISO 22301 Checklist",
        icon: CheckSquare,
        comingSoon: true,
      },
      {
        id: "audit-findings",
        label: "Audit Findings",
        icon: ClipboardList,
        comingSoon: true,
      },
      {
        id: "compliance-reports",
        label: "Compliance Reports",
        icon: BadgeCheck,
      },
      {
        id: "gap-analysis",
        label: "Gap Analysis",
        icon: Table,
        comingSoon: true,
      },
      {
        id: "certification-status",
        label: "Certification Status",
        icon: BadgeCheck,
        comingSoon: true,
      },
    ],
  },
  {
    title: "Settings",
    items: [{ id: "settings", label: "System Configuration", icon: Settings }],
  },
];

export function Sidebar() {
  const { currentView, setCurrentView, sidebarCollapsed, toggleSidebar } =
    useStore();
  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >(() =>
    Object.fromEntries(navSections.map((section) => [section.title, true])),
  );

  return (
    <aside
      className={`fixed left-0 top-0 h-screen glass-sidebar z-50 transition-all duration-300 ${
        sidebarCollapsed ? "w-16" : "w-[280px]"
      }`}>
      <div className="flex flex-col h-full">
        <div
          className={`flex items-center gap-3 p-4 border-b border-white/5 ${
            sidebarCollapsed ? "justify-center" : ""
          }`}>
          <div className="flex-shrink-0 w-10 h-10 rounded-bia-md bg-gradient-to-br from-bia-primary to-bia-secondary flex items-center justify-center shadow-lg shadow-bia-primary/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div
            className={`transition-all duration-300 overflow-hidden ${
              sidebarCollapsed ? "w-0 opacity-0" : "w-44 opacity-100"
            }`}>
            <h1 className="text-lg font-bold text-bia-text-primary tracking-tight whitespace-nowrap">
              BIA MiniMax
            </h1>
            <p className="text-[10px] text-bia-text-tertiary font-bold uppercase tracking-widest whitespace-nowrap">
              Enterprise GRC
            </p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-6 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-2">
              {!sidebarCollapsed && (
                <button
                  type="button"
                  onClick={() =>
                    setCollapsedSections((prev) => ({
                      ...prev,
                      [section.title]: !prev[section.title],
                    }))
                  }
                  className="w-full px-3 flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-bia-text-tertiary hover:text-bia-text-secondary transition-colors">
                  <span>{section.title}</span>
                  {collapsedSections[section.title] ? (
                    <ChevronRight className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
              )}
              {(!collapsedSections[section.title] || sidebarCollapsed) && (
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setCurrentView(item.id)}
                      className={`nav-item w-full text-[11px] leading-5 ${
                        currentView === item.id ? "nav-item-active" : ""
                      } ${item.comingSoon ? "opacity-70" : ""} ${
                        sidebarCollapsed ? "justify-center px-2" : ""
                      }`}
                      title={
                        sidebarCollapsed
                          ? item.label
                          : item.comingSoon
                            ? `${item.label} (Coming Soon)`
                            : item.label
                      }>
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!sidebarCollapsed && (
                        <span className="flex-1 text-left">{item.label}</span>
                      )}
                      {!sidebarCollapsed && item.comingSoon && (
                        <span className="text-[10px] uppercase tracking-widest text-bia-text-tertiary">
                          Soon
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <button
          onClick={toggleSidebar}
          className="p-3 border-t border-[rgba(255,255,255,0.05)] text-bia-text-secondary hover:text-bia-text-primary transition-colors flex items-center justify-center">
          {sidebarCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>
    </aside>
  );
}
