import type { IngestPhase, PhaseStatus } from "./schema";

const PHASE_ID = /^(?:\d+(?:\.\d+)*|[A-Za-z]+)$/;
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

export type PhaseTransitionInfo = {
  phaseId: string;
  title: string;
  from: PhaseStatus;
  to: PhaseStatus;
};

export function diffPhaseTransitions(
  previous: { phaseId: string; title: string; status: PhaseStatus }[],
  next: IngestPhase[],
): PhaseTransitionInfo[] {
  const before = new Map(
    previous.map((phase) => [phase.phaseId, phase.status]),
  );
  const transitions: PhaseTransitionInfo[] = [];

  for (const phase of next) {
    const from = before.get(phase.id);

    if (!from || from === phase.status) continue;

    transitions.push({
      phaseId: phase.id,
      title: phase.title,
      from,
      to: phase.status,
    });
  }

  return transitions;
}

export function comparePhaseIds(a: string, b: string): number {
  const left = a.split(".");
  const right = b.split(".");
  const length = Math.max(left.length, right.length);

  for (let index = 0; index < length; index += 1) {
    const l = left[index];
    const r = right[index];

    if (l === undefined) return -1;
    if (r === undefined) return 1;

    if (/^\d+$/.test(l) && /^\d+$/.test(r)) {
      const diff = Number(l) - Number(r);

      if (diff !== 0) return diff;
    } else {
      const cmp = l.localeCompare(r);

      if (cmp !== 0) return cmp;
    }
  }

  return 0;
}
