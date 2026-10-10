import { NextResponse } from "next/server";

import { detectPlatform } from "@/lib/ideas/platform";
import {
  ideaCreateSchema,
  ideaPlatformSchema,
  ideaStatusSchema,
} from "@/lib/hub/schema";
import { isOwner } from "@/lib/hub/session";
import { createIdea, listIdeas } from "@/lib/hub/store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isOwner())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const project = searchParams.get("project") ?? undefined;
  const tag = searchParams.get("tag") ?? undefined;
  const platformRaw = searchParams.get("platform");
  const statusRaw = searchParams.get("status");

  const platform = platformRaw
    ? ideaPlatformSchema.safeParse(platformRaw)
    : null;
  const status = statusRaw ? ideaStatusSchema.safeParse(statusRaw) : null;

  if ((platform && !platform.success) || (status && !status.success)) {
    return NextResponse.json({ error: "invalid_filter" }, { status: 400 });
  }

  const ideas = await listIdeas({
    project,
    tag,
    platform: platform?.data,
    status: status?.data,
  });

  return NextResponse.json({ ideas });
}

export async function POST(request: Request) {
  if (!(await isOwner())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = ideaCreateSchema.safeParse(
    await request.json().catch(() => null),
  );

  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_body", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const platform =
    parsed.data.platform ?? detectPlatform(parsed.data.sourceUrl);

  const idea = await createIdea({ ...parsed.data, platform });

  return NextResponse.json({ idea }, { status: 201 });
}
