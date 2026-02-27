import { createBrowserClient } from "@/lib/supabase/client";
import type {
  Trial,
  TrialMaterial,
  TrialParameter,
  TrialCost,
  TrialAttachment,
  TrialSupplier,
  TrialFormData,
  DashboardStats,
} from "@/lib/types";
import { generateTrialNumber, calculateTotal } from "@/lib/utils";
import { generatePigName } from "@/lib/pig-names";

/** Get all trials with optional filtering */
export async function getTrials(filters?: {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<Trial[]> {
  const supabase = createBrowserClient();

  let query = supabase
    .from("trials")
    .select("*, trial_materials(*), trial_parameters(*), trial_costs(*), trial_attachments(*), trial_suppliers(*)");

  if (filters?.search) {
    query = query.or(
      `trial_number.ilike.%${filters.search}%,pig_name.ilike.%${filters.search}%,department.ilike.%${filters.search}%,lead_name.ilike.%${filters.search}%`
    );
  }

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters?.dateFrom) {
    query = query.gte("date", filters.dateFrom);
  }

  if (filters?.dateTo) {
    query = query.lte("date", filters.dateTo);
  }

  const sortBy = filters?.sortBy || "created_at";
  const sortOrder = filters?.sortOrder || "desc";
  query = query.order(sortBy, { ascending: sortOrder === "asc" });

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching trials:", error);
    return [];
  }

  return (data as unknown as Trial[]) || [];
}

/** Get a single trial by ID */
export async function getTrial(id: string): Promise<Trial | null> {
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from("trials")
    .select("*, trial_materials(*), trial_parameters(*), trial_costs(*), trial_attachments(*), trial_suppliers(*), project:projects(*), process_step:process_steps(*)")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching trial:", error);
    return null;
  }

  const trial = data as unknown as Trial;

  // Sort related items by order_index
  if (trial.trial_materials) {
    trial.trial_materials.sort((a, b) => a.order_index - b.order_index);
  }
  if (trial.trial_parameters) {
    trial.trial_parameters.sort((a, b) => a.order_index - b.order_index);
  }
  if (trial.trial_costs) {
    trial.trial_costs.sort((a, b) => a.order_index - b.order_index);
  }
  if (trial.trial_attachments) {
    trial.trial_attachments.sort((a, b) => a.order_index - b.order_index);
  }
  if (trial.trial_suppliers) {
    trial.trial_suppliers.sort((a, b) => a.order_index - b.order_index);
  }

  return trial;
}

/** Generate the next trial number and pig name */
export async function getNextTrialNumber(): Promise<{ trialNumber: string; pigName: string }> {
  const supabase = createBrowserClient();
  const year = new Date().getFullYear();

  const { count, error } = await supabase
    .from("trials")
    .select("*", { count: "exact", head: true })
    .like("trial_number", `TR-${year}-%`);

  if (error) {
    console.error("Error counting trials:", error);
    const trialNumber = generateTrialNumber(0);
    return { trialNumber, pigName: generatePigName(trialNumber) };
  }

  const trialNumber = generateTrialNumber(count || 0);
  return { trialNumber, pigName: generatePigName(trialNumber) };
}

