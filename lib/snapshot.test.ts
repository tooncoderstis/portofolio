import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  refreshStats: vi.fn(),
  NotConfigured: class NotConfigured extends Error {},
  NotImplemented: class NotImplemented extends Error {},
}));

vi.mock("./stats", () => ({
  refreshStats: mocks.refreshStats,
  StatsNotConfiguredError: mocks.NotConfigured,
  StatsNotImplementedError: mocks.NotImplemented,
  STATS_SOURCES: ["github", "wakatime", "umami", "monkeytype"],
}));

import { snapshotAll } from "./snapshot";

describe("snapshotAll", () => {
  it("menandai ok/skipped/error per sumber", async () => {
    mocks.refreshStats.mockImplementation(async (source: string) => {
      if (source === "umami") throw new mocks.NotImplemented();
      if (source === "monkeytype") throw new mocks.NotConfigured();
      if (source === "wakatime") throw new Error("upstream down");
      return { source, meta: {}, data: {} };
    });

    const results = await snapshotAll();

    const byStatus = Object.fromEntries(
      results.map((result) => [result.source, result.status]),
    );

    expect(byStatus).toEqual({
      github: "ok",
      wakatime: "error",
      umami: "skipped",
      monkeytype: "skipped",
    });
  });

  it("meneruskan timestamp ke refreshStats", async () => {
    mocks.refreshStats.mockResolvedValue({
      source: "github",
      meta: {},
      data: {},
    });

    const now = new Date("2026-09-27T00:00:00.000Z");
    await snapshotAll(now);

    expect(mocks.refreshStats).toHaveBeenCalledWith("github", now);
  });
});
