import { NextResponse } from "next/server";

import { isOwner } from "@/lib/hub/session";
import { listProjects } from "@/lib/hub/store";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isOwner())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ projects: await listProjects() });
}
