import "server-only";

import { cookies } from "next/headers";

import { env } from "@/lib/env";

import { SESSION_COOKIE, verifySessionToken } from "./auth";

export function isOwnerConfigured(): boolean {
  return Boolean(env.HUB_PASSWORD_HASH && env.HUB_SESSION_SECRET);
}

export async function isOwner(): Promise<boolean> {
  if (!env.HUB_SESSION_SECRET) return false;

  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  if (!token) return false;

  return verifySessionToken(token, env.HUB_SESSION_SECRET);
}
