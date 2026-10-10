import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AutoRefresh } from "@/components/hub/auto-refresh";
import { DecisionForm } from "@/components/hub/decision-form";
import { MarkdownView } from "@/components/hub/markdown-view";
import { PhaseList } from "@/components/hub/phase-list";
import { ProgressBar } from "@/components/hub/progress-bar";
import { IdeaCard } from "@/components/ideas/idea-card";
import { IdeaForm } from "@/components/ideas/idea-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/format";
import { getProject, listDecisions, listIdeas } from "@/lib/hub/store";

type RouteProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
};

const TABS = [
  { value: "ringkasan", label: "Ringkasan" },
  { value: "rencana", label: "Rencana" },
  { value: "status", label: "STATUS.md" },
  { value: "prd", label: "PRD.md" },
  { value: "keputusan", label: "Keputusan" },
] as const;

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { slug } = await params;

  return { title: `Hub — ${slug}` };
}

export default async function HubProjectPage({
  params,
  searchParams,
}: RouteProps) {
  const { slug } = await params;
  const { tab } = await searchParams;
  const project = await getProject(slug);

  if (!project) notFound();

  const active = TABS.some((item) => item.value === tab) ? tab : "ringkasan";
  const decisions = await listDecisions(slug);
  const ideas = active === "rencana" ? await listIdeas({ project: slug }) : [];

  return (
    <div className="space-y-8">
      <AutoRefresh />
      <div className="space-y-3">
        <Link
          href="/hub"
          className="text-muted-foreground text-sm hover:underline"
        >
          ← Semua proyek
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {project.name}
          </h1>
          <Badge variant="secondary">{project.progress}%</Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          {project.done}/{project.total} fase selesai
          {project.updatedAt
            ? ` · diperbarui ${formatRelativeTime(project.updatedAt)}`
            : ""}
        </p>
        {project.path ? (
          <p className="text-muted-foreground font-mono text-xs">
            {project.path}
          </p>
        ) : null}
        <ProgressBar value={project.progress} />
      </div>

      <nav className="border-border flex gap-1 overflow-x-auto border-b">
        {TABS.map((item) => (
          <Link
            key={item.value}
            href={`/hub/${slug}?tab=${item.value}`}
            className={
              item.value === active
                ? "border-foreground -mb-px shrink-0 border-b-2 px-3 py-2 text-sm font-medium whitespace-nowrap"
                : "text-muted-foreground hover:text-foreground -mb-px shrink-0 border-b-2 border-transparent px-3 py-2 text-sm whitespace-nowrap"
            }
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {active === "ringkasan" ? (
        <Card>
          <CardHeader>
            <CardTitle>Fase</CardTitle>
          </CardHeader>
          <CardContent>
            <PhaseList phases={project.phases} />
          </CardContent>
        </Card>
      ) : null}

      {active === "rencana" ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tambah ide pengembangan</CardTitle>
            </CardHeader>
            <CardContent>
              <IdeaForm
                defaultProject={slug}
                lockProject
                projects={[{ slug, name: project.name }]}
              />
            </CardContent>
          </Card>

          {ideas.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Belum ada ide pengembangan untuk proyek ini.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {ideas.map((idea) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  projectName={project.name}
                />
              ))}
            </div>
          )}
        </div>
      ) : null}

      {active === "status" ? (
        <Card>
          <CardContent className="pt-6">
            <MarkdownView markdown={project.statusMd} />
          </CardContent>
        </Card>
      ) : null}

      {active === "prd" ? (
        <Card>
          <CardContent className="pt-6">
            <MarkdownView markdown={project.prdMd} />
          </CardContent>
        </Card>
      ) : null}

      {active === "keputusan" ? (
        <Card>
          <CardHeader>
            <CardTitle>Keputusan fase</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <DecisionForm slug={slug} phases={project.phases} />
            {decisions.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Belum ada keputusan tercatat.
              </p>
            ) : (
              <ul className="divide-border divide-y">
                {decisions.map((decision) => (
                  <li key={decision.id} className="space-y-1 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          decision.action === "continue" ? "default" : "outline"
                        }
                      >
                        {decision.action === "continue"
                          ? "Lanjut"
                          : "Tidak lanjut"}
                      </Badge>
                      {decision.phaseId ? (
                        <span className="text-muted-foreground font-mono text-xs">
                          {decision.phaseId}
                        </span>
                      ) : null}
                      <span className="text-muted-foreground text-xs">
                        {formatRelativeTime(decision.createdAt)}
                      </span>
                    </div>
                    {decision.note ? (
                      <p className="text-sm">{decision.note}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
