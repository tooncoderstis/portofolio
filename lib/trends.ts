import "server-only";

import { getSnapshots } from "./db";
import type { StatsSource } from "./stats";

export function extractMetric(
  source: StatsSource,
  payload: unknown,
): number | null {
  if (typeof payload !== "object" || payload === null) return null;

  const data = payload as Record<string, unknown>;

  switch (source) {
    case "github": {
      const contributions = data.contributions as
        { total?: unknown } | undefined;

      return typeof contributions?.total === "number"
        ? contributions.total
        : null;
    }

    case "wakatime":
      return typeof data.totalSeconds === "number" ? data.totalSeconds : null;

    case "monkeytype":
      return typeof data.bestWpm === "number" ? data.bestWpm : null;

    case "umami":
      return null;
  }
}

export type TrendPoint = { date: string; value: number | null };

export type Trend = {
  source: StatsSource;
  days: number;
  points: TrendPoint[];
};

export async function getTrend(source: StatsSource, days = 30): Promise<Trend> {
  const rows = await getSnapshots(source, days);

  return {
    source,
    days,
    points: rows.map((row) => ({
      date: row.capturedOn,
      value: extractMetric(source, row.payload),
    })),
  };
}
