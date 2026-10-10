import { NextResponse } from "next/server";

import { isIngestAuthorized } from "@/lib/hub/ingest-auth";
import { registerPayloadSchema } from "@/lib/hub/schema";
import { pruneMissingProjects, upsertProject } from "@/lib/hub/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isIngestAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = registerPayloadSchema.safeParse(
    await request.json().catch(() => null),
  );

  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_body", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { projects, prune } = parsed.data;

  if (prune && projects.length === 0) {
    return NextResponse.json({ error: "empty_projects" }, { status: 400 });
  }

  for (const project of projects) {
    await upsertProject({
      slug: project.slug,
      name: project.name,
      path: project.path,
    });
  }

  const pruned = prune
    ? await pruneMissingProjects(projects.map((project) => project.slug))
    : [];

  return NextResponse.json({ registered: projects.length, pruned });
}
