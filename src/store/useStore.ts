import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Process,
  ImpactAssessment,
  RecoveryObjective,
  TimelinePoint,
  Dependency,
  Settings,
  BusinessResource,
  ResourceDependency,
  ProcessResourceLink,
  ExerciseRecord,
  BCPerson,
  BCRole,
  BCTrainingRecord,
  BCCompetency,
  BCPersonCompetency,
  Risk,
  Threat,
  RiskTreatment,
  StrategicPlanning,
  RecoveryOption,
  CostBenefitAnalysis,
  StrategyApproval,
  ApprovalStep,
  StrategyAssessment,
  StrategyObjective,
  DEFAULT_SETTINGS,
  DEFAULT_BUSINESS_RESOURCES,
  DEFAULT_RESOURCE_DEPENDENCIES,
  DEFAULT_EXERCISE_RECORDS,
  getTimelinePointsFromCustom,
} from "../types";
import {
  Incident,
  IncidentCategory,
  IncidentSeverity,
  IncidentStatus,
  IncidentStatistics,
} from "../types/incident";

// NOTE: All data is now sourced from the database via API calls.
// No hardcoded sample data is initialized in the store.
// Store initialization happens in initializeDataFromAPI()

const createId = () =>
  typeof globalThis !== "undefined" &&
  globalThis.crypto &&
  "randomUUID" in globalThis.crypto
    ? globalThis.crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const toDate = (value?: Date | string) => (value ? new Date(value) : null);

const createIncidentStatistics = (
  incidents: Incident[],
): IncidentStatistics => {
  const byStatus: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};
  const byCategory: Record<string, number> = {};

  incidents.forEach((incident) => {
    byStatus[incident.status] = (byStatus[incident.status] || 0) + 1;
    bySeverity[incident.severity] = (bySeverity[incident.severity] || 0) + 1;
    byCategory[incident.category] = (byCategory[incident.category] || 0) + 1;
  });

  const resolved = incidents.filter(
    (incident) =>
      incident.status === IncidentStatus.RESOLVED ||
      incident.status === IncidentStatus.CLOSED,
  );

  const mttrHours = resolved.length
    ? resolved.reduce((total, incident) => {
        const start =
          toDate(incident.responseStartTime) || toDate(incident.detectionTime);
        const end =
          toDate(incident.resolutionTime) || toDate(incident.updatedAt);
        if (!start || !end) return total;
        const diffMs = end.getTime() - start.getTime();
        return total + diffMs / (1000 * 60 * 60);
      }, 0) / resolved.length
    : 0;

  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  const resolvedLast30Days = resolved.filter((incident) => {
    const resolution = toDate(incident.resolutionTime);
    return resolution ? resolution >= last30Days : false;
  }).length;

  const unresolved = incidents.filter(
    (incident) =>
      incident.status !== IncidentStatus.RESOLVED &&
      incident.status !== IncidentStatus.CLOSED,
  ).length;

  const escalated = incidents.filter(
    (incident) => incident.status === IncidentStatus.ESCALATED,
  ).length;

  const activeIncidents = incidents.filter((incident) =>
    [
      IncidentStatus.REPORTED,
      IncidentStatus.ASSESSED,
      IncidentStatus.RESPONDING,
      IncidentStatus.ESCALATED,
    ].includes(incident.status),
  ).length;

  return {
    total: incidents.length,
    byStatus,
    bySeverity,
    byCategory,
    mttr: Math.round(mttrHours * 100) / 100,
    unresolved,
    escalated,
    activeIncidents,
    resolvedLast30Days,
  };
};

const EMPTY_INCIDENT_STATS = createIncidentStatistics([]);

interface StoreState {
  processes: Process[];
  impacts: Record<string, ImpactAssessment>;
  recoveryObjectives: Record<string, RecoveryObjective>;
  temporalData: Record<string, TimelinePoint[]>;
  dependencies: Dependency[];
  businessResources: BusinessResource[];
  resourceDependencies: ResourceDependency[];
  processResourceLinks: ProcessResourceLink[];
  exerciseRecords: ExerciseRecord[];
  risks: Risk[];
  threats: Threat[];
  riskTreatments: RiskTreatment[];
  strategicItems: StrategicPlanning[];
  recoveryOptions: RecoveryOption[];
  costBenefitAnalyses: CostBenefitAnalysis[];
  strategyApprovals: StrategyApproval[];
  strategyAssessments: StrategyAssessment[];
  strategyObjectives: StrategyObjective[];
  diagramStore: Record<string, { data: any; updatedAt: string }>;
  bcPeople: BCPerson[];
  bcRoles: BCRole[];
  bcTrainingRecords: BCTrainingRecord[];
  bcCompetencies: BCCompetency[];
  bcPersonCompetencies: BCPersonCompetency[];
  incidents: Incident[];
  incidentStatistics: IncidentStatistics;
  settings: Settings;
  currentView: string;
  selectedProcessId: string | null;
  sidebarCollapsed: boolean;
  showGlossary: boolean;

