import { NextResponse } from "next/server";

import { isOwner } from "@/lib/hub/session";
import { getProject, listDecisions } from "@/lib/hub/store";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  if (!(await isOwner())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { slug } = await context.params;
  const project = await getProject(slug);

  if (!project) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    project,
    decisions: await listDecisions(slug),
  });
}
