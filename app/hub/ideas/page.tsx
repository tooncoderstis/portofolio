import type { Metadata } from "next";

import { AutoRefresh } from "@/components/hub/auto-refresh";
import { IdeaCard } from "@/components/ideas/idea-card";
import { IdeaFilters } from "@/components/ideas/idea-filters";
import { IdeaForm } from "@/components/ideas/idea-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ideaPlatformSchema,
  ideaStatusSchema,
  type IdeaPlatform,
  type IdeaStatus,
} from "@/lib/hub/schema";
import { listIdeas, listProjects } from "@/lib/hub/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Ide" };

type SearchParams = Promise<{
  project?: string;
  platform?: string;
  status?: string;
  tag?: string;
}>;

function validPlatform(value?: string): IdeaPlatform | undefined {
  const parsed = value ? ideaPlatformSchema.safeParse(value) : null;

  return parsed?.success ? parsed.data : undefined;
}

function validStatus(value?: string): IdeaStatus | undefined {
  const parsed = value ? ideaStatusSchema.safeParse(value) : null;

  return parsed?.success ? parsed.data : undefined;
}

export default async function IdeasPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { project, platform, status, tag } = await searchParams;

  const [ideas, projects] = await Promise.all([
    listIdeas({
      project,
      tag,
      platform: validPlatform(platform),
      status: validStatus(status),
    }),
    listProjects(),
  ]);

  const names = new Map(projects.map((item) => [item.slug, item.name]));
  const projectOptions = projects.map((item) => ({
    slug: item.slug,
    name: item.name,
  }));

  return (
    <div className="space-y-8">
      <AutoRefresh />
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Ide</h1>
        <p className="text-muted-foreground text-sm">
          Kumpulan ide baru dari Threads, X, TikTok, Instagram, dan lainnya.
          Kaitkan ke proyek untuk masuk ke rencana pengembangan.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tambah ide</CardTitle>
        </CardHeader>
        <CardContent>
          <IdeaForm projects={projectOptions} defaultProject={project} />
        </CardContent>
      </Card>

      <IdeaFilters
        basePath="/hub/ideas"
        current={{ project, platform, status, tag }}
      />

      {ideas.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Belum ada ide pada filter ini.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {ideas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              projectName={idea.project ? names.get(idea.project) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
