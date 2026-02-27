"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { stepFormSchema, type StepFormValues } from "@/lib/validations";
import { createStep, updateStep } from "@/lib/project-actions";
import type { ProcessStep } from "@/lib/types";

interface StepFormProps {
  projectId: string;
  step?: ProcessStep;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  nextStepNumber: number;
}

export function StepForm({
  projectId,
  step,
  open,
  onOpenChange,
  onSaved,
  nextStepNumber,
}: StepFormProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const isEditing = !!step;

  const form = useForm<StepFormValues>({
    resolver: zodResolver(stepFormSchema),
    defaultValues: {
      project_id: projectId,
      step_number: step?.step_number ?? nextStepNumber,
      step_name: step?.step_name || "",
      step_type: step?.step_type || "material",
      facility_name: step?.facility_name || "",
      facility_location: step?.facility_location || "",
      facility_type: step?.facility_type || "",
      step_owner: step?.step_owner || "",
      scheduled_start_date: step?.scheduled_start_date || "",
      scheduled_end_date: step?.scheduled_end_date || "",
      actual_start_date: step?.actual_start_date || "",
      actual_end_date: step?.actual_end_date || "",
      delay_reason: step?.delay_reason || "",
      material_input: step?.material_input || "",
      material_output: step?.material_output || "",
      input_specification: step?.input_specification || "",
      output_specification: step?.output_specification || "",
      quantity: step?.quantity ?? null,
      quantity_units: step?.quantity_units || "",
      deliverable: step?.deliverable || "",
      service_provider: step?.service_provider || "",
      service_description: step?.service_description || "",
      estimated_cost: step?.estimated_cost ?? null,
      actual_cost: step?.actual_cost ?? null,
      lessons_learned: step?.lessons_learned || "",
      notes: step?.notes || "",
      status: step?.status || "not_started",
    },
  });

  const stepType = form.watch("step_type");

  async function onSubmit(data: StepFormValues) {
    setSaving(true);
    try {
      const result = isEditing
        ? await updateStep(step!.id, data)
        : await createStep(data);

      if ("error" in result) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: isEditing ? "Step updated" : "Step added",
          description: `Step "${data.step_name}" saved.`,
        });
        onOpenChange(false);
        onSaved();
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Process Step" : "Add Process Step"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details of this process step."
              : "Add a new step to this project."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Step Number</Label>
              <Input
                type="number"
                {...form.register("step_number", { valueAsNumber: true })}
                readOnly={isEditing}
                className={isEditing ? "bg-muted" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label>
                Step Name <span className="text-destructive">*</span>
              </Label>
              <Input
                {...form.register("step_name")}
                placeholder="e.g., Extrusion, Coating"
              />
              {form.formState.errors.step_name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.step_name.message}
                </p>
              )}
            </div>
          </div>

          {/* Type, Status, Owner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={stepType}
                onValueChange={(v) =>
                  form.setValue("step_type", v as "material" | "service")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="material">Material</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(v) => form.setValue("status", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Step Owner</Label>
              <Input
                {...form.register("step_owner")}
                placeholder="Responsible person"
              />
            </div>
          </div>

          {/* Facility */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Facility Name</Label>
              <Input
                {...form.register("facility_name")}
                placeholder="e.g., Plant A"
              />
            </div>
            <div className="space-y-2">
              <Label>Facility Type</Label>
              <Input
                {...form.register("facility_type")}
                placeholder="e.g., Manufacturing"
              />
            </div>
            <div className="space-y-2">
              <Label>Facility Location</Label>
              <Input
                {...form.register("facility_location")}
                placeholder="e.g., Chicago, IL"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Sched. Start</Label>
              <Input
                type="date"
                {...form.register("scheduled_start_date")}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Sched. End</Label>
              <Input
                type="date"
                {...form.register("scheduled_end_date")}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Actual Start</Label>
              <Input
                type="date"
                {...form.register("actual_start_date")}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Actual End</Label>
              <Input
                type="date"
                {...form.register("actual_end_date")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Delay Reason</Label>
            <Input
              {...form.register("delay_reason")}
              placeholder="If delayed, explain why"
            />
          </div>

          {/* Conditional: Material or Service */}
          {stepType === "material" ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Material Input</Label>
                  <Input
                    {...form.register("material_input")}
                    placeholder="e.g., Resin pellets"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Material Output</Label>
                  <Input
                    {...form.register("material_output")}
                    placeholder="e.g., Extruded film"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Input Specification</Label>
                  <Input
                    {...form.register("input_specification")}
                    placeholder="e.g., Grade A, 50 micron"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Output Specification</Label>
                  <Input
                    {...form.register("output_specification")}
                    placeholder="e.g., 100mm width, 0.5mm thick"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Service Provider</Label>
                <Input
                  {...form.register("service_provider")}
                  placeholder="e.g., Acme Testing Co."
                />
              </div>
              <div className="space-y-2">
                <Label>Service Description</Label>
                <Input
                  {...form.register("service_description")}
                  placeholder="e.g., Tensile strength testing"
                />
              </div>
            </div>
          )}

          {/* Quantity & Deliverable */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                step="0.01"
                {...form.register("quantity", { valueAsNumber: true })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Quantity Units</Label>
              <Input
                {...form.register("quantity_units")}
                placeholder="e.g., kg, pcs, rolls"
              />
            </div>
            <div className="space-y-2">
              <Label>Deliverable</Label>
              <Input
                {...form.register("deliverable")}
                placeholder="e.g., Finished product batch"
              />
            </div>
          </div>

          {/* Costs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Estimated Cost ($)</Label>
              <Input
                type="number"
                step="0.01"
                {...form.register("estimated_cost", { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Actual Cost ($)</Label>
              <Input
                type="number"
                step="0.01"
                {...form.register("actual_cost", { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Lessons Learned</Label>
            <Textarea
              {...form.register("lessons_learned")}
              placeholder="Key takeaways from this step"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              {...form.register("notes")}
              placeholder="Additional notes"
              rows={3}
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isEditing ? "Update Step" : "Add Step"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
