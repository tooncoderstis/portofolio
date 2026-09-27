import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type WidgetShellProps = {
  title: string;
  description?: string;
  source: string;
  stale?: boolean;
  fetchedAtLabel?: string;
  children: ReactNode;
};

export function WidgetShell({
  title,
  description,
  source,
  stale = false,
  fetchedAtLabel,
  children,
}: WidgetShellProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>{title}</CardTitle>
            {description ? (
              <CardDescription>{description}</CardDescription>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {stale ? <Badge variant="secondary">stale</Badge> : null}
            <Badge variant="outline">{source}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
      {fetchedAtLabel ? (
        <CardFooter className="text-muted-foreground text-xs">
          Disinkronkan {fetchedAtLabel}
        </CardFooter>
      ) : null}
    </Card>
  );
}
