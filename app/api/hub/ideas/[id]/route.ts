import { NextResponse } from "next/server";

import { ideaUpdateSchema } from "@/lib/hub/schema";
import { isOwner } from "@/lib/hub/session";
import { deleteIdea, getIdea, updateIdea } from "@/lib/hub/store";

export const dynamic = "force-dynamic";

type RouteProps = { params: Promise<{ id: string }> };

function parseId(raw: string): number | null {
  const id = Number(raw);

  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(_request: Request, { params }: RouteProps) {
  if (!(await isOwner())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const id = parseId((await params).id);

  if (!id) return NextResponse.json({ error: "invalid_id" }, { status: 400 });

  const idea = await getIdea(id);

  if (!idea) return NextResponse.json({ error: "not_found" }, { status: 404 });

  return NextResponse.json({ idea });
}

export async function PATCH(request: Request, { params }: RouteProps) {
  if (!(await isOwner())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const id = parseId((await params).id);

  if (!id) return NextResponse.json({ error: "invalid_id" }, { status: 400 });

  const parsed = ideaUpdateSchema.safeParse(
    await request.json().catch(() => null),
  );

  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_body", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const idea = await updateIdea(id, parsed.data);

  if (!idea) return NextResponse.json({ error: "not_found" }, { status: 404 });

  return NextResponse.json({ idea });
}

export async function DELETE(_request: Request, { params }: RouteProps) {
  if (!(await isOwner())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const id = parseId((await params).id);

  if (!id) return NextResponse.json({ error: "invalid_id" }, { status: 400 });

  const removed = await deleteIdea(id);

  if (!removed) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