/** Create a new trial */
export async function createTrial(
  formData: TrialFormData
): Promise<{ id: string } | { error: string }> {
  const supabase = createBrowserClient();

  const estimatedTotal = calculateTotal(formData.costs, "estimated_cost");
  const actualTotal = calculateTotal(formData.costs, "actual_cost");

  // Insert trial
  const { data: trialData, error: trialError } = await (supabase
    .from("trials") as any)
    .insert({
      trial_number: formData.trial_number,
      pig_name: formData.pig_name,
      date: formData.date || null,
      department: formData.department || null,
      lead_name: formData.lead_name || null,
      product_process: formData.product_process || null,
      duration: formData.duration || null,
      production_line: formData.production_line || null,
      team_members: formData.team_members || null,
      primary_goal: formData.primary_goal || null,
      success_criteria: formData.success_criteria || null,
      results_vs_objectives: formData.results_vs_objectives || null,
      key_learnings: formData.key_learnings || null,
      recommendations: formData.recommendations || null,
      recommendation_status: formData.recommendation_status || null,
      status: formData.status || "draft",
      estimated_total_cost: estimatedTotal,
      actual_total_cost: actualTotal,
      project_id: (formData as any).project_id || null,
      process_step_id: (formData as any).process_step_id || null,
    })
    .select("id, pig_name")
    .single();

  if (trialError) {
    console.error("Error creating trial:", trialError);
    return { error: trialError.message };
  }

  const trial = trialData as unknown as { id: string; pig_name: string };

  // Insert related data in parallel
  const insertOps = [];

  if (formData.materials.length > 0) {
    insertOps.push(
      (supabase.from("trial_materials") as any).insert(
        formData.materials.map((m, i) => ({
          trial_id: trial.id,
          material_name: m.material_name,
          specification: m.specification,
          supplier_lot: m.supplier_lot,
          order_index: i,
        }))
      )
    );
  }

  if (formData.parameters.length > 0) {
    insertOps.push(
      (supabase.from("trial_parameters") as any).insert(
        formData.parameters.map((p, i) => ({
          trial_id: trial.id,
          parameter_name: p.parameter_name,
          target_value: p.target_value,
          actual_value: p.actual_value,
          order_index: i,
        }))
      )
    );
  }

  if (formData.costs.length > 0) {
    insertOps.push(
      (supabase.from("trial_costs") as any).insert(
        formData.costs.map((c, i) => ({
          trial_id: trial.id,
          category: c.category,
          estimated_cost: c.estimated_cost,
          actual_cost: c.actual_cost,
          notes: c.notes,
          order_index: i,
        }))
      )
    );
  }

  if (formData.attachments.length > 0) {
    insertOps.push(
      (supabase.from("trial_attachments") as any).insert(
        formData.attachments.map((a, i) => ({
          trial_id: trial.id,
          file_name: a.file_name,
          file_type: a.file_type,
          file_size: a.file_size,
          description: a.description,
          storage_path: a.storage_path,
          order_index: i,
        }))
      )
    );
  }

  if (formData.suppliers.length > 0) {
    insertOps.push(
      (supabase.from("trial_suppliers") as any).insert(
        formData.suppliers.map((s, i) => ({
          trial_id: trial.id,
          supplier_name: s.supplier_name,
          contact_name: s.contact_name,
          role: s.role,
          site_location: s.site_location,
          order_index: i,
        }))
      )
    );
  }

  await Promise.all(insertOps);

  return { id: trial.id };
}

