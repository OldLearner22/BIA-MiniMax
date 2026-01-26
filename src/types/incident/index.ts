// Incident Management Types
// Based on ISO 22301 requirements

// ============================================================================
// ENUMS
// ============================================================================

export enum IncidentCategory {
  TECHNICAL_FAILURE = "TECHNICAL_FAILURE",
  HUMAN_ERROR = "HUMAN_ERROR",
  NATURAL_DISASTER = "NATURAL_DISASTER",
  MALICIOUS_ACTIVITY = "MALICIOUS_ACTIVITY",
  SUPPLY_CHAIN_DISRUPTION = "SUPPLY_CHAIN_DISRUPTION",
  UTILITY_OUTAGE = "UTILITY_OUTAGE",
  HEALTH_EMERGENCY = "HEALTH_EMERGENCY",
  OTHER = "OTHER",
}

export enum IncidentSeverity {
  LOW = "LOW", // Minor disruption, minimal impact
  MEDIUM = "MEDIUM", // Significant disruption, some impact
  HIGH = "HIGH", // Major disruption, substantial impact
  CRITICAL = "CRITICAL", // Catastrophic disruption, severe impact
}

export enum IncidentStatus {
  REPORTED = "REPORTED",
  ASSESSED = "ASSESSED",
  RESPONDING = "RESPONDING",
  ESCALATED = "ESCALATED",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
  CANCELLED = "CANCELLED",
}

export enum ImpactArea {
  FINANCIAL = "FINANCIAL",
  OPERATIONAL = "OPERATIONAL",
  REPUTATIONAL = "REPUTATIONAL",
  LEGAL = "LEGAL",
  SAFETY = "SAFETY",
  ENVIRONMENTAL = "ENVIRONMENTAL",
}

export enum IncidentUpdateType {
  STATUS_CHANGE = "STATUS_CHANGE",
  ACTION_TAKEN = "ACTION_TAKEN",
  INFORMATION_UPDATE = "INFORMATION_UPDATE",
  ESCALATION = "ESCALATION",
}

export enum RecoveryTaskStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  BLOCKED = "BLOCKED",
  CANCELLED = "CANCELLED",
}

export enum TaskPriority {
  CRITICAL = "CRITICAL",
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}

// ============================================================================
// INTERFACES
// ============================================================================

export interface Incident {
  id: string;
  incidentNumber: string;
  title: string;
  description: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;

  // Impact Assessment
  impactAreas: ImpactArea[];
  businessImpact: string;
  estimatedFinancialImpact?: number;

  // Affected Items
  affectedProcessIds: string[];
  affectedLocations: string[];
  affectedSystems: string[];

  // Timeline (ISO 22301 Required)
  detectionTime: Date;
  reportTime: Date;
  responseStartTime?: Date;
  resolutionTime?: Date;
  closureTime?: Date;

  // Response Information
  initialResponseActions: string;
  escalationDetails?: string;
  rootCause?: string;
  correctiveActions?: string;
  preventiveActions?: string;

  // Relationships
  reportedBy: string;
  assignedTo?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;

  // Relations
  updates?: IncidentUpdate[];
  decisions?: IncidentDecision[];
  communications?: IncidentCommunication[];
  recoveryTasks?: RecoveryTask[];
  _count?: {
    updates: number;
    decisions: number;
    communications: number;
    recoveryTasks: number;
  };
}

export interface IncidentUpdate {
  id: string;
  incidentId: string;
  updateType: IncidentUpdateType;
  title: string;
  description: string;
  previousStatus?: IncidentStatus;
  newStatus?: IncidentStatus;
  actionsTaken: string[];
  createdBy: string;
  createdAt: Date;
}

export interface IncidentDecision {
  id: string;
  incidentId: string;
  decisionNumber: string;
  title: string;
  description: string;
  decisionMaker: string;
  decisionRationale: string;
  optionsConsidered: string[];
  implementationPlan?: string;
  decisionTimestamp: Date;
  createdAt: Date;
}

export interface IncidentCommunication {
  id: string;
  incidentId: string;
  communicationType: string;
  subject: string;
  message: string;
  recipients: string[];
  sentBy: string;
  sentAt: Date;
}

export interface RecoveryTask {
  id: string;
  incidentId: string;
  taskNumber: string;
  title: string;
  description: string;
  status: RecoveryTaskStatus;
  priority: TaskPriority;
  assignedTo?: string;
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IncidentStatistics {
  total: number;
  byStatus: Record<string, number>;
  bySeverity: Record<string, number>;
  byCategory: Record<string, number>;
  mttr: number; // Mean Time to Resolution (hours)
  unresolved: number;
  escalated: number;
  activeIncidents: number;
  resolvedLast30Days: number;
}

export interface IncidentSearchCriteria {
  status?: string[];
  severity?: string[];
  category?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  reportedBy?: string;
  assignedTo?: string;
  searchText?: string;
  page?: number;
  limit?: number;
}

export interface CreateIncidentDTO {
  title: string;
  description: string;
  category: string;
  severity: string;
  impactAreas: string[];
  businessImpact: string;
  affectedProcessIds?: string[];
  affectedLocations?: string[];
  affectedSystems?: string[];
  initialResponseActions: string;
  estimatedFinancialImpact?: number;
  reportedBy: string;
  detectionTime?: Date;
}

export interface UpdateIncidentDTO {
  title?: string;
  description?: string;
  status?: string;
  severity?: string;
  assignedTo?: string;
  escalationDetails?: string;
  rootCause?: string;
  correctiveActions?: string;
  preventiveActions?: string;
}

export interface CreateIncidentUpdateDTO {
  updateType: string;
  title: string;
  description: string;
  previousStatus?: string;
  newStatus?: string;
  actionsTaken?: string[];
  createdBy: string;
}

export interface PaginatedIncidentResponse {
  incidents: Incident[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
