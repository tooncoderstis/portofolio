import { z } from "zod";

import { fetchJson } from "../http";

const contributionLevels = [
  "NONE",
  "FIRST_QUARTILE",
  "SECOND_QUARTILE",
  "THIRD_QUARTILE",
  "FOURTH_QUARTILE",
] as const;

const levelMap: Record<(typeof contributionLevels)[number], 0 | 1 | 2 | 3 | 4> =
  {
    NONE: 0,
    FIRST_QUARTILE: 1,
    SECOND_QUARTILE: 2,
    THIRD_QUARTILE: 3,
    FOURTH_QUARTILE: 4,
  };

const graphSchema = z.object({
  data: z.object({
    user: z
      .object({
        login: z.string(),
        name: z.string().nullable(),
        avatarUrl: z.string(),
        bio: z.string().nullable(),
        followers: z.object({ totalCount: z.number() }),
        repositories: z.object({ totalCount: z.number() }),
        contributionsCollection: z.object({
          contributionCalendar: z.object({
            totalContributions: z.number(),
            weeks: z.array(
              z.object({
                contributionDays: z.array(
                  z.object({
                    date: z.string(),
                    contributionCount: z.number(),
                    contributionLevel: z.enum(contributionLevels),
                  }),
                ),
              }),
            ),
          }),
        }),
      })
      .nullable(),
  }),
  errors: z.array(z.object({ message: z.string() })).optional(),
});

const reposSchema = z.array(
  z.object({
    language: z.string().nullable(),
    fork: z.boolean(),
    archived: z.boolean(),
  }),
);

export type GithubCalendarDay = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

export type GithubLanguage = {
  name: string;
  count: number;
  percent: number;
};

export type GithubStats = {
  source: "github";
  username: string;
  fetchedAt: string;
  profile: {
    name: string | null;
    avatarUrl: string;
    bio: string | null;
    followers: number;
    publicRepos: number;
  };
  contributions: { total: number };
  streak: { current: number; longest: number };
  calendar: GithubCalendarDay[];
  topLanguages: GithubLanguage[];
};

export type GithubConfig = {
  token: string;
  username: string;
};

const GITHUB_API = "https://api.github.com";
const GITHUB_GRAPHQL = `${GITHUB_API}/graphql`;

const CONTRIBUTIONS_QUERY = `
query Contributions($login: String!) {
  user(login: $login) {
    login
    name
    avatarUrl
    bio
    followers { totalCount }
    repositories(privacy: PUBLIC, ownerAffiliations: OWNER, isFork: false) { totalCount }
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            contributionLevel
          }
        }
      }
    }
  }
}`;

export function computeStreaks(
  days: { date: string; count: number }[],
  today: string,
): { current: number; longest: number } {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));

  let longest = 0;
  let run = 0;

  for (const day of sorted) {
    if (day.count > 0) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 0;
    }
  }

  let end = sorted.length - 1;

  const last = sorted[end];

  if (last && last.count === 0 && last.date === today) {
    end -= 1;
  }

  let current = 0;

  for (let i = end; i >= 0; i -= 1) {
    const day = sorted[i];

    if (day && day.count > 0) {
      current += 1;
    } else {
      break;
    }
  }

  return { current, longest };
}

function topLanguages(repos: z.infer<typeof reposSchema>): GithubLanguage[] {
  const counts = new Map<string, number>();

  for (const repo of repos) {
    if (repo.fork || repo.archived || !repo.language) continue;

    counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1);
  }

  const total = [...counts.values()].reduce((sum, value) => sum + value, 0);

  if (total === 0) return [];

  return [...counts.entries()]
    .map(([name, count]) => ({
      name,
      count,
      percent: Math.round((count / total) * 1000) / 10,
    }))
    .sort((a, b) => b.count - a.count);
}

export function normalizeGithub(
  graphRaw: unknown,
  reposRaw: unknown,
  today: string,
  fetchedAt: string,
): GithubStats {
  const graph = graphSchema.parse(graphRaw);

  if (graph.errors?.length) {
    throw new Error(
      `GitHub GraphQL error: ${graph.errors.map((e) => e.message).join("; ")}`,
    );
  }

  const user = graph.data.user;

  if (!user) {
    throw new Error("GitHub user tidak ditemukan.");
  }

  const repos = reposSchema.parse(reposRaw);
  const weeks = user.contributionsCollection.contributionCalendar.weeks;

  const calendar: GithubCalendarDay[] = weeks.flatMap((week) =>
    week.contributionDays.map((day) => ({
      date: day.date,
      count: day.contributionCount,
      level: levelMap[day.contributionLevel],
    })),
  );

  const streak = computeStreaks(
    calendar.map((day) => ({ date: day.date, count: day.count })),
    today,
  );

  return {
    source: "github",
    username: user.login,
    fetchedAt,
    profile: {
      name: user.name,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      followers: user.followers.totalCount,
      publicRepos: user.repositories.totalCount,
    },
    contributions: {
      total:
        user.contributionsCollection.contributionCalendar.totalContributions,
    },
    streak,
    calendar,
    topLanguages: topLanguages(repos),
  };
}

export async function getGithubStats(
  { token, username }: GithubConfig,
  now: Date = new Date(),
): Promise<GithubStats> {
  const headers = {
    authorization: `bearer ${token}`,
    accept: "application/vnd.github+json",
    "user-agent": "portofolio",
    "x-github-api-version": "2022-11-28",
  };

  const [graphRaw, reposRaw] = await Promise.all([
    fetchJson<unknown>(GITHUB_GRAPHQL, {
      method: "POST",
      headers: { ...headers, "content-type": "application/json" },
      body: JSON.stringify({
        query: CONTRIBUTIONS_QUERY,
        variables: { login: username },
      }),
    }),
    fetchJson<unknown>(
      `${GITHUB_API}/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed&type=owner`,
      { headers },
    ),
  ]);

  return normalizeGithub(
    graphRaw,
    reposRaw,
    now.toISOString().slice(0, 10),
    now.toISOString(),
  );
}
