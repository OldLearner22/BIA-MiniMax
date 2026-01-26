// shared/types/incident.types.ts
export enum IncidentCategory {
  TECHNICAL_FAILURE = 'TECHNICAL_FAILURE',
  HUMAN_ERROR = 'HUMAN_ERROR',
  NATURAL_DISASTER = 'NATURAL_DISASTER',
  MALICIOUS_ACTIVITY = 'MALICIOUS_ACTIVITY',
  SUPPLY_CHAIN_DISRUPTION = 'SUPPLY_CHAIN_DISRUPTION',
  UTILITY_OUTAGE = 'UTILITY_OUTAGE',
  HEALTH_EMERGENCY = 'HEALTH_EMERGENCY',
  OTHER = 'OTHER'
}

export enum IncidentSeverity {
  LOW = 'LOW',        // Minor disruption, minimal impact
  MEDIUM = 'MEDIUM',  // Significant disruption, some impact
  HIGH = 'HIGH',      // Major disruption, substantial impact
  CRITICAL = 'CRITICAL' // Catastrophic disruption, severe impact
}

export enum IncidentStatus {
  REPORTED = 'REPORTED',
  ASSESSED = 'ASSESSED',
  RESPONDING = 'RESPONDING',
  ESCALATED = 'ESCLATED',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED'
}

export enum BIAImpactArea {
  FINANCIAL = 'FINANCIAL',
  OPERATIONAL = 'OPERATIONAL',
  REPUTATIONAL = 'REPUTATIONAL',
  LEGAL = 'LEGAL',
  SAFETY = 'SAFETY',
  ENVIRONMENTAL = 'ENVIRONMENTAL'
}

export interface Incident {
  id: string;
  incidentNumber: string;
  title: string;
  description: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  impactAreas: BIAImpactArea[];
  businessImpact: string;
  
  // ISO 22301 Required Fields
  detectionTime: Date;
  reportTime: Date;
  responseStartTime?: Date;
  resolutionTime?: Date;
  closureTime?: Date;
  
  // Affected Assets/Processes
  affectedProcesses: string[];
  affectedLocations: string[];
  affectedSystems: string[];
  
  // Response Information
  initialResponseActions: string;
  escalationDetails?: string;
  rootCause?: string;
  correctiveActions?: string;
  preventiveActions?: string;
  
  // Relationships
  reportedBy: string;
  assignedTo?: string;
  biaReference?: string;
  bcpReference?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  version: number;
  isActive: boolean;
}

export interface IncidentUpdate {
  id: string;
  incidentId: string;
  updateType: 'STATUS_CHANGE' | 'ACTION_TAKEN' | 'INFORMATION_UPDATE' | 'ESCALATION';
  description: string;
  previousStatus?: IncidentStatus;
  newStatus?: IncidentStatus;
  actionsTaken: string[];
  createdBy: string;
  createdAt: Date;
}

export interface IncidentSearchCriteria {
  status?: IncidentStatus[];
  severity?: IncidentSeverity[];
  category?: IncidentCategory[];
  dateFrom?: Date;
  dateTo?: Date;
  reportedBy?: string;
  assignedTo?: string;
  searchText?: string;
  page?: number;
  limit?: number;
}

export interface IncidentStatistics {
  total: number;
  byStatus: Record<IncidentStatus, number>;
  bySeverity: Record<IncidentSeverity, number>;
  byCategory: Record<IncidentCategory, number>;
  mttr: number; // Mean Time to Resolution (hours)
  unresolved: number;
  escalated: number;
}