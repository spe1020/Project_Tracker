import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrialForm } from "@/components/trials/trial-form";
import { getTrial } from "@/lib/actions";

interface EditTrialPageProps {
  params: { id: string };
}

export default async function EditTrialPage({ params }: EditTrialPageProps) {
  const trial = await getTrial(params.id);

  if (!trial) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/trials/${trial.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Edit {trial.trial_number}
          </h1>
          <p className="text-muted-foreground mt-1">
            Update trial documentation
          </p>
        </div>
      </div>

      <TrialForm trial={trial} trialNumber={trial.trial_number} />
    </div>
  );
}
