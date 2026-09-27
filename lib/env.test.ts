import { describe, expect, it } from "vitest";

import { parseEnv } from "./env";

describe("parseEnv", () => {
  it("memberi default untuk variabel opsional", () => {
    const env = parseEnv({});

    expect(env.NODE_ENV).toBe("development");
    expect(env.APP_VERSION).toBe("0.1.0");
    expect(env.SITE_URL).toBe("http://localhost:3000");
    expect(env.GITHUB_TOKEN).toBeUndefined();
    expect(env.DATABASE_URL).toBeUndefined();
  });

  it("memperlakukan string kosong sebagai undefined", () => {
    const env = parseEnv({ GITHUB_TOKEN: "", REDIS_URL: "   " });

    expect(env.GITHUB_TOKEN).toBeUndefined();
    expect(env.REDIS_URL).toBeUndefined();
  });

  it("menerima nilai yang valid", () => {
    const env = parseEnv({
      GITHUB_TOKEN: "ghp_contoh",
      UMAMI_API_URL: "https://api.umami.is/v1",
    });

    expect(env.GITHUB_TOKEN).toBe("ghp_contoh");
    expect(env.UMAMI_API_URL).toBe("https://api.umami.is/v1");
  });

  it("melempar error bila URL tidak valid", () => {
    expect(() => parseEnv({ UMAMI_API_URL: "bukan-url" })).toThrow(
      /tidak valid/,
    );
  });
});
