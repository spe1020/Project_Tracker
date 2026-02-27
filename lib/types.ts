export interface Trial {
  id: string;
  trial_number: string;
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
  created_at: string;
  updated_at: string;
  // Relations
  trial_materials?: TrialMaterial[];
  trial_parameters?: TrialParameter[];
  trial_costs?: TrialCost[];
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

export interface TrialFormData {
  trial_number: string;
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
}

export interface DashboardStats {
  totalTrials: number;
  activeTrials: number;
  completedTrials: number;
  totalEstimatedCost: number;
  totalActualCost: number;
}
