import type { GithubCalendarDay } from "@/lib/adapters/github";
import { cn } from "@/lib/utils";

const LEVEL_CLASS: Record<number, string> = {
  0: "bg-muted",
  1: "bg-emerald-200 dark:bg-emerald-950",
  2: "bg-emerald-300 dark:bg-emerald-800",
  3: "bg-emerald-400 dark:bg-emerald-600",
  4: "bg-emerald-600 dark:bg-emerald-400",
};

export function getLevelClass(level: number): string {
  return LEVEL_CLASS[level] ?? "bg-muted";
}

export function ContributionHeatmap({
  weeks,
}: {
  weeks: GithubCalendarDay[][];
}) {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex gap-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-rows-7 gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.count} kontribusi pada ${day.date}`}
                className={cn(
                  "size-2.5 rounded-[3px]",
                  getLevelClass(day.level),
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
