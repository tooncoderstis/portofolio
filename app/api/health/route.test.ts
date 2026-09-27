import { describe, expect, it } from "vitest";

import { GET } from "./route";

describe("GET /api/health", () => {
  it("mengembalikan 200 dengan status, version, dan time", async () => {
    const res = GET();

    expect(res.status).toBe(200);

    const body = (await res.json()) as {
      status: string;
      version: string;
      time: string;
    };

    expect(body.status).toBe("ok");
    expect(typeof body.version).toBe("string");
    expect(body.version.length).toBeGreaterThan(0);
    expect(Number.isNaN(Date.parse(body.time))).toBe(false);
  });
});
