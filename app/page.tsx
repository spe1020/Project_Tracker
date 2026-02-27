"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FlaskConical,
  Clock,
  CheckCircle2,
  DollarSign,
  PlusCircle,
  BarChart3,
  ArrowRight,
  FolderKanban,
  Pause,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardStats, getRecentTrials } from "@/lib/actions";
import {
  getProjectDashboardStats,
  getRecentProjects,
} from "@/lib/project-actions";
import {
  formatCurrency,
  formatDate,
  formatStatus,
  getStatusColor,
  formatProjectStatus,
  getProjectStatusColor,
} from "@/lib/utils";
import type {
  Trial,
  DashboardStats,
  Project,
  ProjectDashboardStats,
} from "@/lib/types";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTrials: 0,
    activeTrials: 0,
    completedTrials: 0,
    totalEstimatedCost: 0,
    totalActualCost: 0,
  });
  const [projectStats, setProjectStats] = useState<ProjectDashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    onHoldProjects: 0,
  });
  const [recentTrials, setRecentTrials] = useState<Trial[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [statsData, trialsData, projStatsData, projData] =
        await Promise.all([
          getDashboardStats(),
          getRecentTrials(5),
          getProjectDashboardStats(),
          getRecentProjects(5),
        ]);
      setStats(statsData);
      setRecentTrials(trialsData);
      setProjectStats(projStatsData);
      setRecentProjects(projData);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manufacturing project &amp; trial overview
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/projects/new">
            <Button variant="outline">
              <PlusCircle className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </Link>
          <Link href="/trials/new">
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              New Trial
            </Button>
          </Link>
          <Link href="/analytics">
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* Project stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Projects
            </CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projectStats.totalProjects}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Projects
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projectStats.activeProjects}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed Projects
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projectStats.completedProjects}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              On Hold
            </CardTitle>
            <Pause className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projectStats.onHoldProjects}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trial stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Trials
            </CardTitle>
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTrials}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Trials
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTrials}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTrials}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Costs
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalActualCost)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Est: {formatCurrency(stats.totalEstimatedCost)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Projects</CardTitle>
          <Link href="/projects">
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentProjects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No projects yet. Create your first project to get started.
              </p>
              <Link href="/projects/new" className="mt-4 inline-block">
                <Button variant="outline">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create First Project
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/view?id=${project.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {project.project_number}
                      </span>
                      <Badge
                        className={getProjectStatusColor(project.status)}
                        variant="secondary"
                      >
                        {formatProjectStatus(project.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-0.5">
                      {project.product_name}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground ml-4 shrink-0">
                    {project.step_count !== undefined
                      ? `${project.completed_step_count}/${project.step_count} steps`
                      : ""}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Trials */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Trials</CardTitle>
          <Link href="/trials">
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentTrials.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No trials yet. Create your first trial to get started.
              </p>
              <Link href="/trials/new" className="mt-4 inline-block">
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create First Trial
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTrials.map((trial) => (
                <Link
                  key={trial.id}
                  href={`/trials/view?id=${trial.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{trial.trial_number}</span>
                      {trial.pig_name && (
                        <span className="text-sm text-muted-foreground">🐷 {trial.pig_name}</span>
                      )}
                      <Badge
                        className={getStatusColor(trial.status)}
                        variant="secondary"
                      >
                        {formatStatus(trial.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-0.5">
                      {trial.product_process || trial.department || "No description"}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground ml-4 shrink-0">
                    {formatDate(trial.date)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