  // Navigation
  setCurrentView: (view: string) => void;
  setSelectedProcessId: (id: string | null) => void;
  toggleSidebar: () => void;
  toggleGlossary: () => void;

  // Process CRUD
  addProcess: (process: Process) => void;
  updateProcess: (id: string, updates: Partial<Process>) => void;
  deleteProcess: (id: string) => void;
  getProcessById: (id: string) => Process | undefined;

  // Impact
  updateImpact: (processId: string, impact: ImpactAssessment) => void;

  // Recovery
  updateRecoveryObjective: (
    processId: string,
    objective: RecoveryObjective,
  ) => void;

  // Temporal
  updateTemporalData: (processId: string, data: TimelinePoint[]) => void;
  initTemporalData: (processId: string) => void;

  // Dependencies
  addDependency: (dep: Dependency) => void;
  removeDependency: (id: string) => void;
  getDependenciesForProcess: (processId: string) => {
    upstream: Dependency[];
    downstream: Dependency[];
  };

  // Resources
  addBusinessResource: (resource: BusinessResource) => void;
  updateBusinessResource: (
    id: string,
    updates: Partial<BusinessResource>,
  ) => void;
  deleteBusinessResource: (id: string) => void;
  setResourceDependencies: (deps: ResourceDependency[]) => void;
  addResourceDependency: (dep: ResourceDependency) => void;
  removeResourceDependency: (id: string) => void;
  linkResourceToProcess: (link: ProcessResourceLink) => void;
  unlinkResourceFromProcess: (id: string) => void;

  // Exercises
  addExerciseRecord: (record: ExerciseRecord) => void;
  updateExerciseRecord: (id: string, updates: Partial<ExerciseRecord>) => void;
  deleteExerciseRecord: (id: string) => void;

  // Risk & Threats
  addRisk: (risk: Risk) => void;
  updateRisk: (id: string, updates: Partial<Risk>) => void;
  deleteRisk: (id: string) => void;
  addThreat: (threat: Threat) => void;
  updateThreat: (id: string, updates: Partial<Threat>) => void;
  deleteThreat: (id: string) => void;
  addRiskTreatment: (treatment: RiskTreatment) => void;
  updateRiskTreatment: (id: string, updates: Partial<RiskTreatment>) => void;
  deleteRiskTreatment: (id: string) => void;

  // Strategic Planning
  addStrategicItem: (item: StrategicPlanning) => void;
  updateStrategicItem: (
    id: string,
    updates: Partial<StrategicPlanning>,
  ) => void;
  deleteStrategicItem: (id: string) => void;

  // Recovery Options
  addRecoveryOption: (option: RecoveryOption) => void;
  updateRecoveryOption: (id: string, updates: Partial<RecoveryOption>) => void;
  deleteRecoveryOption: (id: string) => void;

  // Cost Benefit Analysis
  addCostBenefitAnalysis: (analysis: CostBenefitAnalysis) => void;
  updateCostBenefitAnalysis: (
    id: string,
    updates: Partial<CostBenefitAnalysis>,
  ) => void;
  deleteCostBenefitAnalysis: (id: string) => void;
  calculateCBA: (id: string) => Promise<void>;

  // Strategy Approval
  submitForApproval: (approval: StrategyApproval) => Promise<void>;
  approveStep: (
    approvalId: string,
    stepId: string,
    comments?: string,
  ) => Promise<void>;
  rejectStep: (
    approvalId: string,
    stepId: string,
    reason: string,
  ) => Promise<void>;
  exportStrategyDecision: (approvalId: string) => Promise<string>;
  exportStrategyComparison: (approvalIds?: string[]) => Promise<string>;
  downloadStrategyDocument: (content: string, filename: string) => void;

  // Diagrams
  loadDiagram: (processId: string) => Promise<{ data: any } | null>;
  saveDiagram: (processId: string, data: any) => Promise<void>;

  // People & Roles
  fetchBCPeople: () => Promise<void>;
  fetchBCRoles: () => Promise<void>;
  fetchTrainingRecords: () => Promise<void>;
  fetchCompetencies: () => Promise<void>;
  fetchPersonCompetencies: () => Promise<void>;

  // Incident Management
  createIncident: (incident: Partial<Incident>) => Promise<Incident>;
  updateIncidentStatus: (
    incidentId: string,
    status: IncidentStatus,
  ) => Promise<void>;
  fetchIncidentStatistics: () => void;

