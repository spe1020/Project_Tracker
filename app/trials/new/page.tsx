"use client";

import { useEffect, useState } from "react";
import { TrialForm } from "@/components/trials/trial-form";
import { getNextTrialNumber } from "@/lib/actions";

export default function NewTrialPage() {
  const [trialNumber, setTrialNumber] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const num = await getNextTrialNumber();
      setTrialNumber(num);
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
          Create a new manufacturing trial documentation
        </p>
      </div>

      <TrialForm trialNumber={trialNumber} />
    </div>
  );
}
