import { describe, expect, it } from "vitest";

import { slugify } from "./slug";

describe("slugify", () => {
  it("mengubah nama folder menjadi slug", () => {
    expect(slugify("materi sigmalab")).toBe("materi-sigmalab");
    expect(slugify("sigmalab - Copy")).toBe("sigmalab-copy");
    expect(slugify("OpenDots")).toBe("opendots");
  });

  it("merapikan pemisah berlebih", () => {
    expect(slugify("a___b   c")).toBe("a-b-c");
    expect(slugify("--x--")).toBe("x");
  });
});
