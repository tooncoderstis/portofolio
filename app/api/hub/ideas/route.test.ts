import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  isOwner: vi.fn(),
  listIdeas: vi.fn(),
  createIdea: vi.fn(),
}));

vi.mock("@/lib/hub/session", () => ({ isOwner: mocks.isOwner }));
vi.mock("@/lib/hub/store", () => ({
  listIdeas: mocks.listIdeas,
  createIdea: mocks.createIdea,
}));

import { GET, POST } from "./route";

function get(query = "") {
  return new Request(`http://test/api/hub/ideas${query}`);
}

function post(body: unknown) {
  return new Request("http://test/api/hub/ideas", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  mocks.isOwner.mockReset();
  mocks.listIdeas.mockReset();
  mocks.createIdea.mockReset();
  mocks.isOwner.mockResolvedValue(true);
  mocks.listIdeas.mockResolvedValue([]);
  mocks.createIdea.mockImplementation(async (input) => ({ id: 1, ...input }));
});

describe("/api/hub/ideas", () => {
  it("menolak GET bila bukan owner", async () => {
    mocks.isOwner.mockResolvedValue(false);

    const response = await GET(get());

    expect(response.status).toBe(401);
    expect(mocks.listIdeas).not.toHaveBeenCalled();
  });

  it("meneruskan filter ke listIdeas", async () => {
    const response = await GET(
      get("?project=sigmalab&platform=tiktok&status=inbox&tag=ai"),
    );

    expect(response.status).toBe(200);
    expect(mocks.listIdeas).toHaveBeenCalledWith({
      project: "sigmalab",
      platform: "tiktok",
      status: "inbox",
      tag: "ai",
    });
  });

  it("menolak filter platform tidak valid", async () => {
    const response = await GET(get("?platform=facebook"));

    expect(response.status).toBe(400);
    expect(mocks.listIdeas).not.toHaveBeenCalled();
  });

  it("menolak POST tanpa judul", async () => {
    const response = await POST(post({ summary: "tanpa judul" }));

    expect(response.status).toBe(400);
    expect(mocks.createIdea).not.toHaveBeenCalled();
  });

  it("mendeteksi platform dari tautan saat membuat ide", async () => {
    const response = await POST(
      post({
        title: "Ide dari Threads",
        sourceUrl: "https://threads.net/@a/b/1",
      }),
    );

    expect(response.status).toBe(201);
    expect(mocks.createIdea).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Ide dari Threads",
        platform: "threads",
      }),
    );
  });

  it("menghormati platform eksplisit tanpa tautan", async () => {
    await POST(post({ title: "Ide internal", project: "portofolio" }));

    expect(mocks.createIdea).toHaveBeenCalledWith(
      expect.objectContaining({ platform: "other", project: "portofolio" }),
    );
  });
});
