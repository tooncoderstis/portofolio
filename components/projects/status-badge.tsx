import { Badge } from "@/components/ui/badge";
import type { ProjectStatus } from "@/lib/content";

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return status === "in-progress" ? (
    <Badge>Sedang dikerjakan</Badge>
  ) : (
    <Badge variant="secondary">Selesai</Badge>
  );
}
