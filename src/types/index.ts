export type Criticality = "critical" | "high" | "medium" | "low" | "minimal";
export type ProcessStatus = "draft" | "in-review" | "approved";
export type RecoveryStrategy =
  | "high-availability"
  | "warm-standby"
  | "cold-backup"
  | "manual"
  | "cloud-based";
export type DependencyType = "technical" | "operational" | "resource";

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
  layout?: any;
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
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

export interface CustomTimelinePoint {
  id: string;
  label: string;
  value: number;
  unit: "hours" | "days" | "weeks";
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

export type ResourceType =
  | "personnel"
  | "systems"
  | "equipment"
  | "facilities"
  | "vendors"
  | "data";
export type TimeUnit = "minutes" | "hours" | "days";

export interface TimeValue {
  value: number;
  unit: TimeUnit;
}

export interface WorkaroundProcedure {
  id: string;
  title: string;
  description: string;
  rtoImpact: number; // Additional time added to RTO if using workaround (minutes)
  activationTime: number; // Time to switch to workaround (minutes)
  steps: string[];
}

export interface VendorDetails {
  name: string;
  contractReference: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  sla: {
    guaranteedRto: number; // minutes
    availability: number; // percentage (e.g. 99.9)
    supportHours: string; // e.g. "24/7", "8-5 M-F"
    penaltyClause?: string;
  };
}

export interface BusinessResource {
  id: string;
  name: string;
  type: ResourceType;
  description: string;
  rto: TimeValue; // Made required as per architecture
  rpo?: TimeValue;
  redundancy: "none" | "partial" | "full";
  recoveryProcedure?: string;
  workarounds?: WorkaroundProcedure[];
  vendorDetails?: VendorDetails;
  quantityAtIntervals?: Record<string, number>;
}

export interface ResourceDependency {
  id: string;
  sourceResourceId: string;
  targetResourceId: string;
  type: DependencyType; // Added to match architecture
  isBlocking: boolean; // Added to match architecture
  description: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

export type ResourceCriticality = "essential" | "important" | "supporting";

export type ExerciseStatus =
  | "planned"
  | "scheduled"
  | "in-progress"
  | "completed"
  | "cancelled";

export type ExerciseType =
  | "tabletop"
  | "walkthrough"
  | "simulation"
  | "full-scale";

export interface ExerciseScope {
  processIds: string[];
  resourceIds: string[];
}

export interface FollowUpAction {
  id: string;
  description: string;
  owner: string;
  dueDate: string;
  status: "open" | "in-progress" | "completed" | "overdue";
  completedDate?: string;
}

export interface ExerciseRecord {
  id: string;
  title: string;
  type: ExerciseType;
  status: ExerciseStatus;
  scheduledDate: string; // ISO date string
  completedDate?: string; // ISO date string
  description: string;
  scope: ExerciseScope; // Updated from string to structured object
  participants: string[];
  findings: string;
  followUpActions: FollowUpAction[]; // Updated from actionsRequired string
  createdAt: string;
  updatedAt: string;
}

export interface TieredResourceRequirement {
  timeLabel: string; // e.g., "Day 1", "Week 1", "4 hours"
  timeOffset: number; // minutes
  quantity: number;
}

export interface ProcessResourceLink {
  id: string;
  processId: string;
  resourceId: string;
  criticality: ResourceCriticality;
  quantityRequired: number; // Initial/Immediate requirement
  notes: string;
  tieredRequirements?: TieredResourceRequirement[];
  processHandle?: string | null;
  resourceHandle?: string | null;
}

export interface Settings {
  impactWeights: Record<string, number>;
  theme: "dark" | "light";
  impactThreshold: number;
  customTimelinePoints: CustomTimelinePoint[];
  impactCategories: ImpactCategory[];
  // businessResources moved to root store, kept here optionally for migration check if needed, or removed.
  // businessResources: BusinessResource[];
}

export const RESOURCE_TYPES: { value: ResourceType; label: string }[] = [
  { value: "personnel", label: "Personnel" },
  { value: "systems", label: "Systems/Applications" },
  { value: "equipment", label: "Equipment" },
  { value: "facilities", label: "Facilities" },
  { value: "vendors", label: "Vendors/Suppliers" },
  { value: "data", label: "Data/Records" },
];

export const DEFAULT_BUSINESS_RESOURCES: BusinessResource[] = [
  {
    id: "res-1",
    name: "ERP System",
    type: "systems",
    description: "Enterprise resource planning platform",
    rto: { value: 4, unit: "hours" },
    rpo: { value: 1, unit: "hours" },
    redundancy: "partial",
  },
  {
    id: "res-2",
    name: "IT Support Team",
    type: "personnel",
    description: "Technical support and infrastructure team",
    rto: { value: 2, unit: "hours" },
    redundancy: "partial",
  },
  {
    id: "res-3",
    name: "Primary Data Center",
    type: "facilities",
    description: "Main data center hosting critical systems",
    rto: { value: 8, unit: "hours" },
    rpo: { value: 4, unit: "hours" },
    redundancy: "full",
  },
];

export const DEFAULT_RESOURCE_DEPENDENCIES: ResourceDependency[] = [
  {
    id: "dep-1",
    sourceResourceId: "res-2", // Primary Server
    targetResourceId: "res-4", // Data Center
    type: "technical",
    isBlocking: true,
    description: "Server hardware hosted in data center",
  },
  {
    id: "dep-2",
    sourceResourceId: "res-1", // Database
    targetResourceId: "res-2", // Primary Server
    type: "technical",
    isBlocking: true,
    description: "Database runs on primary server cluster",
  },
  {
    id: "dep-3",
    sourceResourceId: "res-3", // Customer Support Team
    targetResourceId: "res-1", // Customer Database
    type: "operational",
    isBlocking: true,
    description: "Support team needs DB access to function",
  },
];

export const DEFAULT_EXERCISE_RECORDS: ExerciseRecord[] = [
  {
    id: "ex-1",
    title: "Annual Q1 Disaster Recovery Test",
    type: "simulation",
    status: "completed",
    scheduledDate: "2025-03-15",
    completedDate: "2025-03-15",
    description:
      "Simulated outage of primary data center to validity failover procedures.",
    scope: {
      processIds: [],
      resourceIds: ["res-2", "res-4"],
    },
    participants: ["IT Ops", "Compliance Team", "CTO"],
    findings:
      "Failover succeeded within 2 hours. DNS propagation took longer than expected.",
    followUpActions: [
      {
        id: "act-1",
        description: "Update DNS TTL settings before next test",
        owner: "Network Lead",
        dueDate: "2025-04-01",
        status: "open",
      },
    ],
    createdAt: "2025-03-10T10:00:00Z",
    updatedAt: "2025-03-16T09:00:00Z",
  },
  {
    id: "ex-2",
    title: "Call Center Comm Failure Tabletop",
    type: "tabletop",
    status: "scheduled",
    scheduledDate: "2025-06-20",
    description:
      "Discussion based exercise to review communication protocols during VoIP outage.",
    scope: {
      processIds: [],
      resourceIds: ["res-3"],
    },
    participants: ["Support Leads", "Vendor Reps"],
    findings: "",
    followUpActions: [],
    createdAt: "2025-05-01T10:00:00Z",
    updatedAt: "2025-05-01T10:00:00Z",
  },
];

export interface AppState {
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
  settings: Settings;
}

export const DEFAULT_TIMELINE_POINTS = [
  { timeOffset: 0, timeLabel: "Immediate" },
  { timeOffset: 4, timeLabel: "4 hours" },
  { timeOffset: 8, timeLabel: "8 hours" },
  { timeOffset: 24, timeLabel: "24 hours" },
  { timeOffset: 48, timeLabel: "48 hours" },
  { timeOffset: 72, timeLabel: "72 hours" },
  { timeOffset: 168, timeLabel: "1 week" },
];

export const GLOSSARY: Record<
  string,
  { term: string; definition: string; isoRef: string }
> = {
  MTPD: {
    term: "Maximum Tolerable Period of Disruption",
    definition:
      "The maximum duration a business process can be unavailable before causing unacceptable consequences to the organization.",
    isoRef: "ISO 22301:2019 Clause 8.2.2",
  },
  RTO: {
    term: "Recovery Time Objective",
    definition:
      "The target time within which a business process must be restored after a disruption to avoid unacceptable consequences.",
    isoRef: "ISO 22301:2019 Clause 8.2.2",
  },
  RPO: {
    term: "Recovery Point Objective",
    definition:
      "The maximum acceptable amount of data loss measured in time. It indicates the point in time to which data must be recovered.",
    isoRef: "ISO 22301:2019 Clause 8.2.2",
  },
  MBCO: {
    term: "Minimum Business Continuity Objective",
    definition:
      "The minimum level of services and/or products that is acceptable to achieve business objectives during a disruption.",
    isoRef: "ISO 22301:2019 Clause 8.2.2",
  },
  BIA: {
    term: "Business Impact Analysis",
    definition:
      "The process of analyzing business functions and the effect that a disruption might have on them.",
    isoRef: "ISO 22301:2019 Clause 8.2.2",
  },
  BCMS: {
    term: "Business Continuity Management System",
    definition:
      "Part of the overall management system that establishes, implements, operates, monitors, reviews, maintains and improves business continuity.",
    isoRef: "ISO 22301:2019 Clause 3.5",
  },
};

export const DEFAULT_CUSTOM_TIMELINE_POINTS: CustomTimelinePoint[] = [
  { id: "ctp-1", label: "Immediate", value: 0, unit: "hours" },
  { id: "ctp-2", label: "4 hours", value: 4, unit: "hours" },
  { id: "ctp-3", label: "8 hours", value: 8, unit: "hours" },
  { id: "ctp-4", label: "24 hours", value: 24, unit: "hours" },
  { id: "ctp-5", label: "48 hours", value: 48, unit: "hours" },
  { id: "ctp-6", label: "72 hours", value: 72, unit: "hours" },
  { id: "ctp-7", label: "1 week", value: 1, unit: "weeks" },
];

export const DEFAULT_IMPACT_CATEGORIES: ImpactCategory[] = [
  {
    id: "financial",
    name: "Financial",
    description: "Direct monetary losses and revenue impact",
    weight: 25,
    color: "#F87171",
    timeBasedDefinitions: [
      { timelinePointId: "ctp-1", description: "Negligible, <$1,000" },
      { timelinePointId: "ctp-2", description: "Minor delays, $1,000-$5,000" },
      { timelinePointId: "ctp-3", description: "Moderate, $5,000-$10,000" },
      { timelinePointId: "ctp-4", description: "Significant, $10,000-$50,000" },
      { timelinePointId: "ctp-5", description: "Major, $50,000-$100,000" },
      { timelinePointId: "ctp-6", description: "Severe, $100,000-$500,000" },
      { timelinePointId: "ctp-7", description: "Catastrophic, >$500,000" },
    ],
  },
  {
    id: "operational",
    name: "Operational",
    description: "Business process and productivity impact",
    weight: 25,
    color: "#FBBF24",
    timeBasedDefinitions: [
      { timelinePointId: "ctp-1", description: "No disruption" },
      { timelinePointId: "ctp-2", description: "Minor workflow delays" },
      { timelinePointId: "ctp-3", description: "Some processes affected" },
      { timelinePointId: "ctp-4", description: "Significant backlog" },
      { timelinePointId: "ctp-5", description: "Major operations halted" },
      { timelinePointId: "ctp-6", description: "Critical services down" },
      { timelinePointId: "ctp-7", description: "Complete operational failure" },
    ],
  },
  {
    id: "reputational",
    name: "Reputational",
    description: "Brand and customer trust impact",
    weight: 20,
    color: "#818CF8",
    timeBasedDefinitions: [
      { timelinePointId: "ctp-1", description: "No public awareness" },
      { timelinePointId: "ctp-2", description: "Internal awareness only" },
      { timelinePointId: "ctp-3", description: "Some customer complaints" },
      { timelinePointId: "ctp-4", description: "Social media mentions" },
      { timelinePointId: "ctp-5", description: "Media coverage begins" },
      { timelinePointId: "ctp-6", description: "Widespread negative press" },
      { timelinePointId: "ctp-7", description: "Long-term brand damage" },
    ],
  },
  {
    id: "legal",
    name: "Legal/Compliance",
    description: "Regulatory and legal exposure",
    weight: 15,
    color: "#38BDF8",
    timeBasedDefinitions: [
      { timelinePointId: "ctp-1", description: "No compliance issues" },
      { timelinePointId: "ctp-2", description: "Minor documentation gaps" },
      { timelinePointId: "ctp-3", description: "SLA breach warnings" },
      {
        timelinePointId: "ctp-4",
        description: "Regulatory notification required",
      },
      { timelinePointId: "ctp-5", description: "Formal investigation likely" },
      { timelinePointId: "ctp-6", description: "Regulatory fines expected" },
      {
        timelinePointId: "ctp-7",
        description: "Major legal action, license risk",
      },
    ],
  },
  {
    id: "health",
    name: "Health & Safety",
    description: "Employee and public safety impact",
    weight: 10,
    color: "#34D399",
    timeBasedDefinitions: [
      { timelinePointId: "ctp-1", description: "No safety concerns" },
      { timelinePointId: "ctp-2", description: "Minor inconvenience" },
      { timelinePointId: "ctp-3", description: "First aid incidents" },
      { timelinePointId: "ctp-4", description: "Medical attention needed" },
      { timelinePointId: "ctp-5", description: "Serious injuries possible" },
      { timelinePointId: "ctp-6", description: "Life-threatening situations" },
      { timelinePointId: "ctp-7", description: "Fatalities possible" },
    ],
  },
  {
    id: "environmental",
    name: "Environmental",
    description: "Environmental and sustainability impact",
    weight: 5,
    color: "#10B981",
    timeBasedDefinitions: [
      { timelinePointId: "ctp-1", description: "No environmental impact" },
      { timelinePointId: "ctp-2", description: "Minor waste increase" },
      { timelinePointId: "ctp-3", description: "Localized contamination" },
      { timelinePointId: "ctp-4", description: "Cleanup required" },
      {
        timelinePointId: "ctp-5",
        description: "Environmental agency notified",
      },
      { timelinePointId: "ctp-6", description: "Significant remediation" },
      { timelinePointId: "ctp-7", description: "Long-term ecological damage" },
    ],
  },
];

export const DEFAULT_SETTINGS: Settings = {
  impactWeights: {
    financial: 25,
    operational: 25,
    reputational: 20,
    legal: 15,
    health: 10,
    environmental: 5,
  },
  theme: "dark",
  impactThreshold: 3,
  customTimelinePoints: DEFAULT_CUSTOM_TIMELINE_POINTS,
  impactCategories: DEFAULT_IMPACT_CATEGORIES,
  // businessResources: DEFAULT_BUSINESS_RESOURCES // Moved to top level
};

export function getTimelinePointsFromCustom(
  customPoints: CustomTimelinePoint[],
): { timeOffset: number; timeLabel: string }[] {
  return customPoints
    .map((cp) => {
      let hours = cp.value;
      if (cp.unit === "days") hours = cp.value * 24;
      if (cp.unit === "weeks") hours = cp.value * 168;
      return { timeOffset: hours, timeLabel: cp.label };
    })
    .sort((a, b) => a.timeOffset - b.timeOffset);
}

// ============================================================================
// BC PEOPLE & ROLES TYPES - ISO 22301
// ============================================================================

export interface BCPerson {
  id: string;
  employee_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  mobile?: string;
  department?: string;
  job_title?: string;
  location?: string;
  manager_id?: string;
  hire_date?: Date;
  employment_status: "active" | "inactive" | "on_leave" | "terminated";
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  profile_photo_url?: string;
  created_at: Date;
  updated_at: Date;
  organization_id: string;
}

export interface BCRole {
  id: string;
  name: string;
  description?: string;
  role_type:
    | "executive"
    | "strategic"
    | "operational"
    | "support"
    | "specialist";
  criticality_level: "critical" | "high" | "medium" | "low";
  min_experience_years: number;
  required_certifications: string[];
  key_responsibilities: string[];
  authority_level?: string;
  reporting_line?: string;
  activation_criteria?: string;
  escalation_authority: boolean;
  budget_authority_limit?: number;
  geographic_scope?: string;
  created_at: Date;
  updated_at: Date;
  organization_id: string;
}

export interface BCTeamStructure {
  id: string;
  name: string;
  description?: string;
  structure_type:
    | "crisis_team"
    | "recovery_team"
    | "emergency_response"
    | "communication_team"
    | "business_unit";
  parent_id?: string;
  level: number;
  display_order: number;
  is_active: boolean;
  activation_triggers?: string[];
  deactivation_criteria?: string;
  meeting_frequency?: string;
  reporting_schedule?: string;
  position_x?: number;
  position_y?: number;
  created_at: Date;
  updated_at: Date;
  organization_id: string;
  children?: BCTeamStructure[];
  assignments?: BCRoleAssignment[];
}

export interface BCRoleAssignment {
  id: string;
  person_id: string;
  role_id: string;
  team_structure_id: string;
  assignment_type: "primary" | "backup" | "alternate" | "deputy";
  start_date: Date;
  end_date?: Date;
  is_active: boolean;
  notification_preferences?: Record<string, any>;
  availability_status: "available" | "on_leave" | "unavailable" | "limited";
  last_training_date?: Date;
  next_training_due?: Date;
  competency_score?: number;
  created_at: Date;
  updated_at: Date;
  person?: BCPerson;
  role?: BCRole;
  team_structure?: BCTeamStructure;
}

export interface TeamStructureUpdateRequest {
  assignments: Record<
    string,
    {
      personId: string;
      personName: string;
      personTitle: string;
      roleType: string;
      teamId: string;
    }
  >;
  teamPositions: Record<
    string,
    {
      x: number;
      y: number;
    }
  >;
}

export interface OrganigramData {
  teams: BCTeamStructure[];
  people: BCPerson[];
  roles: BCRole[];
  assignments: BCRoleAssignment[];
}

export interface BCContactMethod {
  id: string;
  person_id: string;
  contact_type: 'email' | 'phone' | 'mobile' | 'satellite_phone' | 'radio' | 'pager' | 'teams' | 'slack' | 'whatsapp';
  contact_value: string;
  priority_order: number;
  is_primary: boolean;
  is_24_7_available: boolean;
  preferred_for_alerts: boolean;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface BCTrainingRecord {
  id: string;
  person_id: string;
  training_type: string;
  training_title: string;
  provider?: string;
  completion_date: Date;
  expiry_date?: Date;
  certificate_number?: string;
  certificate_url?: string;
  score?: number;
  status: 'completed' | 'in_progress' | 'expired' | 'failed';
  renewal_required: boolean;
  renewal_reminder_days: number;
  created_at: Date;
  updated_at: Date;
  person?: BCPerson;
}

export interface BCCompetency {
  id: string;
  name: string;
  description?: string;
  competency_category: 'technical' | 'leadership' | 'communication' | 'crisis_management' | 'regulatory' | 'business_specific';
  required_for_roles: string[];
  assessment_criteria?: string;
  proficiency_levels?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  organization_id: string;
}

export interface BCPersonCompetency {
  id: string;
  person_id: string;
  competency_id: string;
  proficiency_level: number;
  assessment_date: Date;
  assessor_id?: string;
  assessment_method: 'self_assessment' | 'manager_assessment' | 'peer_review' | 'formal_test' | 'observation';
  evidence?: string;
  next_assessment_date?: Date;
  created_at: Date;
  updated_at: Date;
  person?: BCPerson;
  competency?: BCCompetency;
}

export interface BCSuccessionPlan {
  id: string;
  primary_role_assignment_id: string;
  backup_person_id: string;
  succession_order: number;
  readiness_level: 'ready_now' | 'ready_in_6_months' | 'ready_in_1_year' | 'development_needed';
  development_plan?: string;
  last_updated_date: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  criticality: string; // Extreme, High, Medium, Low, Negligible

