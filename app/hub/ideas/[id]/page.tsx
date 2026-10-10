import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DeleteIdeaButton } from "@/components/ideas/delete-idea-button";
import { IdeaForm } from "@/components/ideas/idea-form";
import { IdeaStatusBadge } from "@/components/ideas/status-badge";
import { PlatformBadge } from "@/components/ideas/platform-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/format";
import { getIdea, listProjects } from "@/lib/hub/store";

export const dynamic = "force-dynamic";

type RouteProps = { params: Promise<{ id: string }> };

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const id = Number((await params).id);

  if (!Number.isInteger(id) || id <= 0) return { title: "Ide" };

  const idea = await getIdea(id);

  return { title: idea ? `${idea.title} — Ide` : "Ide" };
}

export default async function IdeaDetailPage({ params }: RouteProps) {
  const id = Number((await params).id);

  if (!Number.isInteger(id) || id <= 0) notFound();

  const idea = await getIdea(id);

  if (!idea) notFound();

  const projects = await listProjects();

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Link
          href="/hub/ideas"
          className="text-muted-foreground text-sm hover:underline"
        >
          ← Semua ide
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {idea.title}
          </h1>
          <IdeaStatusBadge status={idea.status} />
          <PlatformBadge platform={idea.platform} />
        </div>
        <p className="text-muted-foreground text-xs">
          diperbarui {formatRelativeTime(idea.updatedAt)}
          {idea.sourceUrl ? (
            <>
              {" · "}
              <a
                href={idea.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                buka sumber
              </a>
            </>
          ) : null}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ubah ide</CardTitle>
        </CardHeader>
        <CardContent>
          <IdeaForm
            idea={idea}
            projects={projects.map((project) => ({
              slug: project.slug,
              name: project.name,
            }))}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <DeleteIdeaButton id={idea.id} />
      </div>
    </div>
  );
}
