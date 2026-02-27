"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrialForm } from "@/components/trials/trial-form";
import { getTrial } from "@/lib/actions";
import type { Trial } from "@/lib/types";

function EditTrialContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [trial, setTrial] = useState<Trial | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    getTrial(id).then((data) => {
      setTrial(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!trial) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/trials">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Trial not found</h1>
            <p className="text-muted-foreground mt-1">
              The requested trial could not be found.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/trials/view?id=${trial.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Edit {trial.trial_number}
          </h1>
          <p className="text-muted-foreground mt-1">
            {trial.pig_name ? `🐷 ${trial.pig_name} \u2014 ` : ""}Update trial documentation
          </p>
        </div>
      </div>

      <TrialForm trial={trial} trialNumber={trial.trial_number} pigName={trial.pig_name || undefined} />
    </div>
  );
}

export default function EditTrialPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">Loading...</h1>
        </div>
      }
    >
      <EditTrialContent />
    </Suspense>
  );
}
