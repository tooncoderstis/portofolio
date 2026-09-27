import { ContributionHeatmap } from "@/components/dashboard/contribution-heatmap";
import { StatTile } from "@/components/dashboard/stat-tile";
import { WidgetShell } from "@/components/dashboard/widget-shell";
import type { GithubStats } from "@/lib/adapters/github";
import { formatNumber, formatPercent, formatRelativeTime } from "@/lib/format";
import { loadStats } from "@/lib/stats-loader";

export async function GithubWidget() {
  const result = await loadStats("github");

  if (result.status !== "ok") {
    const message =
      result.status === "unavailable"
        ? "Kredensial GitHub belum diatur."
        : "Gagal memuat data GitHub. Coba lagi nanti.";

    return (
      <WidgetShell title="GitHub Contributions" source="github">
        <p className="text-muted-foreground text-sm">{message}</p>
      </WidgetShell>
    );
  }

  const stats = result.data.data as GithubStats;

  return (
    <WidgetShell
      title="GitHub Contributions"
      description={`${formatNumber(stats.contributions.total)} kontribusi setahun terakhir`}
      source="github"
      stale={result.data.meta.stale}
      fetchedAtLabel={formatRelativeTime(result.data.meta.fetchedAt)}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Total"
          value={formatNumber(stats.contributions.total)}
        />
        <StatTile label="Streak kini" value={`${stats.streak.current} hari`} />
        <StatTile label="Terpanjang" value={`${stats.streak.longest} hari`} />
        <StatTile
          label="Repo publik"
          value={formatNumber(stats.profile.publicRepos)}
        />
      </div>

      <ContributionHeatmap weeks={stats.calendarWeeks ?? []} />

      {stats.topLanguages.length > 0 ? (
        <div className="space-y-2">
          <div className="text-muted-foreground text-xs font-medium">
            Bahasa teratas
          </div>
          {stats.topLanguages.slice(0, 4).map((language) => (
            <div
              key={language.name}
              className="flex items-center gap-2 text-sm"
            >
              <span className="w-24 shrink-0 truncate">{language.name}</span>
              <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${language.percent}%` }}
                />
              </div>
              <span className="text-muted-foreground w-12 shrink-0 text-right tabular-nums">
                {formatPercent(language.percent)}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </WidgetShell>
  );
}
