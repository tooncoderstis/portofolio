import { z } from "zod";

import { fetchJson } from "../http";

const resultSchema = z.object({
  wpm: z.number(),
  acc: z.number(),
  consistency: z.number().optional(),
  timestamp: z.number().optional(),
});

const profileSchema = z.object({
  data: z.object({
    name: z.string(),
    addedAt: z.number(),
    typingStats: z.object({
      completedTests: z.number(),
      startedTests: z.number(),
      timeTyping: z.number(),
    }),
    personalBests: z.object({
      time: z.record(z.string(), z.array(resultSchema)),
      words: z.record(z.string(), z.array(resultSchema)).optional(),
    }),
    xp: z.number().optional(),
    streak: z.number().optional(),
    maxStreak: z.number().optional(),
  }),
});

export type MonkeytypeBest = {
  duration: string;
  wpm: number;
  acc: number;
  consistency: number | null;
};

export type MonkeytypeStats = {
  source: "monkeytype";
  name: string;
  addedAt: string;
  completedTests: number;
  startedTests: number;
  timeTypingSeconds: number;
  xp: number;
  streak: number;
  maxStreak: number;
  bestWpm: number | null;
  bestAccuracy: number | null;
  bestsByDuration: MonkeytypeBest[];
  fetchedAt: string;
};

export type MonkeytypeConfig = {
  username: string;
  apiKey?: string;
};

const MONKEYTYPE_API = "https://api.monkeytype.com";

export function normalizeMonkeytype(
  profileRaw: unknown,
  fetchedAt: string,
): MonkeytypeStats {
  const profile = profileSchema.parse(profileRaw).data;
  const time = profile.personalBests.time;

  const bestsByDuration: MonkeytypeBest[] = Object.entries(time)
    .map(([duration, results]) => {
      const best = results.reduce<z.infer<typeof resultSchema> | null>(
        (acc, result) => (acc === null || result.wpm > acc.wpm ? result : acc),
        null,
      );

      return best
        ? {
            duration,
            wpm: best.wpm,
            acc: best.acc,
            consistency: best.consistency ?? null,
          }
        : null;
    })
    .filter((entry): entry is MonkeytypeBest => entry !== null)
    .sort((a, b) => Number(a.duration) - Number(b.duration));

  const overallBest = bestsByDuration.reduce<MonkeytypeBest | null>(
    (acc, entry) => (acc === null || entry.wpm > acc.wpm ? entry : acc),
    null,
  );

  return {
    source: "monkeytype",
    name: profile.name,
    addedAt: new Date(profile.addedAt).toISOString(),
    completedTests: profile.typingStats.completedTests,
    startedTests: profile.typingStats.startedTests,
    timeTypingSeconds: profile.typingStats.timeTyping,
    xp: profile.xp ?? 0,
    streak: profile.streak ?? 0,
    maxStreak: profile.maxStreak ?? 0,
    bestWpm: overallBest?.wpm ?? null,
    bestAccuracy: overallBest?.acc ?? null,
    bestsByDuration,
    fetchedAt,
  };
}

export async function getMonkeytypeStats(
  { username, apiKey }: MonkeytypeConfig,
  now: Date = new Date(),
): Promise<MonkeytypeStats> {
  const headers: Record<string, string> = {
    accept: "application/json",
    "user-agent": "portofolio",
  };

  if (apiKey) {
    headers.authorization = `ApeKey ${apiKey}`;
  }

  const profileRaw = await fetchJson<unknown>(
    `${MONKEYTYPE_API}/users/${encodeURIComponent(username)}/profile`,
    { headers },
  );

  return normalizeMonkeytype(profileRaw, now.toISOString());
}
