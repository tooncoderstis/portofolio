import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";

import { ProgressBar } from "@/components/hub/progress-bar";
import { mdxComponents } from "@/components/mdx/mdx-components";
import { StatusBadge } from "@/components/projects/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProject, getProjectSlugs } from "@/lib/content";
import { getProject as getHubProject } from "@/lib/hub/store";

type RouteProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);

  return {
    title: project ? `${project.frontmatter.title} — Proyek` : "Proyek",
  };
}

export default async function ProjectDetailPage({ params }: RouteProps) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) notFound();

  const { frontmatter: data, content } = project;
  const hub = await getHubProject(slug);

  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 px-4 py-10 sm:px-6 sm:py-16">
      <div className="space-y-3">
        <Link
          href="/projects"
          className="text-muted-foreground text-sm hover:underline"
        >
          ← Semua proyek
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{data.title}</h1>
          <StatusBadge status={data.status} />
        </div>
        <p className="text-muted-foreground">{data.summary}</p>
        {data.startDate ? (
          <p className="text-muted-foreground text-xs">
            {data.startDate}
            {data.endDate ? ` — ${data.endDate}` : " — sekarang"}
          </p>
        ) : null}
        {data.stack.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {data.stack.map((tech) => (
              <Badge key={tech} variant="secondary">
                {tech}
              </Badge>
            ))}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-3 pt-2">
          {data.repoUrl ? (
            <Button variant="outline" asChild>
              <a href={data.repoUrl} target="_blank" rel="noreferrer">
                Repo
              </a>
            </Button>
          ) : null}
          {data.liveUrl ? (
            <Button asChild>
              <a href={data.liveUrl} target="_blank" rel="noreferrer">
                Live demo
              </a>
            </Button>
          ) : null}
        </div>
        {hub ? (
          <div className="space-y-2 pt-2">
            <div className="text-muted-foreground flex items-center justify-between text-xs">
              <span>
                Progres pengembangan ({hub.done}/{hub.total} fase)
              </span>
              <span className="tabular-nums">{hub.progress}%</span>
            </div>
            <ProgressBar value={hub.progress} />
          </div>
        ) : null}
      </div>

      <article>
        <MDXRemote source={content} components={mdxComponents} />
      </article>
    </main>
  );
}
