import { describe, expect, it } from "vitest";

import { getProject, getProjects, parseProfile, parseProject } from "./content";

const profileRaw = `---
name: "Aasa"
role: "Software Developer"
tagline: "Membangun aplikasi."
location: "Indonesia"
socials:
  github: "https://github.com/aasatech"
competencies:
  - category: "Backend"
    items:
      - name: "TypeScript"
        level: 85
experience:
  - company: "Freelance"
    role: "Developer"
    period: "2023 — sekarang"
---

## Tentang

Halo.`;

describe("parseProfile", () => {
  it("memvalidasi frontmatter dan memisahkan body", () => {
    const { frontmatter, content } = parseProfile(profileRaw);

    expect(frontmatter.name).toBe("Aasa");
    expect(frontmatter.competencies).toHaveLength(1);
    expect(frontmatter.competencies[0]?.items[0]?.level).toBe(85);
    expect(content).toContain("Halo.");
  });

  it("memberi default untuk socials dan daftar kosong", () => {
    const { frontmatter } = parseProfile(
      `---\nname: "X"\nrole: "Y"\ntagline: "Z"\n---\n`,
    );

    expect(frontmatter.socials).toEqual({});
    expect(frontmatter.competencies).toEqual([]);
    expect(frontmatter.experience).toEqual([]);
  });

  it("menolak frontmatter yang tidak lengkap", () => {
    expect(() => parseProfile(`---\nname: "X"\n---\n`)).toThrow();
  });
});

describe("parseProject", () => {
  it("memvalidasi status dan default stack", () => {
    const { frontmatter } = parseProject(
      `---\ntitle: "T"\nslug: "t"\nstatus: "in-progress"\nsummary: "S"\n---\n`,
    );

    expect(frontmatter.status).toBe("in-progress");
    expect(frontmatter.stack).toEqual([]);
    expect(frontmatter.featured).toBe(false);
  });

  it("menolak status di luar completed/in-progress", () => {
    expect(() =>
      parseProject(
        `---\ntitle: "T"\nslug: "t"\nstatus: "archived"\nsummary: "S"\n---\n`,
      ),
    ).toThrow();
  });
});

describe("konten nyata", () => {
  it("memuat profil dari content/profile.mdx", async () => {
    const { frontmatter } = await getProfileSafe();
    expect(frontmatter.name.length).toBeGreaterThan(0);
  });

  it("memuat daftar proyek dan detailnya", async () => {
    const projects = await getProjects();
    expect(projects.length).toBeGreaterThan(0);

    const first = projects[0];
    expect(first?.frontmatter.slug).toBeTruthy();

    const detail = await getProject(first?.frontmatter.slug ?? "");
    expect(detail?.frontmatter.title).toBe(first?.frontmatter.title);
  });

  it("mengembalikan null untuk slug tak dikenal", async () => {
    expect(await getProject("tidak-ada")).toBeNull();
  });
});

async function getProfileSafe() {
  const { getProfile } = await import("./content");
  return getProfile();
}
