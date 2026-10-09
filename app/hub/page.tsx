import { AutoRefresh } from "@/components/hub/auto-refresh";
import { ProjectCard } from "@/components/hub/project-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listProjects } from "@/lib/hub/store";

export const dynamic = "force-dynamic";

export default async function HubPage() {
  const projects = await listProjects();

  return (
    <div className="space-y-8">
      <AutoRefresh />
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Hub Proyek</h1>
        <p className="text-muted-foreground text-sm">
          Progres semua proyek yang melapor ke hub. Diperbarui otomatis saat
          opencode menyelesaikan fase.
        </p>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Belum ada proyek</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2 text-sm">
            <p>
              Daftarkan folder proyek, lalu jalankan laporan dari tiap proyek.
            </p>
            <pre className="bg-muted mt-2 rounded-md p-3 text-xs">
              npm run hub:register
            </pre>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
