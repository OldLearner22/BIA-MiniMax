import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Process, ImpactAssessment, RecoveryObjective, TimelinePoint, Dependency, Settings, DEFAULT_SETTINGS, getTimelinePointsFromCustom } from '../types';

const SAMPLE_PROCESSES: Process[] = [
  { id: 'PROC-001', name: 'Payment Processing', owner: 'Jane Smith', department: 'Finance', description: 'Core payment processing system for customer transactions.', criticality: 'critical', status: 'approved', createdAt: '2024-01-15T10:00:00Z', updatedAt: '2024-12-01T14:30:00Z' },
  { id: 'PROC-002', name: 'Customer Service Platform', owner: 'Mike Johnson', department: 'Operations', description: 'Multi-channel customer support platform.', criticality: 'high', status: 'approved', createdAt: '2024-01-20T09:00:00Z', updatedAt: '2024-11-15T11:20:00Z' },
  { id: 'PROC-003', name: 'Inventory Management', owner: 'Sarah Williams', department: 'Supply Chain', description: 'Real-time inventory tracking system.', criticality: 'high', status: 'draft', createdAt: '2024-02-01T08:00:00Z', updatedAt: '2024-12-05T16:45:00Z' },
  { id: 'PROC-004', name: 'Order Fulfillment', owner: 'Tom Brown', department: 'Operations', description: 'End-to-end order processing.', criticality: 'medium', status: 'in-review', createdAt: '2024-02-10T14:00:00Z', updatedAt: '2024-11-28T09:15:00Z' },
  { id: 'PROC-005', name: 'Email Communications', owner: 'Lisa Davis', department: 'IT', description: 'Corporate email system.', criticality: 'low', status: 'approved', createdAt: '2024-02-15T11:00:00Z', updatedAt: '2024-10-20T13:30:00Z' }
];

const SAMPLE_IMPACTS: Record<string, ImpactAssessment> = {
  'PROC-001': { financial: 5, operational: 4, reputational: 5, legal: 4, health: 0, environmental: 0 },
  'PROC-002': { financial: 3, operational: 4, reputational: 4, legal: 2, health: 0, environmental: 0 },
  'PROC-003': { financial: 4, operational: 5, reputational: 3, legal: 2, health: 0, environmental: 1 },
  'PROC-004': { financial: 4, operational: 4, reputational: 4, legal: 3, health: 0, environmental: 0 },
  'PROC-005': { financial: 2, operational: 3, reputational: 2, legal: 1, health: 0, environmental: 0 }
};

const SAMPLE_RECOVERY: Record<string, RecoveryObjective> = {
  'PROC-001': { mtpd: 4, rto: 2, rpo: 0, mbco: true, recoveryStrategy: 'high-availability', strategyNotes: 'Active-active data center with automatic failover' },
  'PROC-002': { mtpd: 24, rto: 8, rpo: 4, mbco: false, recoveryStrategy: 'warm-standby', strategyNotes: 'Secondary contact center' },
  'PROC-003': { mtpd: 48, rto: 24, rpo: 8, mbco: false, recoveryStrategy: 'cold-backup', strategyNotes: 'Manual processes available' },
  'PROC-004': { mtpd: 24, rto: 12, rpo: 2, mbco: true, recoveryStrategy: 'warm-standby', strategyNotes: 'Backup system with 4-hour activation' },
  'PROC-005': { mtpd: 72, rto: 24, rpo: 24, mbco: false, recoveryStrategy: 'cold-backup', strategyNotes: 'Cloud-based email with 24-hour recovery' }
};

