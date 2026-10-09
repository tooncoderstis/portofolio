import { NextResponse } from "next/server";

import { isIngestAuthorized } from "@/lib/hub/ingest-auth";
import { runIngest } from "@/lib/hub/ingest";
import { ingestPayloadSchema } from "@/lib/hub/schema";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isIngestAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = ingestPayloadSchema.safeParse(
    await request.json().catch(() => null),
  );

  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_body", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const result = await runIngest(parsed.data);

  return NextResponse.json(
    { ranAt: new Date().toISOString(), ...result },
    { status: 200 },
  );
}
