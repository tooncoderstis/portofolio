import { describe, expect, it } from "vitest";

import { getLevelClass } from "./contribution-heatmap";

describe("getLevelClass", () => {
  it("memetakan level kontribusi ke kelas warna", () => {
    expect(getLevelClass(0)).toBe("bg-muted");
    expect(getLevelClass(4)).toContain("emerald");
  });

  it("jatuh ke bg-muted untuk level tak dikenal", () => {
    expect(getLevelClass(9)).toBe("bg-muted");
  });
});
