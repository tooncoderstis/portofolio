import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  snapshotAll: vi.fn(),
  env: {
    SNAPSHOT_SECRET: undefined as string | undefined,
    NODE_ENV: "test" as string,
  },
}));

vi.mock("@/lib/snapshot", () => ({ snapshotAll: mocks.snapshotAll }));
vi.mock("@/lib/env", () => ({ env: mocks.env }));

import { GET, POST } from "./route";

beforeEach(() => {
  mocks.snapshotAll.mockReset();
  mocks.snapshotAll.mockResolvedValue([{ source: "github", status: "ok" }]);
  mocks.env.SNAPSHOT_SECRET = undefined;
  mocks.env.NODE_ENV = "test";
});

describe("/api/snapshot", () => {
  it("mengizinkan tanpa secret di luar produksi", async () => {
    const response = await POST(new Request("http://test/api/snapshot"));

    expect(response.status).toBe(200);
    expect((await response.json()).results).toHaveLength(1);
  });

  it("menolak di produksi bila secret belum diatur", async () => {
    mocks.env.NODE_ENV = "production";

    const response = await GET(new Request("http://test/api/snapshot"));

    expect(response.status).toBe(401);
    expect(mocks.snapshotAll).not.toHaveBeenCalled();
  });

  it("menerima header secret yang benar", async () => {
    mocks.env.SNAPSHOT_SECRET = "rahasia";

    const unauthorized = await POST(new Request("http://test/api/snapshot"));
    expect(unauthorized.status).toBe(401);

    const authorized = await POST(
      new Request("http://test/api/snapshot", {
        headers: { "x-snapshot-secret": "rahasia" },
      }),
    );
    expect(authorized.status).toBe(200);
  });
});
