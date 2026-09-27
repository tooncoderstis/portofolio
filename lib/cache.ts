import "server-only";

import Redis from "ioredis";

import { env } from "./env";

export interface CacheStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
}

export class MemoryStore implements CacheStore {
  private readonly entries = new Map<
    string,
    { value: string; expiresAt: number }
  >();

  async get(key: string): Promise<string | null> {
    const entry = this.entries.get(key);

    if (!entry) return null;

    if (entry.expiresAt <= Date.now()) {
      this.entries.delete(key);
      return null;
    }

    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    this.entries.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }
}

class RedisStore implements CacheStore {
  private readonly client: Redis;

  constructor(url: string) {
    this.client = new Redis(url, { maxRetriesPerRequest: 2 });
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.client.set(key, value, "EX", ttlSeconds);
  }
}

let store: CacheStore | null = null;

export function createMemoryStore(): CacheStore {
  return new MemoryStore();
}

export function getCacheStore(): CacheStore {
  if (!store) {
    store = env.REDIS_URL ? new RedisStore(env.REDIS_URL) : new MemoryStore();
  }

  return store;
}

export function setCacheStore(next: CacheStore | null): void {
  store = next;
}

export const CACHE_TTL_SECONDS = 60 * 60;
export const STALE_TTL_SECONDS = 60 * 60 * 24 * 7;

const CACHE_PREFIX = "cache:";
const STALE_PREFIX = "stale:";

async function readJson<T>(cache: CacheStore, key: string): Promise<T | null> {
  const raw = await cache.get(key);

  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function getCached<T>(key: string): Promise<T | null> {
  return readJson<T>(getCacheStore(), `${CACHE_PREFIX}${key}`);
}

export async function setCached<T>(
  key: string,
  value: T,
  ttlSeconds: number = CACHE_TTL_SECONDS,
): Promise<void> {
  await getCacheStore().set(
    `${CACHE_PREFIX}${key}`,
    JSON.stringify(value),
    ttlSeconds,
  );
}

export async function getStale<T>(key: string): Promise<T | null> {
  return readJson<T>(getCacheStore(), `${STALE_PREFIX}${key}`);
}

export async function setStale<T>(
  key: string,
  value: T,
  ttlSeconds: number = STALE_TTL_SECONDS,
): Promise<void> {
  await getCacheStore().set(
    `${STALE_PREFIX}${key}`,
    JSON.stringify(value),
    ttlSeconds,
  );
}
