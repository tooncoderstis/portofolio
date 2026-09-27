import { StatTile } from "@/components/dashboard/stat-tile";
import { WidgetShell } from "@/components/dashboard/widget-shell";
import type { MonkeytypeStats } from "@/lib/adapters/monkeytype";
import { formatNumber, formatRelativeTime } from "@/lib/format";
import { loadStats } from "@/lib/stats-loader";

export async function MonkeytypeWidget() {
  const result = await loadStats("monkeytype");

  if (result.status !== "ok") {
    const message =
      result.status === "unavailable"
        ? "Username MonkeyType belum diatur."
        : "Gagal memuat data MonkeyType. Coba lagi nanti.";

    return (
      <WidgetShell title="MonkeyType" source="monkeytype">
        <p className="text-muted-foreground text-sm">{message}</p>
      </WidgetShell>
    );
  }

  const stats = result.data.data as MonkeytypeStats;

  return (
    <WidgetShell
      title="MonkeyType"
      description={
        stats.bestWpm !== null
          ? `Kecepatan terbaik ${stats.bestWpm} WPM`
          : "Belum ada hasil tes"
      }
      source="monkeytype"
      stale={result.data.meta.stale}
      fetchedAtLabel={formatRelativeTime(result.data.meta.fetchedAt)}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="WPM terbaik"
          value={stats.bestWpm !== null ? `${stats.bestWpm}` : "-"}
        />
        <StatTile
          label="Akurasi"
          value={stats.bestAccuracy !== null ? `${stats.bestAccuracy}%` : "-"}
        />
        <StatTile
          label="Tes selesai"
          value={formatNumber(stats.completedTests)}
        />
        <StatTile label="Streak maks" value={`${stats.maxStreak} hari`} />
      </div>

      {stats.bestsByDuration.length > 0 ? (
        <div className="space-y-2">
          <div className="text-muted-foreground text-xs font-medium">
            Personal best per durasi
          </div>
          {stats.bestsByDuration.map((best) => (
            <div
              key={best.duration}
              className="bg-muted/30 flex items-center justify-between rounded-md border px-3 py-2 text-sm"
            >
              <span>{best.duration}s</span>
              <span className="tabular-nums">
                <span className="font-semibold">{best.wpm}</span> WPM ·{" "}
                {best.acc}%
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </WidgetShell>
  );
}
