import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getStats: vi.fn(),
  NotConfigured: class NotConfigured extends Error {},
  NotImplemented: class NotImplemented extends Error {},
}));

vi.mock("@/lib/stats", () => ({
  isStatsSource: (value: string) =>
    ["github", "wakatime", "umami", "monkeytype"].includes(value),
  getStats: mocks.getStats,
  StatsNotConfiguredError: mocks.NotConfigured,
  StatsNotImplementedError: mocks.NotImplemented,
}));

import { GET } from "./route";

const context = (source: string) => ({
  params: Promise.resolve({ source }),
});

beforeEach(() => {
  mocks.getStats.mockReset();
});

describe("GET /api/stats/[source]", () => {
  it("mengembalikan 404 untuk sumber tak dikenal", async () => {
    const response = await GET(
      new Request("http://test/api/stats/foo"),
      context("foo"),
    );

    expect(response.status).toBe(404);
    expect((await response.json()).error).toBe("not_found");
  });

  it("mengembalikan 200 dengan data saat sukses", async () => {
    mocks.getStats.mockResolvedValue({
      source: "github",
      meta: { stale: false },
      data: { total: 17 },
    });

    const response = await GET(
      new Request("http://test/api/stats/github"),
      context("github"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual({ total: 17 });
    expect(mocks.getStats).toHaveBeenCalledWith("github");
  });

  it("mengembalikan 501 untuk sumber yang belum diimplementasikan", async () => {
    mocks.getStats.mockRejectedValue(new mocks.NotImplemented());

    const response = await GET(
      new Request("http://test/api/stats/wakatime"),
      context("wakatime"),
    );

    expect(response.status).toBe(501);
    expect((await response.json()).error).toBe("not_implemented");
  });

  it("mengembalikan 503 bila belum dikonfigurasi", async () => {
    mocks.getStats.mockRejectedValue(new mocks.NotConfigured());

    const response = await GET(
      new Request("http://test/api/stats/github"),
      context("github"),
    );

    expect(response.status).toBe(503);
    expect((await response.json()).error).toBe("not_configured");
  });

  it("mengembalikan 502 saat upstream gagal", async () => {
    mocks.getStats.mockRejectedValue(new Error("boom"));

    const response = await GET(
      new Request("http://test/api/stats/github"),
      context("github"),
    );

    expect(response.status).toBe(502);
    expect((await response.json()).error).toBe("upstream_error");
  });
});