/** Update an existing trial */
export async function updateTrial(
  id: string,
  formData: TrialFormData
): Promise<{ id: string } | { error: string }> {
  const supabase = createBrowserClient();

  const estimatedTotal = calculateTotal(formData.costs, "estimated_cost");
  const actualTotal = calculateTotal(formData.costs, "actual_cost");

  // Update trial
  const updatePayload = {
    trial_number: formData.trial_number,
    date: formData.date || null,
    department: formData.department || null,
    lead_name: formData.lead_name || null,
    product_process: formData.product_process || null,
    duration: formData.duration || null,
    production_line: formData.production_line || null,
    team_members: formData.team_members || null,
    primary_goal: formData.primary_goal || null,
    success_criteria: formData.success_criteria || null,
    results_vs_objectives: formData.results_vs_objectives || null,
    key_learnings: formData.key_learnings || null,
    recommendations: formData.recommendations || null,
    recommendation_status: formData.recommendation_status || null,
    status: formData.status || "draft",
    estimated_total_cost: estimatedTotal,
    actual_total_cost: actualTotal,
    project_id: (formData as any).project_id || null,
    process_step_id: (formData as any).process_step_id || null,
  };
  const { error: trialError } = await (supabase
    .from("trials") as any)
    .update(updatePayload)
    .eq("id", id);

  if (trialError) {
    console.error("Error updating trial:", trialError);
    return { error: trialError.message };
  }

  // Delete existing related data and re-insert
  await Promise.all([
    supabase.from("trial_materials").delete().eq("trial_id", id),
    supabase.from("trial_parameters").delete().eq("trial_id", id),
    supabase.from("trial_costs").delete().eq("trial_id", id),
    supabase.from("trial_attachments").delete().eq("trial_id", id),
    supabase.from("trial_suppliers").delete().eq("trial_id", id),
  ]);

  const reinsertOps = [];

  if (formData.materials.length > 0) {
    reinsertOps.push(
      (supabase.from("trial_materials") as any).insert(
        formData.materials.map((m, i) => ({
          trial_id: id,
          material_name: m.material_name,
          specification: m.specification,
          supplier_lot: m.supplier_lot,
          order_index: i,
        }))
      )
    );
  }

  if (formData.parameters.length > 0) {
    reinsertOps.push(
      (supabase.from("trial_parameters") as any).insert(
        formData.parameters.map((p, i) => ({
          trial_id: id,
          parameter_name: p.parameter_name,
          target_value: p.target_value,
          actual_value: p.actual_value,
          order_index: i,
        }))
      )
    );
  }

  if (formData.costs.length > 0) {
    reinsertOps.push(
      (supabase.from("trial_costs") as any).insert(
        formData.costs.map((c, i) => ({
          trial_id: id,
          category: c.category,
          estimated_cost: c.estimated_cost,
          actual_cost: c.actual_cost,
          notes: c.notes,
          order_index: i,
        }))
      )
    );
  }

  if (formData.attachments.length > 0) {
    reinsertOps.push(
      (supabase.from("trial_attachments") as any).insert(
        formData.attachments.map((a, i) => ({
          trial_id: id,
          file_name: a.file_name,
          file_type: a.file_type,
          file_size: a.file_size,
          description: a.description,
          storage_path: a.storage_path,
          order_index: i,
        }))
      )
    );
  }

  if (formData.suppliers.length > 0) {
    reinsertOps.push(
      (supabase.from("trial_suppliers") as any).insert(
        formData.suppliers.map((s, i) => ({
          trial_id: id,
          supplier_name: s.supplier_name,
          contact_name: s.contact_name,
          role: s.role,
          site_location: s.site_location,
          order_index: i,
        }))
      )
    );
  }

  await Promise.all(reinsertOps);

  return { id };
}

/** Delete a trial */
export async function deleteTrial(
  id: string
): Promise<{ success: boolean } | { error: string }> {
  const supabase = createBrowserClient();

  const { error } = await supabase.from("trials").delete().eq("id", id);

  if (error) {
    console.error("Error deleting trial:", error);
    return { error: error.message };
  }

  return { success: true };
}

/** Get dashboard stats */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createBrowserClient();

  const [totalRes, activeRes, completedRes, costsRes] = await Promise.all([
    supabase.from("trials").select("*", { count: "exact", head: true }),
    supabase
      .from("trials")
      .select("*", { count: "exact", head: true })
      .eq("status", "in_progress"),
    supabase
      .from("trials")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed"),
    supabase.from("trials").select("estimated_total_cost, actual_total_cost"),
  ]);

  const costData = costsRes.data as unknown as { estimated_total_cost: number | null; actual_total_cost: number | null }[] | null;
  const totalEstimated =
    costData?.reduce(
      (sum, t) => sum + (Number(t.estimated_total_cost) || 0),
      0
    ) || 0;
  const totalActual =
    costData?.reduce(
      (sum, t) => sum + (Number(t.actual_total_cost) || 0),
      0
    ) || 0;

  return {
    totalTrials: totalRes.count || 0,
    activeTrials: activeRes.count || 0,
    completedTrials: completedRes.count || 0,
    totalEstimatedCost: totalEstimated,
    totalActualCost: totalActual,
  };
}

/** Get recent trials for dashboard */
export async function getRecentTrials(limit: number = 5): Promise<Trial[]> {
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from("trials")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching recent trials:", error);
    return [];
  }

  return (data as unknown as Trial[]) || [];
}
