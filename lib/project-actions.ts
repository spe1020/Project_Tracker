import { createBrowserClient } from "@/lib/supabase/client";
import type {
  Project,
  ProcessStep,
  ProjectFormData,
  StepFormData,
  ProjectDashboardStats,
  Trial,
} from "@/lib/types";
import { generateProjectNumber } from "@/lib/utils";

// ─── Projects ────────────────────────────────────────────

/** Get all projects with optional filtering */
export async function getProjects(filters?: {
  search?: string;
  status?: string;
}): Promise<Project[]> {
  const supabase = createBrowserClient();

  let query = supabase
    .from("projects")
    .select("*, process_steps(id, status)");

  if (filters?.search) {
    query = query.or(
      `project_number.ilike.%${filters.search}%,product_name.ilike.%${filters.search}%,project_lead.ilike.%${filters.search}%,department.ilike.%${filters.search}%`
    );
  }

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching projects:", error);
    return [];
  }

  return ((data as unknown as any[]) || []).map((p) => {
    const steps = p.process_steps || [];
    return {
      ...p,
      step_count: steps.length,
      completed_step_count: steps.filter(
        (s: any) => s.status === "completed"
      ).length,
      process_steps: undefined,
    } as Project;
  });
}

/** Get a single project by ID, with steps and linked trials */
export async function getProject(id: string): Promise<Project | null> {
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching project:", error);
    return null;
  }

  const project = data as unknown as Project;

  // Fetch steps sorted by step_number
  const { data: stepsData } = await supabase
    .from("process_steps")
    .select("*")
    .eq("project_id", id)
    .order("step_number", { ascending: true });

  const steps = (stepsData as unknown as ProcessStep[]) || [];

  // Fetch trials linked to this project
  const { data: trialsData } = await supabase
    .from("trials")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const trials = (trialsData as unknown as Trial[]) || [];

  // Attach linked trial to each step
  for (const step of steps) {
    step.linked_trial =
      trials.find((t) => t.process_step_id === step.id) || null;
  }

  project.process_steps = steps;
  project.step_count = steps.length;
  project.completed_step_count = steps.filter(
    (s) => s.status === "completed"
  ).length;

  return project;
}

/** Generate the next project number */
export async function getNextProjectNumber(): Promise<string> {
  const supabase = createBrowserClient();
  const year = new Date().getFullYear();

  const { count, error } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .like("project_number", `PROJ-${year}-%`);

  if (error) {
    console.error("Error counting projects:", error);
    return generateProjectNumber(0);
  }

  return generateProjectNumber(count || 0);
}

/** Create a new project */
export async function createProject(
  formData: ProjectFormData
): Promise<{ id: string } | { error: string }> {
  const supabase = createBrowserClient();

  const { data, error } = await (supabase.from("projects") as any)
    .insert({
      project_number: formData.project_number,
      product_name: formData.product_name,
      project_description: formData.project_description || null,
      project_lead: formData.project_lead || null,
      department: formData.department || null,
      status: formData.status || "active",
    })
    .select("id")
    .single();

  if (error) {
    console.error("Error creating project:", error);
    return { error: error.message };
  }

  return { id: (data as any).id };
}

/** Update an existing project */
export async function updateProject(
  id: string,
  formData: ProjectFormData
): Promise<{ id: string } | { error: string }> {
  const supabase = createBrowserClient();

  const { error } = await (supabase.from("projects") as any)
    .update({
      product_name: formData.product_name,
      project_description: formData.project_description || null,
      project_lead: formData.project_lead || null,
      department: formData.department || null,
      status: formData.status || "active",
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating project:", error);
    return { error: error.message };
  }

  return { id };
}

/** Delete a project */
export async function deleteProject(
  id: string
): Promise<{ success: boolean } | { error: string }> {
  const supabase = createBrowserClient();

  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    console.error("Error deleting project:", error);
    return { error: error.message };
  }

  return { success: true };
}

// ─── Process Steps ───────────────────────────────────────