const INITIAL_TIMELINE = getTimelinePointsFromCustom(DEFAULT_SETTINGS.customTimelinePoints);
const SAMPLE_TEMPORAL: Record<string, TimelinePoint[]> = {
  'PROC-001': INITIAL_TIMELINE.map((tp, i) => ({ ...tp, financial: Math.min(5, i), operational: Math.min(5, Math.floor(i * 0.8)), reputational: Math.min(5, i), legal: Math.min(5, Math.floor(i * 0.6)), health: 0, environmental: 0 })),
  'PROC-002': INITIAL_TIMELINE.map((tp, i) => ({ ...tp, financial: Math.min(4, Math.floor(i * 0.6)), operational: Math.min(4, Math.floor(i * 0.7)), reputational: Math.min(4, i), legal: Math.min(2, Math.floor(i * 0.3)), health: 0, environmental: 0 })),
};

const SAMPLE_DEPENDENCIES: Dependency[] = [
  { id: 'DEP-001', sourceProcessId: 'PROC-004', targetProcessId: 'PROC-001', type: 'technical', criticality: 5, description: 'Order fulfillment requires payment processing' },
  { id: 'DEP-002', sourceProcessId: 'PROC-004', targetProcessId: 'PROC-003', type: 'operational', criticality: 4, description: 'Order fulfillment depends on inventory data' },
  { id: 'DEP-003', sourceProcessId: 'PROC-002', targetProcessId: 'PROC-005', type: 'technical', criticality: 3, description: 'Customer service uses email for notifications' },
  { id: 'DEP-004', sourceProcessId: 'PROC-001', targetProcessId: 'PROC-005', type: 'technical', criticality: 2, description: 'Payment confirmations sent via email' },
];

interface StoreState {
  processes: Process[];
  impacts: Record<string, ImpactAssessment>;
  recoveryObjectives: Record<string, RecoveryObjective>;
  temporalData: Record<string, TimelinePoint[]>;
  dependencies: Dependency[];
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
  updateRecoveryObjective: (processId: string, objective: RecoveryObjective) => void;
  
  // Temporal
  updateTemporalData: (processId: string, data: TimelinePoint[]) => void;
  initTemporalData: (processId: string) => void;
  
  // Dependencies
  addDependency: (dep: Dependency) => void;
  removeDependency: (id: string) => void;
  getDependenciesForProcess: (processId: string) => { upstream: Dependency[]; downstream: Dependency[] };
  
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
      processes: SAMPLE_PROCESSES,
      impacts: SAMPLE_IMPACTS,
      recoveryObjectives: SAMPLE_RECOVERY,
      temporalData: SAMPLE_TEMPORAL,
      dependencies: SAMPLE_DEPENDENCIES,
      settings: DEFAULT_SETTINGS,
      currentView: 'dashboard',
      selectedProcessId: null,
      sidebarCollapsed: false,
      showGlossary: false,

