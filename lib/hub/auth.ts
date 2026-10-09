import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

export const SESSION_COOKIE = "hub_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

const SCRYPT_PREFIX = "scrypt";
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LENGTH);
  const derived = scryptSync(password, salt, KEY_LENGTH);

  return `${SCRYPT_PREFIX}$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split("$");

  if (parts.length !== 3 || parts[0] !== SCRYPT_PREFIX) return false;

  const salt = Buffer.from(parts[1], "hex");
  const expected = Buffer.from(parts[2], "hex");

  if (salt.length === 0 || expected.length === 0) return false;

  const derived = scryptSync(password, salt, expected.length);

  return (
    derived.length === expected.length && timingSafeEqual(derived, expected)
  );
}

type SessionPayload = { exp: number };

function sign(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  return left.length === right.length && timingSafeEqual(left, right);
}

export function createSessionToken(
  secret: string,
  now: Date = new Date(),
): string {
  const payload: SessionPayload = {
    exp: Math.floor(now.getTime() / 1000) + SESSION_TTL_SECONDS,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");

  return `${body}.${sign(body, secret)}`;
}

export function verifySessionToken(
  token: string,
  secret: string,
  now: Date = new Date(),
): boolean {
  const separator = token.indexOf(".");

  if (separator <= 0) return false;

  const body = token.slice(0, separator);
  const signature = token.slice(separator + 1);

  if (!safeEqual(signature, sign(body, secret))) return false;

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as SessionPayload;

    return (
      typeof payload.exp === "number" && payload.exp * 1000 > now.getTime()
    );
  } catch {
    return false;
  }
}

export function readCookie(
  cookieHeader: string | null,
  name: string,
): string | null {
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(";")) {
    const [key, ...rest] = part.trim().split("=");

    if (key === name) return rest.join("=") || null;
  }

  return null;
}
