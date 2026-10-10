"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!deferred || hidden) return null;

  async function install() {
    if (!deferred) return;

    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setHidden(true);
  }

  return (
    <div className="border-border/60 bg-background fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-lg border p-3 shadow-lg sm:right-6 sm:left-auto">
      <div className="min-w-0">
        <p className="text-sm font-medium">Pasang sebagai aplikasi</p>
        <p className="text-muted-foreground truncate text-xs">
          Akses lebih cepat dan bisa dibuka offline.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button size="sm" onClick={install}>
          Instal
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setHidden(true)}>
          Nanti
        </Button>
      </div>
    </div>
  );
}
