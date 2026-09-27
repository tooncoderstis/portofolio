export function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

export function formatPercent(value: number): string {
  return `${value}%`;
}

export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) return `${hours}j ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;

  return `${seconds}s`;
}

export function formatRelativeTime(
  iso: string,
  now: Date = new Date(),
): string {
  const then = new Date(iso).getTime();

  if (Number.isNaN(then)) return "tidak diketahui";

  const diff = Math.max(0, now.getTime() - then);
  const minutes = Math.floor(diff / 60_000);

  if (minutes < 1) return "baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours} jam lalu`;

  const days = Math.floor(hours / 24);

  return `${days} hari lalu`;
}
