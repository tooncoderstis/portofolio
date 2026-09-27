import { afterEach, describe, expect, it, vi } from "vitest";

import { getMonkeytypeStats, normalizeMonkeytype } from "./monkeytype";

const profileFixture = {
  data: {
    name: "aasatech",
    addedAt: 1790500744322,
    typingStats: { completedTests: 3, startedTests: 3, timeTyping: 90.02 },
    personalBests: {
      time: {
        "15": [{ wpm: 70, acc: 95, consistency: 80 }],
        "30": [{ wpm: 60.78, acc: 96.2, consistency: 70.21 }],
      },
      words: {},
    },
    xp: 187,
    streak: 1,
    maxStreak: 2,
  },
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("normalizeMonkeytype", () => {
  it("memilih WPM terbaik lintas durasi", () => {
    const stats = normalizeMonkeytype(
      profileFixture,
      "2026-09-27T10:00:00.000Z",
    );

    expect(stats.bestWpm).toBe(70);
    expect(stats.bestAccuracy).toBe(95);
    expect(stats.bestsByDuration.map((entry) => entry.duration)).toEqual([
      "15",
      "30",
    ]);
    expect(stats.completedTests).toBe(3);
    expect(stats.maxStreak).toBe(2);
  });

  it("mengembalikan null bila belum ada personal best", () => {
    const stats = normalizeMonkeytype(
      {
        data: {
          ...profileFixture.data,
          personalBests: { time: {}, words: {} },
        },
      },
      "2026-09-27T10:00:00.000Z",
    );

    expect(stats.bestWpm).toBeNull();
    expect(stats.bestsByDuration).toEqual([]);
  });
});

describe("getMonkeytypeStats", () => {
  it("menambahkan header ApeKey hanya bila apiKey diberikan", async () => {
    const mock = vi.fn(
      async () => new Response(JSON.stringify(profileFixture), { status: 200 }),
    );
    vi.stubGlobal("fetch", mock);

    await getMonkeytypeStats({ username: "aasatech" });
    await getMonkeytypeStats({ username: "aasatech", apiKey: "ape_123" });

    const calls = mock.mock.calls as unknown as Array<
      [unknown, RequestInit | undefined]
    >;
    const withoutKey = calls[0]?.[1]?.headers as
      Record<string, string> | undefined;
    expect(withoutKey?.authorization).toBeUndefined();

    const withKey = calls[1]?.[1]?.headers as
      Record<string, string> | undefined;
    expect(withKey?.authorization).toBe("ApeKey ape_123");
  });
});
