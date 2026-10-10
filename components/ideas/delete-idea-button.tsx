"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function DeleteIdeaButton({
  id,
  redirectTo = "/hub/ideas",
}: {
  id: number;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onClick() {
    if (!window.confirm("Hapus ide ini?")) return;

    setPending(true);

    try {
      const response = await fetch(`/api/hub/ideas/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push(redirectTo);
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={onClick}
      disabled={pending}
    >
      {pending ? "Menghapus…" : "Hapus"}
    </Button>
  );
}
