import "server-only";

import { getGithubStats } from "./adapters/github";
import { getMonkeytypeStats } from "./adapters/monkeytype";
import { getWakatimeStats } from "./adapters/wakatime";
import { getCached, getStale, setCached, setStale } from "./cache";
import { upsertSnapshot } from "./db";
import { env } from "./env";

export const STATS_SOURCES = [
  "github",
  "wakatime",
  "umami",
  "monkeytype",
] as const;

export type StatsSource = (typeof STATS_SOURCES)[number];

export function isStatsSource(value: string): value is StatsSource {
  return (STATS_SOURCES as readonly string[]).includes(value);
}

export const CACHE_VERSION = "v1";

export function cacheKey(source: StatsSource): string {
  return `${source}:${CACHE_VERSION}`;
}

export class StatsNotConfiguredError extends Error {
  constructor(source: StatsSource) {
    super(`Sumber '${source}' belum dikonfigurasi.`);
    this.name = "StatsNotConfiguredError";
  }
}

export class StatsNotImplementedError extends Error {
  constructor(source: StatsSource) {
    super(`Sumber '${source}' belum diimplementasikan.`);
    this.name = "StatsNotImplementedError";
  }
}

type CacheEntry = {
  data: unknown;
  fetchedAt: string;
};

export type StatsMeta = {
  source: StatsSource;
  stale: boolean;
  cached: boolean;
  fetchedAt: string;
};

export type StatsResponse = {
  source: StatsSource;
  meta: StatsMeta;
  data: unknown;
};

async function fetchSource(source: StatsSource): Promise<unknown> {
  switch (source) {
    case "github": {
      if (!env.GITHUB_TOKEN || !env.GITHUB_USERNAME) {
        throw new StatsNotConfiguredError(source);
      }

      return getGithubStats({
        token: env.GITHUB_TOKEN,
        username: env.GITHUB_USERNAME,
      });
    }

    case "wakatime": {
      if (!env.WAKATIME_API_KEY) {
        throw new StatsNotConfiguredError(source);
      }

      return getWakatimeStats({ apiKey: env.WAKATIME_API_KEY });
    }

    case "monkeytype": {
      if (!env.MONKEYTYPE_USERNAME) {
        throw new StatsNotConfiguredError(source);
      }

      return getMonkeytypeStats({
        username: env.MONKEYTYPE_USERNAME,
        apiKey: env.MONKEYTYPE_API_KEY,
      });
    }

    case "umami":
      throw new StatsNotImplementedError(source);
  }
}

async function saveSnapshot(
  source: StatsSource,
  data: unknown,
  now: Date,
): Promise<void> {
  try {
    await upsertSnapshot({
      source,
      capturedOn: now.toISOString().slice(0, 10),
      payload: data,
    });
  } catch {
    // snapshot bersifat best-effort; kegagalan tidak boleh menjatuhkan respons
  }
}

export async function getStats(
  source: StatsSource,
  now: Date = new Date(),
): Promise<StatsResponse> {
  const key = cacheKey(source);
  const cached = await getCached<CacheEntry>(key);

  if (cached) {
    return {
      source,
      data: cached.data,
      meta: { source, stale: false, cached: true, fetchedAt: cached.fetchedAt },
    };
  }

  try {
    const data = await fetchSource(source);
    const entry: CacheEntry = { data, fetchedAt: now.toISOString() };

    await setCached(key, entry);
    await setStale(key, entry);
    await saveSnapshot(source, data, now);

    return {
      source,
      data,
      meta: { source, stale: false, cached: false, fetchedAt: entry.fetchedAt },
    };
  } catch (error) {
    if (
      error instanceof StatsNotConfiguredError ||
      error instanceof StatsNotImplementedError
    ) {
      throw error;
    }

    const stale = await getStale<CacheEntry>(key);

    if (stale) {
      return {
        source,
        data: stale.data,
        meta: {
          source,
          stale: true,
          cached: true,
          fetchedAt: stale.fetchedAt,
        },
      };
    }

    throw error;
  }
}
