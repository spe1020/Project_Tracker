"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrialList } from "@/components/trials/trial-list";
import { getTrials } from "@/lib/actions";
import type { Trial } from "@/lib/types";

export default function TrialsPage() {
  const [trials, setTrials] = useState<Trial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const data = await getTrials();
      setTrials(data);
      setLoading(false);
    }
    fetchData();
  }, []);

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

      {loading ? (
        <p className="text-muted-foreground">Loading trials...</p>
      ) : (
        <TrialList trials={trials} />
      )}
    </div>
  );
}
