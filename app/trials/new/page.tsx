export const dynamic = "force-dynamic";

import { TrialForm } from "@/components/trials/trial-form";
import { getNextTrialNumber } from "@/lib/actions";

export default async function NewTrialPage() {
  const trialNumber = await getNextTrialNumber();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Trial</h1>
        <p className="text-muted-foreground mt-1">
          Create a new manufacturing trial documentation
        </p>
      </div>

      <TrialForm trialNumber={trialNumber} />
    </div>
  );
}
