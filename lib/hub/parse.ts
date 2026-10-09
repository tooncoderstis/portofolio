import type { IngestPhase, PhaseStatus } from "./schema";

const PHASE_ID = /^\d+(?:\.\d+)*$/;
const SEPARATOR = /^:?-{2,}:?$/;

function detectStatus(cells: string[]): PhaseStatus | null {
  for (const cell of cells) {
    if (/✅|✔|✓/.test(cell)) return "done";
  }

  for (const cell of cells) {
    if (/🔄|🚧|⏳/.test(cell)) return "in_progress";
  }

  for (const cell of cells) {
    if (/⬜|❌|⛔/.test(cell)) return "todo";
  }

  return null;
}

function splitRow(line: string): string[] {
  const trimmed = line.trim();

  if (!trimmed.startsWith("|")) return [];

  const cells = trimmed
    .split("|")
    .slice(1, -1)
    .map((cell) => cell.trim());

  if (cells.every((cell) => cell === "" || SEPARATOR.test(cell))) return [];

  return cells;
}

export function parseStatusPhases(markdown: string): IngestPhase[] {
  if (!markdown) return [];

  const phases: IngestPhase[] = [];
  const seen = new Set<string>();

  for (const line of markdown.split(/\r?\n/)) {
    const cells = splitRow(line);

    if (cells.length < 3) continue;

    const id = cells[0];

    if (!PHASE_ID.test(id) || seen.has(id)) continue;

    const status = detectStatus(cells);

    if (!status) continue;

    const title = cells[1] || cells[2];

    if (!title || detectStatus([title])) continue;

    seen.add(id);
    phases.push({ id, title, status });
  }

  return phases;
}

export function comparePhaseIds(a: string, b: string): number {
  const left = a.split(".").map(Number);
  const right = b.split(".").map(Number);
  const length = Math.max(left.length, right.length);

  for (let index = 0; index < length; index += 1) {
    const diff = (left[index] ?? -1) - (right[index] ?? -1);

    if (diff !== 0) return diff;
  }

  return 0;
}
