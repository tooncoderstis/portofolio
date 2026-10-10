import { z } from "zod";

export const phaseStatusSchema = z.enum(["todo", "in_progress", "done"]);
export type PhaseStatus = z.infer<typeof phaseStatusSchema>;

export const ingestPhaseSchema = z.object({
  id: z.string().min(1).max(64),
  title: z.string().min(1).max(300),
  status: phaseStatusSchema,
});
export type IngestPhase = z.infer<typeof ingestPhaseSchema>;

export const hubProjectSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(200),
  path: z.string().max(500).optional(),
});
export type HubProjectInput = z.infer<typeof hubProjectSchema>;

const markdownSchema = z.string().max(400_000);

export const ingestPayloadSchema = z.object({
  project: hubProjectSchema,
  phases: z.array(ingestPhaseSchema).max(500).optional(),
  statusMarkdown: markdownSchema.optional(),
  prdMarkdown: markdownSchema.optional(),
  event: z.enum(["phase_completed"]).optional(),
  phaseId: z.string().max(64).optional(),
});
export type IngestPayload = z.infer<typeof ingestPayloadSchema>;

export const registerPayloadSchema = z.object({
  projects: z.array(hubProjectSchema).max(200),
  prune: z.boolean().optional(),
});
export type RegisterPayload = z.infer<typeof registerPayloadSchema>;

export const decisionActionSchema = z.enum(["continue", "hold"]);
export type DecisionAction = z.infer<typeof decisionActionSchema>;

export const decisionPayloadSchema = z.object({
  action: decisionActionSchema,
  phaseId: z.string().max(64).optional(),
  note: z.string().max(2000).optional(),
});
export type DecisionPayload = z.infer<typeof decisionPayloadSchema>;

export const pushSubscriptionSchema = z.object({
  endpoint: z.url().max(2000),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});
export type PushSubscriptionInput = z.infer<typeof pushSubscriptionSchema>;

export const ideaPlatformSchema = z.enum([
  "threads",
  "x",
  "tiktok",
  "instagram",
  "youtube",
  "website",
  "other",
]);
export type IdeaPlatform = z.infer<typeof ideaPlatformSchema>;

export const ideaStatusSchema = z.enum([
  "inbox",
  "exploring",
  "planned",
  "done",
  "archived",
]);
export type IdeaStatus = z.infer<typeof ideaStatusSchema>;

const ideaProjectSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9-]+$/);

export const ideaCreateSchema = z.object({
  title: z.string().min(1).max(200),
  summary: z.string().max(2000).optional(),
  notesMarkdown: z.string().max(100_000).optional(),
  platform: ideaPlatformSchema.optional(),
  sourceUrl: z.url().max(2000).optional(),
  tags: z.array(z.string().min(1).max(40)).max(20).optional(),
  status: ideaStatusSchema.optional(),
  priority: z.number().int().min(1).max(3).optional(),
  project: ideaProjectSchema.optional(),
});
export type IdeaCreateInput = z.infer<typeof ideaCreateSchema>;

export const ideaUpdateSchema = ideaCreateSchema.partial();
export type IdeaUpdateInput = z.infer<typeof ideaUpdateSchema>;