  // Data Fetching from API
  fetchProcesses: () => Promise<void>;
  fetchImpacts: () => Promise<void>;
  fetchRecoveryObjectives: () => Promise<void>;
  fetchDependencies: () => Promise<void>;
  fetchBusinessResources: () => Promise<void>;
  fetchRecoveryOptions: () => Promise<void>;
  fetchCostBenefitAnalyses: () => Promise<void>;
  fetchExerciseRecords: () => Promise<void>;
  fetchIncidents: () => Promise<void>;
  initializeDataFromAPI: () => Promise<void>;

  // Settings
  updateSettings: (settings: Partial<Settings>) => void;

  // Calculations
  calculateRiskScore: (processId: string) => number;
  calculateMTPDFromTimeline: (processId: string) => number | null;

  // Data Management
  exportData: () => string;
  importData: (json: string) => boolean;
  clearAllData: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // All data initialized as empty arrays - will be loaded from database via API
      processes: [],
      impacts: {},
      recoveryObjectives: {},
      temporalData: {},
      dependencies: [],
      businessResources: [],
      resourceDependencies: [],
      processResourceLinks: [],
      exerciseRecords: [],
      risks: [],
      threats: [],
      riskTreatments: [],
      strategicItems: [],
      recoveryOptions: [],
      costBenefitAnalyses: [],
      strategyApprovals: [],
      strategyAssessments: [],
      strategyObjectives: [],
      diagramStore: {},
      bcPeople: [],
      bcRoles: [],
      bcTrainingRecords: [],
      bcCompetencies: [],
      bcPersonCompetencies: [],
      incidents: [],
      incidentStatistics: EMPTY_INCIDENT_STATS,
      settings: DEFAULT_SETTINGS,
      currentView: "dashboard",
      selectedProcessId: null,
      sidebarCollapsed: false,
      showGlossary: false,

      setCurrentView: (view) => set({ currentView: view }),
      setSelectedProcessId: (id) => set({ selectedProcessId: id }),
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      toggleGlossary: () => set((s) => ({ showGlossary: !s.showGlossary })),

      addProcess: (process) =>
        set((s) => ({
          processes: [...s.processes, process],
          impacts: {
            ...s.impacts,
            [process.id]: {
              financial: 0,
              operational: 0,
              reputational: 0,
              legal: 0,
              health: 0,
              environmental: 0,
            },
          },
          recoveryObjectives: {
            ...s.recoveryObjectives,
            [process.id]: {
              mtpd: 24,
              rto: 12,
              rpo: 4,
              mbco: false,
              recoveryStrategy: "warm-standby",
              strategyNotes: "",
            },
          },
        })),

      updateProcess: (id, updates) =>
        set((s) => ({
          processes: s.processes.map((p) =>
            p.id === id
              ? { ...p, ...updates, updatedAt: new Date().toISOString() }
              : p,
          ),
        })),

      deleteProcess: (id) =>
        set((s) => {
          const { [id]: _i, ...remainingImpacts } = s.impacts;
          const { [id]: _r, ...remainingRecovery } = s.recoveryObjectives;
          const { [id]: _t, ...remainingTemporal } = s.temporalData;
          return {
            processes: s.processes.filter((p) => p.id !== id),
            impacts: remainingImpacts,
            recoveryObjectives: remainingRecovery,
            temporalData: remainingTemporal,
            dependencies: s.dependencies.filter(
              (d) => d.sourceProcessId !== id && d.targetProcessId !== id,
            ),
          };
        }),

      getProcessById: (id) => get().processes.find((p) => p.id === id),

      updateImpact: (processId, impact) =>
        set((s) => ({ impacts: { ...s.impacts, [processId]: impact } })),

      updateRecoveryObjective: (processId, objective) =>
        set((s) => ({
          recoveryObjectives: {
            ...s.recoveryObjectives,
            [processId]: objective,
          },
        })),

      updateTemporalData: (processId, data) =>
        set((s) => ({
          temporalData: { ...s.temporalData, [processId]: data },
        })),

      initTemporalData: (processId) => {
        const existing = get().temporalData[processId];
        const customPoints = getTimelinePointsFromCustom(
          get().settings.customTimelinePoints || [],
        );
        const numPoints = customPoints.length || 7;
        if (!existing || existing.length !== numPoints) {
          const impact = get().impacts[processId] || {
            financial: 0,
            operational: 0,
            reputational: 0,
            legal: 0,
            health: 0,
            environmental: 0,
          };
          const data = customPoints.map((tp, i) => ({
            ...tp,
            financial: Math.min(
              impact.financial,
              Math.floor((i * impact.financial) / numPoints),
            ),
            operational: Math.min(
              impact.operational,
              Math.floor((i * impact.operational) / numPoints),
            ),
            reputational: Math.min(
              impact.reputational,
              Math.floor((i * impact.reputational) / numPoints),
            ),
            legal: Math.min(
              impact.legal,
              Math.floor((i * impact.legal) / numPoints),
            ),
            health: Math.min(
              impact.health,
              Math.floor((i * impact.health) / numPoints),
            ),
            environmental: Math.min(
              impact.environmental,
              Math.floor((i * impact.environmental) / numPoints),
            ),
          }));
          set((s) => ({
            temporalData: { ...s.temporalData, [processId]: data },
          }));
        }
      },

