import { describe, expect, it } from "vitest";

import {
  formatDuration,
  formatNumber,
  formatPercent,
  formatRelativeTime,
} from "./format";

describe("formatNumber", () => {
  it("memformat dengan pemisah ribuan gaya Indonesia", () => {
    expect(formatNumber(17)).toBe("17");
    expect(formatNumber(48000)).toBe("48.000");
  });
});

describe("formatPercent", () => {
  it("menambahkan tanda persen", () => {
    expect(formatPercent(66.7)).toBe("66.7%");
  });
});

describe("formatDuration", () => {
  it("memformat jam, menit, dan detik", () => {
    expect(formatDuration(45000)).toBe("12j 30m");
    expect(formatDuration(300)).toBe("5m");
    expect(formatDuration(45)).toBe("45s");
    expect(formatDuration(0)).toBe("0s");
  });
});

describe("formatRelativeTime", () => {
  const now = new Date("2026-09-27T12:00:00Z");

  it("menangani baru saja, menit, jam, dan hari", () => {
    expect(formatRelativeTime("2026-09-27T11:59:40Z", now)).toBe("baru saja");
    expect(formatRelativeTime("2026-09-27T11:30:00Z", now)).toBe(
      "30 menit lalu",
    );
    expect(formatRelativeTime("2026-09-27T09:00:00Z", now)).toBe("3 jam lalu");
    expect(formatRelativeTime("2026-09-25T12:00:00Z", now)).toBe("2 hari lalu");
  });

  it("mengembalikan 'tidak diketahui' untuk tanggal tidak valid", () => {
    expect(formatRelativeTime("bukan-tanggal", now)).toBe("tidak diketahui");
  });
});
