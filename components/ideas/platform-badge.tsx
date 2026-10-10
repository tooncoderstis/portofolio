import { Badge } from "@/components/ui/badge";
import { PLATFORM_LABELS } from "@/lib/ideas/platform";
import type { IdeaPlatform } from "@/lib/hub/schema";

export function PlatformBadge({ platform }: { platform: IdeaPlatform }) {
  return <Badge variant="outline">{PLATFORM_LABELS[platform]}</Badge>;
}