  // Base values (Point estimates)
  probability: number; // 0-1
  impact: number; // Numerical value (e.g., loss amount)
  exposure: number; // prob * impact

  // Quantitative parameters for Monte Carlo
  minProbability?: number;
  maxProbability?: number;
  mostLikelyProbability?: number;

  minImpact?: number;
  maxImpact?: number;
  mostLikelyImpact?: number;

  owner?: string;
  mitigationStrategy?: string;
  createdAt?: string;
  updatedAt?: string;
  organizationId?: string;
}

export interface Threat {
  id: string;
  title: string;
  description: string;
  category: string;
  source: string;
  likelihood: number; // 1-5
  impact: number; // 1-5
  riskScore: number; // likelihood * impact
  status: string;
  owner?: string;
  createdAt?: string;
  updatedAt?: string;
  organizationId?: string;
}

export interface StrategicPlanning {
  id: string;
  type: "Risk" | "Opportunity";
  title: string;
  description: string;
  source: string;
  impact: string;
  actionPlan: string;
  priority: "High" | "Medium" | "Low";
  status: "Open" | "In Progress" | "Completed" | "Monitored";
  owner?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RiskTreatment {
  id: string;
  title: string;
  description: string;
  strategy: string;
  actionPlan: string;
  priority: string;
  status: string;
  owner?: string;
  targetDate?: string;
  residualRisk?: string;
  riskId?: string;
  threatId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StrategyAssessment {
  id: string;
  dimension: string;
  currentScore: number;
  targetScore: number;
  assessmentDate: string;
  organizationId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StrategyObjective {
  id: string;
  title: string;
  description: string;
  kpi: string;
  targetValue: number;
  currentValue: number;
  status: string;
  organizationId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StrategyInitiative {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  owner?: string;
  progress: number;
  organizationId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// BC STRATEGY - RECOVERY OPTIONS, COST-BENEFIT ANALYSIS & APPROVALS
// ============================================================================

export type RecoveryTier = 'immediate' | 'rapid' | 'standard' | 'extended';
export type RecoveryStrategyType = 'prevention' | 'response' | 'recovery';

export interface RecoveryOption {
  id: string;
  processId: string;
  title: string;
  description: string;
  strategyType: RecoveryStrategyType;
  tier: RecoveryTier;
  rto: TimeValue;
  rpo: TimeValue;
  recoveryCapacity: number;
  peopleRequired: number;
  technologyType: 'cloud' | 'on-premise' | 'hybrid' | 'manual' | 'external';
  facilityType: 'primary' | 'secondary' | 'remote' | 'external' | 'none';
  implementationCost: number;
  operationalCost: number;
  readinessScore: number;
  lastTestedDate?: string;
  testingStatus: 'pass' | 'fail' | 'pending' | 'not-tested';
  testingNotes?: string;
  dependsOn?: string[];
  activationTriggers?: string[];
  activationProcedure?: string;
  status: 'draft' | 'approved' | 'active' | 'retired';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  organizationId?: string;
}

export interface CostBreakdown {
  personnel: number;
  technology: number;
  infrastructure: number;
  training: number;
  external: number;
  other: number;
  total: number;
}

export interface AvoidedLossBreakdown {
  financial: number;
  operational: number;
  reputational: number;
  legal: number;
  total: number;
}

export interface CostBenefitAnalysis {
  id: string;
  title: string;
  description: string;
  analysisDate: string;
  recoveryOptionIds: string[];
  implementationCosts: CostBreakdown;
  operationalCosts: CostBreakdown;
  maintenanceCosts: CostBreakdown;
  avoidedLosses: AvoidedLossBreakdown;
  riskReduction: number;
  totalCost: number;
  totalBenefit: number;
  netBenefit: number;
  roi: number;
  paybackPeriod: number;
  bcRatio: number;
  bestCase: { roi: number; netBenefit: number };
  worstCase: { roi: number; netBenefit: number };
  intangibleBenefits: string[];
  recommendation: 'approve' | 'reject' | 'revise' | 'defer';
  recommendationNotes: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  organizationId?: string;
}

export interface ApprovalStep {
  id: string;
  stepNumber: number;
  title: string;
  description?: string;
  requiredRole?: string;
  approvers: string[];
  status: 'pending' | 'in-review' | 'approved' | 'rejected' | 'skipped';
  assignedTo?: string;
  comments?: string;
  decision?: 'approve' | 'reject' | 'request-changes';
  decidedBy?: string;
  decidedAt?: string;
}

export interface ApprovalAuditEntry {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  details: string;
}

export interface StrategyApproval {
  id: string;
  strategyType: 'recovery-option' | 'cost-benefit' | 'comprehensive-plan';
  strategyId: string;
  strategyTitle: string;
  status: 'not-started' | 'in-progress' | 'approved' | 'rejected' | 'cancelled';
  currentStep: number;
  submittedBy: string;
  submittedAt: string;
  submissionNotes?: string;
  steps: ApprovalStep[];
  finalDecision?: 'approved' | 'rejected' | 'deferred';
  finalDecisionDate?: string;
  finalDecisionBy?: string;
  finalDecisionNotes?: string;
  approvalConditions?: string[];
  auditLog: ApprovalAuditEntry[];
  createdAt: string;
  updatedAt: string;
  organizationId?: string;
}
