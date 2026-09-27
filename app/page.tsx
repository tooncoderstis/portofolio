export default function Home() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-24">
      <h1 className="text-3xl font-bold tracking-tight">Portofolio</h1>
      <p className="text-muted-foreground">
        Kerangka Next.js siap. Dashboard live akan dibangun pada FASE 1.
      </p>
      <p className="text-muted-foreground text-sm">
        Status sistem:{" "}
        <a className="underline" href="/api/health">
          /api/health
        </a>
      </p>
    </main>
  );
}
