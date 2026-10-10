import type { IdeaStatus } from "@/lib/hub/schema";

export const IDEA_STATUS_LABELS: Record<IdeaStatus, string> = {
  inbox: "Kotak masuk",
  exploring: "Dieksplorasi",
  planned: "Direncanakan",
  done: "Selesai",
  archived: "Diarsipkan",
};

export const IDEA_STATUS_ORDER: IdeaStatus[] = [
  "inbox",
  "exploring",
  "planned",
  "done",
  "archived",
];

export const IDEA_PRIORITY_LABELS: Record<number, string> = {
  1: "Tinggi",
  2: "Sedang",
  3: "Rendah",
};

export function priorityLabel(value: number): string {
  return IDEA_PRIORITY_LABELS[value] ?? "Sedang";
}
