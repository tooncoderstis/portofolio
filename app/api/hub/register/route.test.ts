import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  isIngestAuthorized: vi.fn(),
  upsertProject: vi.fn(),
  pruneMissingProjects: vi.fn(),
}));

vi.mock("@/lib/hub/ingest-auth", () => ({
  isIngestAuthorized: mocks.isIngestAuthorized,
}));
vi.mock("@/lib/hub/store", () => ({
  upsertProject: mocks.upsertProject,
  pruneMissingProjects: mocks.pruneMissingProjects,
}));

import { POST } from "./route";

function request(body: unknown) {
  return new Request("http://test/api/hub/register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.isIngestAuthorized.mockReturnValue(true);
  mocks.upsertProject.mockResolvedValue(undefined);
  mocks.pruneMissingProjects.mockResolvedValue([]);
});

describe("/api/hub/register", () => {
  it("menolak tanpa secret", async () => {
    mocks.isIngestAuthorized.mockReturnValue(false);

    const response = await POST(
      request({ projects: [{ slug: "a", name: "A" }] }),
    );

    expect(response.status).toBe(401);
    expect(mocks.upsertProject).not.toHaveBeenCalled();
  });

  it("menolak payload tidak valid", async () => {
    const response = await POST(
      request({ projects: [{ slug: "Bukan Valid" }] }),
    );

    expect(response.status).toBe(400);
  });

  it("mendaftarkan proyek tanpa prune", async () => {
    const response = await POST(
      request({ projects: [{ slug: "a", name: "A" }] }),
    );

    expect(response.status).toBe(200);
    expect(mocks.upsertProject).toHaveBeenCalledWith({
      slug: "a",
      name: "A",
      path: undefined,
    });
    expect(mocks.pruneMissingProjects).not.toHaveBeenCalled();
  });

  it("menolak prune dengan daftar kosong", async () => {
    const response = await POST(request({ projects: [], prune: true }));

    expect(response.status).toBe(400);
    expect(mocks.pruneMissingProjects).not.toHaveBeenCalled();
  });

  it("prune menghapus proyek di luar daftar", async () => {
    mocks.pruneMissingProjects.mockResolvedValue(["lama"]);

    const response = await POST(
      request({ projects: [{ slug: "a", name: "A" }], prune: true }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.pruned).toEqual(["lama"]);
    expect(mocks.pruneMissingProjects).toHaveBeenCalledWith(["a"]);
  });
});
