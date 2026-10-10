export type ProjectProgress = {
  done: number;
  total: number;
  progress: number;
};

export function buildProgressMap(
  hubProjects: {
    slug: string;
    done: number;
    total: number;
    progress: number;
  }[],
): Record<string, ProjectProgress> {
  return Object.fromEntries(
    hubProjects.map((project) => [
      project.slug,
      {
        done: project.done,
        total: project.total,
        progress: project.progress,
      },
    ]),
  );
}
