export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  FlaskConical,
  Clock,
  CheckCircle2,
  DollarSign,
  PlusCircle,
  BarChart3,
  ArrowRight,
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
  formatCurrency,
  formatDate,
  formatStatus,
  getStatusColor,
} from "@/lib/utils";

export default async function DashboardPage() {
  const [stats, recentTrials] = await Promise.all([
    getDashboardStats(),
    getRecentTrials(5),
  ]);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manufacturing trial documentation overview
          </p>
        </div>
        <div className="flex gap-2">
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

      {/* Stats cards */}
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
                  href={`/trials/${trial.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{trial.trial_number}</span>
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
