import { NextResponse } from "next/server";

import { isOwner } from "@/lib/hub/session";
import { listNotifications, markAllNotificationsRead } from "@/lib/hub/store";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isOwner())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ notifications: await listNotifications() });
}

export async function POST() {
  if (!(await isOwner())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  await markAllNotificationsRead();

  return NextResponse.json({ ok: true });
}
