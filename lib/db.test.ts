import { describe, expect, it, vi } from "vitest";

vi.mock("./env", () => ({ env: { DATABASE_URL: undefined } }));

import { getPool, getSnapshots, upsertSnapshot } from "./db";

describe("db tanpa DATABASE_URL", () => {
  it("getPool mengembalikan null", () => {
    expect(getPool()).toBeNull();
  });

  it("upsertSnapshot no-op dan mengembalikan false", async () => {
    await expect(
      upsertSnapshot({
        source: "github",
        capturedOn: "2026-09-27",
        payload: { ok: true },
      }),
    ).resolves.toBe(false);
  });

  it("getSnapshots mengembalikan array kosong", async () => {
    await expect(getSnapshots("github", 7)).resolves.toEqual([]);
  });
});
