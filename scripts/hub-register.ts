import "dotenv/config";

import { readdirSync, statSync } from "node:fs";
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

async function main(): Promise<void> {
  const root = process.argv[2] ?? process.env.HUB_PROJECTS_ROOT ?? DEFAULT_ROOT;
  const baseUrl = process.env.HUB_INGEST_URL;
  const secret = process.env.HUB_INGEST_SECRET ?? "";
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

  for (const name of folders) {
    const slug = slugify(name);
    const payload = {
      project: { slug, name, path: join(root, name) },
    };

    try {
      const response = await fetch(`${baseUrl}/api/hub/ingest`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-hub-secret": secret,
        },
        body: JSON.stringify(payload),
      });

      console.log(`${response.status}  ${slug}`);
    } catch (error) {
      console.error(`gagal  ${slug}:`, error);
    }
  }
}

main().catch((error: unknown) => {
  console.error("Registrasi gagal:", error);
  process.exitCode = 1;
});
