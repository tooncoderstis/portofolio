import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  upsertProject: vi.fn(),
  applyPhases: vi.fn(),
  createNotification: vi.fn(),
  sendPushToAll: vi.fn(),
}));

vi.mock("./store", () => ({
  upsertProject: mocks.upsertProject,
  applyPhases: mocks.applyPhases,
  createNotification: mocks.createNotification,
}));
vi.mock("./push", () => ({ sendPushToAll: mocks.sendPushToAll }));

import { runIngest } from "./ingest";

const payload = {
  project: { slug: "sigmalab", name: "SigmaLab" },
  phases: [
    { id: "A", title: "Setup", status: "in_progress" as const },
    { id: "B", title: "API", status: "done" as const },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.upsertProject.mockResolvedValue(undefined);
  mocks.applyPhases.mockResolvedValue([
    {
      project: "sigmalab",
      phaseId: "A",
      title: "Setup",
      from: "todo",
      to: "in_progress",
    },
    {
      project: "sigmalab",
      phaseId: "B",
      title: "API",
      from: "in_progress",
      to: "done",
    },
  ]);
  mocks.createNotification.mockResolvedValue(undefined);
  mocks.sendPushToAll.mockResolvedValue(1);
});

describe("runIngest", () => {
  it("menotifikasi fase mulai dan selesai", async () => {
    const result = await runIngest(payload);

    expect(result.started.map((item) => item.phaseId)).toEqual(["A"]);
    expect(result.completed.map((item) => item.phaseId)).toEqual(["B"]);
    expect(mocks.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({ type: "phase_started", phaseId: "A" }),
    );
    expect(mocks.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({ type: "phase_completed", phaseId: "B" }),
    );
    expect(mocks.sendPushToAll).toHaveBeenCalledTimes(2);
  });

  it("mengabaikan transisi reopen/pause", async () => {
    mocks.applyPhases.mockResolvedValue([
      {
        project: "sigmalab",
        phaseId: "C",
        title: "Dok",
        from: "in_progress",
        to: "todo",
      },
    ]);

    const result = await runIngest(payload);

    expect(result.started).toEqual([]);
    expect(result.completed).toEqual([]);
    expect(mocks.createNotification).not.toHaveBeenCalled();
    expect(mocks.sendPushToAll).not.toHaveBeenCalled();
  });

  it("senyap saat tidak ada fase berubah", async () => {
    mocks.applyPhases.mockResolvedValue([]);

    await runIngest(payload);

    expect(mocks.createNotification).not.toHaveBeenCalled();
    expect(mocks.sendPushToAll).not.toHaveBeenCalled();
  });
});
