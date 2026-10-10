import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  isOwner: vi.fn(),
  getIdea: vi.fn(),
  updateIdea: vi.fn(),
  deleteIdea: vi.fn(),
}));

vi.mock("@/lib/hub/session", () => ({ isOwner: mocks.isOwner }));
vi.mock("@/lib/hub/store", () => ({
  getIdea: mocks.getIdea,
  updateIdea: mocks.updateIdea,
  deleteIdea: mocks.deleteIdea,
}));

import { DELETE, GET, PATCH } from "./route";

const context = (id: string) => ({ params: Promise.resolve({ id }) });

function jsonRequest(method: string, body: unknown) {
  return new Request("http://test/api/hub/ideas/1", {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  mocks.isOwner.mockReset();
  mocks.getIdea.mockReset();
  mocks.updateIdea.mockReset();
  mocks.deleteIdea.mockReset();
  mocks.isOwner.mockResolvedValue(true);
  mocks.getIdea.mockResolvedValue({ id: 1, title: "Ide" });
  mocks.updateIdea.mockResolvedValue({ id: 1, title: "Diperbarui" });
  mocks.deleteIdea.mockResolvedValue(true);
});

describe("/api/hub/ideas/[id]", () => {
  it("menolak bila bukan owner", async () => {
    mocks.isOwner.mockResolvedValue(false);

    const response = await DELETE(
      new Request("http://test/api/hub/ideas/1", { method: "DELETE" }),
      context("1"),
    );

    expect(response.status).toBe(401);
    expect(mocks.deleteIdea).not.toHaveBeenCalled();
  });

  it("menolak id tidak valid", async () => {
    const response = await GET(
      new Request("http://test/api/hub/ideas/abc"),
      context("abc"),
    );

    expect(response.status).toBe(400);
    expect(mocks.getIdea).not.toHaveBeenCalled();
  });

  it("404 bila ide tidak ditemukan", async () => {
    mocks.getIdea.mockResolvedValue(null);

    const response = await GET(
      new Request("http://test/api/hub/ideas/9"),
      context("9"),
    );

    expect(response.status).toBe(404);
  });

  it("memperbarui ide dengan patch valid", async () => {
    const response = await PATCH(
      jsonRequest("PATCH", { status: "planned" }),
      context("1"),
    );

    expect(response.status).toBe(200);
    expect(mocks.updateIdea).toHaveBeenCalledWith(1, { status: "planned" });
  });

  it("menolak patch tidak valid", async () => {
    const response = await PATCH(
      jsonRequest("PATCH", { status: "ngawur" }),
      context("1"),
    );

    expect(response.status).toBe(400);
    expect(mocks.updateIdea).not.toHaveBeenCalled();
  });

  it("menghapus ide dan mengembalikan 204", async () => {
    const response = await DELETE(
      new Request("http://test/api/hub/ideas/1", { method: "DELETE" }),
      context("1"),
    );

    expect(response.status).toBe(204);
    expect(mocks.deleteIdea).toHaveBeenCalledWith(1);
  });

  it("404 saat menghapus ide yang tidak ada", async () => {
    mocks.deleteIdea.mockResolvedValue(false);

    const response = await DELETE(
      new Request("http://test/api/hub/ideas/1", { method: "DELETE" }),
      context("1"),
    );

    expect(response.status).toBe(404);
  });
});
