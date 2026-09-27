import { Suspense } from "react";

import { ComingSoonWidget } from "@/components/dashboard/coming-soon-widget";
import { GithubWidget } from "@/components/dashboard/github-widget";
import { WidgetSkeleton } from "@/components/dashboard/widget-skeleton";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <section className="space-y-6">
        <Reveal>
          <Badge variant="secondary">Dashboard live</Badge>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {site.name}
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-muted-foreground max-w-2xl text-lg">
            {site.tagline}
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <a href={site.links.github} target="_blank" rel="noreferrer">
                GitHub
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="#dashboard">Lihat dashboard</a>
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

          <Reveal delay={0.05}>
            <ComingSoonWidget
              title="WakaTime"
              description="Jam coding, bahasa, dan editor"
              source="wakatime"
            />
          </Reveal>

          <Reveal delay={0.1}>
            <ComingSoonWidget
              title="Umami Analytics"
              description="Page views dan pengunjung unik"
              source="umami"
            />
          </Reveal>

          <Reveal delay={0.15}>
            <ComingSoonWidget
              title="MonkeyType"
              description="Kecepatan mengetik terbaik"
              source="monkeytype"
            />
          </Reveal>
        </div>
      </section>
    </main>
  );
}
