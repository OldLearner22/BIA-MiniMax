export type Criticality = 'critical' | 'high' | 'medium' | 'low' | 'minimal';
export type ProcessStatus = 'draft' | 'in-review' | 'approved';
export type RecoveryStrategy = 'high-availability' | 'warm-standby' | 'cold-backup' | 'manual' | 'cloud-based';
export type DependencyType = 'technical' | 'operational' | 'resource';

export interface Process {
  id: string;
  name: string;
  owner: string;
  department: string;
  description: string;
  criticality: Criticality;
  status: ProcessStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ImpactAssessment {
  financial: number;
  operational: number;
  reputational: number;
  legal: number;
  health: number;
  environmental: number;
}

export interface RecoveryObjective {
  mtpd: number;
  rto: number;
  rpo: number;
  mbco: boolean;
  recoveryStrategy: RecoveryStrategy;
  strategyNotes: string;
}

export interface TimelinePoint {
  timeOffset: number;
  timeLabel: string;
  financial: number;
  operational: number;
  reputational: number;
  legal: number;
  health: number;
  environmental: number;
}

export interface Dependency {
  id: string;
  sourceProcessId: string;
  targetProcessId: string;
  type: DependencyType;
  criticality: number;
  description: string;
}

export interface CustomTimelinePoint {
  id: string;
  label: string;
  value: number;
  unit: 'hours' | 'days' | 'weeks';
}

export interface TimeBasedDefinition {
  timelinePointId: string;
  description: string;
}

export interface ImpactCategory {
  id: string;
  name: string;
  description: string;
  weight: number;
  color: string;
  timeBasedDefinitions: TimeBasedDefinition[];
}

export type ResourceType = 'personnel' | 'systems' | 'equipment' | 'facilities' | 'vendors' | 'data';
export type TimeUnit = 'minutes' | 'hours' | 'days';

export interface TimeValue {
  value: number;
  unit: TimeUnit;
}

export interface BusinessResource {
  id: string;
  name: string;
  type: ResourceType;
  description: string;
  rto?: TimeValue;
  rpo?: TimeValue;
  quantityAtIntervals?: Record<string, number>; // timelinePointId -> quantity
}

export interface Settings {
  impactWeights: Record<string, number>;
  theme: 'dark' | 'light';
  impactThreshold: number;
  customTimelinePoints: CustomTimelinePoint[];
  impactCategories: ImpactCategory[];
  businessResources: BusinessResource[];
}

export const RESOURCE_TYPES: { value: ResourceType; label: string }[] = [
  { value: 'personnel', label: 'Personnel' },
  { value: 'systems', label: 'Systems/Applications' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'facilities', label: 'Facilities' },
  { value: 'vendors', label: 'Vendors/Suppliers' },
  { value: 'data', label: 'Data/Records' },
];

export const DEFAULT_BUSINESS_RESOURCES: BusinessResource[] = [
  { id: 'res-1', name: 'ERP System', type: 'systems', description: 'Enterprise resource planning platform', rto: { value: 4, unit: 'hours' }, rpo: { value: 1, unit: 'hours' } },
  { id: 'res-2', name: 'IT Support Team', type: 'personnel', description: 'Technical support and infrastructure team', rto: { value: 2, unit: 'hours' } },
  { id: 'res-3', name: 'Primary Data Center', type: 'facilities', description: 'Main data center hosting critical systems', rto: { value: 8, unit: 'hours' }, rpo: { value: 4, unit: 'hours' } },
];

export interface AppState {
  processes: Process[];
  impacts: Record<string, ImpactAssessment>;
  recoveryObjectives: Record<string, RecoveryObjective>;
  temporalData: Record<string, TimelinePoint[]>;
  dependencies: Dependency[];
  settings: Settings;
}

export const DEFAULT_TIMELINE_POINTS = [
  { timeOffset: 0, timeLabel: 'Immediate' },
  { timeOffset: 4, timeLabel: '4 hours' },
  { timeOffset: 8, timeLabel: '8 hours' },
  { timeOffset: 24, timeLabel: '24 hours' },
  { timeOffset: 48, timeLabel: '48 hours' },
  { timeOffset: 72, timeLabel: '72 hours' },
  { timeOffset: 168, timeLabel: '1 week' },
];

export const GLOSSARY: Record<string, { term: string; definition: string; isoRef: string }> = {
  MTPD: {
    term: 'Maximum Tolerable Period of Disruption',
    definition: 'The maximum duration a business process can be unavailable before causing unacceptable consequences to the organization.',
    isoRef: 'ISO 22301:2019 Clause 8.2.2'
  },
  RTO: {
    term: 'Recovery Time Objective',
    definition: 'The target time within which a business process must be restored after a disruption to avoid unacceptable consequences.',
    isoRef: 'ISO 22301:2019 Clause 8.2.2'
  },
  RPO: {
    term: 'Recovery Point Objective',
    definition: 'The maximum acceptable amount of data loss measured in time. It indicates the point in time to which data must be recovered.',
    isoRef: 'ISO 22301:2019 Clause 8.2.2'
  },
  MBCO: {
    term: 'Minimum Business Continuity Objective',
    definition: 'The minimum level of services and/or products that is acceptable to achieve business objectives during a disruption.',
    isoRef: 'ISO 22301:2019 Clause 8.2.2'
  },
  BIA: {
    term: 'Business Impact Analysis',
    definition: 'The process of analyzing business functions and the effect that a disruption might have on them.',
    isoRef: 'ISO 22301:2019 Clause 8.2.2'
  },
  BCMS: {
    term: 'Business Continuity Management System',
    definition: 'Part of the overall management system that establishes, implements, operates, monitors, reviews, maintains and improves business continuity.',
    isoRef: 'ISO 22301:2019 Clause 3.5'
  }
};

export const DEFAULT_CUSTOM_TIMELINE_POINTS: CustomTimelinePoint[] = [
  { id: 'ctp-1', label: 'Immediate', value: 0, unit: 'hours' },
  { id: 'ctp-2', label: '4 hours', value: 4, unit: 'hours' },
  { id: 'ctp-3', label: '8 hours', value: 8, unit: 'hours' },
  { id: 'ctp-4', label: '24 hours', value: 24, unit: 'hours' },
  { id: 'ctp-5', label: '48 hours', value: 48, unit: 'hours' },
  { id: 'ctp-6', label: '72 hours', value: 72, unit: 'hours' },
  { id: 'ctp-7', label: '1 week', value: 1, unit: 'weeks' },
];

export const DEFAULT_IMPACT_CATEGORIES: ImpactCategory[] = [
  {
    id: 'financial', name: 'Financial', description: 'Direct monetary losses and revenue impact', weight: 25, color: '#F87171',
    timeBasedDefinitions: [
      { timelinePointId: 'ctp-1', description: 'Negligible, <$1,000' },
      { timelinePointId: 'ctp-2', description: 'Minor delays, $1,000-$5,000' },
      { timelinePointId: 'ctp-3', description: 'Moderate, $5,000-$10,000' },
      { timelinePointId: 'ctp-4', description: 'Significant, $10,000-$50,000' },
      { timelinePointId: 'ctp-5', description: 'Major, $50,000-$100,000' },
      { timelinePointId: 'ctp-6', description: 'Severe, $100,000-$500,000' },
      { timelinePointId: 'ctp-7', description: 'Catastrophic, >$500,000' },
    ]
  },
  {
    id: 'operational', name: 'Operational', description: 'Business process and productivity impact', weight: 25, color: '#FBBF24',
    timeBasedDefinitions: [
      { timelinePointId: 'ctp-1', description: 'No disruption' },
      { timelinePointId: 'ctp-2', description: 'Minor workflow delays' },
      { timelinePointId: 'ctp-3', description: 'Some processes affected' },
      { timelinePointId: 'ctp-4', description: 'Significant backlog' },
      { timelinePointId: 'ctp-5', description: 'Major operations halted' },
      { timelinePointId: 'ctp-6', description: 'Critical services down' },
      { timelinePointId: 'ctp-7', description: 'Complete operational failure' },
    ]
  },
  {
    id: 'reputational', name: 'Reputational', description: 'Brand and customer trust impact', weight: 20, color: '#818CF8',
    timeBasedDefinitions: [
      { timelinePointId: 'ctp-1', description: 'No public awareness' },
      { timelinePointId: 'ctp-2', description: 'Internal awareness only' },
      { timelinePointId: 'ctp-3', description: 'Some customer complaints' },
      { timelinePointId: 'ctp-4', description: 'Social media mentions' },
      { timelinePointId: 'ctp-5', description: 'Media coverage begins' },
      { timelinePointId: 'ctp-6', description: 'Widespread negative press' },
      { timelinePointId: 'ctp-7', description: 'Long-term brand damage' },
    ]
  },
  {
    id: 'legal', name: 'Legal/Compliance', description: 'Regulatory and legal exposure', weight: 15, color: '#38BDF8',
    timeBasedDefinitions: [
      { timelinePointId: 'ctp-1', description: 'No compliance issues' },
      { timelinePointId: 'ctp-2', description: 'Minor documentation gaps' },
      { timelinePointId: 'ctp-3', description: 'SLA breach warnings' },
      { timelinePointId: 'ctp-4', description: 'Regulatory notification required' },
      { timelinePointId: 'ctp-5', description: 'Formal investigation likely' },
      { timelinePointId: 'ctp-6', description: 'Regulatory fines expected' },
      { timelinePointId: 'ctp-7', description: 'Major legal action, license risk' },
    ]
  },
  {
    id: 'health', name: 'Health & Safety', description: 'Employee and public safety impact', weight: 10, color: '#34D399',
    timeBasedDefinitions: [
      { timelinePointId: 'ctp-1', description: 'No safety concerns' },
      { timelinePointId: 'ctp-2', description: 'Minor inconvenience' },
      { timelinePointId: 'ctp-3', description: 'First aid incidents' },
      { timelinePointId: 'ctp-4', description: 'Medical attention needed' },
      { timelinePointId: 'ctp-5', description: 'Serious injuries possible' },
      { timelinePointId: 'ctp-6', description: 'Life-threatening situations' },
      { timelinePointId: 'ctp-7', description: 'Fatalities possible' },
    ]
  },
  {
    id: 'environmental', name: 'Environmental', description: 'Environmental and sustainability impact', weight: 5, color: '#10B981',
    timeBasedDefinitions: [
      { timelinePointId: 'ctp-1', description: 'No environmental impact' },
      { timelinePointId: 'ctp-2', description: 'Minor waste increase' },
      { timelinePointId: 'ctp-3', description: 'Localized contamination' },
      { timelinePointId: 'ctp-4', description: 'Cleanup required' },
      { timelinePointId: 'ctp-5', description: 'Environmental agency notified' },
      { timelinePointId: 'ctp-6', description: 'Significant remediation' },
      { timelinePointId: 'ctp-7', description: 'Long-term ecological damage' },
    ]
  },
];

export const DEFAULT_SETTINGS: Settings = {
  impactWeights: { financial: 25, operational: 25, reputational: 20, legal: 15, health: 10, environmental: 5 },
  theme: 'dark',
  impactThreshold: 3,
  customTimelinePoints: DEFAULT_CUSTOM_TIMELINE_POINTS,
  impactCategories: DEFAULT_IMPACT_CATEGORIES,
  businessResources: DEFAULT_BUSINESS_RESOURCES
};

export function getTimelinePointsFromCustom(customPoints: CustomTimelinePoint[]): { timeOffset: number; timeLabel: string }[] {
  return customPoints
    .map(cp => {
      let hours = cp.value;
      if (cp.unit === 'days') hours = cp.value * 24;
      if (cp.unit === 'weeks') hours = cp.value * 168;
      return { timeOffset: hours, timeLabel: cp.label };
    })
    .sort((a, b) => a.timeOffset - b.timeOffset);
}
