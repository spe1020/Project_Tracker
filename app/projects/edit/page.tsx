"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectForm } from "@/components/projects/project-form";
import { getProject } from "@/lib/project-actions";
import type { Project } from "@/lib/types";

function EditProjectContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    getProject(id).then((data) => {
      setProject(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Loading...</h1>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/projects">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Project not found
            </h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Project</h1>
        <p className="text-muted-foreground mt-1">
          Editing: {project.project_number} — {project.product_name}
        </p>
      </div>
      <ProjectForm project={project} projectNumber={project.project_number} />
    </div>
  );
}

export default function EditProjectPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">Loading...</h1>
        </div>
      }
    >
      <EditProjectContent />
    </Suspense>
  );
}
