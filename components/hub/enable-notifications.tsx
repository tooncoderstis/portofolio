"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type Status = "unsupported" | "off" | "on" | "denied";

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(normalized);
  const output = new Uint8Array(raw.length);

  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }

  return output;
}

export function EnableNotifications({
  publicKey,
}: {
  publicKey: string | null;
}) {
  const [status, setStatus] = useState<Status>("off");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (
      !publicKey ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      setStatus("unsupported");
      return;
    }

    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => setStatus(subscription ? "on" : "off"))
      .catch(() => setStatus("off"));
  }, [publicKey]);

  async function enable() {
    if (!publicKey) return;
    setPending(true);

    try {
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "off");
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });

      const response = await fetch("/api/hub/push/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });

      setStatus(response.ok ? "on" : "off");
    } catch {
      setStatus("off");
    } finally {
      setPending(false);
    }
  }

  async function disable() {
    setPending(true);

    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        await fetch("/api/hub/push/subscribe", {
          method: "DELETE",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ endpoint }),
        });
      }

      setStatus("off");
    } catch {
      // biarkan status apa adanya
    } finally {
      setPending(false);
    }
  }

  if (status === "unsupported") {
    return (
      <p className="text-muted-foreground text-xs">
        Browser ini tidak mendukung Web Push.
      </p>
    );
  }

  if (status === "denied") {
    return (
      <p className="text-muted-foreground text-xs">
        Notifikasi diblokir. Aktifkan lewat pengaturan situs di browser.
      </p>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        variant={status === "on" ? "outline" : "default"}
        size="sm"
        onClick={status === "on" ? disable : enable}
        disabled={pending || !publicKey}
      >
        {status === "on" ? "Matikan notifikasi" : "Aktifkan notifikasi fase"}
      </Button>
      <span className="text-muted-foreground text-xs">
        {status === "on" ? "Aktif" : "Nonaktif"}
      </span>
    </div>
  );
}
