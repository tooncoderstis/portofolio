import "server-only";

import {
  refreshStats,
  STATS_SOURCES,
  StatsNotConfiguredError,
  StatsNotImplementedError,
  type StatsSource,
} from "./stats";

export type SnapshotResult = {
  source: StatsSource;
  status: "ok" | "skipped" | "error";
  message?: string;
};

export async function snapshotAll(
  now: Date = new Date(),
): Promise<SnapshotResult[]> {
  const results: SnapshotResult[] = [];

  for (const source of STATS_SOURCES) {
    try {
      await refreshStats(source, now);
      results.push({ source, status: "ok" });
    } catch (error) {
      if (
        error instanceof StatsNotImplementedError ||
        error instanceof StatsNotConfiguredError
      ) {
        results.push({ source, status: "skipped", message: error.message });
        continue;
      }

      results.push({
        source,
        status: "error",
        message:
          error instanceof Error ? error.message : "kesalahan tidak dikenal",
      });
    }
  }

  return results;
}
