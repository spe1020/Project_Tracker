import { Loader2 } from "lucide-react";

export default function TrialsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-9 w-32 bg-muted rounded animate-pulse" />
        <div className="h-5 w-64 bg-muted rounded animate-pulse mt-2" />
      </div>
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </div>
  );
}
