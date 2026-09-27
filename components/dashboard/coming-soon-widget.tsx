import { WidgetShell } from "@/components/dashboard/widget-shell";

export function ComingSoonWidget({
  title,
  description,
  source,
}: {
  title: string;
  description: string;
  source: string;
}) {
  return (
    <WidgetShell title={title} description={description} source={source}>
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <span className="inline-block size-2 animate-pulse rounded-full bg-amber-500" />
        Segera hadir — sumber ini belum diimplementasikan.
      </div>
    </WidgetShell>
  );
}
