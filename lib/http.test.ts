import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchJson, HttpError } from "./http";

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("fetchJson", () => {
  it("mengembalikan JSON saat sukses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ ok: true })),
    );

    await expect(fetchJson("https://example.com")).resolves.toEqual({
      ok: true,
    });
  });

  it("retry lalu sukses setelah respons 500", async () => {
    const mock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({}, 500))
      .mockResolvedValueOnce(jsonResponse({ ok: true }));
    vi.stubGlobal("fetch", mock);

    await expect(
      fetchJson("https://example.com", { retries: 1 }),
    ).resolves.toEqual({ ok: true });
    expect(mock).toHaveBeenCalledTimes(2);
  });

  it("langsung gagal tanpa retry pada status 4xx", async () => {
    const mock = vi.fn(async () => jsonResponse({}, 404));
    vi.stubGlobal("fetch", mock);

    await expect(
      fetchJson("https://example.com", { retries: 2 }),
    ).rejects.toBeInstanceOf(HttpError);
    expect(mock).toHaveBeenCalledTimes(1);
  });
});