      addDependency: (dep) =>
        set((s) => ({ dependencies: [...s.dependencies, dep] })),
      removeDependency: (id) =>
        set((s) => ({
          dependencies: s.dependencies.filter((d) => d.id !== id),
        })),

      getDependenciesForProcess: (processId) => {
        const deps = get().dependencies;
        return {
          upstream: deps.filter((d) => d.sourceProcessId === processId),
          downstream: deps.filter((d) => d.targetProcessId === processId),
        };
      },

      addBusinessResource: (resource) =>
        set((s) => ({
          businessResources: [...s.businessResources, resource],
        })),
      updateBusinessResource: (id, updates) =>
        set((s) => ({
          businessResources: s.businessResources.map((r) =>
            r.id === id ? { ...r, ...updates } : r,
          ),
        })),
      deleteBusinessResource: (id) =>
        set((s) => ({
          businessResources: s.businessResources.filter((r) => r.id !== id),
        })),
      setResourceDependencies: (deps) =>
        set(() => ({ resourceDependencies: deps })),
      addResourceDependency: (dep) =>
        set((s) => ({
          resourceDependencies: [...s.resourceDependencies, dep],
        })),
      removeResourceDependency: (id) =>
        set((s) => ({
          resourceDependencies: s.resourceDependencies.filter(
            (d) => d.id !== id,
          ),
        })),
      linkResourceToProcess: (link) =>
        set((s) => ({
          processResourceLinks: [
            ...s.processResourceLinks,
            { ...link, id: link.id || createId() },
          ],
        })),
      unlinkResourceFromProcess: (id) =>
        set((s) => ({
          processResourceLinks: s.processResourceLinks.filter(
            (l) => l.id !== id,
          ),
        })),

      addExerciseRecord: (record) =>
        set((s) => ({ exerciseRecords: [...s.exerciseRecords, record] })),
      updateExerciseRecord: (id, updates) =>
        set((s) => ({
          exerciseRecords: s.exerciseRecords.map((r) =>
            r.id === id
              ? { ...r, ...updates, updatedAt: new Date().toISOString() }
              : r,
          ),
        })),
      deleteExerciseRecord: (id) =>
        set((s) => ({
          exerciseRecords: s.exerciseRecords.filter((r) => r.id !== id),
        })),

      addRisk: (risk) => set((s) => ({ risks: [...s.risks, risk] })),
      updateRisk: (id, updates) =>
        set((s) => ({
          risks: s.risks.map((r) =>
            r.id === id
              ? { ...r, ...updates, updatedAt: new Date().toISOString() }
              : r,
          ),
        })),
      deleteRisk: (id) =>
        set((s) => ({ risks: s.risks.filter((r) => r.id !== id) })),

      addThreat: (threat) => set((s) => ({ threats: [...s.threats, threat] })),
      updateThreat: (id, updates) =>
        set((s) => ({
          threats: s.threats.map((t) =>
            t.id === id
              ? { ...t, ...updates, updatedAt: new Date().toISOString() }
              : t,
          ),
        })),
      deleteThreat: (id) =>
        set((s) => ({ threats: s.threats.filter((t) => t.id !== id) })),

      addRiskTreatment: (treatment) =>
        set((s) => ({ riskTreatments: [...s.riskTreatments, treatment] })),
      updateRiskTreatment: (id, updates) =>
        set((s) => ({
          riskTreatments: s.riskTreatments.map((t) =>
            t.id === id
              ? { ...t, ...updates, updatedAt: new Date().toISOString() }
              : t,
          ),
        })),
      deleteRiskTreatment: (id) =>
        set((s) => ({
          riskTreatments: s.riskTreatments.filter((t) => t.id !== id),
        })),

      addStrategicItem: (item) =>
        set((s) => ({ strategicItems: [...s.strategicItems, item] })),
      updateStrategicItem: (id, updates) =>
        set((s) => ({
          strategicItems: s.strategicItems.map((i) =>
            i.id === id
              ? { ...i, ...updates, updatedAt: new Date().toISOString() }
              : i,
          ),
        })),
      deleteStrategicItem: (id) =>
        set((s) => ({
          strategicItems: s.strategicItems.filter((i) => i.id !== id),
        })),

