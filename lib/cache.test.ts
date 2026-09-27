import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createMemoryStore,
  getCached,
  getStale,
  setCached,
  setCacheStore,
  setStale,
} from "./cache";

describe("cache", () => {
  beforeEach(() => {
    setCacheStore(createMemoryStore());
    vi.useRealTimers();
  });

  it("menyimpan dan membaca nilai", async () => {
    await setCached("github", { contributions: 10 });

    await expect(getCached("github")).resolves.toEqual({ contributions: 10 });
  });

  it("mengembalikan null setelah TTL habis", async () => {
    vi.useFakeTimers();

    await setCached("github", { contributions: 10 }, 10);
    vi.advanceTimersByTime(11_000);

    await expect(getCached("github")).resolves.toBeNull();
  });

  it("menyimpan snapshot stale terpisah dari cache", async () => {
    await setStale("github", { last: true });

    await expect(getStale("github")).resolves.toEqual({ last: true });
    await expect(getCached("github")).resolves.toBeNull();
  });

  it("mengembalikan null bila JSON rusak", async () => {
    setCacheStore({ get: async () => "bukan-json", set: async () => {} });

    await expect(getCached("github")).resolves.toBeNull();
  });
});
