"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Plus,
  User,
  Building2,
  FlaskConical,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { StepCard } from "@/components/steps/step-card";
import { StepForm } from "@/components/steps/step-form";
import {
  getProject,
  deleteProject,
  deleteStep,
  getNextStepNumber,
} from "@/lib/project-actions";
import {
  formatDate,
  getProjectStatusColor,
  formatProjectStatus,
  getStatusColor,
  formatStatus,
} from "@/lib/utils";
import type { Project, ProcessStep, Trial } from "@/lib/types";

function ProjectViewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = searchParams.get("id");

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // Step form state
  const [stepFormOpen, setStepFormOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<ProcessStep | undefined>();
  const [nextStepNum, setNextStepNum] = useState(1);

  const loadProject = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    const data = await getProject(id);
    setProject(data);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  async function handleDelete() {
    if (!project) return;
    if (
      !confirm(
        `Delete project ${project.project_number}? This will also delete all its process steps and trials.`
      )
    )
      return;

    const result = await deleteProject(project.id);
    if ("error" in result) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({ title: "Project deleted" });
      router.push("/projects");
    }
  }

  async function handleAddStep() {
    if (!project) return;
    const num = await getNextStepNumber(project.id);
    setNextStepNum(num);
    setEditingStep(undefined);
    setStepFormOpen(true);
  }

  async function handleEditStep(step: ProcessStep) {
    setEditingStep(step);
    setNextStepNum(step.step_number);
    setStepFormOpen(true);
  }

  async function handleDeleteStep(stepId: string) {
    if (!confirm("Delete this process step?")) return;
    const result = await deleteStep(stepId);
    if ("error" in result) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({ title: "Step deleted" });
      loadProject();
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Loading project...
        </h1>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/projects">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Project not found
            </h1>
            <p className="text-muted-foreground mt-1">
              The requested project could not be found.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const steps = project.process_steps || [];
  const trials = project.trials || [];

  // Trials not assigned to any step
  const ungroupedTrials = trials.filter((t) => !t.process_step_id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/projects">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {project.project_number}
              </h1>
              <Badge
                className={getProjectStatusColor(project.status)}
                variant="secondary"
              >
                {formatProjectStatus(project.status)}
              </Badge>
            </div>
            {project.pig_name && (
              <p className="text-base font-medium mt-1">
                🐷 {project.pig_name}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-0.5">
              {project.product_name}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/trials/new?project_id=${project.id}`}>
            <Button>
              <FlaskConical className="h-4 w-4 mr-2" />
              Create Trial
            </Button>
          </Link>
          <Link href={`/projects/edit?id=${project.id}`}>
            <Button variant="outline">
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Project info card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {project.project_lead && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Project Lead</p>
                  <p className="font-medium">{project.project_lead}</p>
                </div>
              </div>
            )}
            {project.department && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{project.department}</p>
                </div>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Steps Progress</p>
              <p className="font-medium">
                {project.completed_step_count}/{project.step_count} completed
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Trials</p>
              <p className="font-medium">{project.trial_count || 0} total</p>
            </div>
          </div>

          {/* Dates row */}
          {(project.start_date || project.target_completion_date) && (
            <div className="flex items-center gap-2 mt-4 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {project.start_date ? `Start: ${formatDate(project.start_date)}` : ""}
                {project.start_date && project.target_completion_date ? " | " : ""}
                {project.target_completion_date ? `Target: ${formatDate(project.target_completion_date)}` : ""}
                {project.actual_completion_date ? ` | Completed: ${formatDate(project.actual_completion_date)}` : ""}
              </span>
            </div>
          )}

          {project.project_description && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="whitespace-pre-wrap mt-1">
                {project.project_description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Process Steps */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Process Steps</h2>
          <Button onClick={handleAddStep}>
            <Plus className="h-4 w-4 mr-2" />
            Add Step
          </Button>
        </div>

        {steps.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                No process steps yet. Click &ldquo;Add Step&rdquo; to define
                the first step in this project.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {steps.map((step) => (
              <StepCard
                key={step.id}
                step={step}
                onEdit={() => handleEditStep(step)}
                onDelete={() => handleDeleteStep(step.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Ungrouped Trials (not assigned to a step) */}
      {ungroupedTrials.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Project Trials (No Step)</h2>
          <Card>
            <CardContent className="divide-y">
              {ungroupedTrials.map((trial) => (
                <Link
                  key={trial.id}
                  href={`/trials/view?id=${trial.id}`}
                  className="flex items-center justify-between py-3 hover:bg-muted/50 transition-colors -mx-6 px-6 first:pt-6 last:pb-6"
                >
                  <div className="flex items-center gap-2">
                    <FlaskConical className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{trial.trial_number}</span>
                    {trial.pig_name && (
                      <span className="text-sm text-muted-foreground">
                        🐷 {trial.pig_name}
                      </span>
                    )}
                    <Badge className={getStatusColor(trial.status)} variant="secondary">
                      {formatStatus(trial.status)}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(trial.date)}
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Metadata */}
      <p className="text-xs text-muted-foreground">
        Created: {formatDate(project.created_at)} | Last updated:{" "}
        {formatDate(project.updated_at)}
      </p>

      {/* Step form dialog */}
      {project && (
        <StepForm
          projectId={project.id}
          step={editingStep}
          open={stepFormOpen}
          onOpenChange={setStepFormOpen}
          onSaved={loadProject}
          nextStepNumber={nextStepNum}
        />
      )}
    </div>
  );
}

export default function ProjectViewPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">Loading...</h1>
        </div>
      }
    >
      <ProjectViewContent />
    </Suspense>
  );
}
