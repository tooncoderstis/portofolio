import "server-only";

import { z } from "zod";

const emptyToUndefined = (value: unknown): unknown =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalString = z.preprocess(
  emptyToUndefined,
  z.string().min(1).optional(),
);
const optionalUrl = z.preprocess(emptyToUndefined, z.url().optional());

const envSchema = z.object({
  NODE_ENV: z.preprocess(
    emptyToUndefined,
    z.enum(["development", "test", "production"]).default("development"),
  ),
  APP_VERSION: z.preprocess(emptyToUndefined, z.string().default("0.1.0")),
  SITE_URL: z.preprocess(
    emptyToUndefined,
    z.url().default("http://localhost:3000"),
  ),
  GITHUB_TOKEN: optionalString,
  GITHUB_USERNAME: optionalString,
  WAKATIME_API_KEY: optionalString,
  MONKEYTYPE_USERNAME: optionalString,
  MONKEYTYPE_API_KEY: optionalString,
  UMAMI_API_URL: optionalUrl,
  UMAMI_API_KEY: optionalString,
  UMAMI_WEBSITE_ID: optionalString,
  DATABASE_URL: optionalString,
  REDIS_URL: optionalString,
  SNAPSHOT_SECRET: optionalString,
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(
  source: Record<string, string | undefined> = process.env,
): Env {
  const result = envSchema.safeParse(source);

  if (!result.success) {
    throw new Error(
      `Konfigurasi environment tidak valid: ${result.error.message}`,
    );
  }

  return result.data;
}

export const env = parseEnv();
