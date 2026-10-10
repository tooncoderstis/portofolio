import { describe, expect, it } from "vitest";

import { detectPlatform } from "./platform";

describe("detectPlatform", () => {
  it("mendeteksi platform dari hostname", () => {
    expect(detectPlatform("https://www.threads.net/@foo/post/123")).toBe(
      "threads",
    );
    expect(detectPlatform("https://x.com/foo/status/123")).toBe("x");
    expect(detectPlatform("https://twitter.com/foo/status/123")).toBe("x");
    expect(detectPlatform("https://www.tiktok.com/@foo/video/123")).toBe(
      "tiktok",
    );
    expect(detectPlatform("https://www.instagram.com/reel/abc/")).toBe(
      "instagram",
    );
    expect(detectPlatform("https://youtu.be/abc")).toBe("youtube");
  });

  it("mengembalikan website untuk domain lain", () => {
    expect(detectPlatform("https://example.com/artikel")).toBe("website");
  });

  it("mengembalikan other untuk URL kosong atau tidak valid", () => {
    expect(detectPlatform()).toBe("other");
    expect(detectPlatform(null)).toBe("other");
    expect(detectPlatform("")).toBe("other");
    expect(detectPlatform("bukan url")).toBe("other");
  });

  it("tidak salah mencocokkan domain yang mirip", () => {
    expect(detectPlatform("https://notx.com/foo")).toBe("website");
    expect(detectPlatform("https://tiktok.com.evil.example/foo")).toBe(
      "website",
    );
  });
});