      addRecoveryOption: (option) =>
        set((s) => ({
          recoveryOptions: [...s.recoveryOptions, option],
        })),
      updateRecoveryOption: (id, updates) =>
        set((s) => ({
          recoveryOptions: s.recoveryOptions.map((o) =>
            o.id === id
              ? { ...o, ...updates, updatedAt: new Date().toISOString() }
              : o,
          ),
        })),
      deleteRecoveryOption: (id) =>
        set((s) => ({
          recoveryOptions: s.recoveryOptions.filter((o) => o.id !== id),
        })),

      addCostBenefitAnalysis: (analysis) =>
        set((s) => ({
          costBenefitAnalyses: [...s.costBenefitAnalyses, analysis],
        })),
      updateCostBenefitAnalysis: (id, updates) =>
        set((s) => ({
          costBenefitAnalyses: s.costBenefitAnalyses.map((a) =>
            a.id === id
              ? { ...a, ...updates, updatedAt: new Date().toISOString() }
              : a,
          ),
        })),
      deleteCostBenefitAnalysis: (id) =>
        set((s) => ({
          costBenefitAnalyses: s.costBenefitAnalyses.filter((a) => a.id !== id),
        })),
      calculateCBA: async (id) => {
        const analysis = get().costBenefitAnalyses.find((a) => a.id === id);
        if (!analysis) return;

        const totalImplementation =
          analysis.implementationPersonnel +
          analysis.implementationTech +
          analysis.implementationInfra +
          analysis.implementationTraining +
          analysis.implementationExternal +
          analysis.implementationOther;
        const totalOperational =
          analysis.operationalPersonnel +
          analysis.operationalTech +
          analysis.operationalInfra +
          analysis.operationalTraining +
          analysis.operationalExternal +
          analysis.operationalOther;
        const totalMaintenance =
          analysis.maintenancePersonnel +
          analysis.maintenanceTech +
          analysis.maintenanceInfra +
          analysis.maintenanceTraining +
          analysis.maintenanceExternal +
          analysis.maintenanceOther;
        const totalCost =
          totalImplementation + totalOperational + totalMaintenance;
        const totalBenefit =
          analysis.avoidedFinancial +
          analysis.avoidedOperational +
          analysis.avoidedReputational +
          analysis.avoidedLegal;
        const netBenefit = totalBenefit - totalCost;
        const roi = totalCost > 0 ? (netBenefit / totalCost) * 100 : 0;
        const paybackPeriod = totalBenefit > 0 ? totalCost / totalBenefit : 0;
        const bcRatio = totalCost > 0 ? totalBenefit / totalCost : 0;

        set((s) => ({
          costBenefitAnalyses: s.costBenefitAnalyses.map((a) =>
            a.id === id
              ? {
                  ...a,
                  totalCost,
                  totalBenefit,
                  netBenefit,
                  roi,
                  paybackPeriod,
                  bcRatio,
                  updatedAt: new Date().toISOString(),
                }
              : a,
          ),
        }));
      },

