import { Badge } from "@/components/ui/badge";
import { IDEA_STATUS_LABELS } from "@/lib/ideas/meta";
import type { IdeaStatus } from "@/lib/hub/schema";

const VARIANTS: Record<IdeaStatus, "default" | "secondary" | "outline"> = {
  inbox: "outline",
  exploring: "secondary",
  planned: "default",
  done: "default",
  archived: "outline",
};

export function IdeaStatusBadge({ status }: { status: IdeaStatus }) {
  return <Badge variant={VARIANTS[status]}>{IDEA_STATUS_LABELS[status]}</Badge>;
}
