import { NextResponse } from "next/server";

import { isOwner } from "@/lib/hub/session";
import { decisionPayloadSchema } from "@/lib/hub/schema";
import { createDecision, getProject } from "@/lib/hub/store";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ slug: string }> };

export async function POST(request: Request, context: RouteContext) {
  if (!(await isOwner())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { slug } = await context.params;

  if (!(await getProject(slug))) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const parsed = decisionPayloadSchema.safeParse(
    await request.json().catch(() => null),
  );

  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  await createDecision({
    project: slug,
    action: parsed.data.action,
    phaseId: parsed.data.phaseId ?? null,
    note: parsed.data.note ?? null,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
