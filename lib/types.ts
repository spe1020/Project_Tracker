export interface Trial {
  id: string;
  trial_number: string;
  pig_name: string | null;
  date: string | null;
  department: string | null;
  lead_name: string | null;
  product_process: string | null;
  duration: string | null;
  production_line: string | null;
  team_members: string | null;
  primary_goal: string | null;
  success_criteria: string | null;
  results_vs_objectives: string | null;
  key_learnings: string | null;
  recommendations: string | null;
  recommendation_status: "proceed" | "additional_trials" | "discontinue" | null;
  status: "draft" | "in_progress" | "completed";
  estimated_total_cost: number | null;
  actual_total_cost: number | null;
  project_id: string | null;
  process_step_id: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  trial_materials?: TrialMaterial[];
  trial_parameters?: TrialParameter[];
  trial_costs?: TrialCost[];
  trial_attachments?: TrialAttachment[];
  trial_suppliers?: TrialSupplier[];
  // Joined project/step (from getTrial)
  project?: Project | null;
  process_step?: ProcessStep | null;
}

export interface TrialMaterial {
  id?: string;
  trial_id?: string;
  material_name: string;
  specification: string;
  supplier_lot: string;
  order_index: number;
  created_at?: string;
}

export interface TrialParameter {
  id?: string;
  trial_id?: string;
  parameter_name: string;
  target_value: string;
  actual_value: string;
  order_index: number;
  created_at?: string;
}

export interface TrialCost {
  id?: string;
  trial_id?: string;
  category: "materials" | "labor" | "downtime";
  estimated_cost: number | null;
  actual_cost: number | null;
  notes: string;
  order_index: number;
  created_at?: string;
}

export interface TrialAttachment {
  id?: string;
  trial_id?: string;
  file_name: string;
  file_type: string;
  file_size: number | null;
  description: string;
  storage_path: string | null;
  order_index: number;
  created_at?: string;
}

export interface TrialSupplier {
  id?: string;
  trial_id?: string;
  supplier_name: string;
  contact_name: string;
  role: string;
  site_location: string;
  order_index: number;
  created_at?: string;
}

export interface TrialFormData {
  trial_number: string;
  pig_name: string;
  date: string;
  department: string;
  lead_name: string;
  product_process: string;
  duration: string;
  production_line: string;
  team_members: string;
  primary_goal: string;
  success_criteria: string;
  results_vs_objectives: string;
  key_learnings: string;
  recommendations: string;
  recommendation_status: string;
  status: string;
  materials: TrialMaterial[];
  parameters: TrialParameter[];
  costs: TrialCost[];
  attachments: TrialAttachment[];
  suppliers: TrialSupplier[];
}

export interface DashboardStats {
  totalTrials: number;
  activeTrials: number;
  completedTrials: number;
  totalEstimatedCost: number;
  totalActualCost: number;
}

// --- Projects & Process Steps ---

export interface Project {
  id: string;
  project_number: string;
  product_name: string;
  project_description: string | null;
  project_lead: string | null;
  department: string | null;
  status: "active" | "completed" | "on_hold" | "cancelled";
  created_at: string;
  updated_at: string;
  // Relations
  process_steps?: ProcessStep[];
  // Computed (from joins)
  step_count?: number;
  completed_step_count?: number;
}

export interface ProcessStep {
  id: string;
  project_id: string;
  step_number: number;
  step_name: string;
  step_type: "material" | "service";
  facility_name: string | null;
  facility_location: string | null;
  scheduled_start_date: string | null;
  scheduled_end_date: string | null;
  actual_start_date: string | null;
  actual_end_date: string | null;
  delay_reason: string | null;
  material_input: string | null;
  material_output: string | null;
  service_provider: string | null;
  service_description: string | null;
  estimated_cost: number | null;
  actual_cost: number | null;
  lessons_learned: string | null;
  notes: string | null;
  status: "not_started" | "in_progress" | "completed" | "delayed" | "blocked";
  created_at: string;
  updated_at: string;
  // Joined
  linked_trial?: Trial | null;
}

export interface ProjectFormData {
  project_number: string;
  product_name: string;
  project_description: string;
  project_lead: string;
  department: string;
  status: string;
}

export interface StepFormData {
  project_id: string;
  step_number: number;
  step_name: string;
  step_type: string;
  facility_name: string;
  facility_location: string;
  scheduled_start_date: string;
  scheduled_end_date: string;
  actual_start_date: string;
  actual_end_date: string;
  delay_reason: string;
  material_input: string;
  material_output: string;
  service_provider: string;
  service_description: string;
  estimated_cost: number | null;
  actual_cost: number | null;
  lessons_learned: string;
  notes: string;
  status: string;
}

export interface ProjectDashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
}
