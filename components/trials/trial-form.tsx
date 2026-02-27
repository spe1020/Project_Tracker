"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Plus, Trash2, Save, Loader2, Paperclip, FileText, Image, Video, File, X, RefreshCw } from "lucide-react";

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
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { trialFormSchema, type TrialFormValues } from "@/lib/validations";
import { createTrial, updateTrial } from "@/lib/actions";
import { formatCurrency, formatFileSize, getFileTypeLabel } from "@/lib/utils";
import { generateRandomPigName } from "@/lib/pig-names";
import type { Trial } from "@/lib/types";

function RequiredAsterisk() {
  return <span className="text-destructive ml-0.5">*</span>;
}

interface TrialFormProps {
  trial?: Trial;
  trialNumber: string;
  pigName?: string;
}

export function TrialForm({ trial, trialNumber, pigName }: TrialFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const isEditing = !!trial;

  const form = useForm<TrialFormValues>({
    resolver: zodResolver(trialFormSchema),
    defaultValues: {
      trial_number: trial?.trial_number || trialNumber,
      pig_name: trial?.pig_name || pigName || "",
      date: trial?.date || new Date().toISOString().split("T")[0],
      department: trial?.department || "",
      lead_name: trial?.lead_name || "",
      product_process: trial?.product_process || "",
      duration: trial?.duration || "",
      production_line: trial?.production_line || "",
      team_members: trial?.team_members || "",
      primary_goal: trial?.primary_goal || "",
      success_criteria: trial?.success_criteria || "",
      results_vs_objectives: trial?.results_vs_objectives || "",
      key_learnings: trial?.key_learnings || "",
      recommendations: trial?.recommendations || "",
      recommendation_status: trial?.recommendation_status || "",
      status: trial?.status || "draft",
      materials: trial?.trial_materials?.map((m) => ({
        material_name: m.material_name,
        specification: m.specification,
        supplier_lot: m.supplier_lot,
        order_index: m.order_index,
      })) || [],
      parameters: trial?.trial_parameters?.map((p) => ({
        parameter_name: p.parameter_name,
        target_value: p.target_value,
        actual_value: p.actual_value,
        order_index: p.order_index,
      })) || [],
      costs: trial?.trial_costs?.map((c) => ({
        category: c.category,
        estimated_cost: c.estimated_cost,
        actual_cost: c.actual_cost,
        notes: c.notes,
        order_index: c.order_index,
      })) || [],
      attachments: trial?.trial_attachments?.map((a) => ({
        file_name: a.file_name,
        file_type: a.file_type,
        file_size: a.file_size,
        description: a.description,
        storage_path: a.storage_path,
        order_index: a.order_index,
      })) || [],
      suppliers: trial?.trial_suppliers?.map((s) => ({
        supplier_name: s.supplier_name,
        contact_name: s.contact_name,
        role: s.role,
        site_location: s.site_location,
        order_index: s.order_index,
      })) || [],
    },
  });

  const {
    fields: materialFields,
    append: appendMaterial,
    remove: removeMaterial,
  } = useFieldArray({ control: form.control, name: "materials" });

  const {
    fields: parameterFields,
    append: appendParameter,
    remove: removeParameter,
  } = useFieldArray({ control: form.control, name: "parameters" });

  const {
    fields: costFields,
    append: appendCost,
    remove: removeCost,
  } = useFieldArray({ control: form.control, name: "costs" });

  const {
    fields: attachmentFields,
    append: appendAttachment,
    remove: removeAttachment,
  } = useFieldArray({ control: form.control, name: "attachments" });

  const {
    fields: supplierFields,
    append: appendSupplier,
    remove: removeSupplier,
  } = useFieldArray({ control: form.control, name: "suppliers" });

  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      appendAttachment({
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        description: "",
        storage_path: null,
        order_index: attachmentFields.length,
      });
    });
    e.target.value = "";
  }

  function getFileIcon(mimeType: string) {
    if (mimeType.startsWith("image/")) return <Image className="h-4 w-4" />;
    if (mimeType.startsWith("video/")) return <Video className="h-4 w-4" />;
    if (mimeType === "application/pdf") return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  }

  const watchedCosts = form.watch("costs");
  const estimatedTotal = watchedCosts.reduce(
    (sum, c) => sum + (Number(c.estimated_cost) || 0),
    0
  );
  const actualTotal = watchedCosts.reduce(
    (sum, c) => sum + (Number(c.actual_cost) || 0),
    0
  );

  async function onSubmit(data: TrialFormValues, status?: string) {
    setSaving(true);
    const submitData = { ...data, status: status || data.status };

    try {
      const result = isEditing
        ? await updateTrial(trial!.id, submitData)
        : await createTrial(submitData);

      if ("error" in result) {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      } else {
        toast({ title: isEditing ? "Trial updated" : "Trial created", description: `Trial ${data.trial_number} saved successfully.` });
        router.push(`/trials/view?id=${result.id}`);
      }
    } catch {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit((data) => onSubmit(data))}
      className="space-y-8 pb-24"
    >
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Row 1: Trial Number, Project Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="trial_number">Trial Number</Label>
              <Input
                id="trial_number"
                {...form.register("trial_number")}
                readOnly
                className="bg-muted"
              />
              {form.formState.errors.trial_number && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.trial_number.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pig_name">Project Name</Label>
              <div className="flex gap-2 items-center">
                <span className="text-lg">🐷</span>
                <Input
                  id="pig_name"
                  {...form.register("pig_name")}
                  readOnly={isEditing}
                  className={isEditing ? "bg-muted" : ""}
                  placeholder="e.g., Operation Golden Hamhock"
                />
                {!isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => form.setValue("pig_name", generateRandomPigName())}
                    title="Shuffle name"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {form.formState.errors.pig_name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.pig_name.message}
                </p>
              )}
            </div>
          </div>

          {/* Row 2: Date, Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date<RequiredAsterisk /></Label>
              <Input id="date" type="date" {...form.register("date")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department<RequiredAsterisk /></Label>
              <Input id="department" {...form.register("department")} placeholder="e.g., Production, R&D" />
            </div>
          </div>

          {/* Row 2: Trial Lead (full width) */}
          <div className="space-y-2">
            <Label htmlFor="lead_name">Trial Lead<RequiredAsterisk /></Label>
            <Input id="lead_name" {...form.register("lead_name")} placeholder="Lead name" />
          </div>

          {/* Row 3: Product/Process, Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product_process">Product/Process<RequiredAsterisk /></Label>
              <Input id="product_process" {...form.register("product_process")} placeholder="Product or process name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input id="duration" {...form.register("duration")} placeholder="e.g., 4 hours, 2 days" />
            </div>
          </div>

          {/* Row 4: Production Line, Team Members */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="production_line">Production Line</Label>
              <Input id="production_line" {...form.register("production_line")} placeholder="Line number/name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team_members">Team Members</Label>
              <Input id="team_members" {...form.register("team_members")} placeholder="Comma-separated names" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suppliers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Suppliers</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendSupplier({
                supplier_name: "",
                contact_name: "",
                role: "",
                site_location: "",
                order_index: supplierFields.length,
              })
            }
          >
            <Plus className="h-4 w-4 mr-1" /> Add Supplier
          </Button>
        </CardHeader>
        <CardContent>
          {supplierFields.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No suppliers added yet. Click &quot;Add Supplier&quot; to begin.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="hidden md:grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 text-sm font-medium text-muted-foreground">
                <span>Supplier Name</span>
                <span>Contact</span>
                <span>Role</span>
                <span>Site</span>
                <span className="w-9"></span>
              </div>
              {supplierFields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3"
                >
                  <Input
                    {...form.register(`suppliers.${index}.supplier_name`)}
                    placeholder="Supplier name"
                  />
                  <Input
                    {...form.register(`suppliers.${index}.contact_name`)}
                    placeholder="Contact name"
                  />
                  <Input
                    {...form.register(`suppliers.${index}.role`)}
                    placeholder="e.g., Raw material supplier"
                  />
                  <Input
                    {...form.register(`suppliers.${index}.site_location`)}
                    placeholder="e.g., Chicago, IL"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSupplier(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Objectives</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="primary_goal">Primary Goal<RequiredAsterisk /></Label>
            <Textarea id="primary_goal" {...form.register("primary_goal")} placeholder="What is the main objective of this trial?" rows={4} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="success_criteria">Success Criteria</Label>
            <Textarea id="success_criteria" {...form.register("success_criteria")} placeholder="How will success be measured?" rows={4} />
          </div>
        </CardContent>
      </Card>

      {/* Materials */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Materials</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendMaterial({
                material_name: "",
                specification: "",
                supplier_lot: "",
                order_index: materialFields.length,
              })
            }
          >
            <Plus className="h-4 w-4 mr-1" /> Add Material
          </Button>
        </CardHeader>
        <CardContent>
          {materialFields.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No materials added yet. Click &quot;Add Material&quot; to begin.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="hidden md:grid grid-cols-[1fr_1fr_1fr_auto] gap-3 text-sm font-medium text-muted-foreground">
                <span>Material Name</span>
                <span>Specification</span>
                <span>Supplier/Lot</span>
                <span className="w-9"></span>
              </div>
              {materialFields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3"
                >
                  <Input
                    {...form.register(`materials.${index}.material_name`)}
                    placeholder="Material name"
                  />
                  <Input
                    {...form.register(`materials.${index}.specification`)}
                    placeholder="Specification"
                  />
                  <Input
                    {...form.register(`materials.${index}.supplier_lot`)}
                    placeholder="Supplier/Lot #"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMaterial(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Parameters */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Parameters</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendParameter({
                parameter_name: "",
                target_value: "",
                actual_value: "",
                order_index: parameterFields.length,
              })
            }
          >
            <Plus className="h-4 w-4 mr-1" /> Add Parameter
          </Button>
        </CardHeader>
        <CardContent>
          {parameterFields.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No parameters added yet. Click &quot;Add Parameter&quot; to begin.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="hidden md:grid grid-cols-[1fr_1fr_1fr_auto] gap-3 text-sm font-medium text-muted-foreground">
                <span>Parameter</span>
                <span>Target Value</span>
                <span>Actual Value</span>
                <span className="w-9"></span>
              </div>
              {parameterFields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3"
                >
                  <Input
                    {...form.register(`parameters.${index}.parameter_name`)}
                    placeholder="Parameter name"
                  />
                  <Input
                    {...form.register(`parameters.${index}.target_value`)}
                    placeholder="Target"
                  />
                  <Input
                    {...form.register(`parameters.${index}.actual_value`)}
                    placeholder="Actual"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeParameter(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Costs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Cost Tracking</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendCost({
                category: "materials",
                estimated_cost: null,
                actual_cost: null,
                notes: "",
                order_index: costFields.length,
              })
            }
          >
            <Plus className="h-4 w-4 mr-1" /> Add Cost Item
          </Button>
        </CardHeader>
        <CardContent>
          {costFields.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No cost items added yet. Click &quot;Add Cost Item&quot; to begin.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="hidden md:grid grid-cols-[150px_1fr_1fr_1fr_auto] gap-3 text-sm font-medium text-muted-foreground">
                <span>Category</span>
                <span>Estimated ($)</span>
                <span>Actual ($)</span>
                <span>Notes</span>
                <span className="w-9"></span>
              </div>
              {costFields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 md:grid-cols-[150px_1fr_1fr_1fr_auto] gap-3"
                >
                  <Select
                    value={form.watch(`costs.${index}.category`)}
                    onValueChange={(value) =>
                      form.setValue(
                        `costs.${index}.category`,
                        value as "materials" | "labor" | "downtime"
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="materials">Materials</SelectItem>
                      <SelectItem value="labor">Labor</SelectItem>
                      <SelectItem value="downtime">Downtime</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    step="0.01"
                    {...form.register(`costs.${index}.estimated_cost`, {
                      valueAsNumber: true,
                    })}
                    placeholder="0.00"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    {...form.register(`costs.${index}.actual_cost`, {
                      valueAsNumber: true,
                    })}
                    placeholder="0.00"
                  />
                  <Input
                    {...form.register(`costs.${index}.notes`)}
                    placeholder="Notes"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCost(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-[150px_1fr_1fr_1fr_auto] gap-3 font-semibold">
                <span>Totals</span>
                <span>{formatCurrency(estimatedTotal)}</span>
                <span>{formatCurrency(actualTotal)}</span>
                <span></span>
                <span className="w-9"></span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attachments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Attachments</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-4 w-4 mr-1" /> Add Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.pptx"
            onChange={handleFileSelect}
          />
        </CardHeader>
        <CardContent>
          {attachmentFields.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No files attached yet. Click &quot;Add Files&quot; to attach photos, videos, or documents.
            </p>
          ) : (
            <div className="space-y-3">
              {attachmentFields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-center gap-3 rounded-md border p-3"
                >
                  <div className="text-muted-foreground">
                    {getFileIcon(form.watch(`attachments.${index}.file_type`))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {form.watch(`attachments.${index}.file_name`)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getFileTypeLabel(form.watch(`attachments.${index}.file_type`))}
                      {" \u00b7 "}
                      {formatFileSize(form.watch(`attachments.${index}.file_size`))}
                    </p>
                  </div>
                  <Input
                    {...form.register(`attachments.${index}.description`)}
                    placeholder="Description (optional)"
                    className="max-w-[200px]"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAttachment(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results & Conclusions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Results &amp; Conclusions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="results_vs_objectives">
              Results vs. Objectives
            </Label>
            <Textarea
              id="results_vs_objectives"
              {...form.register("results_vs_objectives")}
              placeholder="How did results compare to the stated objectives?"
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="key_learnings">Key Learnings</Label>
            <Textarea
              id="key_learnings"
              {...form.register("key_learnings")}
              placeholder="What were the key takeaways from this trial?"
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recommendations">Recommendations</Label>
            <Textarea
              id="recommendations"
              {...form.register("recommendations")}
              placeholder="What are the recommended next steps?"
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label>Recommendation Status</Label>
            <Select
              value={form.watch("recommendation_status")}
              onValueChange={(value) =>
                form.setValue("recommendation_status", value)
              }
            >
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue placeholder="Select recommendation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="proceed">Proceed</SelectItem>
                <SelectItem value="additional_trials">
                  Additional Trials Needed
                </SelectItem>
                <SelectItem value="discontinue">Discontinue</SelectItem>
              </SelectContent>
            </Select>
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
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={form.handleSubmit((data) => onSubmit(data, "draft"))}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save as Draft
          </Button>
          <Button
            type="button"
            disabled={saving}
            onClick={form.handleSubmit((data) => onSubmit(data, "completed"))}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Complete Trial
          </Button>
        </div>
      </div>
    </form>
  );
}
