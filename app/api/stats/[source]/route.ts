import { NextResponse } from "next/server";

import {
  getStats,
  isStatsSource,
  StatsNotConfiguredError,
  StatsNotImplementedError,
} from "@/lib/stats";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ source: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { source } = await context.params;

  if (!isStatsSource(source)) {
    return NextResponse.json({ error: "not_found", source }, { status: 404 });
  }

  try {
    const result = await getStats(source);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof StatsNotImplementedError) {
      return NextResponse.json(
        { error: "not_implemented", source },
        { status: 501 },
      );
    }

    if (error instanceof StatsNotConfiguredError) {
      return NextResponse.json(
        { error: "not_configured", source },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "upstream_error", source },
      { status: 502 },
    );
  }
}
