import "server-only";

import type { Pool } from "pg";

import { getPool } from "@/lib/db";

import { comparePhaseIds } from "./parse";
import type {
  DecisionAction,
  IngestPhase,
  PhaseStatus,
  PushSubscriptionInput,
} from "./schema";

export class HubNotConfiguredError extends Error {
  constructor() {
    super("Hub membutuhkan DATABASE_URL.");
    this.name = "HubNotConfiguredError";
  }
}

const HUB_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS hub_project (
  slug text PRIMARY KEY,
  name text NOT NULL,
  path text,
  status_md text,
  prd_md text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS hub_phase (
  project text NOT NULL,
  phase_id text NOT NULL,
  title text NOT NULL,
  status text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (project, phase_id)
);
CREATE TABLE IF NOT EXISTS hub_notification (
  id bigserial PRIMARY KEY,
  project text NOT NULL,
  phase_id text,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS push_subscription (
  id bigserial PRIMARY KEY,
  endpoint text UNIQUE NOT NULL,
  keys jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS hub_decision (
  id bigserial PRIMARY KEY,
  project text NOT NULL,
  action text NOT NULL,
  phase_id text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
)`;

export type HubPhase = {
  phaseId: string;
  title: string;
  status: PhaseStatus;
};

export type HubProjectSummary = {
  slug: string;
  name: string;
  path: string | null;
  updatedAt: string | null;
  phases: HubPhase[];
  total: number;
  done: number;
  progress: number;
};

export type HubProjectDetail = HubProjectSummary & {
  statusMd: string | null;
  prdMd: string | null;
};

export type PhaseTransition = {
  project: string;
  phaseId: string;
  title: string;
};

export type HubNotification = {
  id: number;
  project: string;
  phaseId: string | null;
  type: string;
  title: string;
  body: string | null;
  read: boolean;
  createdAt: string;
};

export type HubDecision = {
  id: number;
  project: string;
  action: DecisionAction;
  phaseId: string | null;
  note: string | null;
  createdAt: string;
};

export type PushSubscription = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

type Client = Pool;

async function withSchema<T>(
  run: (client: Client) => Promise<T>,
  fallback: T,
): Promise<T> {
  const client = getPool();

  if (!client) return fallback;

  await client.query(HUB_SCHEMA_SQL);

  return run(client);
}

function toIso(value: Date | string | null): string | null {
  if (!value) return null;

  return value instanceof Date ? value.toISOString() : String(value);
}

export function computeProgress(phases: { status: PhaseStatus }[]): {
  total: number;
  done: number;
  progress: number;
} {
  const total = phases.length;
  const done = phases.filter((phase) => phase.status === "done").length;
  const progress = total === 0 ? 0 : Math.round((done / total) * 100);

  return { total, done, progress };
}

export async function upsertProject(input: {
  slug: string;
  name: string;
  path?: string;
  statusMarkdown?: string;
  prdMarkdown?: string;
}): Promise<void> {
  await withSchema(async (client) => {
    await client.query(
      `INSERT INTO hub_project (slug, name, path, status_md, prd_md, updated_at)
       VALUES ($1, $2, $3, $4, $5, now())
       ON CONFLICT (slug) DO UPDATE SET
         name = EXCLUDED.name,
         path = COALESCE(EXCLUDED.path, hub_project.path),
         status_md = COALESCE(EXCLUDED.status_md, hub_project.status_md),
         prd_md = COALESCE(EXCLUDED.prd_md, hub_project.prd_md),
         updated_at = now()`,
      [
        input.slug,
        input.name,
        input.path ?? null,
        input.statusMarkdown ?? null,
        input.prdMarkdown ?? null,
      ],
    );
  }, undefined);
}

async function readPhases(client: Client, project: string) {
  const { rows } = await client.query<{
    phase_id: string;
    title: string;
    status: PhaseStatus;
  }>(`SELECT phase_id, title, status FROM hub_phase WHERE project = $1`, [
    project,
  ]);

  return rows.map((row) => ({
    phaseId: row.phase_id,
    title: row.title,
    status: row.status,
  }));
}

export async function applyPhases(
  project: string,
  phases: IngestPhase[],
): Promise<PhaseTransition[]> {
  return withSchema(async (client) => {
    const existing = await readPhases(client, project);
    const previous = new Map(
      existing.map((phase) => [phase.phaseId, phase.status]),
    );
    const transitions: PhaseTransition[] = [];

    for (const phase of phases) {
      const before = previous.get(phase.id);

      if (before && before !== "done" && phase.status === "done") {
        transitions.push({
          project,
          phaseId: phase.id,
          title: phase.title,
        });
      }

      await client.query(
        `INSERT INTO hub_phase (project, phase_id, title, status, updated_at)
         VALUES ($1, $2, $3, $4, now())
         ON CONFLICT (project, phase_id) DO UPDATE SET
           title = EXCLUDED.title,
           status = EXCLUDED.status,
           updated_at = CASE
             WHEN hub_phase.status <> EXCLUDED.status THEN now()
             ELSE hub_phase.updated_at
           END`,
        [project, phase.id, phase.title, phase.status],
      );
    }

    return transitions;
  }, []);
}

export async function listProjects(): Promise<HubProjectSummary[]> {
  return withSchema(async (client) => {
    const projects = await client.query<{
      slug: string;
      name: string;
      path: string | null;
      updated_at: Date | null;
    }>(
      `SELECT slug, name, path, updated_at FROM hub_project ORDER BY name ASC`,
    );

    const phases = await client.query<{
      project: string;
      phase_id: string;
      title: string;
      status: PhaseStatus;
    }>(
      `SELECT project, phase_id, title, status FROM hub_phase ORDER BY phase_id ASC`,
    );

    const grouped = new Map<string, HubPhase[]>();

    for (const row of phases.rows) {
      const list = grouped.get(row.project) ?? [];
      list.push({
        phaseId: row.phase_id,
        title: row.title,
        status: row.status,
      });
      grouped.set(row.project, list);
    }

    return projects.rows.map((row) => {
      const list = (grouped.get(row.slug) ?? []).sort((a, b) =>
        comparePhaseIds(a.phaseId, b.phaseId),
      );

      return {
        slug: row.slug,
        name: row.name,
        path: row.path,
        updatedAt: toIso(row.updated_at),
        phases: list,
        ...computeProgress(list),
      };
    });
  }, []);
}

export async function getProject(
  slug: string,
): Promise<HubProjectDetail | null> {
  return withSchema(async (client) => {
    const { rows } = await client.query<{
      slug: string;
      name: string;
      path: string | null;
      status_md: string | null;
      prd_md: string | null;
      updated_at: Date | null;
    }>(
      `SELECT slug, name, path, status_md, prd_md, updated_at
         FROM hub_project WHERE slug = $1`,
      [slug],
    );

    const row = rows[0];

    if (!row) return null;

    const phases = (await readPhases(client, slug)).sort((a, b) =>
      comparePhaseIds(a.phaseId, b.phaseId),
    );

    return {
      slug: row.slug,
      name: row.name,
      path: row.path,
      statusMd: row.status_md,
      prdMd: row.prd_md,
      updatedAt: toIso(row.updated_at),
      phases,
      ...computeProgress(phases),
    };
  }, null);
}

export async function createNotification(input: {
  project: string;
  phaseId: string | null;
  type: string;
  title: string;
  body: string | null;
}): Promise<void> {
  await withSchema(async (client) => {
    await client.query(
      `INSERT INTO hub_notification (project, phase_id, type, title, body)
       VALUES ($1, $2, $3, $4, $5)`,
      [input.project, input.phaseId, input.type, input.title, input.body],
    );
  }, undefined);
}

export async function listNotifications(
  limit = 50,
): Promise<HubNotification[]> {
  return withSchema(async (client) => {
    const { rows } = await client.query<{
      id: string;
      project: string;
      phase_id: string | null;
      type: string;
      title: string;
      body: string | null;
      read: boolean;
      created_at: Date;
    }>(
      `SELECT id, project, phase_id, type, title, body, read, created_at
         FROM hub_notification
        ORDER BY created_at DESC
        LIMIT $1`,
      [limit],
    );

    return rows.map((row) => ({
      id: Number(row.id),
      project: row.project,
      phaseId: row.phase_id,
      type: row.type,
      title: row.title,
      body: row.body,
      read: row.read,
      createdAt: row.created_at.toISOString(),
    }));
  }, []);
}

export async function markAllNotificationsRead(): Promise<void> {
  await withSchema(async (client) => {
    await client.query(`UPDATE hub_notification SET read = true`);
  }, undefined);
}

export async function createDecision(input: {
  project: string;
  action: DecisionAction;
  phaseId: string | null;
  note: string | null;
}): Promise<void> {
  await withSchema(async (client) => {
    await client.query(
      `INSERT INTO hub_decision (project, action, phase_id, note)
       VALUES ($1, $2, $3, $4)`,
      [input.project, input.action, input.phaseId, input.note],
    );
  }, undefined);
}

export async function listDecisions(
  project?: string,
  limit = 100,
): Promise<HubDecision[]> {
  return withSchema(async (client) => {
    const { rows } = await client.query<{
      id: string;
      project: string;
      action: DecisionAction;
      phase_id: string | null;
      note: string | null;
      created_at: Date;
    }>(
      `SELECT id, project, action, phase_id, note, created_at
         FROM hub_decision
        WHERE ($1::text IS NULL OR project = $1)
        ORDER BY created_at DESC
        LIMIT $2`,
      [project ?? null, limit],
    );

    return rows.map((row) => ({
      id: Number(row.id),
      project: row.project,
      action: row.action,
      phaseId: row.phase_id,
      note: row.note,
      createdAt: row.created_at.toISOString(),
    }));
  }, []);
}

export async function savePushSubscription(
  input: PushSubscriptionInput,
): Promise<void> {
  await withSchema(async (client) => {
    await client.query(
      `INSERT INTO push_subscription (endpoint, keys)
       VALUES ($1, $2::jsonb)
       ON CONFLICT (endpoint) DO UPDATE SET keys = EXCLUDED.keys`,
      [input.endpoint, JSON.stringify(input.keys)],
    );
  }, undefined);
}

export async function removePushSubscription(endpoint: string): Promise<void> {
  await withSchema(async (client) => {
    await client.query(`DELETE FROM push_subscription WHERE endpoint = $1`, [
      endpoint,
    ]);
  }, undefined);
}

export async function listPushSubscriptions(): Promise<PushSubscription[]> {
  return withSchema(async (client) => {
    const { rows } = await client.query<{
      endpoint: string;
      keys: { p256dh: string; auth: string };
    }>(`SELECT endpoint, keys FROM push_subscription`);

    return rows.map((row) => ({ endpoint: row.endpoint, keys: row.keys }));
  }, []);
}
