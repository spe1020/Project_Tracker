"use client";

import Link from "next/link";
import { User, Building2, FlaskConical, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getProjectStatusColor,
  formatProjectStatus,
  formatDate,
} from "@/lib/utils";
import type { Project } from "@/lib/types";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/view?id=${project.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">
              {project.project_number}
            </CardTitle>
            <Badge
              className={getProjectStatusColor(project.status)}
              variant="secondary"
            >
              {formatProjectStatus(project.status)}
            </Badge>
          </div>
          {project.pig_name && (
            <p className="text-sm font-medium text-foreground">
              🐷 {project.pig_name}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            {project.product_name}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            {project.project_lead && (
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                <span>{project.project_lead}</span>
              </div>
            )}
            {project.department && (
              <div className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                <span>{project.department}</span>
              </div>
            )}
            {project.start_date && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDate(project.start_date)}{project.target_completion_date ? ` \u2014 ${formatDate(project.target_completion_date)}` : ""}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              {project.step_count !== undefined && (
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-foreground">
                    {project.completed_step_count}/{project.step_count} steps
                  </span>
                  {project.step_count > 0 && (
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden min-w-[40px]">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{
                          width: `${
                            (project.completed_step_count! /
                              project.step_count) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
              {project.trial_count !== undefined && project.trial_count > 0 && (
                <div className="flex items-center gap-1">
                  <FlaskConical className="h-3.5 w-3.5" />
                  <span>{project.trial_count} trial{project.trial_count !== 1 ? "s" : ""}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
