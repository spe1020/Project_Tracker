import Link from "next/link";
import { Calendar, User, Factory, DollarSign } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Trial } from "@/lib/types";
import {
  formatDate,
  formatCurrency,
  formatStatus,
  getStatusColor,
} from "@/lib/utils";

interface TrialCardProps {
  trial: Trial;
}

export function TrialCard({ trial }: TrialCardProps) {
  return (
    <Link href={`/trials/${trial.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-base font-semibold">
              {trial.trial_number}
            </CardTitle>
            <Badge
              className={getStatusColor(trial.status)}
              variant="secondary"
            >
              {formatStatus(trial.status)}
            </Badge>
          </div>
          {trial.pig_name && (
            <p className="text-sm font-medium">
              🐷 {trial.pig_name}
            </p>
          )}
          {trial.product_process && (
            <p className="text-sm text-muted-foreground">
              {trial.product_process}
            </p>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-2 text-sm">
            {trial.date && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(trial.date)}
              </div>
            )}
            {trial.lead_name && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                {trial.lead_name}
              </div>
            )}
            {trial.department && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Factory className="h-3.5 w-3.5" />
                {trial.department}
              </div>
            )}
            {(trial.estimated_total_cost || trial.actual_total_cost) && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <DollarSign className="h-3.5 w-3.5" />
                {formatCurrency(
                  trial.actual_total_cost || trial.estimated_total_cost
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
