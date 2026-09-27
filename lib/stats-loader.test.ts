import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getStats: vi.fn(),
  NotConfigured: class NotConfigured extends Error {},
  NotImplemented: class NotImplemented extends Error {},
}));

vi.mock("./stats", () => ({
  getStats: mocks.getStats,
  StatsNotConfiguredError: mocks.NotConfigured,
  StatsNotImplementedError: mocks.NotImplemented,
}));

import { loadStats } from "./stats-loader";

beforeEach(() => {
  mocks.getStats.mockReset();
});

describe("loadStats", () => {
  it("mengembalikan status ok saat berhasil", async () => {
    mocks.getStats.mockResolvedValue({ source: "github", meta: {}, data: {} });

    const result = await loadStats("github");

    expect(result.status).toBe("ok");
  });

  it("menandai not_implemented", async () => {
    mocks.getStats.mockRejectedValue(new mocks.NotImplemented());

    const result = await loadStats("wakatime");

    expect(result).toEqual({
      status: "unavailable",
      reason: "not_implemented",
    });
  });

  it("menandai not_configured", async () => {
    mocks.getStats.mockRejectedValue(new mocks.NotConfigured());

    const result = await loadStats("github");

    expect(result).toEqual({
      status: "unavailable",
      reason: "not_configured",
    });
  });

  it("menandai error generik", async () => {
    mocks.getStats.mockRejectedValue(new Error("boom"));

    const result = await loadStats("github");

    expect(result).toEqual({ status: "error" });
  });
});
