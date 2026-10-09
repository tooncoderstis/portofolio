import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  runIngest: vi.fn(),
  env: {
    HUB_INGEST_SECRET: undefined as string | undefined,
    NODE_ENV: "test" as string,
  },
}));

vi.mock("@/lib/hub/ingest", () => ({ runIngest: mocks.runIngest }));
vi.mock("@/lib/env", () => ({ env: mocks.env }));

import { POST } from "./route";

function request(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://test/api/hub/ingest", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

const validPayload = {
  project: { slug: "portofolio", name: "Portofolio" },
  phases: [{ id: "1.1", title: "Fondasi", status: "done" }],
};

beforeEach(() => {
  mocks.runIngest.mockReset();
  mocks.runIngest.mockResolvedValue({
    project: "portofolio",
    phaseCount: 1,
    completed: [],
  });
  mocks.env.HUB_INGEST_SECRET = undefined;
  mocks.env.NODE_ENV = "test";
});

describe("/api/hub/ingest", () => {
  it("mengizinkan tanpa secret di luar produksi", async () => {
    const response = await POST(request(validPayload));

    expect(response.status).toBe(200);
    expect(mocks.runIngest).toHaveBeenCalledOnce();
  });

  it("menolak di produksi tanpa secret", async () => {
    mocks.env.NODE_ENV = "production";

    const response = await POST(request(validPayload));

    expect(response.status).toBe(401);
    expect(mocks.runIngest).not.toHaveBeenCalled();
  });

  it("menerima header secret yang benar", async () => {
    mocks.env.HUB_INGEST_SECRET = "rahasia";

    const unauthorized = await POST(request(validPayload));
    expect(unauthorized.status).toBe(401);

    const authorized = await POST(
      request(validPayload, { "x-hub-secret": "rahasia" }),
    );
    expect(authorized.status).toBe(200);
  });

  it("menolak payload tidak valid", async () => {
    const response = await POST(request({ project: { slug: "Bukan Valid" } }));

    expect(response.status).toBe(400);
    expect(mocks.runIngest).not.toHaveBeenCalled();
  });
});
