import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Calendar,
  User,
  Factory,
  Clock,
  Pencil,
  Printer,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTrial } from "@/lib/actions";
import {
  formatDate,
  formatCurrency,
  formatStatus,
  getStatusColor,
  getRecommendationLabel,
} from "@/lib/utils";

interface TrialViewPageProps {
  params: { id: string };
}

export default async function TrialViewPage({ params }: TrialViewPageProps) {
  const trial = await getTrial(params.id);

  if (!trial) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <Link href="/trials">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {trial.trial_number}
              </h1>
              <Badge
                className={getStatusColor(trial.status)}
                variant="secondary"
              >
                {formatStatus(trial.status)}
              </Badge>
            </div>
            {trial.product_process && (
              <p className="text-muted-foreground mt-1">
                {trial.product_process}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()} asChild>
            <button>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </button>
          </Button>
          <Link href={`/trials/${trial.id}/edit`}>
            <Button>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block">
        <h1 className="text-2xl font-bold">{trial.trial_number}</h1>
        <p className="text-sm">{trial.product_process}</p>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{formatDate(trial.date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Factory className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="font-medium">{trial.department || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Trial Lead</p>
                <p className="font-medium">{trial.lead_name || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">{trial.duration || "—"}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Production Line</p>
              <p className="font-medium">{trial.production_line || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Team Members</p>
              <p className="font-medium">{trial.team_members || "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Objectives</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Primary Goal
            </p>
            <p className="whitespace-pre-wrap">
              {trial.primary_goal || "—"}
            </p>
          </div>
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Success Criteria
            </p>
            <p className="whitespace-pre-wrap">
              {trial.success_criteria || "—"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Materials */}
      {trial.trial_materials && trial.trial_materials.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Materials</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material Name</TableHead>
                  <TableHead>Specification</TableHead>
                  <TableHead>Supplier/Lot</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trial.trial_materials.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">
                      {m.material_name}
                    </TableCell>
                    <TableCell>{m.specification}</TableCell>
                    <TableCell>{m.supplier_lot}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Parameters */}
      {trial.trial_parameters && trial.trial_parameters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parameter</TableHead>
                  <TableHead>Target Value</TableHead>
                  <TableHead>Actual Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trial.trial_parameters.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      {p.parameter_name}
                    </TableCell>
                    <TableCell>{p.target_value}</TableCell>
                    <TableCell>{p.actual_value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Costs */}
      {trial.trial_costs && trial.trial_costs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cost Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Estimated</TableHead>
                  <TableHead className="text-right">Actual</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trial.trial_costs.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium capitalize">
                      {c.category}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(c.estimated_cost)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(c.actual_cost)}
                    </TableCell>
                    <TableCell>{c.notes}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(trial.estimated_total_cost)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(trial.actual_total_cost)}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Results &amp; Conclusions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Results vs. Objectives
            </p>
            <p className="whitespace-pre-wrap">
              {trial.results_vs_objectives || "—"}
            </p>
          </div>
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Key Learnings
            </p>
            <p className="whitespace-pre-wrap">
              {trial.key_learnings || "—"}
            </p>
          </div>
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Recommendations
            </p>
            <p className="whitespace-pre-wrap">
              {trial.recommendations || "—"}
            </p>
          </div>
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Recommendation Status
            </p>
            <p className="font-medium">
              {getRecommendationLabel(trial.recommendation_status)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <p className="text-xs text-muted-foreground">
        Created: {formatDate(trial.created_at)} | Last updated:{" "}
        {formatDate(trial.updated_at)}
      </p>
    </div>
  );
}
