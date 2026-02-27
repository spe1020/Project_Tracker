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
  LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { StepCard } from "@/components/steps/step-card";
import { StepForm } from "@/components/steps/step-form";
import {
  getProject,
  deleteProject,
  deleteStep,
  getNextStepNumber,
  linkTrialToStep,
  getUnlinkedTrials,
} from "@/lib/project-actions";
import {
  formatDate,
  getProjectStatusColor,
  formatProjectStatus,
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

  // Link trial dialog state
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkStepId, setLinkStepId] = useState<string | null>(null);
  const [unlinkedTrials, setUnlinkedTrials] = useState<Trial[]>([]);
  const [selectedTrialId, setSelectedTrialId] = useState<string>("");

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
        `Delete project ${project.project_number}? This will also delete all its process steps.`
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

  async function handleOpenLinkDialog(stepId: string | null) {
    setLinkStepId(stepId);
    setSelectedTrialId("");
    const trials = await getUnlinkedTrials();
    setUnlinkedTrials(trials);
    setLinkDialogOpen(true);
  }

  async function handleLinkTrial() {
    if (!project || !selectedTrialId) return;
    const result = await linkTrialToStep(
      selectedTrialId,
      project.id,
      linkStepId
    );
    if ("error" in result) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({ title: "Trial linked" });
      setLinkDialogOpen(false);
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

  // Collect trials linked to this project (from steps' linked_trial)
  const linkedTrials = steps
    .map((s) => s.linked_trial)
    .filter((t): t is Trial => !!t);

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
            <p className="text-base font-medium mt-1">
              {project.product_name}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
          </div>
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

      {/* Linked Trials */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Linked Trials</h2>
          <Button
            variant="outline"
            onClick={() => handleOpenLinkDialog(null)}
          >
            <LinkIcon className="h-4 w-4 mr-2" />
            Link Trial
          </Button>
        </div>

        {linkedTrials.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                No trials linked to this project yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="divide-y">
              {linkedTrials.map((trial) => (
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
                        {trial.pig_name}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(trial.date)}
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

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

      {/* Link trial dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link a Trial</DialogTitle>
            <DialogDescription>
              Select an unlinked trial to associate with this project.
            </DialogDescription>
          </DialogHeader>
          {unlinkedTrials.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No unlinked trials available.
            </p>
          ) : (
            <div className="space-y-4">
              <Select
                value={selectedTrialId}
                onValueChange={setSelectedTrialId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a trial" />
                </SelectTrigger>
                <SelectContent>
                  {unlinkedTrials.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.trial_number}
                      {t.pig_name ? ` — ${t.pig_name}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setLinkDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleLinkTrial}
                  disabled={!selectedTrialId}
                >
                  Link Trial
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
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
