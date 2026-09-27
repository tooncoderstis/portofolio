import "server-only";

import { Pool } from "pg";

import { env } from "./env";

let pool: Pool | null = null;

export function getPool(): Pool | null {
  if (!env.DATABASE_URL) return null;

  if (!pool) {
    pool = new Pool({ connectionString: env.DATABASE_URL, max: 5 });
  }

  return pool;
}

export type SnapshotInput = {
  source: string;
  capturedOn: string;
  payload: unknown;
};

export type SnapshotRow = {
  capturedOn: string;
  payload: unknown;
};

const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS snapshot (
  id bigserial PRIMARY KEY,
  source text NOT NULL,
  captured_on date NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT snapshot_source_captured_on_key UNIQUE (source, captured_on)
)`;

export async function upsertSnapshot({
  source,
  capturedOn,
  payload,
}: SnapshotInput): Promise<boolean> {
  const client = getPool();

  if (!client) return false;

  await client.query(CREATE_TABLE_SQL);
  await client.query(
    `INSERT INTO snapshot (source, captured_on, payload)
     VALUES ($1, $2, $3::jsonb)
     ON CONFLICT (source, captured_on)
     DO UPDATE SET payload = EXCLUDED.payload, created_at = now()`,
    [source, capturedOn, JSON.stringify(payload)],
  );

  return true;
}

export async function getSnapshots(
  source: string,
  days: number,
): Promise<SnapshotRow[]> {
  const client = getPool();

  if (!client) return [];

  await client.query(CREATE_TABLE_SQL);

  const { rows } = await client.query<{ captured_on: Date; payload: unknown }>(
    `SELECT captured_on, payload
       FROM snapshot
      WHERE source = $1
        AND captured_on >= (CURRENT_DATE - ($2::int - 1))
      ORDER BY captured_on ASC`,
    [source, days],
  );

  return rows.map((row) => ({
    capturedOn: row.captured_on.toISOString().slice(0, 10),
    payload: row.payload,
  }));
}
