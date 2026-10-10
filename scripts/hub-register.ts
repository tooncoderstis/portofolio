import "dotenv/config";

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { slugify } from "../lib/hub/slug";

const DEFAULT_ROOT = "E:\\aasatech";
const IGNORED = new Set(["node_modules", ".git", ".next", "dist", "build"]);

function projectFolders(root: string): string[] {
  return readdirSync(root)
    .filter((name) => !name.startsWith(".") && !IGNORED.has(name))
    .filter((name) => {
      try {
        return statSync(join(root, name)).isDirectory();
      } catch {
        return false;
      }
    });
}

function loadEnvFile(path: string): Record<string, string> {
  if (!existsSync(path)) return {};

  const env: Record<string, string> = {};

  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);

    if (!match) continue;

    let value = match[2].trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[match[1]] = value;
  }

  return env;
}

function isTruthy(value: string | undefined): boolean {
  return ["1", "true", "yes"].includes((value ?? "").toLowerCase());
}

async function main(): Promise<void> {
  const positional = process.argv
    .slice(2)
    .filter((arg) => !arg.startsWith("--"));
  const root = positional[0] ?? process.env.HUB_PROJECTS_ROOT ?? DEFAULT_ROOT;
  const baseUrl = process.env.HUB_INGEST_URL;
  const secret = process.env.HUB_INGEST_SECRET ?? "";
  const prune =
    process.argv.includes("--prune") || isTruthy(process.env.HUB_PRUNE);
  const ignore = (process.env.HUB_IGNORE_PROJECTS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (!baseUrl) {
    console.error("HUB_INGEST_URL belum diset (lihat .env.example).");
    process.exitCode = 1;
    return;
  }

  const folders = projectFolders(root).filter(
    (name) => !ignore.includes(name) && !ignore.includes(slugify(name)),
  );

  if (folders.length === 0) {
    console.error(`Tidak ada folder proyek di ${root}.`);
    process.exitCode = 1;
    return;
  }

  const projects = folders.map((name) => {
    const dir = join(root, name);
    const fileEnv = loadEnvFile(join(dir, ".env"));

    return {
      slug: fileEnv.HUB_PROJECT_SLUG || slugify(name),
      name: fileEnv.HUB_PROJECT_NAME || name,
      path: dir,
    };
  });

  const response = await fetch(
    `${baseUrl.replace(/\/$/, "")}/api/hub/register`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-hub-secret": secret,
      },
      body: JSON.stringify({ projects, prune }),
    },
  );

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error(`Gagal registrasi (${response.status}):`, body);
    process.exitCode = 1;
    return;
  }

  const pruned: string[] = body.pruned ?? [];

  console.log(
    `OK  ${body.registered ?? projects.length} proyek terdaftar` +
      (prune ? `, ${pruned.length} dihapus` : " (tanpa prune)"),
  );

  for (const project of projects) {
    console.log(`  - ${project.slug} (${project.name})`);
  }

  if (pruned.length > 0) {
    console.log(`  dihapus: ${pruned.join(", ")}`);
  }
}

main().catch((error: unknown) => {
  console.error("Registrasi gagal:", error);
  process.exitCode = 1;
});
