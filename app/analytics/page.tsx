"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createBrowserClient } from "@/lib/supabase/client";
import type { Trial } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  draft: "#94a3b8",
  in_progress: "#3b82f6",
  completed: "#22c55e",
};

export default function AnalyticsPage() {
  const [trials, setTrials] = useState<Trial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrials() {
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from("trials")
        .select("*")
        .order("date", { ascending: true });

      if (!error && data) {
        setTrials(data as Trial[]);
      }
      setLoading(false);
    }
    fetchTrials();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">Loading data...</p>
        </div>
      </div>
    );
  }

  // Status distribution
  const statusData = [
    {
      name: "Draft",
      value: trials.filter((t) => t.status === "draft").length,
      color: STATUS_COLORS.draft,
    },
    {
      name: "In Progress",
      value: trials.filter((t) => t.status === "in_progress").length,
      color: STATUS_COLORS.in_progress,
    },
    {
      name: "Completed",
      value: trials.filter((t) => t.status === "completed").length,
      color: STATUS_COLORS.completed,
    },
  ].filter((d) => d.value > 0);

  // Department breakdown
  const deptMap = new Map<string, number>();
  trials.forEach((t) => {
    const dept = t.department || "Unassigned";
    deptMap.set(dept, (deptMap.get(dept) || 0) + 1);
  });
  const departmentData = Array.from(deptMap.entries()).map(([name, count]) => ({
    name,
    count,
  }));

  // Cost analysis by month
  const monthlyMap = new Map<
    string,
    { estimated: number; actual: number }
  >();
  trials.forEach((t) => {
    if (!t.date) return;
    const month = t.date.substring(0, 7); // YYYY-MM
    const existing = monthlyMap.get(month) || { estimated: 0, actual: 0 };
    existing.estimated += Number(t.estimated_total_cost) || 0;
    existing.actual += Number(t.actual_total_cost) || 0;
    monthlyMap.set(month, existing);
  });
  const costData = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, costs]) => ({
      month,
      estimated: costs.estimated,
      actual: costs.actual,
    }));

  // Summary stats
  const totalEstimated = trials.reduce(
    (sum, t) => sum + (Number(t.estimated_total_cost) || 0),
    0
  );
  const totalActual = trials.reduce(
    (sum, t) => sum + (Number(t.actual_total_cost) || 0),
    0
  );
  const variance = totalActual - totalEstimated;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Insights and trends across manufacturing trials
        </p>
      </div>

      {trials.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No trial data available yet. Create some trials to see analytics.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Estimated Cost
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatCurrency(totalEstimated)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Actual Cost
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatCurrency(totalActual)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Cost Variance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className={`text-2xl font-bold ${
                    variance > 0 ? "text-destructive" : "text-green-600"
                  }`}
                >
                  {variance > 0 ? "+" : ""}
                  {formatCurrency(variance)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Trials by Department */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trials by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(215, 70%, 45%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Cost Comparison */}
            {costData.length > 0 && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Monthly Cost Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={costData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                        />
                        <Legend />
                        <Bar
                          dataKey="estimated"
                          name="Estimated"
                          fill="#94a3b8"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="actual"
                          name="Actual"
                          fill="hsl(215, 70%, 45%)"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}
