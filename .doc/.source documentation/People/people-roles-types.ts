// types/people-roles.ts
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
  employment_status: 'active' | 'inactive' | 'on_leave' | 'terminated';
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
  role_type: 'executive' | 'strategic' | 'operational' | 'support' | 'specialist';
  criticality_level: 'critical' | 'high' | 'medium' | 'low';
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
  structure_type: 'crisis_team' | 'recovery_team' | 'emergency_response' | 'communication_team' | 'business_unit';
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
  assignment_type: 'primary' | 'backup' | 'alternate' | 'deputy';
  start_date: Date;
  end_date?: Date;
  is_active: boolean;
  notification_preferences?: Record<string, any>;
  availability_status: 'available' | 'on_leave' | 'unavailable' | 'limited';
  last_training_date?: Date;
  next_training_due?: Date;
  competency_score?: number;
  created_at: Date;
  updated_at: Date;
  person?: BCPerson;
  role?: BCRole;
  team_structure?: BCTeamStructure;
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
}

export interface BCCompetency {
  id: string;
  name: string;
  description?: string;
  competency_category: 'technical' | 'leadership' | 'communication' | 'crisis_management' | 'regulatory' | 'business_specific';
  required_for_roles: string[];
  assessment_criteria?: string;
  proficiency_levels: Record<string, number>;
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
  competency?: BCCompetency;
  assessor?: BCPerson;
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

export interface BCCommunicationCascade {
  id: string;
  name: string;
  description?: string;
  trigger_conditions: string[];
  cascade_type: 'emergency' | 'business_disruption' | 'recovery' | 'all_clear' | 'test';
  team_structure_id?: string;
  escalation_timeout_minutes: number;
  max_escalation_levels: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  organization_id: string;
  steps?: BCCascadeStep[];
}

export interface BCCascadeStep {
  id: string;
  cascade_id: string;
  step_order: number;
  person_id?: string;
  role_id?: string;
  message_template?: string;
  delivery_methods: string[];
  timeout_minutes: number;
  escalation_on_no_response: boolean;
  created_at: Date;
}

// API Request/Response types
export interface TeamStructureUpdateRequest {
  assignments: Record<string, {
    personId: string;
    personName: string;
    personTitle: string;
    roleType: string;
    teamId: string;
  }>;
  teamPositions: Record<string, {
    x: number;
    y: number;
  }>;
}

export interface OrganigramData {
  teams: BCTeamStructure[];
  people: BCPerson[];
  roles: BCRole[];
  assignments: BCRoleAssignment[];
}

export interface PeopleSearchParams {
  search?: string;
  department?: string;
  employment_status?: string;
  page?: number;
  limit?: number;
  sort_by?: 'name' | 'department' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export interface CompetencyAssessmentRequest {
  person_id: string;
  competency_id: string;
  proficiency_level: number;
  assessment_method: string;
  evidence?: string;
}

export interface SuccessionPlanRequest {
  primary_role_assignment_id: string;
  backup_assignments: {
    person_id: string;
    succession_order: number;
    readiness_level: string;
    development_plan?: string;
  }[];
}

export interface ContactDirectoryEntry {
  person: BCPerson;
  primary_role?: BCRoleAssignment;
  contact_methods: BCContactMethod[];
  availability_status: string;
  last_contact_date?: Date;
}

export interface TrainingMatrixEntry {
  person: BCPerson;
  role_assignments: BCRoleAssignment[];
  training_records: BCTrainingRecord[];
  competency_assessments: BCPersonCompetency[];
  training_compliance_score: number;
  overdue_training: BCTrainingRecord[];
}
