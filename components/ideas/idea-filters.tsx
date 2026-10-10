import Link from "next/link";

import { Button } from "@/components/ui/button";
import { IDEA_STATUS_LABELS, IDEA_STATUS_ORDER } from "@/lib/ideas/meta";
import { PLATFORM_LABELS } from "@/lib/ideas/platform";
import type { IdeaPlatform } from "@/lib/hub/schema";

type CurrentFilters = {
  project?: string;
  platform?: string;
  status?: string;
  tag?: string;
};

function buildHref(
  basePath: string,
  current: CurrentFilters,
  key: keyof CurrentFilters,
  value: string,
): string {
  const params = new URLSearchParams();
  const merged: CurrentFilters = { ...current };

  if (value) merged[key] = value;
  else delete merged[key];

  for (const [k, v] of Object.entries(merged)) {
    if (v) params.set(k, v);
  }

  const query = params.toString();

  return query ? `${basePath}?${query}` : basePath;
}

function FilterRow({
  label,
  options,
  active,
  hrefFor,
}: {
  label: string;
  options: { value: string; label: string }[];
  active?: string;
  hrefFor: (value: string) => string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-muted-foreground w-16 shrink-0 text-xs font-medium uppercase">
        {label}
      </span>
      {options.map((option) => (
        <Button
          key={option.value || "all"}
          asChild
          size="sm"
          variant={active === option.value ? "default" : "outline"}
        >
          <Link href={hrefFor(option.value)}>{option.label}</Link>
        </Button>
      ))}
    </div>
  );
}

export function IdeaFilters({
  basePath,
  current,
  showPlatform = true,
}: {
  basePath: string;
  current: CurrentFilters;
  showPlatform?: boolean;
}) {
  const platformOptions = [
    { value: "", label: "Semua" },
    ...(Object.keys(PLATFORM_LABELS) as IdeaPlatform[]).map((platform) => ({
      value: platform,
      label: PLATFORM_LABELS[platform],
    })),
  ];

  const statusOptions = [
    { value: "", label: "Semua" },
    ...IDEA_STATUS_ORDER.map((status) => ({
      value: status,
      label: IDEA_STATUS_LABELS[status],
    })),
  ];

  return (
    <div className="space-y-3">
      {showPlatform ? (
        <FilterRow
          label="Platform"
          options={platformOptions}
          active={current.platform}
          hrefFor={(value) => buildHref(basePath, current, "platform", value)}
        />
      ) : null}
      <FilterRow
        label="Status"
        options={statusOptions}
        active={current.status}
        hrefFor={(value) => buildHref(basePath, current, "status", value)}
      />
    </div>
  );
}
