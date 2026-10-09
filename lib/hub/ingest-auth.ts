import "server-only";

import { env } from "@/lib/env";
import { safeEqual } from "./auth";

export function isIngestAuthorized(request: Request): boolean {
  if (!env.HUB_INGEST_SECRET) {
    return env.NODE_ENV !== "production";
  }

  const url = new URL(request.url);
  const provided =
    request.headers.get("x-hub-secret") ?? url.searchParams.get("secret");

  return provided ? safeEqual(provided, env.HUB_INGEST_SECRET) : false;
}
