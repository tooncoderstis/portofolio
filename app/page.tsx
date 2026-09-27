import Link from "next/link";
import { Suspense } from "react";

import { ComingSoonWidget } from "@/components/dashboard/coming-soon-widget";
import { GithubWidget } from "@/components/dashboard/github-widget";
import { MonkeytypeWidget } from "@/components/dashboard/monkeytype-widget";
import { TrendWidget } from "@/components/dashboard/trend-widget";
import { WakatimeWidget } from "@/components/dashboard/wakatime-widget";
import { WidgetSkeleton } from "@/components/dashboard/widget-skeleton";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProfile } from "@/lib/content";
import { socialLinks } from "@/lib/socials";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { frontmatter: profile } = await getProfile();
  const socials = socialLinks(profile.socials);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <section className="space-y-6">
        <Reveal>
          <Badge variant="secondary">Dashboard live</Badge>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {profile.name}
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-muted-foreground max-w-2xl text-lg">
            {profile.tagline}
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="flex flex-wrap gap-3">
            {socials.map((social, index) => (
              <Button
                key={social.key}
                variant={index === 0 ? "default" : "outline"}
                asChild
              >
                <a href={social.href} target="_blank" rel="noreferrer">
                  {social.label}
                </a>
              </Button>
            ))}
            <Button
              variant={socials.length > 0 ? "outline" : "default"}
              asChild
            >
              <Link href="/projects">Lihat proyek</Link>
            </Button>
            <Button variant="ghost" asChild>
              <a href="#dashboard">Dashboard</a>
            </Button>
          </div>
        </Reveal>
      </section>

      <section id="dashboard" className="mt-20 space-y-6">
        <Reveal>
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground text-sm">
              Angka diambil langsung dari platform, disegarkan otomatis, dengan
              fallback data terakhir bila sumber sedang tidak tersedia.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-2">
          <Suspense fallback={<WidgetSkeleton />}>
            <Reveal>
              <GithubWidget />
            </Reveal>
          </Suspense>

          <Suspense fallback={<WidgetSkeleton />}>
            <Reveal delay={0.05}>
              <WakatimeWidget />
            </Reveal>
          </Suspense>

          <Suspense fallback={<WidgetSkeleton />}>
            <Reveal delay={0.1}>
              <MonkeytypeWidget />
            </Reveal>
          </Suspense>

          <Reveal delay={0.15}>
            <ComingSoonWidget
              title="Umami Analytics"
              description="Page views dan pengunjung unik"
              source="umami"
            />
          </Reveal>
        </div>
      </section>

      <section className="mt-20 space-y-6">
        <Reveal>
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              Tren (30 hari)
            </h2>
            <p className="text-muted-foreground text-sm">
              Dibangun dari snapshot harian yang tersimpan di Postgres.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-2">
          <Suspense fallback={<WidgetSkeleton />}>
            <Reveal>
              <TrendWidget
                source="github"
                title="Tren kontribusi"
                description="Total kontribusi setahun terakhir"
              />
            </Reveal>
          </Suspense>

          <Suspense fallback={<WidgetSkeleton />}>
            <Reveal delay={0.05}>
              <TrendWidget
                source="wakatime"
                title="Tren waktu coding"
                description="Total waktu coding terakumulasi"
                format="duration"
              />
            </Reveal>
          </Suspense>
        </div>
      </section>
    </main>
  );
}
