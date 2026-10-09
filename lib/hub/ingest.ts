import "server-only";

import { parseStatusPhases } from "./parse";
import { sendPushToAll } from "./push";
import type { IngestPayload } from "./schema";
import {
  applyPhases,
  createNotification,
  upsertProject,
  type PhaseTransition,
} from "./store";

export type IngestResult = {
  project: string;
  phaseCount: number;
  completed: PhaseTransition[];
};

export async function runIngest(payload: IngestPayload): Promise<IngestResult> {
  const { project } = payload;
  const phases =
    payload.phases && payload.phases.length > 0
      ? payload.phases
      : parseStatusPhases(payload.statusMarkdown ?? "");

  await upsertProject({
    slug: project.slug,
    name: project.name,
    path: project.path,
    statusMarkdown: payload.statusMarkdown,
    prdMarkdown: payload.prdMarkdown,
  });

  const transitions = await applyPhases(project.slug, phases);

  for (const transition of transitions) {
    await createNotification({
      project: project.slug,
      phaseId: transition.phaseId,
      type: "phase_completed",
      title: `Fase ${transition.phaseId} selesai — ${project.name}`,
      body: transition.title,
    });

    await sendPushToAll({
      title: `Fase ${transition.phaseId} selesai`,
      body: `${project.name} — ${transition.title}`,
      url: `/hub/${project.slug}`,
    });
  }

  return {
    project: project.slug,
    phaseCount: phases.length,
    completed: transitions,
  };
}
