import type { Metadata } from "next";

import { ProjectList } from "@/components/projects/project-list";
import { getProjects } from "@/lib/content";

export const metadata: Metadata = { title: "Proyek" };

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 px-6 py-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Proyek
        </h1>
        <p className="text-muted-foreground">
          Proyek yang pernah dan sedang saya kerjakan.
        </p>
      </header>

      <ProjectList projects={projects.map((entry) => entry.frontmatter)} />
    </main>
  );
}
