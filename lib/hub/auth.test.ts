import { describe, expect, it } from "vitest";

import {
  createSessionToken,
  hashPassword,
  readCookie,
  verifyPassword,
  verifySessionToken,
} from "./auth";

describe("password", () => {
  it("memverifikasi password yang benar", () => {
    const stored = hashPassword("rahasia-kuat");

    expect(stored).toMatch(/^scrypt\$[0-9a-f]+\$[0-9a-f]+$/);
    expect(verifyPassword("rahasia-kuat", stored)).toBe(true);
  });

  it("menolak password yang salah", () => {
    const stored = hashPassword("rahasia-kuat");

    expect(verifyPassword("salah", stored)).toBe(false);
  });

  it("menolak hash dengan format tidak dikenal", () => {
    expect(verifyPassword("apa saja", "bukan-hash")).toBe(false);
    expect(verifyPassword("apa saja", "scrypt$abc$")).toBe(false);
  });

  it("menghasilkan salt berbeda tiap kali", () => {
    expect(hashPassword("sama")).not.toBe(hashPassword("sama"));
  });
});

describe("session token", () => {
  const secret = "secret-uji";

  it("memverifikasi token yang baru dibuat", () => {
    const token = createSessionToken(secret);

    expect(verifySessionToken(token, secret)).toBe(true);
  });

  it("menolak token dengan secret berbeda", () => {
    const token = createSessionToken(secret);

    expect(verifySessionToken(token, "secret-lain")).toBe(false);
  });

  it("menolak token yang dipalsukan", () => {
    const token = createSessionToken(secret);

    expect(verifySessionToken(`${token}x`, secret)).toBe(false);
    expect(verifySessionToken("rusak", secret)).toBe(false);
  });

  it("menolak token yang kedaluwarsa", () => {
    const past = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
    const token = createSessionToken(secret, past);

    expect(verifySessionToken(token, secret)).toBe(false);
  });
});

describe("readCookie", () => {
  it("mengembalikan nilai cookie yang cocok", () => {
    expect(readCookie("a=1; hub_session=abc.def; b=2", "hub_session")).toBe(
      "abc.def",
    );
  });

  it("mengembalikan null bila tidak ada", () => {
    expect(readCookie("a=1; b=2", "hub_session")).toBeNull();
    expect(readCookie(null, "hub_session")).toBeNull();
  });
});
