import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlatformBadge } from "@/components/ideas/platform-badge";
import { IdeaStatusBadge } from "@/components/ideas/status-badge";
import { formatRelativeTime } from "@/lib/format";
import { priorityLabel } from "@/lib/ideas/meta";
import type { HubIdea } from "@/lib/hub/store";

export function IdeaCard({
  idea,
  projectName,
}: {
  idea: HubIdea;
  projectName?: string;
}) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle>
            <Link href={`/hub/ideas/${idea.id}`} className="hover:underline">
              {idea.title}
            </Link>
          </CardTitle>
          <IdeaStatusBadge status={idea.status} />
        </div>
        {idea.summary ? (
          <CardDescription>{idea.summary}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="mt-auto space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <PlatformBadge platform={idea.platform} />
          {idea.project ? (
            <Badge variant="secondary">{projectName ?? idea.project}</Badge>
          ) : null}
          <Badge variant="outline">
            Prioritas {priorityLabel(idea.priority)}
          </Badge>
          {idea.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              #{tag}
            </Badge>
          ))}
        </div>
        {idea.sourceUrl ? (
          <a
            href={idea.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground block truncate text-xs hover:underline"
          >
            {idea.sourceUrl}
          </a>
        ) : null}
        <p className="text-muted-foreground text-xs">
          diperbarui {formatRelativeTime(idea.updatedAt)}
        </p>
      </CardContent>
    </Card>
  );
}
