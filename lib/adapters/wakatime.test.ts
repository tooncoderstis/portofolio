import { afterEach, describe, expect, it, vi } from "vitest";

import { getWakatimeStats, normalizeWakatime } from "./wakatime";

const userFixture = {
  data: {
    username: "aasatech",
    display_name: "Aasa",
    created_at: "2026-09-27T09:11:38Z",
    last_language: "TypeScript",
  },
};

const statsFixture = {
  data: {
    total_seconds: 45000,
    daily_average: 3000,
    human_readable_total: "12 hrs 30 mins",
    human_readable_daily_average: "50 mins",
    languages: [
      {
        name: "TypeScript",
        percent: 74.5,
        total_seconds: 33525,
        text: "9 hrs 18 mins",
      },
      {
        name: "Go",
        percent: 25.5,
        total_seconds: 11475,
        text: "3 hrs 11 mins",
      },
    ],
    editors: [
      {
        name: "VS Code",
        percent: 100,
        total_seconds: 45000,
        text: "12 hrs 30 mins",
      },
    ],
    operating_systems: [
      {
        name: "Windows",
        percent: 100,
        total_seconds: 45000,
        text: "12 hrs 30 mins",
      },
    ],
  },
};

const summariesFixture = {
  data: [
    {
      grand_total: { total_seconds: 3600, text: "1 hr" },
      range: { date: "2026-09-21" },
    },
    {
      grand_total: { total_seconds: 0, text: "0 secs" },
      range: { date: "2026-09-22" },
    },
  ],
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("normalizeWakatime", () => {
  it("menormalkan profil, total, bahasa, dan aktivitas 7 hari", () => {
    const stats = normalizeWakatime(
      userFixture,
      statsFixture,
      summariesFixture,
      "2026-09-27T10:00:00.000Z",
    );

    expect(stats.displayName).toBe("Aasa");
    expect(stats.totalSeconds).toBe(45000);
    expect(stats.totalText).toBe("12 hrs 30 mins");
    expect(stats.languages).toHaveLength(2);
    expect(stats.languages[0]).toEqual({
      name: "TypeScript",
      percent: 74.5,
      totalSeconds: 33525,
      text: "9 hrs 18 mins",
    });
    expect(stats.last7Days).toHaveLength(2);
    expect(stats.last7Days[0]).toEqual({
      date: "2026-09-21",
      seconds: 3600,
      text: "1 hr",
    });
  });

  it("menurunkan bahasa dari ringkasan bila stats all_time kosong", () => {
    const stats = normalizeWakatime(
      userFixture,
      { data: { ...statsFixture.data, languages: [] } },
      {
        data: [
          {
            grand_total: { total_seconds: 3600, text: "1 hr" },
            range: { date: "2026-09-21" },
            languages: [
              {
                name: "TypeScript",
                percent: 100,
                total_seconds: 3600,
                text: "1 hr",
              },
            ],
          },
          {
            grand_total: { total_seconds: 1800, text: "30 mins" },
            range: { date: "2026-09-22" },
            languages: [
              { name: "TypeScript", percent: 60, total_seconds: 1080 },
              { name: "Go", percent: 40, total_seconds: 720 },
            ],
          },
        ],
      },
      "2026-09-27T10:00:00.000Z",
    );

    expect(stats.languages).toHaveLength(2);
    expect(stats.languages[0]).toMatchObject({
      name: "TypeScript",
      totalSeconds: 4680,
    });
  });
});

describe("getWakatimeStats", () => {
  it("mengirim Basic auth dan menggabungkan tiga permintaan", async () => {
    const mock = vi.fn(async (url: string | URL) => {
      const href = String(url);

      if (href.includes("/stats/all_time")) {
        return new Response(JSON.stringify(statsFixture), { status: 200 });
      }

      if (href.includes("/summaries")) {
        return new Response(JSON.stringify(summariesFixture), { status: 200 });
      }

      return new Response(JSON.stringify(userFixture), { status: 200 });
    });
    vi.stubGlobal("fetch", mock);

    const stats = await getWakatimeStats(
      { apiKey: "waka_secret" },
      new Date("2026-09-27T10:00:00.000Z"),
    );

    expect(stats.totalSeconds).toBe(45000);
    expect(mock).toHaveBeenCalledTimes(3);

    const calls = mock.mock.calls as unknown as Array<
      [unknown, RequestInit | undefined]
    >;
    const headers = calls[0]?.[1]?.headers as
      Record<string, string> | undefined;
    expect(headers?.authorization).toMatch(/^Basic /);
  });
});
