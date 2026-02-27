"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TrialForm } from "@/components/trials/trial-form";
import { getNextTrialNumber } from "@/lib/actions";

function NewTrialContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project_id") || undefined;
  const stepId = searchParams.get("step_id") || undefined;

  const [trialNumber, setTrialNumber] = useState<string | null>(null);
  const [pigName, setPigName] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const result = await getNextTrialNumber();
      setTrialNumber(result.trialNumber);
      setPigName(result.pigName);
    }
    fetchData();
  }, []);

  if (!trialNumber) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Trial</h1>
          <p className="text-muted-foreground mt-1">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Trial</h1>
        <p className="text-muted-foreground mt-1">
          Creating trial: {trialNumber} &bull; 🐷 {pigName}
        </p>
      </div>

      <TrialForm
        trialNumber={trialNumber}
        pigName={pigName!}
        defaultProjectId={projectId}
        defaultStepId={stepId}
      />
    </div>
  );
}

export default function NewTrialPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">Loading...</h1>
        </div>
      }
    >
      <NewTrialContent />
    </Suspense>
  );
}
