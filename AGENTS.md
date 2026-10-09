# AGENTS.md — Panduan Agen untuk Proyek Portofolio

## Project Bootstrap (WAJIB DIBACA DULU)

> Hemat token & jaga konteks antar sesi. Urutan baca:
>
> 1. `STATUS.md` — kondisi & pekerjaan terkini (satu-satunya sumber kebenaran progres).
> 2. `PRD.md` — **jangan baca penuh**; hanya buka section yang relevan dengan tugas.
> 3. `docs/adr/` — 1–2 ADR yang terkait perubahan.
> 4. Ekor `CHANGELOG.md` bila perlu konteks rilis.

Aturan kerja:

- Ikuti DoD: `kode → test → formatter → entri CHANGELOG → update STATUS → ADR bila keputusan → npm run hub:report`.
- Conventional Commits; jangan commit rahasia (`.env` di-ignore).
- Setiap route/endpoint ber-mutasi harus punya test.
- Untuk proyek baru/scaffold, gunakan skill `aasaprojectkit`.

## Ringkasan Proyek

Portofolio developer personal dengan **dashboard live** yang mengagregasi data dari GitHub, WakaTime, Umami, dan MonkeyType, plus halaman tentang saya dan proyek. Detail kebutuhan ada di `PRD.md`.

- **Stack**: Next.js (App Router) + TypeScript + Tailwind + shadcn/ui; Postgres + Redis; EasyPanel (Docker image).
- **Konten**: MDX in-repo (`content/`).
- **Rahasia**: environment variable server-only; tidak ada `NEXT_PUBLIC_` untuk token.

## Perintah Penting

```sh
npm install       # pasang dependensi
npm run dev       # dev server → http://localhost:3000
npm run lint      # ESLint
npm run typecheck # tsc --noEmit
npm test          # Vitest
npm run build     # build produksi
```

## Struktur Repo (rencana)

```
app/                 # App Router: halaman & API routes
  api/health/        #   probe status
  api/stats/[source] #   proxy + agregasi data eksternal
components/          # UI (shadcn/ui + kustom)
content/             # MDX: profile & projects
lib/                 # adapter per-sumber, cache, skema
deploy/easypanel-docker/  # Dockerfile, build-push.ps1, runbook
docs/                # adr/, runbooks/
```

## Konvensi Kode

- TypeScript strict; tidak ada `any` implisit.
- Server/client component dipisah jelas; token hanya di server.
- Setiap fetch eksternal lewat adapter di `lib/` dengan skema tervalidasi (Zod).
- Widget dashboard wajib punya state loading/sukses/error + fallback cache berlabel "stale".
- Jangan menambah komentar kecuali diminta.

## Batas (Guardrails)

- Jangan commit `.env*` (kecuali `.example`). Jalankan secret scan sebelum commit pertama.
- Jangan pernah menaruh kredensial di dokumen atau kode.
- Jangan mengubah ADR lama; bila keputusan berubah, buat ADR baru dengan status "Digantikan oleh ADR-XXXX".
- Git lokal dulu; push/create repo hanya bila diminta pemilik.
