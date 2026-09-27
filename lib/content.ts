import "server-only";

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import matter from "gray-matter";
import { z } from "zod";

const competencyItemSchema = z.object({
  name: z.string(),
  level: z.number().min(0).max(100),
});

const competencyGroupSchema = z.object({
  category: z.string(),
  items: z.array(competencyItemSchema).min(1),
});

const experienceSchema = z.object({
  company: z.string(),
  role: z.string(),
  period: z.string(),
  description: z.string().optional(),
});

const socialsSchema = z.object({
  github: z.url().optional(),
  linkedin: z.url().optional(),
  website: z.url().optional(),
  email: z.email().optional(),
});

export const profileSchema = z.object({
  name: z.string(),
  role: z.string(),
  tagline: z.string(),
  location: z.string().optional(),
  socials: socialsSchema.default({}),
  competencies: z.array(competencyGroupSchema).default([]),
  experience: z.array(experienceSchema).default([]),
});

export type Profile = z.infer<typeof profileSchema>;

export const projectStatusSchema = z.enum(["completed", "in-progress"]);
export type ProjectStatus = z.infer<typeof projectStatusSchema>;

export const projectSchema = z.object({
  title: z.string(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  status: projectStatusSchema,
  summary: z.string(),
  stack: z.array(z.string()).default([]),
  repoUrl: z.string().url().optional(),
  liveUrl: z.string().url().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  featured: z.boolean().default(false),
});

export type Project = z.infer<typeof projectSchema>;

export type ContentEntry<T> = { frontmatter: T; content: string };
export type ProjectEntry = ContentEntry<Project>;

const CONTENT_DIR = join(process.cwd(), "content");
const PROJECTS_DIR = join(CONTENT_DIR, "projects");

export function parseProfile(raw: string): ContentEntry<Profile> {
  const { data, content } = matter(raw);
  return { frontmatter: profileSchema.parse(data), content };
}

export function parseProject(raw: string): ProjectEntry {
  const { data, content } = matter(raw);
  return { frontmatter: projectSchema.parse(data), content };
}

export async function getProfile(): Promise<ContentEntry<Profile>> {
  return parseProfile(readFileSync(join(CONTENT_DIR, "profile.mdx"), "utf8"));
}

export function getProjectSlugs(): string[] {
  if (!existsSync(PROJECTS_DIR)) return [];

  return readdirSync(PROJECTS_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

function readProject(slug: string): ProjectEntry | null {
  const path = join(PROJECTS_DIR, `${slug}.mdx`);

  if (!existsSync(path)) return null;

  const parsed = parseProject(readFileSync(path, "utf8"));

  if (parsed.frontmatter.slug !== slug) {
    throw new Error(
      `Slug frontmatter '${parsed.frontmatter.slug}' tidak cocok dengan nama file '${slug}.mdx'.`,
    );
  }

  return parsed;
}

export async function getProject(slug: string): Promise<ProjectEntry | null> {
  return readProject(slug);
}

const statusRank: Record<ProjectStatus, number> = {
  "in-progress": 0,
  completed: 1,
};

export async function getProjects(): Promise<ProjectEntry[]> {
  return getProjectSlugs()
    .map((slug) => {
      const entry = readProject(slug);

      if (!entry) {
        throw new Error(`Proyek '${slug}' tidak dapat dibaca.`);
      }

      return entry;
    })
    .sort((a, b) => {
      const byStatus =
        statusRank[a.frontmatter.status] - statusRank[b.frontmatter.status];

      if (byStatus !== 0) return byStatus;

      return (b.frontmatter.startDate ?? "").localeCompare(
        a.frontmatter.startDate ?? "",
      );
    });
}