/** Get the next step number for a project */
export async function getNextStepNumber(projectId: string): Promise<number> {
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from("process_steps")
    .select("step_number")
    .eq("project_id", projectId)
    .order("step_number", { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    return 1;
  }

  return ((data[0] as any).step_number || 0) + 1;
}

/** Create a new process step */
export async function createStep(
  formData: StepFormData
): Promise<{ id: string } | { error: string }> {
  const supabase = createBrowserClient();

  const { data, error } = await (supabase.from("process_steps") as any)
    .insert({
      project_id: formData.project_id,
      step_number: formData.step_number,
      step_name: formData.step_name,
      step_type: formData.step_type || "material",
      facility_name: formData.facility_name || null,
      facility_location: formData.facility_location || null,
      scheduled_start_date: formData.scheduled_start_date || null,
      scheduled_end_date: formData.scheduled_end_date || null,
      actual_start_date: formData.actual_start_date || null,
      actual_end_date: formData.actual_end_date || null,
      delay_reason: formData.delay_reason || null,
      material_input: formData.material_input || null,
      material_output: formData.material_output || null,
      service_provider: formData.service_provider || null,
      service_description: formData.service_description || null,
      estimated_cost: formData.estimated_cost,
      actual_cost: formData.actual_cost,
      lessons_learned: formData.lessons_learned || null,
      notes: formData.notes || null,
      status: formData.status || "not_started",
    })
    .select("id")
    .single();

  if (error) {
    console.error("Error creating step:", error);
    return { error: error.message };
  }

  return { id: (data as any).id };
}

/** Update an existing process step */
export async function updateStep(
  id: string,
  formData: StepFormData
): Promise<{ id: string } | { error: string }> {
  const supabase = createBrowserClient();

  const { error } = await (supabase.from("process_steps") as any)
    .update({
      step_name: formData.step_name,
      step_type: formData.step_type || "material",
      facility_name: formData.facility_name || null,
      facility_location: formData.facility_location || null,
      scheduled_start_date: formData.scheduled_start_date || null,
      scheduled_end_date: formData.scheduled_end_date || null,
      actual_start_date: formData.actual_start_date || null,
      actual_end_date: formData.actual_end_date || null,
      delay_reason: formData.delay_reason || null,
      material_input: formData.material_input || null,
      material_output: formData.material_output || null,
      service_provider: formData.service_provider || null,
      service_description: formData.service_description || null,
      estimated_cost: formData.estimated_cost,
      actual_cost: formData.actual_cost,
      lessons_learned: formData.lessons_learned || null,
      notes: formData.notes || null,
      status: formData.status || "not_started",
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating step:", error);
    return { error: error.message };
  }

  return { id };
}

/** Delete a process step */
export async function deleteStep(
  id: string
): Promise<{ success: boolean } | { error: string }> {
  const supabase = createBrowserClient();

  const { error } = await supabase
    .from("process_steps")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting step:", error);
    return { error: error.message };
  }

  return { success: true };
}

/** Link a trial to a project/step */
export async function linkTrialToStep(
  trialId: string,
  projectId: string,
  stepId: string | null
): Promise<{ success: boolean } | { error: string }> {
  const supabase = createBrowserClient();

  const { error } = await (supabase.from("trials") as any)
    .update({
      project_id: projectId,
      process_step_id: stepId,
    })
    .eq("id", trialId);

  if (error) {
    console.error("Error linking trial:", error);
    return { error: error.message };
  }

  return { success: true };
}

// ─── Dashboard helpers ───────────────────────────────────

/** Get project dashboard stats */
export async function getProjectDashboardStats(): Promise<ProjectDashboardStats> {
  const supabase = createBrowserClient();

  const [totalRes, activeRes, completedRes, onHoldRes] = await Promise.all([
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed"),
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("status", "on_hold"),
  ]);

  return {
    totalProjects: totalRes.count || 0,
    activeProjects: activeRes.count || 0,
    completedProjects: completedRes.count || 0,
    onHoldProjects: onHoldRes.count || 0,
  };
}

/** Get recent projects for dashboard */
export async function getRecentProjects(
  limit: number = 5
): Promise<Project[]> {
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from("projects")
    .select("*, process_steps(id, status)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching recent projects:", error);
    return [];
  }

  return ((data as unknown as any[]) || []).map((p) => {
    const steps = p.process_steps || [];
    return {
      ...p,
      step_count: steps.length,
      completed_step_count: steps.filter(
        (s: any) => s.status === "completed"
      ).length,
      process_steps: undefined,
    } as Project;
  });
}

/** Get unlinked trials (trials not assigned to any project) */
export async function getUnlinkedTrials(): Promise<Trial[]> {
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from("trials")
    .select("*")
    .is("project_id", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching unlinked trials:", error);
    return [];
  }

  return (data as unknown as Trial[]) || [];
}
