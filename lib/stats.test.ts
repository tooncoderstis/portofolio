import { beforeEach, describe, expect, it, vi } from "vitest";

const envMock = vi.hoisted(() => ({
  env: {
    GITHUB_TOKEN: "tok" as string | undefined,
    GITHUB_USERNAME: "user" as string | undefined,
  },
}));

const store = vi.hoisted(() => ({
  cache: new Map<string, unknown>(),
  stale: new Map<string, unknown>(),
}));

const getGithubStats = vi.hoisted(() => vi.fn());
const upsertSnapshot = vi.hoisted(() => vi.fn(async () => true));

vi.mock("./env", () => envMock);

vi.mock("./cache", () => ({
  getCached: vi.fn(async (key: string) => store.cache.get(key) ?? null),
  setCached: vi.fn(async (key: string, value: unknown) => {
    store.cache.set(key, value);
  }),
  getStale: vi.fn(async (key: string) => store.stale.get(key) ?? null),
  setStale: vi.fn(async (key: string, value: unknown) => {
    store.stale.set(key, value);
  }),
}));

vi.mock("./db", () => ({ upsertSnapshot }));

vi.mock("./adapters/github", () => ({ getGithubStats }));

import {
  cacheKey,
  getStats,
  StatsNotConfiguredError,
  StatsNotImplementedError,
} from "./stats";

beforeEach(() => {
  store.cache.clear();
  store.stale.clear();
  getGithubStats.mockReset();
  upsertSnapshot.mockClear();
  envMock.env.GITHUB_TOKEN = "tok";
  envMock.env.GITHUB_USERNAME = "user";
});

describe("getStats", () => {
  it("mengambil dari sumber, menyimpan cache/stale, dan menulis snapshot saat cache kosong", async () => {
    getGithubStats.mockResolvedValue({ total: 17 });

    const result = await getStats("github", new Date("2026-09-27T00:00:00Z"));

    expect(result.meta).toEqual({
      source: "github",
      stale: false,
      cached: false,
      fetchedAt: "2026-09-27T00:00:00.000Z",
    });
    expect(result.data).toEqual({ total: 17 });
    expect(store.cache.get(cacheKey("github"))).toBeDefined();
    expect(store.stale.get(cacheKey("github"))).toBeDefined();
    expect(upsertSnapshot).toHaveBeenCalledOnce();
  });

  it("mengembalikan cache tanpa memanggil adapter saat cache hangat", async () => {
    store.cache.set(cacheKey("github"), {
      data: { total: 5 },
      fetchedAt: "2026-09-26T00:00:00.000Z",
    });

    const result = await getStats("github");

    expect(result.meta.cached).toBe(true);
    expect(result.meta.stale).toBe(false);
    expect(result.data).toEqual({ total: 5 });
    expect(getGithubStats).not.toHaveBeenCalled();
  });

  it("fallback ke snapshot stale saat upstream gagal", async () => {
    store.stale.set(cacheKey("github"), {
      data: { total: 4 },
      fetchedAt: "2026-09-20T00:00:00.000Z",
    });
    getGithubStats.mockRejectedValue(new Error("upstream down"));

    const result = await getStats("github");

    expect(result.meta.stale).toBe(true);
    expect(result.meta.fetchedAt).toBe("2026-09-20T00:00:00.000Z");
    expect(result.data).toEqual({ total: 4 });
  });

  it("melempar error bila upstream gagal dan tidak ada snapshot", async () => {
    getGithubStats.mockRejectedValue(new Error("upstream down"));

    await expect(getStats("github")).rejects.toThrow("upstream down");
  });

  it("melempar StatsNotImplementedError untuk sumber yang belum ada", async () => {
    await expect(getStats("wakatime")).rejects.toBeInstanceOf(
      StatsNotImplementedError,
    );
  });

  it("melempar StatsNotConfiguredError bila kredensial GitHub kosong", async () => {
    envMock.env.GITHUB_TOKEN = undefined;

    await expect(getStats("github")).rejects.toBeInstanceOf(
      StatsNotConfiguredError,
    );
  });
});
