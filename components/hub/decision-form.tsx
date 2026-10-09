"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type PhaseOption = { phaseId: string; title: string; status: string };

export function DecisionForm({
  slug,
  phases,
}: {
  slug: string;
  phases: PhaseOption[];
}) {
  const router = useRouter();
  const [action, setAction] = useState<"continue" | "hold">("continue");
  const [phaseId, setPhaseId] = useState("");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const response = await fetch(`/api/hub/projects/${slug}/decision`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action,
          phaseId: phaseId || undefined,
          note: note || undefined,
        }),
      });

      if (!response.ok) {
        setError("Gagal menyimpan keputusan.");
        return;
      }

      setNote("");
      router.refresh();
    } catch {
      setError("Tidak dapat menghubungi server.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={action === "continue" ? "default" : "outline"}
          size="sm"
          onClick={() => setAction("continue")}
        >
          Lanjutkan fase berikutnya
        </Button>
        <Button
          type="button"
          variant={action === "hold" ? "destructive" : "outline"}
          size="sm"
          onClick={() => setAction("hold")}
        >
          Tahan dulu
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-medium">Fase (opsional)</span>
          <select
            value={phaseId}
            onChange={(event) => setPhaseId(event.target.value)}
            className="border-input bg-background focus-visible:border-ring h-9 w-full rounded-md border px-3 text-sm outline-none"
          >
            <option value="">— tidak spesifik —</option>
            {phases.map((phase) => (
              <option key={phase.phaseId} value={phase.phaseId}>
                {phase.phaseId} · {phase.title}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm sm:col-span-2">
          <span className="font-medium">Catatan (opsional)</span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={2}
            className="border-input bg-background focus-visible:border-ring w-full rounded-md border px-3 py-2 text-sm outline-none"
          />
        </label>
      </div>

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      <Button type="submit" disabled={pending} size="sm">
        {pending ? "Menyimpan…" : "Simpan keputusan"}
      </Button>
    </form>
  );
}
