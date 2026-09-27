import { NextResponse } from "next/server";

import { getTrend } from "@/lib/trends";
import { isStatsSource } from "@/lib/stats";

export const dynamic = "force-dynamic";

const MAX_DAYS = 365;

type RouteContext = { params: Promise<{ source: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { source } = await context.params;

  if (!isStatsSource(source)) {
    return NextResponse.json({ error: "not_found", source }, { status: 404 });
  }

  const rawDays = Number(new URL(request.url).searchParams.get("days") ?? 30);
  const days = Number.isFinite(rawDays)
    ? Math.min(Math.max(Math.trunc(rawDays), 1), MAX_DAYS)
    : 30;

  try {
    const trend = await getTrend(source, days);

    return NextResponse.json(trend, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "trend_unavailable", source },
      { status: 502 },
    );
  }
}