      submitForApproval: async (approval) => {
        const submission = {
          ...approval,
          id: approval.id || createId(),
          submittedAt: approval.submittedAt || new Date().toISOString(),
          status: approval.status || "in-progress",
        };
        set((s) => ({
          strategyApprovals: [...s.strategyApprovals, submission],
        }));
      },
      approveStep: async (approvalId, stepId, comments) => {
        set((s) => ({
          strategyApprovals: s.strategyApprovals.map((approval) => {
            if (approval.id !== approvalId) return approval;
            const steps = approval.steps.map((step) =>
              step.id === stepId
                ? ({
                    ...step,
                    status: "approved" as const,
                    comments,
                    decidedAt: new Date().toISOString(),
                    decidedBy: approval.submittedBy,
                  } as ApprovalStep)
                : step,
            );
            const allApproved = steps.every(
              (step) => step.status === "approved",
            );
            return {
              ...approval,
              steps,
              status: allApproved ? "approved" : "in-progress",
              finalDecision: allApproved ? "approved" : approval.finalDecision,
              finalDecisionDate: allApproved
                ? new Date().toISOString()
                : approval.finalDecisionDate,
            };
          }),
        }));
      },
      rejectStep: async (approvalId, stepId, reason) => {
        set((s) => ({
          strategyApprovals: s.strategyApprovals.map((approval) => {
            if (approval.id !== approvalId) return approval;
            const steps = approval.steps.map((step) =>
              step.id === stepId
                ? ({
                    ...step,
                    status: "rejected" as const,
                    comments: reason,
                    decidedAt: new Date().toISOString(),
                    decidedBy: approval.submittedBy,
                  } as ApprovalStep)
                : step,
            );
            return {
              ...approval,
              steps,
              status: "rejected",
              finalDecision: "rejected",
              finalDecisionDate: new Date().toISOString(),
              finalDecisionNotes: reason,
            };
          }),
        }));
      },
      exportStrategyDecision: async (approvalId) => {
        const approval = get().strategyApprovals.find(
          (a) => a.id === approvalId,
        );
        return JSON.stringify(approval ?? {}, null, 2);
      },
      exportStrategyComparison: async (approvalIds) => {
        const approvals =
          approvalIds && approvalIds.length > 0
            ? get().strategyApprovals.filter((a) => approvalIds.includes(a.id))
            : get().strategyApprovals;
        return JSON.stringify(approvals, null, 2);
      },
      downloadStrategyDocument: (content, filename) => {
        if (typeof document === "undefined") return;
        const blob = new Blob([content], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${filename}.json`;
        link.click();
        URL.revokeObjectURL(url);
      },

      fetchBCPeople: async () => {
        try {
          const response = await fetch("/api/bc-people");
          if (!response.ok) throw new Error("Failed to fetch BC people");
          const data = await response.json();
          set({ bcPeople: data });
        } catch (error) {
          console.error("Error fetching BC people:", error);
        }
      },
      fetchBCRoles: async () => {
        try {
          const response = await fetch("/api/bc-roles");
          if (!response.ok) throw new Error("Failed to fetch BC roles");
          const data = await response.json();
          set({ bcRoles: data });
        } catch (error) {
          console.error("Error fetching BC roles:", error);
        }
      },
      fetchTrainingRecords: async () => {
        try {
          const response = await fetch("/api/bc-training-records");
          if (!response.ok) throw new Error("Failed to fetch training records");
          const data = await response.json();
          set({ bcTrainingRecords: data });
        } catch (error) {
          console.error("Error fetching training records:", error);
        }
      },
      fetchCompetencies: async () => {
        try {
          const response = await fetch("/api/bc-competencies");
          if (!response.ok) throw new Error("Failed to fetch competencies");
          const data = await response.json();
          set({ bcCompetencies: data });
        } catch (error) {
          console.error("Error fetching competencies:", error);
        }
      },
      fetchPersonCompetencies: async () => {
        try {
          const response = await fetch(
            "/api/bc-competencies/person-competencies",
          );
          if (!response.ok) {
            throw new Error("Failed to fetch person competencies");
          }
          const data = await response.json();
          set({ bcPersonCompetencies: data });
        } catch (error) {
          console.error("Error fetching person competencies:", error);
        }
      },

      createIncident: async (incident) => {
        const now = new Date();
        const newIncident: Incident = {
          id: createId(),
          incidentNumber: `INC-${Date.now()}`,
          title: incident.title || "Untitled Incident",
          description: incident.description || "",
          category: incident.category || IncidentCategory.OTHER,
          severity: incident.severity || IncidentSeverity.MEDIUM,
          status: IncidentStatus.REPORTED,
          impactAreas: incident.impactAreas || [],
          businessImpact: incident.businessImpact || "",
          estimatedFinancialImpact: incident.estimatedFinancialImpact,
          affectedProcessIds: incident.affectedProcessIds || [],
          affectedLocations: incident.affectedLocations || [],
          affectedSystems: incident.affectedSystems || [],
          detectionTime: now,
          reportTime: now,
          responseStartTime: incident.responseStartTime,
          resolutionTime: incident.resolutionTime,
          closureTime: incident.closureTime,
          initialResponseActions: incident.initialResponseActions || "",
          escalationDetails: incident.escalationDetails,
          rootCause: incident.rootCause,
          correctiveActions: incident.correctiveActions,
          preventiveActions: incident.preventiveActions,
          reportedBy: incident.reportedBy || "Unknown",
          assignedTo: incident.assignedTo,
          createdAt: now,
          updatedAt: now,
          organizationId:
            incident.organizationId || "00000000-0000-0000-0000-000000000001",
          updates: [],
          decisions: [],
          communications: [],
          recoveryTasks: [],
          _count: {
            updates: 0,
            decisions: 0,
            communications: 0,
            recoveryTasks: 0,
          },
        };

        set((s) => {
          const incidents = [...s.incidents, newIncident];
          return {
            incidents,
            incidentStatistics: createIncidentStatistics(incidents),
          };
        });

        return newIncident;
      },
      updateIncidentStatus: async (incidentId, status) => {
        set((s) => {
          const incidents = s.incidents.map((incident) =>
            incident.id === incidentId
              ? {
                  ...incident,
                  status,
                  resolutionTime:
                    status === IncidentStatus.RESOLVED ||
                    status === IncidentStatus.CLOSED
                      ? incident.resolutionTime || new Date()
                      : incident.resolutionTime,
                  updatedAt: new Date(),
                }
              : incident,
          );
          return {
            incidents,
            incidentStatistics: createIncidentStatistics(incidents),
          };
        });
      },
      fetchIncidentStatistics: () => {
        set((s) => ({
          incidentStatistics: createIncidentStatistics(
            Array.isArray(s.incidents) ? s.incidents : [],
          ),
        }));
      },

      loadDiagram: async (processId) => {
        const diagram = get().diagramStore[processId];
        return diagram ? { data: diagram.data } : null;
      },
      saveDiagram: async (processId, data) => {
        set((s) => ({
          diagramStore: {
            ...s.diagramStore,
            [processId]: { data, updatedAt: new Date().toISOString() },
          },
        }));
      },

      updateSettings: (settings) =>
        set((s) => ({ settings: { ...s.settings, ...settings } })),

      calculateRiskScore: (processId) => {
        const impact = get().impacts[processId];
        const categories = get().settings.impactCategories || [];

        if (!impact || categories.length === 0) return 0;

        let total = 0,
          weightSum = 0;

        // Use impact categories and their weights from database
        categories.forEach((category) => {
          const impactValue =
            impact[category.id as keyof ImpactAssessment] || 0;
          total += impactValue * category.weight;
          weightSum += category.weight;
        });

        return weightSum > 0 ? parseFloat((total / weightSum).toFixed(2)) : 0;
      },

      calculateMTPDFromTimeline: (processId) => {
        const timeline = get().temporalData[processId];
        const threshold = get().settings.impactThreshold;
        if (!timeline) return null;
        for (const point of timeline) {
          const maxImpact = Math.max(
            point.financial,
            point.operational,
            point.reputational,
            point.legal,
            point.health,
            point.environmental,
          );
          if (maxImpact >= threshold) return point.timeOffset;
        }
        return null;
      },

      // Fetch data from API
      fetchProcesses: async () => {
        try {
          const response = await fetch("/api/processes");
          if (response.ok) {
            const data = await response.json();
            set({ processes: data || [] });
          }
        } catch (error) {
          console.warn("Failed to fetch processes from API:", error);
          set({ processes: [] });
        }
      },

      fetchImpacts: async () => {
        try {
          const response = await fetch("/api/impacts");
          if (response.ok) {
            const data = await response.json();
            const impactsMap = (data || []).reduce(
              (acc: Record<string, any>, impact: any) => {
                acc[impact.processId] = impact;
                return acc;
              },
              {},
            );
            set({ impacts: impactsMap || {} });
          }
        } catch (error) {
          console.warn("Failed to fetch impacts from API:", error);
          set({ impacts: {} });
        }
      },

      fetchRecoveryObjectives: async () => {
        try {
          const response = await fetch("/api/recovery-objectives");
          if (response.ok) {
            const data = await response.json();
            const objectivesMap = (data || []).reduce(
              (acc: Record<string, any>, obj: any) => {
                acc[obj.processId] = obj;
                return acc;
              },
              {},
            );
            set({ recoveryObjectives: objectivesMap || {} });
          }
        } catch (error) {
          console.warn("Failed to fetch recovery objectives from API:", error);
          set({ recoveryObjectives: {} });
        }
      },

      fetchDependencies: async () => {
        try {
          const response = await fetch("/api/dependencies");
          if (response.ok) {
            const data = await response.json();
            set({ dependencies: data || [] });
          }
        } catch (error) {
          console.warn("Failed to fetch dependencies from API:", error);
          set({ dependencies: [] });
        }
      },

      fetchBusinessResources: async () => {
        try {
          const response = await fetch("/api/business-resources");
          if (response.ok) {
            const data = await response.json();
            set({ businessResources: data || [] });
          }
        } catch (error) {
          console.warn("Failed to fetch business resources from API:", error);
          set({ businessResources: [] });
        }
      },

      fetchRecoveryOptions: async () => {
        try {
          const response = await fetch("/api/recovery-options");
          if (response.ok) {
            const data = await response.json();
            set({ recoveryOptions: data || [] });
          }
        } catch (error) {
          console.warn("Failed to fetch recovery options from API:", error);
          set({ recoveryOptions: [] });
        }
      },

      fetchCostBenefitAnalyses: async () => {
        try {
          const response = await fetch("/api/cost-benefit-analyses");
          if (response.ok) {
            const data = await response.json();
            set({ costBenefitAnalyses: data || [] });
          }
        } catch (error) {
          console.warn(
            "Failed to fetch cost-benefit analyses from API:",
            error,
          );
          set({ costBenefitAnalyses: [] });
        }
      },

      fetchExerciseRecords: async () => {
        try {
          const response = await fetch("/api/exercises");
          if (response.ok) {
            let data = await response.json();
            // Ensure data is an array
            if (!Array.isArray(data)) {
              data = [];
            }
            // Ensure each record has a properly structured scope
            const validatedRecords = data.map((record: any) => ({
              ...record,
              scope: record.scope || { processIds: [], resourceIds: [] },
            }));
            set({
              exerciseRecords:
                validatedRecords.length > 0 ? validatedRecords : [],
            });
          }
        } catch (error) {
          console.warn("Failed to fetch exercise records from API:", error);
          set({ exerciseRecords: [] });
        }
      },

      fetchIncidents: async () => {
        try {
          const response = await fetch("/api/incidents");
          if (response.ok) {
            const data = await response.json();
            // Handle both array response and paginated response object
            const incidents = Array.isArray(data) ? data : data.incidents || [];
            set({
              incidents: Array.isArray(incidents) ? incidents : [],
            });
          }
        } catch (error) {
          console.warn("Failed to fetch incidents, using sample data:", error);
        }
      },

      initializeDataFromAPI: async () => {
        await Promise.all([
          get().fetchProcesses(),
          get().fetchImpacts(),
          get().fetchRecoveryObjectives(),
          get().fetchDependencies(),
          get().fetchBusinessResources(),
          get().fetchRecoveryOptions(),
          get().fetchCostBenefitAnalyses(),
          get().fetchExerciseRecords(),
          get().fetchIncidents(),
          get().fetchBCPeople(),
          get().fetchBCRoles(),
          get().fetchTrainingRecords(),
          get().fetchCompetencies(),
        ]);
      },

      exportData: () => {
        const {
          processes,
          impacts,
          recoveryObjectives,
          temporalData,
          dependencies,
          businessResources,
          resourceDependencies,
          processResourceLinks,
          exerciseRecords,
          risks,
          threats,
          riskTreatments,
          strategicItems,
          recoveryOptions,
          costBenefitAnalyses,
          strategyAssessments,
          strategyObjectives,
          diagramStore,
          settings,
        } = get();
        return JSON.stringify(
          {
            processes,
            impacts,
            recoveryObjectives,
            temporalData,
            dependencies,
            businessResources,
            resourceDependencies,
            processResourceLinks,
            exerciseRecords,
            risks,
            threats,
            riskTreatments,
            strategicItems,
            recoveryOptions,
            costBenefitAnalyses,
            strategyAssessments,
            strategyObjectives,
            diagramStore,
            settings,
            exportedAt: new Date().toISOString(),
          },
          null,
          2,
        );
      },

      importData: (json) => {
        try {
          const data = JSON.parse(json);
          if (!data.processes || !Array.isArray(data.processes)) return false;
          set({
            processes: data.processes,
            impacts: data.impacts || {},
            recoveryObjectives: data.recoveryObjectives || {},
            temporalData: data.temporalData || {},
            dependencies: data.dependencies || [],
            businessResources: data.businessResources || [],
            resourceDependencies: data.resourceDependencies || [],
            processResourceLinks: data.processResourceLinks || [],
            exerciseRecords: data.exerciseRecords || [],
            risks: data.risks || [],
            threats: data.threats || [],
            riskTreatments: data.riskTreatments || [],
            strategicItems: data.strategicItems || [],
            recoveryOptions: data.recoveryOptions || [],
            costBenefitAnalyses: data.costBenefitAnalyses || [],
            strategyAssessments: data.strategyAssessments || [],
            strategyObjectives: data.strategyObjectives || [],
            diagramStore: data.diagramStore || {},
            settings: data.settings || DEFAULT_SETTINGS,
          });
          return true;
        } catch {
          return false;
        }
      },

      clearAllData: () =>
        set({
          processes: [],
          impacts: {},
          recoveryObjectives: {},
          temporalData: {},
          dependencies: [],
          businessResources: [],
          resourceDependencies: [],
          processResourceLinks: [],
          exerciseRecords: [],
          risks: [],
          threats: [],
          riskTreatments: [],
          strategicItems: [],
          recoveryOptions: [],
          costBenefitAnalyses: [],
          strategyAssessments: [],
          strategyObjectives: [],
          diagramStore: {},
          settings: DEFAULT_SETTINGS,
        }),
    }),
    {
      name: "bia-tool-storage-v3",
      partialize: (state) => ({
        processes: state.processes,
        impacts: state.impacts,
        recoveryObjectives: state.recoveryObjectives,
        temporalData: state.temporalData,
        dependencies: state.dependencies,
        businessResources: state.businessResources,
        resourceDependencies: state.resourceDependencies,
        processResourceLinks: state.processResourceLinks,
        exerciseRecords: state.exerciseRecords,
        risks: state.risks,
        threats: state.threats,
        riskTreatments: state.riskTreatments,
        strategicItems: state.strategicItems,
        recoveryOptions: state.recoveryOptions,
        costBenefitAnalyses: state.costBenefitAnalyses,
        strategyAssessments: state.strategyAssessments,
        strategyObjectives: state.strategyObjectives,
        diagramStore: state.diagramStore,
        settings: state.settings,
      }),
    },
  ),
);
