import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({ getSnapshots: vi.fn() }));

vi.mock("./db", () => ({ getSnapshots: db.getSnapshots }));

import { extractMetric, getTrend } from "./trends";

beforeEach(() => {
  db.getSnapshots.mockReset();
});

describe("extractMetric", () => {
  it("mengambil metrik yang tepat per sumber", () => {
    expect(extractMetric("github", { contributions: { total: 17 } })).toBe(17);
    expect(extractMetric("wakatime", { totalSeconds: 3600 })).toBe(3600);
    expect(extractMetric("monkeytype", { bestWpm: 60.5 })).toBe(60.5);
    expect(extractMetric("umami", { pageviews: 10 })).toBeNull();
  });

  it("mengembalikan null untuk payload tak valid", () => {
    expect(extractMetric("github", null)).toBeNull();
    expect(extractMetric("github", { contributions: {} })).toBeNull();
  });
});

describe("getTrend", () => {
  it("memetakan snapshot ke deret waktu", async () => {
    db.getSnapshots.mockResolvedValue([
      { capturedOn: "2026-09-25", payload: { contributions: { total: 10 } } },
      { capturedOn: "2026-09-26", payload: { contributions: { total: 15 } } },
    ]);

    const trend = await getTrend("github", 30);

    expect(trend.points).toEqual([
      { date: "2026-09-25", value: 10 },
      { date: "2026-09-26", value: 15 },
    ]);
    expect(db.getSnapshots).toHaveBeenCalledWith("github", 30);
  });
});
