"use client";

import Link from "next/link";
import { useState } from "react";

import { StatusBadge } from "@/components/projects/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Project } from "@/lib/content";

const FILTERS = [
  { value: "all", label: "Semua" },
  { value: "in-progress", label: "Sedang dikerjakan" },
  { value: "completed", label: "Selesai" },
] as const;

type FilterValue = (typeof FILTERS)[number]["value"];

export function ProjectList({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<FilterValue>("all");
  const visible = projects.filter(
    (project) => filter === "all" || project.status === filter,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <Button
            key={item.value}
            size="sm"
            variant={filter === item.value ? "default" : "outline"}
            onClick={() => setFilter(item.value)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {visible.map((project) => (
          <Card key={project.slug} className="flex h-full flex-col">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <CardTitle>
                  <Link
                    href={`/projects/${project.slug}`}
                    className="hover:underline"
                  >
                    {project.title}
                  </Link>
                </CardTitle>
                <StatusBadge status={project.status} />
              </div>
              <CardDescription>{project.summary}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex flex-wrap gap-2">
                {project.stack.map((tech) => (
                  <Badge key={tech} variant="secondary">
                    {tech}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex gap-4 text-sm">
              <Link
                href={`/projects/${project.slug}`}
                className="font-medium underline underline-offset-4"
              >
                Detail
              </Link>
              {project.repoUrl ? (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:underline"
                >
                  Repo
                </a>
              ) : null}
              {project.liveUrl ? (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:underline"
                >
                  Live
                </a>
              ) : null}
            </CardFooter>
          </Card>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Tidak ada proyek pada filter ini.
        </p>
      ) : null}
    </div>
  );
}
