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
  started: PhaseTransition[];
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
  const started = transitions.filter((item) => item.to === "in_progress");
  const completed = transitions.filter((item) => item.to === "done");

  for (const transition of started) {
    await createNotification({
      project: project.slug,
      phaseId: transition.phaseId,
      type: "phase_started",
      title: `Fase ${transition.phaseId} mulai dikerjakan — ${project.name}`,
      body: transition.title,
    });

    await sendPushToAll({
      title: `Fase ${transition.phaseId} mulai dikerjakan`,
      body: `${project.name} — ${transition.title}`,
      url: `/hub/${project.slug}`,
    });
  }

  for (const transition of completed) {
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
    started,
    completed,
  };
}
