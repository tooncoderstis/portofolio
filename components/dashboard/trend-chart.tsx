import type { TrendPoint } from "@/lib/trends";

export function TrendChart({
  points,
  height = 72,
}: {
  points: TrendPoint[];
  height?: number;
}) {
  const values = points
    .map((point) => point.value)
    .filter((value): value is number => value !== null);

  if (values.length === 0) {
    return (
      <p className="text-muted-foreground text-xs">
        Belum ada data. Snapshot harian akan mengisi grafik ini.
      </p>
    );
  }

  const width = 300;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = points.length > 1 ? width / (points.length - 1) : 0;

  const coords = points
    .map((point, index) => {
      const value = point.value ?? min;
      const x = points.length > 1 ? index * step : width / 2;
      const y = height - ((value - min) / range) * (height - 8) - 4;

      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-20 w-full text-emerald-500"
      preserveAspectRatio="none"
      role="img"
      aria-label="Grafik tren"
    >
      <polyline
        points={coords}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
