import { afterEach, describe, expect, it, vi } from "vitest";

import { computeStreaks, getGithubStats, normalizeGithub } from "./github";

const graphFixture = {
  data: {
    user: {
      login: "aasatech",
      name: "Aasa",
      avatarUrl: "https://avatars.example/u/1",
      bio: "Builder",
      followers: { totalCount: 12 },
      repositories: { totalCount: 34 },
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: 5,
          weeks: [
            {
              contributionDays: [
                {
                  date: "2026-09-20",
                  contributionCount: 0,
                  contributionLevel: "NONE",
                },
                {
                  date: "2026-09-21",
                  contributionCount: 2,
                  contributionLevel: "SECOND_QUARTILE",
                },
                {
                  date: "2026-09-22",
                  contributionCount: 1,
                  contributionLevel: "FIRST_QUARTILE",
                },
                {
                  date: "2026-09-23",
                  contributionCount: 0,
                  contributionLevel: "NONE",
                },
                {
                  date: "2026-09-24",
                  contributionCount: 2,
                  contributionLevel: "THIRD_QUARTILE",
                },
              ],
            },
          ],
        },
      },
    },
  },
};

const reposFixture = [
  { language: "TypeScript", fork: false, archived: false },
  { language: "TypeScript", fork: false, archived: false },
  { language: "Go", fork: false, archived: false },
  { language: "Go", fork: true, archived: false },
  { language: null, fork: false, archived: false },
];

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("computeStreaks", () => {
  it("menghitung streak saat ini dan terpanjang", () => {
    const days = [
      { date: "2026-09-20", count: 0 },
      { date: "2026-09-21", count: 2 },
      { date: "2026-09-22", count: 1 },
      { date: "2026-09-23", count: 0 },
      { date: "2026-09-24", count: 2 },
    ];

    expect(computeStreaks(days, "2026-09-24")).toEqual({
      current: 1,
      longest: 2,
    });
  });

  it("mengabaikan hari ini bila nol", () => {
    const days = [
      { date: "2026-09-21", count: 1 },
      { date: "2026-09-22", count: 1 },
      { date: "2026-09-23", count: 0 },
    ];

    expect(computeStreaks(days, "2026-09-23").current).toBe(2);
  });
});

describe("normalizeGithub", () => {
  it("menormalkan profil, kontribusi, kalender, dan bahasa", () => {
    const stats = normalizeGithub(
      graphFixture,
      reposFixture,
      "2026-09-24",
      "2026-09-24T10:00:00.000Z",
    );

    expect(stats.username).toBe("aasatech");
    expect(stats.profile.followers).toBe(12);
    expect(stats.contributions.total).toBe(5);
    expect(stats.calendar).toHaveLength(5);
    expect(stats.calendarWeeks).toHaveLength(1);
    expect(stats.calendarWeeks[0]).toHaveLength(5);
    expect(stats.calendar[1]).toEqual({
      date: "2026-09-21",
      count: 2,
      level: 2,
    });
    expect(stats.streak).toEqual({ current: 1, longest: 2 });
    expect(stats.topLanguages[0]).toEqual({
      name: "TypeScript",
      count: 2,
      percent: 66.7,
    });
  });

  it("melempar error bila GraphQL mengembalikan errors", () => {
    expect(() =>
      normalizeGithub(
        { data: { user: null }, errors: [{ message: "Bad credentials" }] },
        [],
        "2026-09-24",
        "2026-09-24T10:00:00.000Z",
      ),
    ).toThrow(/Bad credentials/);
  });
});

describe("getGithubStats", () => {
  it("menggabungkan GraphQL dan REST lalu menormalkan", async () => {
    const mock = vi.fn(async (url: string | URL) =>
      String(url).includes("/graphql")
        ? new Response(JSON.stringify(graphFixture), { status: 200 })
        : new Response(JSON.stringify(reposFixture), { status: 200 }),
    );
    vi.stubGlobal("fetch", mock);

    const stats = await getGithubStats(
      { token: "tok", username: "aasatech" },
      new Date("2026-09-24T10:00:00.000Z"),
    );

    expect(stats.contributions.total).toBe(5);
    expect(mock).toHaveBeenCalledTimes(2);
  });
});
