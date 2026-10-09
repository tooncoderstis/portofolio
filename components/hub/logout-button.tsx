"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onLogout() {
    setPending(true);

    try {
      await fetch("/api/hub/auth/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={onLogout} disabled={pending}>
      {pending ? "Keluar…" : "Keluar"}
    </Button>
  );
}
