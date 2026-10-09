import Link from "next/link";

import { ProgressBar } from "@/components/hub/progress-bar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/format";
import type { HubProjectSummary } from "@/lib/hub/store";

export function ProjectCard({ project }: { project: HubProjectSummary }) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle>
            <Link href={`/hub/${project.slug}`} className="hover:underline">
              {project.name}
            </Link>
          </CardTitle>
          <Badge variant="secondary">{project.progress}%</Badge>
        </div>
        <CardDescription>
          {project.done}/{project.total} fase selesai
          {project.updatedAt
            ? ` · diperbarui ${formatRelativeTime(project.updatedAt)}`
            : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-auto space-y-3">
        <ProgressBar value={project.progress} />
        {project.path ? (
          <p className="text-muted-foreground truncate font-mono text-xs">
            {project.path}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
