import "server-only";

import {
  getStats,
  StatsNotConfiguredError,
  StatsNotImplementedError,
  type StatsResponse,
  type StatsSource,
} from "./stats";

export type LoadResult =
  | { status: "ok"; data: StatsResponse }
  | { status: "unavailable"; reason: "not_configured" | "not_implemented" }
  | { status: "error" };

export async function loadStats(source: StatsSource): Promise<LoadResult> {
  try {
    return { status: "ok", data: await getStats(source) };
  } catch (error) {
    if (error instanceof StatsNotImplementedError) {
      return { status: "unavailable", reason: "not_implemented" };
    }

    if (error instanceof StatsNotConfiguredError) {
      return { status: "unavailable", reason: "not_configured" };
    }

    return { status: "error" };
  }
}
