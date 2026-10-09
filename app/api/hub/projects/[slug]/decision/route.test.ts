import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  isOwner: vi.fn(),
  getProject: vi.fn(),
  createDecision: vi.fn(),
}));

vi.mock("@/lib/hub/session", () => ({ isOwner: mocks.isOwner }));
vi.mock("@/lib/hub/store", () => ({
  getProject: mocks.getProject,
  createDecision: mocks.createDecision,
}));

import { POST } from "./route";

function request(body: unknown) {
  return new Request("http://test/api/hub/projects/portofolio/decision", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const context = { params: Promise.resolve({ slug: "portofolio" }) };

beforeEach(() => {
  mocks.isOwner.mockReset();
  mocks.getProject.mockReset();
  mocks.createDecision.mockReset();
  mocks.isOwner.mockResolvedValue(true);
  mocks.getProject.mockResolvedValue({ slug: "portofolio" });
  mocks.createDecision.mockResolvedValue(undefined);
});

describe("/api/hub/projects/[slug]/decision", () => {
  it("menolak bila bukan owner", async () => {
    mocks.isOwner.mockResolvedValue(false);

    const response = await POST(request({ action: "continue" }), context);

    expect(response.status).toBe(401);
    expect(mocks.createDecision).not.toHaveBeenCalled();
  });

  it("404 bila proyek tidak ada", async () => {
    mocks.getProject.mockResolvedValue(null);

    const response = await POST(request({ action: "continue" }), context);

    expect(response.status).toBe(404);
  });

  it("menolak aksi tidak valid", async () => {
    const response = await POST(request({ action: "mungkin" }), context);

    expect(response.status).toBe(400);
    expect(mocks.createDecision).not.toHaveBeenCalled();
  });

  it("menyimpan keputusan yang valid", async () => {
    const response = await POST(
      request({ action: "hold", phaseId: "3.4", note: "tunggu review" }),
      context,
    );

    expect(response.status).toBe(201);
    expect(mocks.createDecision).toHaveBeenCalledWith({
      project: "portofolio",
      action: "hold",
      phaseId: "3.4",
      note: "tunggu review",
    });
  });
});
