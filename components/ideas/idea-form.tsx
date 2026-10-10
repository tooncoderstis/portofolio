"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  IDEA_STATUS_LABELS,
  IDEA_STATUS_ORDER,
  priorityLabel,
} from "@/lib/ideas/meta";
import { PLATFORM_LABELS, detectPlatform } from "@/lib/ideas/platform";
import type { HubIdea } from "@/lib/hub/store";
import type { IdeaPlatform, IdeaStatus } from "@/lib/hub/schema";

type ProjectOption = { slug: string; name: string };

type IdeaFormProps = {
  projects?: ProjectOption[];
  idea?: HubIdea;
  defaultProject?: string;
  lockProject?: boolean;
  redirectTo?: string;
};

const inputClass =
  "border-input bg-background focus-visible:border-ring h-9 w-full rounded-md border px-3 text-sm outline-none";
const textareaClass =
  "border-input bg-background focus-visible:border-ring w-full rounded-md border px-3 py-2 text-sm outline-none";

export function IdeaForm({
  projects = [],
  idea,
  defaultProject,
  lockProject = false,
  redirectTo,
}: IdeaFormProps) {
  const router = useRouter();
  const editing = Boolean(idea);

  const [title, setTitle] = useState(idea?.title ?? "");
  const [summary, setSummary] = useState(idea?.summary ?? "");
  const [sourceUrl, setSourceUrl] = useState(idea?.sourceUrl ?? "");
  const [platform, setPlatform] = useState<IdeaPlatform>(
    idea?.platform ?? "other",
  );
  const [platformTouched, setPlatformTouched] = useState(Boolean(idea));
  const [status, setStatus] = useState<IdeaStatus>(idea?.status ?? "inbox");
  const [priority, setPriority] = useState(idea?.priority ?? 2);
  const [tags, setTags] = useState((idea?.tags ?? []).join(", "));
  const [notesMarkdown, setNotesMarkdown] = useState(idea?.notesMd ?? "");
  const [project, setProject] = useState(idea?.project ?? defaultProject ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onSourceChange(value: string) {
    setSourceUrl(value);

    if (!platformTouched) {
      setPlatform(value ? detectPlatform(value) : "other");
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Judul wajib diisi.");
      return;
    }

    setPending(true);
    setError(null);

    const payload = {
      title: title.trim(),
      summary: summary.trim() || undefined,
      sourceUrl: sourceUrl.trim() || undefined,
      platform,
      status,
      priority,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      notesMarkdown: notesMarkdown.trim() || undefined,
      project: lockProject ? defaultProject : project || undefined,
    };

    try {
      const response = await fetch(
        editing ? `/api/hub/ideas/${idea?.id}` : "/api/hub/ideas",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        setError("Gagal menyimpan ide.");
        return;
      }

      if (redirectTo) {
        router.push(redirectTo);
        return;
      }

      if (!editing) {
        setTitle("");
        setSummary("");
        setSourceUrl("");
        setTags("");
        setNotesMarkdown("");
        setPlatform("other");
        setPlatformTouched(false);
        setStatus("inbox");
        setPriority(2);
      }

      router.refresh();
    } catch {
      setError("Tidak dapat menghubungi server.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="space-y-1 text-sm">
        <span className="font-medium">Judul</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className={inputClass}
          placeholder="Ringkasan singkat ide"
          required
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-medium">Tautan sumber</span>
          <input
            value={sourceUrl}
            onChange={(event) => onSourceChange(event.target.value)}
            className={inputClass}
            placeholder="https://threads.net/... atau https://tiktok.com/..."
          />
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium">Platform</span>
          <select
            value={platform}
            onChange={(event) => {
              setPlatformTouched(true);
              setPlatform(event.target.value as IdeaPlatform);
            }}
            className={inputClass}
          >
            {(Object.keys(PLATFORM_LABELS) as IdeaPlatform[]).map((value) => (
              <option key={value} value={value}>
                {PLATFORM_LABELS[value]}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium">Status</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as IdeaStatus)}
            className={inputClass}
          >
            {IDEA_STATUS_ORDER.map((value) => (
              <option key={value} value={value}>
                {IDEA_STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium">Prioritas</span>
          <select
            value={priority}
            onChange={(event) => setPriority(Number(event.target.value))}
            className={inputClass}
          >
            {[1, 2, 3].map((value) => (
              <option key={value} value={value}>
                {priorityLabel(value)}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium">
            Proyek {lockProject ? "" : "(opsional)"}
          </span>
          <select
            value={project}
            disabled={lockProject}
            onChange={(event) => setProject(event.target.value)}
            className={`${inputClass} disabled:opacity-60`}
          >
            {!lockProject ? <option value="">— inbox umum —</option> : null}
            {projects.map((option) => (
              <option key={option.slug} value={option.slug}>
                {option.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium">Tag (pisahkan koma)</span>
          <input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            className={inputClass}
            placeholder="ai, produktivitas"
          />
        </label>
      </div>

      <label className="space-y-1 text-sm">
        <span className="font-medium">Ringkasan (opsional)</span>
        <textarea
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          rows={2}
          className={textareaClass}
        />
      </label>

      <label className="space-y-1 text-sm">
        <span className="font-medium">Catatan (markdown, opsional)</span>
        <textarea
          value={notesMarkdown}
          onChange={(event) => setNotesMarkdown(event.target.value)}
          rows={5}
          className={textareaClass}
        />
      </label>

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      <Button type="submit" disabled={pending} size="sm">
        {pending ? "Menyimpan…" : editing ? "Simpan perubahan" : "Tambah ide"}
      </Button>
    </form>
  );
}
