import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getTrend: vi.fn() }));

vi.mock("@/lib/trends", () => ({ getTrend: mocks.getTrend }));
vi.mock("@/lib/stats", () => ({
  isStatsSource: (value: string) =>
    ["github", "wakatime", "umami", "monkeytype"].includes(value),
}));

import { GET } from "./route";

const context = (source: string) => ({ params: Promise.resolve({ source }) });

beforeEach(() => {
  mocks.getTrend.mockReset();
  mocks.getTrend.mockResolvedValue({ source: "github", days: 30, points: [] });
});

describe("GET /api/trends/[source]", () => {
  it("mengembalikan 404 untuk sumber tak dikenal", async () => {
    const response = await GET(
      new Request("http://test/api/trends/foo"),
      context("foo"),
    );

    expect(response.status).toBe(404);
  });

  it("mengembalikan tren dengan default 30 hari", async () => {
    const response = await GET(
      new Request("http://test/api/trends/github"),
      context("github"),
    );

    expect(response.status).toBe(200);
    expect(mocks.getTrend).toHaveBeenCalledWith("github", 30);
  });

  it("membatasi nilai days ke rentang 1..365", async () => {
    await GET(
      new Request("http://test/api/trends/github?days=9999"),
      context("github"),
    );
    expect(mocks.getTrend).toHaveBeenCalledWith("github", 365);

    await GET(
      new Request("http://test/api/trends/github?days=0"),
      context("github"),
    );
    expect(mocks.getTrend).toHaveBeenCalledWith("github", 1);
  });

  it("mengembalikan 502 saat gagal", async () => {
    mocks.getTrend.mockRejectedValue(new Error("db down"));

    const response = await GET(
      new Request("http://test/api/trends/github"),
      context("github"),
    );

    expect(response.status).toBe(502);
  });
});
