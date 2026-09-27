import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { snapshotAll } from "@/lib/snapshot";

export const dynamic = "force-dynamic";

function isAuthorized(request: Request): boolean {
  if (!env.SNAPSHOT_SECRET) {
    return env.NODE_ENV !== "production";
  }

  const url = new URL(request.url);
  const provided =
    request.headers.get("x-snapshot-secret") ?? url.searchParams.get("secret");

  return provided === env.SNAPSHOT_SECRET;
}

async function run(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const results = await snapshotAll();

  return NextResponse.json(
    { ranAt: new Date().toISOString(), results },
    { status: 200 },
  );
}

export async function GET(request: Request) {
  return run(request);
}

export async function POST(request: Request) {
  return run(request);
}
