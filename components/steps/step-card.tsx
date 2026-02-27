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

        {/* Date range (collapsed) */}
        {(step.scheduled_start_date || step.actual_start_date) && (
          <span className="hidden sm:inline text-xs text-muted-foreground shrink-0">
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
          {(step.facility_name || step.facility_location) && (
            <div className="flex items-start gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Facility</p>
                <p className="text-muted-foreground">
                  {[step.facility_name, step.facility_location]
                    .filter(Boolean)
                    .join(" — ")}
                </p>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="flex items-start gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium">Timeline</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-muted-foreground">
                <span>Scheduled: {formatDate(step.scheduled_start_date)} — {formatDate(step.scheduled_end_date)}</span>
                <span>Actual: {formatDate(step.actual_start_date)} — {formatDate(step.actual_end_date)}</span>
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
            (step.material_input || step.material_output) && (
              <div className="text-sm space-y-1">
                <p className="font-medium">Material Flow</p>
                {step.material_input && (
                  <p className="text-muted-foreground">
                    Input: {step.material_input}
                  </p>
                )}
                {step.material_output && (
                  <p className="text-muted-foreground">
                    Output: {step.material_output}
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

          {/* Linked trial */}
          {step.linked_trial && (
            <div className="flex items-center gap-2 text-sm">
              <FlaskConical className="h-4 w-4 text-muted-foreground" />
              <span>Linked Trial:</span>
              <Link
                href={`/trials/view?id=${step.linked_trial.id}`}
                className="text-primary hover:underline font-medium"
              >
                {step.linked_trial.trial_number}
                {step.linked_trial.pig_name && ` — ${step.linked_trial.pig_name}`}
              </Link>
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
