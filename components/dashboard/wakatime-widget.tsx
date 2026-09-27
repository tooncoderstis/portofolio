import { StatTile } from "@/components/dashboard/stat-tile";
import { WidgetShell } from "@/components/dashboard/widget-shell";
import type { WakatimeStats } from "@/lib/adapters/wakatime";
import {
  formatDuration,
  formatPercent,
  formatRelativeTime,
} from "@/lib/format";
import { loadStats } from "@/lib/stats-loader";

export async function WakatimeWidget() {
  const result = await loadStats("wakatime");

  if (result.status !== "ok") {
    const message =
      result.status === "unavailable"
        ? "Kredensial WakaTime belum diatur."
        : "Gagal memuat data WakaTime. Coba lagi nanti.";

    return (
      <WidgetShell title="WakaTime" source="wakatime">
        <p className="text-muted-foreground text-sm">{message}</p>
      </WidgetShell>
    );
  }

  const stats = result.data.data as WakatimeStats;
  const maxDay = Math.max(1, ...stats.last7Days.map((day) => day.seconds));
  const last7DaysSeconds = stats.last7Days.reduce(
    (sum, day) => sum + day.seconds,
    0,
  );

  return (
    <WidgetShell
      title="WakaTime"
      description={`${formatDuration(stats.totalSeconds)} total sejak bergabung`}
      source="wakatime"
      stale={result.data.meta.stale}
      fetchedAtLabel={formatRelativeTime(result.data.meta.fetchedAt)}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile
          label="Total coding"
          value={formatDuration(stats.totalSeconds)}
        />
        <StatTile
          label="7 hari terakhir"
          value={formatDuration(last7DaysSeconds)}
        />
        <StatTile
          label="Bergabung"
          value={new Date(stats.joinedAt).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        />
      </div>

      <div className="space-y-2">
        <div className="text-muted-foreground text-xs font-medium">
          7 hari terakhir
        </div>
        <div className="flex items-end gap-2">
          {stats.last7Days.map((day) => (
            <div
              key={day.date}
              className="flex flex-1 flex-col items-center gap-1"
            >
              <div className="bg-muted/40 flex h-16 w-full items-end overflow-hidden rounded">
                <div
                  className="w-full rounded bg-emerald-500"
                  style={{ height: `${(day.seconds / maxDay) * 100}%` }}
                />
              </div>
              <span className="text-muted-foreground text-[10px]">
                {new Date(day.date).toLocaleDateString("id-ID", {
                  weekday: "short",
                })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {stats.languages.length > 0 ? (
        <div className="space-y-2">
          <div className="text-muted-foreground text-xs font-medium">
            Bahasa teratas
          </div>
          {stats.languages.slice(0, 4).map((language) => (
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
                {formatPercent(Math.round(language.percent * 10) / 10)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-xs">
          Belum ada data bahasa. Statistik muncul setelah plugin editor mengirim
          heartbeat.
        </p>
      )}
    </WidgetShell>
  );
}
