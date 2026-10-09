import "server-only";

import webpush, { WebPushError } from "web-push";

import { env } from "@/lib/env";

import {
  listPushSubscriptions,
  removePushSubscription,
  type PushSubscription,
} from "./store";

export function isPushConfigured(): boolean {
  return Boolean(
    env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY && env.VAPID_SUBJECT,
  );
}

export function getVapidPublicKey(): string | null {
  return env.VAPID_PUBLIC_KEY ?? null;
}

let configured = false;

function ensureConfigured(): boolean {
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY || !env.VAPID_SUBJECT) {
    return false;
  }

  if (!configured) {
    webpush.setVapidDetails(
      env.VAPID_SUBJECT,
      env.VAPID_PUBLIC_KEY,
      env.VAPID_PRIVATE_KEY,
    );
    configured = true;
  }

  return true;
}

export type PushPayload = { title: string; body?: string; url?: string };

export async function sendPushToAll(payload: PushPayload): Promise<number> {
  if (!ensureConfigured()) return 0;

  const subscriptions = await listPushSubscriptions();
  let sent = 0;

  await Promise.all(
    subscriptions.map(async (subscription: PushSubscription) => {
      try {
        await webpush.sendNotification(
          { endpoint: subscription.endpoint, keys: subscription.keys },
          JSON.stringify(payload),
        );
        sent += 1;
      } catch (error) {
        if (
          error instanceof WebPushError &&
          (error.statusCode === 404 || error.statusCode === 410)
        ) {
          await removePushSubscription(subscription.endpoint);
        }
      }
    }),
  );

  return sent;
}
