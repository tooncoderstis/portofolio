import { NextResponse } from "next/server";
import { z } from "zod";

import { isOwner } from "@/lib/hub/session";
import { pushSubscriptionSchema } from "@/lib/hub/schema";
import { removePushSubscription, savePushSubscription } from "@/lib/hub/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await isOwner())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = pushSubscriptionSchema.safeParse(
    await request.json().catch(() => null),
  );

  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  await savePushSubscription(parsed.data);

  return NextResponse.json({ ok: true }, { status: 201 });
}

const deleteSchema = z.object({ endpoint: z.url().max(2000) });

export async function DELETE(request: Request) {
  if (!(await isOwner())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = deleteSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  await removePushSubscription(parsed.data.endpoint);

  return NextResponse.json({ ok: true });
}
