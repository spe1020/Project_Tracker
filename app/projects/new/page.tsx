"use client";

import { useEffect, useState } from "react";
import { ProjectForm } from "@/components/projects/project-form";
import { getNextProjectNumber } from "@/lib/project-actions";

export default function NewProjectPage() {
  const [projectNumber, setProjectNumber] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const number = await getNextProjectNumber();
      setProjectNumber(number);
    }
    fetchData();
  }, []);

  if (!projectNumber) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Project</h1>
          <p className="text-muted-foreground mt-1">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Project</h1>
        <p className="text-muted-foreground mt-1">
          Creating project: {projectNumber}
        </p>
      </div>
      <ProjectForm projectNumber={projectNumber} />
    </div>
  );
}
