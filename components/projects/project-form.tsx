"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Save, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { useToast } from "@/components/ui/use-toast";
import {
  projectFormSchema,
  type ProjectFormValues,
} from "@/lib/validations";
import { createProject, updateProject } from "@/lib/project-actions";
import type { Project } from "@/lib/types";

interface ProjectFormProps {
  project?: Project;
  projectNumber: string;
}

export function ProjectForm({ project, projectNumber }: ProjectFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const isEditing = !!project;

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      project_number: project?.project_number || projectNumber,
      product_name: project?.product_name || "",
      project_description: project?.project_description || "",
      project_lead: project?.project_lead || "",
      department: project?.department || "",
      status: project?.status || "planning",
      start_date: project?.start_date || "",
      target_completion_date: project?.target_completion_date || "",
    },
  });

  async function onSubmit(data: ProjectFormValues) {
    setSaving(true);
    try {
      const result = isEditing
        ? await updateProject(project!.id, data)
        : await createProject(data);

      if ("error" in result) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: isEditing ? "Project updated" : "Project created",
          description: `Project ${data.project_number} saved successfully.`,
        });
        router.push(`/projects/view?id=${result.id}`);
      }
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-8 pb-24"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Project Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project_number">Project Number</Label>
              <Input
                id="project_number"
                {...form.register("project_number")}
                readOnly
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product_name">
                Product Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="product_name"
                {...form.register("product_name")}
                placeholder="e.g., Widget X-100"
              />
              {form.formState.errors.product_name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.product_name.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project_description">Description</Label>
            <Textarea
              id="project_description"
              {...form.register("project_description")}
              placeholder="Describe the project objectives and scope"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project_lead">Project Lead</Label>
              <Input
                id="project_lead"
                {...form.register("project_lead")}
                placeholder="Lead name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                {...form.register("department")}
                placeholder="e.g., Production, R&D"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(value) => form.setValue("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                {...form.register("start_date")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_completion_date">Target Completion</Label>
              <Input
                id="target_completion_date"
                type="date"
                {...form.register("target_completion_date")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sticky Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-white py-3 px-4 sm:px-6 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={saving}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isEditing ? "Update Project" : "Create Project"}
          </Button>
        </div>
      </div>
    </form>
  );
}
