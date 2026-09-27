import type { Profile } from "./content";

export type SocialLink = { key: string; label: string; href: string };

const LABELS: Record<string, string> = {
  github: "GitHub",
  linkedin: "LinkedIn",
  website: "Website",
  email: "Email",
};

export function socialLinks(socials: Profile["socials"]): SocialLink[] {
  return Object.entries(socials)
    .filter((entry): entry is [string, string] => Boolean(entry[1]))
    .map(([key, value]) => ({
      key,
      label: LABELS[key] ?? key,
      href: key === "email" ? `mailto:${value}` : value,
    }));
}
