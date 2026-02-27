"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Pencil,
  Trash2,
  Calendar,
  DollarSign,
  Building2,
  FlaskConical,
  User,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  cn,
  formatDate,
  formatCurrency,
  getStepStatusColor,
  formatStepStatus,
  getStatusColor,
  formatStatus,
} from "@/lib/utils";
import type { ProcessStep } from "@/lib/types";

interface StepCardProps {
  step: ProcessStep;
  onEdit: () => void;
  onDelete: () => void;
}

export function StepCard({ step, onEdit, onDelete }: StepCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      {/* Collapsed header — always visible */}
      <button
        type="button"
        className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        {/* Step number badge */}
        <span className="flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
          {step.step_number}
        </span>

        {/* Name & type */}
        <div className="flex-1 min-w-0">
          <span className="font-medium">{step.step_name}</span>
          {step.step_owner && (
            <span className="text-xs text-muted-foreground ml-2">({step.step_owner})</span>
          )}
        </div>

        {/* Type badge */}
        <Badge variant="outline" className="capitalize shrink-0">
          {step.step_type}
        </Badge>

        {/* Status */}
        <Badge
          className={cn(getStepStatusColor(step.status), "shrink-0")}
          variant="secondary"
        >
          {formatStepStatus(step.status)}
        </Badge>

        {/* Trial count */}
        {step.linked_trials && step.linked_trials.length > 0 && (
          <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground shrink-0">
            <FlaskConical className="h-3 w-3" />
            {step.linked_trials.length}
          </span>
        )}

        {/* Date range (collapsed) */}
        {(step.scheduled_start_date || step.actual_start_date) && (
          <span className="hidden md:inline text-xs text-muted-foreground shrink-0">
            {formatDate(step.actual_start_date || step.scheduled_start_date)}
          </span>
        )}

        {/* Cost (collapsed) */}
        {(step.actual_cost || step.estimated_cost) && (
          <span className="hidden md:inline text-xs text-muted-foreground shrink-0">
            {formatCurrency(step.actual_cost ?? step.estimated_cost)}
          </span>
        )}

        {/* Chevron */}
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform shrink-0",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Expanded content */}
      {open && (
        <CardContent className="pt-0 pb-4 px-4 space-y-4 border-t">
          {/* Facility */}
          {(step.facility_name || step.facility_location || step.facility_type) && (
            <div className="flex items-start gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Facility</p>
                <p className="text-muted-foreground">
                  {[step.facility_name, step.facility_type, step.facility_location]
                    .filter(Boolean)
                    .join(" \u2014 ")}
                </p>
              </div>
            </div>
          )}

          {/* Step Owner */}
          {step.step_owner && (
            <div className="flex items-start gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Step Owner</p>
                <p className="text-muted-foreground">{step.step_owner}</p>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="flex items-start gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium">Timeline</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-muted-foreground">
                <span>Scheduled: {formatDate(step.scheduled_start_date)} \u2014 {formatDate(step.scheduled_end_date)}</span>
                <span>Actual: {formatDate(step.actual_start_date)} \u2014 {formatDate(step.actual_end_date)}</span>
              </div>
              {step.delay_reason && (
                <p className="text-yellow-700 text-xs">
                  Delay: {step.delay_reason}
                </p>
              )}
            </div>
          </div>

          {/* Material flow OR Service details */}
          {step.step_type === "material" ? (
            (step.material_input || step.material_output || step.input_specification || step.output_specification) && (
              <div className="text-sm space-y-1">
                <p className="font-medium">Material Flow</p>
                {step.material_input && (
                  <p className="text-muted-foreground">
                    Input: {step.material_input}
                  </p>
                )}
                {step.input_specification && (
                  <p className="text-muted-foreground">
                    Input Spec: {step.input_specification}
                  </p>
                )}
                {step.material_output && (
                  <p className="text-muted-foreground">
                    Output: {step.material_output}
                  </p>
                )}
                {step.output_specification && (
                  <p className="text-muted-foreground">
                    Output Spec: {step.output_specification}
                  </p>
                )}
              </div>
            )
          ) : (
            (step.service_provider || step.service_description) && (
              <div className="text-sm space-y-1">
                <p className="font-medium">Service Details</p>
                {step.service_provider && (
                  <p className="text-muted-foreground">
                    Provider: {step.service_provider}
                  </p>
                )}
                {step.service_description && (
                  <p className="text-muted-foreground">
                    {step.service_description}
                  </p>
                )}
              </div>
            )
          )}

          {/* Quantity & Deliverable */}
          {(step.quantity || step.deliverable) && (
            <div className="flex items-start gap-2 text-sm">
              <Package className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Output</p>
                {step.quantity && (
                  <p className="text-muted-foreground">
                    Quantity: {step.quantity}{step.quantity_units ? ` ${step.quantity_units}` : ""}
                  </p>
                )}
                {step.deliverable && (
                  <p className="text-muted-foreground">
                    Deliverable: {step.deliverable}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Costs */}
          {(step.estimated_cost || step.actual_cost) && (
            <div className="flex items-start gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Costs</p>
                <p className="text-muted-foreground">
                  Estimated: {formatCurrency(step.estimated_cost)} | Actual:{" "}
                  {formatCurrency(step.actual_cost)}
                </p>
              </div>
            </div>
          )}

          {/* Lessons learned */}
          {step.lessons_learned && (
            <div className="text-sm">
              <p className="font-medium">Lessons Learned</p>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {step.lessons_learned}
              </p>
            </div>
          )}

          {/* Notes */}
          {step.notes && (
            <div className="text-sm">
              <p className="font-medium">Notes</p>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {step.notes}
              </p>
            </div>
          )}

          {/* Linked trials */}
          {step.linked_trials && step.linked_trials.length > 0 && (
            <div className="text-sm space-y-1">
              <p className="font-medium flex items-center gap-1">
                <FlaskConical className="h-4 w-4 text-muted-foreground" />
                Linked Trials
              </p>
              {step.linked_trials.map((trial) => (
                <Link
                  key={trial.id}
                  href={`/trials/view?id=${trial.id}`}
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <span className="font-medium">{trial.trial_number}</span>
                  {trial.pig_name && <span className="text-muted-foreground">{trial.pig_name}</span>}
                  <Badge className={cn(getStatusColor(trial.status), "text-xs")} variant="secondary">
                    {formatStatus(trial.status)}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Delete
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
