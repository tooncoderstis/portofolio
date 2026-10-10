import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";

import { mdxComponents } from "@/components/mdx/mdx-components";
import { getProfile } from "@/lib/content";
import { socialLinks } from "@/lib/socials";

export const metadata: Metadata = { title: "Tentang" };

export default async function AboutPage() {
  const { frontmatter: profile, content } = await getProfile();

  const socials = socialLinks(profile.socials);

  return (
    <main className="mx-auto w-full max-w-3xl space-y-14 px-4 py-10 sm:px-6 sm:py-16">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {profile.name}
        </h1>
        <p className="text-muted-foreground">
          {profile.role}
          {profile.location ? ` · ${profile.location}` : ""}
        </p>
        {socials.length > 0 ? (
          <div className="flex flex-wrap gap-4 text-sm">
            {socials.map((social) => (
              <a
                key={social.key}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4"
              >
                {social.label}
              </a>
            ))}
          </div>
        ) : null}
      </header>

      <section>
        <MDXRemote source={content} components={mdxComponents} />
      </section>

      {profile.competencies.length > 0 ? (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Kompetensi</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {profile.competencies.map((group) => (
              <div key={group.category} className="space-y-3">
                <h3 className="text-muted-foreground text-sm font-semibold">
                  {group.category}
                </h3>
                {group.items.map((item) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{item.name}</span>
                      <span className="text-muted-foreground tabular-nums">
                        {item.level}%
                      </span>
                    </div>
                    <div className="bg-muted h-2 overflow-hidden rounded-full">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${item.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {profile.experience.length > 0 ? (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Pengalaman</h2>
          <div className="space-y-4">
            {profile.experience.map((entry) => (
              <div
                key={`${entry.company}-${entry.period}`}
                className="rounded-lg border p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium">
                    {entry.role} · {entry.company}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {entry.period}
                  </span>
                </div>
                {entry.description ? (
                  <p className="text-muted-foreground mt-1 text-sm">
                    {entry.description}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
