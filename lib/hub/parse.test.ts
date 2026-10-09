import { describe, expect, it } from "vitest";

import { comparePhaseIds, parseStatusPhases } from "./parse";

const SAMPLE = `# STATUS

| Sub | Judul                            | Status |
| --- | -------------------------------- | ------ |
| 1.1 | Fondasi data                     | ✅     |
| 1.2 | Adapter GitHub end-to-end        | ✅     |
| 1.3 | API route get stats              | 🔄     |
| —   | Adapter Umami                    | ⬜     |
| 2   | Bootstrap                        | ✅     | catatan |
`;

describe("parseStatusPhases", () => {
  it("mengekstrak fase beserta status", () => {
    expect(parseStatusPhases(SAMPLE)).toEqual([
      { id: "1.1", title: "Fondasi data", status: "done" },
      { id: "1.2", title: "Adapter GitHub end-to-end", status: "done" },
      { id: "1.3", title: "API route get stats", status: "in_progress" },
      { id: "2", title: "Bootstrap", status: "done" },
    ]);
  });

  it("mengabaikan baris tanpa id numerik dan tanpa status", () => {
    const phases = parseStatusPhases(SAMPLE);

    expect(phases.some((phase) => phase.id === "—")).toBe(false);
    expect(phases.some((phase) => phase.title === "Status")).toBe(false);
  });

  it("menandai status todo", () => {
    expect(parseStatusPhases("| 3.1 | Sesuatu | ⬜ |")).toEqual([
      { id: "3.1", title: "Sesuatu", status: "todo" },
    ]);
  });

  it("mengembalikan array kosong untuk markdown kosong", () => {
    expect(parseStatusPhases("")).toEqual([]);
  });

  it("menghapus duplikat id", () => {
    const raw = "| 1 | A | ✅ |\n| 1 | A (lagi) | ⬜ |";

    expect(parseStatusPhases(raw)).toEqual([
      { id: "1", title: "A", status: "done" },
    ]);
  });
});

describe("comparePhaseIds", () => {
  it("mengurutkan secara natural", () => {
    const sorted = ["1.10", "2", "1.2", "1.1"].sort(comparePhaseIds);

    expect(sorted).toEqual(["1.1", "1.2", "1.10", "2"]);
  });
});
