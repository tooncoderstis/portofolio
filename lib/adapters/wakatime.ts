import { z } from "zod";

import { fetchJson } from "../http";

const entrySchema = z.object({
  name: z.string(),
  percent: z.number().optional(),
  total_seconds: z.number().optional(),
  text: z.string().optional(),
});

const userSchema = z.object({
  data: z.object({
    username: z.string().nullable().optional(),
    display_name: z.string().nullable().optional(),
    created_at: z.string(),
    last_language: z.string().nullable().optional(),
  }),
});

const statsSchema = z.object({
  data: z.object({
    total_seconds: z.number(),
    daily_average: z.number().optional(),
    human_readable_total: z.string().optional(),
    human_readable_daily_average: z.string().optional(),
    languages: z.array(entrySchema).optional(),
    editors: z.array(entrySchema).optional(),
    operating_systems: z.array(entrySchema).optional(),
  }),
});

const summariesSchema = z.object({
  data: z.array(
    z.object({
      grand_total: z.object({
        total_seconds: z.number(),
        text: z.string().optional(),
      }),
      range: z.object({ date: z.string() }),
      languages: z.array(entrySchema).optional(),
    }),
  ),
});

export type WakatimeEntry = {
  name: string;
  percent: number;
  totalSeconds: number;
  text: string;
};

export type WakatimeStats = {
  source: "wakatime";
  username: string | null;
  displayName: string | null;
  joinedAt: string;
  lastLanguage: string | null;
  totalSeconds: number;
  totalText: string;
  dailyAverageSeconds: number;
  dailyAverageText: string;
  languages: WakatimeEntry[];
  editors: WakatimeEntry[];
  operatingSystems: WakatimeEntry[];
  last7Days: { date: string; seconds: number; text: string }[];
  fetchedAt: string;
};

export type WakatimeConfig = {
  apiKey: string;
};

const WAKATIME_API = "https://wakatime.com/api/v1";

function toEntry(entry: z.infer<typeof entrySchema>): WakatimeEntry {
  return {
    name: entry.name,
    percent: entry.percent ?? 0,
    totalSeconds: entry.total_seconds ?? 0,
    text: entry.text ?? "",
  };
}

function aggregateLanguages(
  summaries: z.infer<typeof summariesSchema>["data"],
): WakatimeEntry[] {
  const totals = new Map<string, number>();

  for (const day of summaries) {
    for (const language of day.languages ?? []) {
      totals.set(
        language.name,
        (totals.get(language.name) ?? 0) + (language.total_seconds ?? 0),
      );
    }
  }

  const total = [...totals.values()].reduce((sum, value) => sum + value, 0);

  if (total === 0) return [];

  return [...totals.entries()]
    .map(([name, totalSeconds]) => ({
      name,
      totalSeconds,
      percent: Math.round((totalSeconds / total) * 1000) / 10,
      text: "",
    }))
    .sort((a, b) => b.totalSeconds - a.totalSeconds);
}

export function normalizeWakatime(
  userRaw: unknown,
  statsRaw: unknown,
  summariesRaw: unknown,
  fetchedAt: string,
): WakatimeStats {
  const user = userSchema.parse(userRaw).data;
  const stats = statsSchema.parse(statsRaw).data;
  const summaries = summariesSchema.parse(summariesRaw).data;

  const languagesFromStats = (stats.languages ?? []).map(toEntry);
  const languages =
    languagesFromStats.length > 0
      ? languagesFromStats
      : aggregateLanguages(summaries);

  return {
    source: "wakatime",
    username: user.username ?? null,
    displayName: user.display_name ?? null,
    joinedAt: user.created_at,
    lastLanguage: user.last_language ?? null,
    totalSeconds: stats.total_seconds,
    totalText: stats.human_readable_total ?? "0 secs",
    dailyAverageSeconds: stats.daily_average ?? 0,
    dailyAverageText: stats.human_readable_daily_average ?? "0 secs",
    languages,
    editors: (stats.editors ?? []).map(toEntry),
    operatingSystems: (stats.operating_systems ?? []).map(toEntry),
    last7Days: summaries.map((day) => ({
      date: day.range.date,
      seconds: day.grand_total.total_seconds,
      text: day.grand_total.text ?? "0 secs",
    })),
    fetchedAt,
  };
}

export async function getWakatimeStats(
  { apiKey }: WakatimeConfig,
  now: Date = new Date(),
): Promise<WakatimeStats> {
  const headers = {
    authorization: `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`,
    accept: "application/json",
    "user-agent": "portofolio",
  };

  const [userRaw, statsRaw, summariesRaw] = await Promise.all([
    fetchJson<unknown>(`${WAKATIME_API}/users/current`, { headers }),
    fetchJson<unknown>(`${WAKATIME_API}/users/current/stats/all_time`, {
      headers,
    }),
    fetchJson<unknown>(
      `${WAKATIME_API}/users/current/summaries?range=last_7_days`,
      { headers },
    ),
  ]);

  return normalizeWakatime(userRaw, statsRaw, summariesRaw, now.toISOString());
}
