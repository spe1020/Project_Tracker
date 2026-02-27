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

export const trialFormSchema = z.object({
  trial_number: z.string().min(1, "Trial number is required"),
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
  materials: z.array(materialSchema),
  parameters: z.array(parameterSchema),
  costs: z.array(costSchema),
});

export type TrialFormValues = z.infer<typeof trialFormSchema>;
