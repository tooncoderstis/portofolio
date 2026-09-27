import { TrendChart } from "@/components/dashboard/trend-chart";
import { WidgetShell } from "@/components/dashboard/widget-shell";
import { formatDuration, formatNumber } from "@/lib/format";
import type { StatsSource } from "@/lib/stats";
import { getTrend } from "@/lib/trends";

export async function TrendWidget({
  source,
  title,
  description,
  format = "number",
}: {
  source: StatsSource;
  title: string;
  description: string;
  format?: "number" | "duration";
}) {
  const trend = await getTrend(source, 30);

  const latest = [...trend.points]
    .reverse()
    .find((point) => point.value !== null);

  const valueLabel =
    latest?.value != null
      ? format === "duration"
        ? formatDuration(latest.value)
        : formatNumber(latest.value)
      : "-";

  return (
    <WidgetShell
      title={title}
      description={description}
      source={`${source} · 30 hari`}
    >
      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-semibold tabular-nums">
          {valueLabel}
        </span>
        <span className="text-muted-foreground text-xs">
          {trend.points.length} titik data
        </span>
      </div>
      <TrendChart points={trend.points} />
    </WidgetShell>
  );
}
