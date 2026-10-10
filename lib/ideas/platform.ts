import type { IdeaPlatform } from "@/lib/hub/schema";

const PLATFORM_HOSTS: { platform: IdeaPlatform; hosts: string[] }[] = [
  { platform: "threads", hosts: ["threads.net", "threads.com"] },
  { platform: "x", hosts: ["x.com", "twitter.com", "t.co"] },
  { platform: "tiktok", hosts: ["tiktok.com"] },
  { platform: "instagram", hosts: ["instagram.com", "instagr.am"] },
  { platform: "youtube", hosts: ["youtube.com", "youtu.be"] },
];

export const PLATFORM_LABELS: Record<IdeaPlatform, string> = {
  threads: "Threads",
  x: "X",
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube",
  website: "Situs",
  other: "Lainnya",
};

export function detectPlatform(url?: string | null): IdeaPlatform {
  if (!url) return "other";

  let host: string;

  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return "other";
  }

  for (const entry of PLATFORM_HOSTS) {
    if (entry.hosts.some((h) => host === h || host.endsWith(`.${h}`))) {
      return entry.platform;
    }
  }

  return "website";
}
