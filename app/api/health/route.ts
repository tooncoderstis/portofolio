import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    status: "ok",
    version: process.env.APP_VERSION ?? "0.1.0",
    time: new Date().toISOString(),
  });
}
