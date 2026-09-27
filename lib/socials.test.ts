import { describe, expect, it } from "vitest";

import { socialLinks } from "./socials";

describe("socialLinks", () => {
  it("memberi label dan href, serta mailto untuk email", () => {
    const links = socialLinks({
      github: "https://github.com/x",
      email: "a@b.com",
    });

    expect(links).toEqual([
      { key: "github", label: "GitHub", href: "https://github.com/x" },
      { key: "email", label: "Email", href: "mailto:a@b.com" },
    ]);
  });

  it("mengabaikan nilai kosong", () => {
    const links = socialLinks({
      github: undefined,
      linkedin: "https://linkedin.com/in/x",
    });

    expect(links).toHaveLength(1);
    expect(links[0]?.key).toBe("linkedin");
  });
});
