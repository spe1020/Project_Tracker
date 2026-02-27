export const dynamic = "force-dynamic";

import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrialList } from "@/components/trials/trial-list";
import { getTrials } from "@/lib/actions";

export default async function TrialsPage() {
  const trials = await getTrials();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trials</h1>
          <p className="text-muted-foreground mt-1">
            Browse and manage all manufacturing trials
          </p>
        </div>
        <Link href="/trials/new">
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Trial
          </Button>
        </Link>
      </div>

      <TrialList trials={trials} />
    </div>
  );
}