      setCurrentView: (view) => set({ currentView: view }),
      setSelectedProcessId: (id) => set({ selectedProcessId: id }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      toggleGlossary: () => set((s) => ({ showGlossary: !s.showGlossary })),

      addProcess: (process) => set((s) => ({
        processes: [...s.processes, process],
        impacts: { ...s.impacts, [process.id]: { financial: 0, operational: 0, reputational: 0, legal: 0, health: 0, environmental: 0 } },
        recoveryObjectives: { ...s.recoveryObjectives, [process.id]: { mtpd: 24, rto: 12, rpo: 4, mbco: false, recoveryStrategy: 'warm-standby', strategyNotes: '' } }
      })),

      updateProcess: (id, updates) => set((s) => ({
        processes: s.processes.map((p) => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p)
      })),

      deleteProcess: (id) => set((s) => {
        const { [id]: _i, ...remainingImpacts } = s.impacts;
        const { [id]: _r, ...remainingRecovery } = s.recoveryObjectives;
        const { [id]: _t, ...remainingTemporal } = s.temporalData;
        return {
          processes: s.processes.filter((p) => p.id !== id),
          impacts: remainingImpacts,
          recoveryObjectives: remainingRecovery,
          temporalData: remainingTemporal,
          dependencies: s.dependencies.filter((d) => d.sourceProcessId !== id && d.targetProcessId !== id)
        };
      }),

      getProcessById: (id) => get().processes.find((p) => p.id === id),

      updateImpact: (processId, impact) => set((s) => ({ impacts: { ...s.impacts, [processId]: impact } })),

      updateRecoveryObjective: (processId, objective) => set((s) => ({ recoveryObjectives: { ...s.recoveryObjectives, [processId]: objective } })),

      updateTemporalData: (processId, data) => set((s) => ({ temporalData: { ...s.temporalData, [processId]: data } })),

      initTemporalData: (processId) => {
        const existing = get().temporalData[processId];
        const customPoints = getTimelinePointsFromCustom(get().settings.customTimelinePoints || []);
        const numPoints = customPoints.length || 7;
        if (!existing || existing.length !== numPoints) {
          const impact = get().impacts[processId] || { financial: 0, operational: 0, reputational: 0, legal: 0, health: 0, environmental: 0 };
          const data = customPoints.map((tp, i) => ({
            ...tp,
            financial: Math.min(impact.financial, Math.floor(i * impact.financial / numPoints)),
            operational: Math.min(impact.operational, Math.floor(i * impact.operational / numPoints)),
            reputational: Math.min(impact.reputational, Math.floor(i * impact.reputational / numPoints)),
            legal: Math.min(impact.legal, Math.floor(i * impact.legal / numPoints)),
            health: Math.min(impact.health, Math.floor(i * impact.health / numPoints)),
            environmental: Math.min(impact.environmental, Math.floor(i * impact.environmental / numPoints)),
          }));
          set((s) => ({ temporalData: { ...s.temporalData, [processId]: data } }));
        }
      },

      addDependency: (dep) => set((s) => ({ dependencies: [...s.dependencies, dep] })),
      removeDependency: (id) => set((s) => ({ dependencies: s.dependencies.filter((d) => d.id !== id) })),

      getDependenciesForProcess: (processId) => {
        const deps = get().dependencies;
        return {
          upstream: deps.filter((d) => d.sourceProcessId === processId),
          downstream: deps.filter((d) => d.targetProcessId === processId)
        };
      },

      updateSettings: (settings) => set((s) => ({ settings: { ...s.settings, ...settings } })),

      calculateRiskScore: (processId) => {
        const impact = get().impacts[processId];
        const weights = get().settings.impactWeights;
        if (!impact) return 0;
        let total = 0, weightSum = 0;
        Object.entries(weights).forEach(([key, weight]) => {
          total += (impact[key as keyof ImpactAssessment] || 0) * weight;
          weightSum += weight;
        });
        return parseFloat((total / weightSum).toFixed(2));
      },

      calculateMTPDFromTimeline: (processId) => {
        const timeline = get().temporalData[processId];
        const threshold = get().settings.impactThreshold;
        if (!timeline) return null;
        for (const point of timeline) {
          const maxImpact = Math.max(point.financial, point.operational, point.reputational, point.legal, point.health, point.environmental);
          if (maxImpact >= threshold) return point.timeOffset;
        }
        return null;
      },

      exportData: () => {
        const { processes, impacts, recoveryObjectives, temporalData, dependencies, settings } = get();
        return JSON.stringify({ processes, impacts, recoveryObjectives, temporalData, dependencies, settings, exportedAt: new Date().toISOString() }, null, 2);
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
            settings: data.settings || DEFAULT_SETTINGS
          });
          return true;
        } catch { return false; }
      },

      clearAllData: () => set({
        processes: [],
        impacts: {},
        recoveryObjectives: {},
        temporalData: {},
        dependencies: [],
        settings: DEFAULT_SETTINGS
      })
    }),
    {
      name: 'bia-tool-storage-v3',
      partialize: (state) => ({
        processes: state.processes,
        impacts: state.impacts,
        recoveryObjectives: state.recoveryObjectives,
        temporalData: state.temporalData,
        dependencies: state.dependencies,
        settings: state.settings,
      }),
    }
  )
);
