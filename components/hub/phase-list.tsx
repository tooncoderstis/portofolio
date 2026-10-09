import { Badge } from "@/components/ui/badge";
import type { HubPhase } from "@/lib/hub/store";
import type { PhaseStatus } from "@/lib/hub/schema";

const LABELS: Record<PhaseStatus, string> = {
  done: "Selesai",
  in_progress: "Dikerjakan",
  todo: "Belum",
};

const VARIANTS: Record<PhaseStatus, "default" | "secondary" | "outline"> = {
  done: "default",
  in_progress: "secondary",
  todo: "outline",
};

export function PhaseList({ phases }: { phases: HubPhase[] }) {
  if (phases.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Belum ada fase yang dilaporkan.
      </p>
    );
  }

  return (
    <ul className="divide-border divide-y">
      {phases.map((phase) => (
        <li
          key={phase.phaseId}
          className="flex items-center justify-between gap-4 py-2.5"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="text-muted-foreground shrink-0 font-mono text-xs">
              {phase.phaseId}
            </span>
            <span className="truncate text-sm">{phase.title}</span>
          </span>
          <Badge variant={VARIANTS[phase.status]}>{LABELS[phase.status]}</Badge>
        </li>
      ))}
    </ul>
  );
}
