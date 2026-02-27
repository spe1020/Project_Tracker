import { z } from "zod";

export const materialSchema = z.object({
  material_name: z.string(),
  specification: z.string(),
  supplier_lot: z.string(),
  order_index: z.number(),
});

export const parameterSchema = z.object({
  parameter_name: z.string(),
  target_value: z.string(),
  actual_value: z.string(),
  order_index: z.number(),
});

export const costSchema = z.object({
  category: z.enum(["materials", "labor", "downtime"]),
  estimated_cost: z.coerce.number().nullable(),
  actual_cost: z.coerce.number().nullable(),
  notes: z.string(),
  order_index: z.number(),
});

export const attachmentSchema = z.object({
  file_name: z.string().min(1, "File name is required"),
  file_type: z.string(),
  file_size: z.number().nullable(),
  description: z.string(),
  storage_path: z.string().nullable(),
  order_index: z.number(),
});

export const supplierSchema = z.object({
  supplier_name: z.string(),
  contact_name: z.string(),
  role: z.string(),
  site_location: z.string(),
  order_index: z.number(),
});

export const trialFormSchema = z.object({
  trial_number: z.string().min(1, "Trial number is required"),
  pig_name: z.string().min(1, "Project name is required"),
  date: z.string(),
  department: z.string(),
  lead_name: z.string(),
  product_process: z.string(),
  duration: z.string(),
  production_line: z.string(),
  team_members: z.string(),
  primary_goal: z.string(),
  success_criteria: z.string(),
  results_vs_objectives: z.string(),
  key_learnings: z.string(),
  recommendations: z.string(),
  recommendation_status: z.string(),
  status: z.string(),
  project_id: z.string().min(1, "Project is required"),
  process_step_id: z.string(),
  materials: z.array(materialSchema),
  parameters: z.array(parameterSchema),
  costs: z.array(costSchema),
  attachments: z.array(attachmentSchema),
  suppliers: z.array(supplierSchema),
});

export type TrialFormValues = z.infer<typeof trialFormSchema>;

// --- Project & Step schemas ---

export const projectFormSchema = z.object({
  project_number: z.string().min(1, "Project number is required"),
  pig_name: z.string().min(1, "Project name is required"),
  product_name: z.string().min(1, "Product name is required"),
  project_description: z.string(),
  project_lead: z.string(),
  department: z.string(),
  status: z.string(),
  start_date: z.string(),
  target_completion_date: z.string(),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

export const stepFormSchema = z.object({
  project_id: z.string().min(1),
  step_number: z.coerce.number().min(1),
  step_name: z.string().min(1, "Step name is required"),
  step_type: z.enum(["material", "service"]),
  facility_name: z.string(),
  facility_location: z.string(),
  facility_type: z.string(),
  step_owner: z.string(),
  scheduled_start_date: z.string(),
  scheduled_end_date: z.string(),
  actual_start_date: z.string(),
  actual_end_date: z.string(),
  delay_reason: z.string(),
  material_input: z.string(),
  material_output: z.string(),
  input_specification: z.string(),
  output_specification: z.string(),
  quantity: z.coerce.number().nullable(),
  quantity_units: z.string(),
  deliverable: z.string(),
  service_provider: z.string(),
  service_description: z.string(),
  estimated_cost: z.coerce.number().nullable(),
  actual_cost: z.coerce.number().nullable(),
  lessons_learned: z.string(),
  notes: z.string(),
  status: z.string(),
});

export type StepFormValues = z.infer<typeof stepFormSchema>;
