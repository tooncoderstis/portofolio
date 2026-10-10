import { describe, expect, it } from "vitest";

import { buildProgressMap } from "./projects-sync";

describe("buildProgressMap", () => {
  it("memetakan progres per slug", () => {
    const map = buildProgressMap([
      { slug: "sigmalab", done: 3, total: 9, progress: 33 },
      { slug: "klinix", done: 1, total: 3, progress: 33 },
    ]);

    expect(map.sigmalab).toEqual({ done: 3, total: 9, progress: 33 });
    expect(map.klinix).toEqual({ done: 1, total: 3, progress: 33 });
    expect(map.missing).toBeUndefined();
  });

  it("mengembalikan objek kosong untuk daftar kosong", () => {
    expect(buildProgressMap([])).toEqual({});
  });
});
