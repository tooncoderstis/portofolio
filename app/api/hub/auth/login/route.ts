import { NextResponse } from "next/server";
import { z } from "zod";

import { env } from "@/lib/env";
import {
  createSessionToken,
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  verifyPassword,
} from "@/lib/hub/auth";

export const dynamic = "force-dynamic";

const bodySchema = z.object({ password: z.string().min(1) });

export async function POST(request: Request) {
  if (!env.HUB_PASSWORD_HASH || !env.HUB_SESSION_SECRET) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!verifyPassword(parsed.data.password, env.HUB_PASSWORD_HASH)) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set({
    name: SESSION_COOKIE,
    value: createSessionToken(env.HUB_SESSION_SECRET),
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });

  return response;
}
