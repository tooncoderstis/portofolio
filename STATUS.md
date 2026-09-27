# STATUS — Portofolio

> **Sumber kebenaran status & progres.** Baca file ini dulu sebelum melanjutkan pekerjaan.
> Riwayat rilis: [`CHANGELOG.md`](CHANGELOG.md) · Keputusan: [`docs/adr/`](docs/adr/) · Kebutuhan: [`PRD.md`](PRD.md).
> **Jangan simpan kredensial di file ini.**

- **Terakhir diperbarui**: 2026-09-27
- **Versi produksi aktif**: belum deploy ke EasyPanel (image lokal `portofolio:test` sudah terverifikasi)
- **Platform**: Next.js (App Router) + TypeScript + Tailwind + shadcn/ui · Postgres + Redis · EasyPanel (Docker image)

## TL;DR (konteks 30 detik)

Portofolio developer dengan dashboard live (GitHub, WakaTime, Umami, MonkeyType) plus halaman tentang saya dan proyek. Stack Next.js App Router + TS + Tailwind, data eksternal via API route server-side + ISR/Redis, tren dari snapshot harian Postgres. Deploy di EasyPanel sebagai Docker image. **FASE 1: 1.1–1.6 selesai. Dashboard live, halaman `/about` & `/projects`, dan grafik tren dari snapshot harian semua jalan. Sisa FASE 1: adapter Umami (butuh kredensial).**

> ⚠️ **Catatan keamanan**: `.env` sementara memakai token GitHub/WakaTime lama yang pernah terekspos di disk. **Rotasi token** sebelum push/deploy.
>
> ✏️ **Konten contoh perlu diedit**: `content/profile.mdx` (nama/kompetensi), `content/projects/*.mdx` (judul, ringkasan, `liveUrl` masih `https://example.com`).

## Checklist Scaffold

| Tahap | Judul                                     | Status                                     |
| ----- | ----------------------------------------- | ------------------------------------------ |
| 0     | Discovery & keputusan stack               | ✅                                         |
| 1     | Scaffold dokumentasi                      | ✅                                         |
| 2     | Bootstrap agen (AGENTS.md, opencode.json) | ✅                                         |
| 3     | Repo & health files + CI                  | ✅                                         |
| 4     | Kerangka Next.js                          | ✅                                         |
| 5     | Deploy EasyPanel                          | ✅ (scaffold; belum push/deploy ke server) |

## FASE 1 — Dashboard Live + Konten

| Sub | Judul                                                          | Status                 |
| --- | -------------------------------------------------------------- | ---------------------- |
| 1.1 | Fondasi data (env/http/cache/db + `docker-compose.yml`)        | ✅                     |
| 1.2 | Adapter GitHub end-to-end (GraphQL + REST)                     | ✅                     |
| 1.3 | API route `GET /api/stats/[source]` (cache + stale + snapshot) | ✅                     |
| 1.4 | UI shell + widget dashboard (GitHub/WakaTime/MonkeyType)       | ✅                     |
| 1.5 | Halaman konten MDX (`/about`, `/projects`, `/projects/[slug]`) | ✅                     |
| 1.6 | Snapshot harian + grafik tren                                  | ✅ (menunggu evaluasi) |
| —   | Adapter Umami                                                  | ⬜ (butuh kredensial)  |

## Kondisi saat ini

- **Konten**: `lib/content.ts` (gray-matter + Zod) memvalidasi `content/profile.mdx` dan `content/projects/*.mdx` (schema ketat; slug file ↔ frontmatter divalidasi). Render MDX via `next-mdx-remote/rsc` + komponen styling di `components/mdx/`.
- **Halaman**: `/` (hero + dashboard, `force-dynamic`), `/about` (bio, kompetensi, pengalaman), `/projects` (filter status client-side), `/projects/[slug]` (SSG via `generateStaticParams`, 404 untuk slug tak dikenal). Navigasi di header.
- **Snapshot & tren**: `lib/snapshot.ts` (`snapshotAll` → `refreshStats` paksa fetch + upsert), `POST/GET /api/snapshot` (dilindungi `SNAPSHOT_SECRET`; 401 tanpa secret di produksi), `lib/trends.ts` (+ `extractMetric`), `GET /api/trends/[source]?days=30`, dan widget `TrendWidget`/`TrendChart` di beranda.
- Verifikasi: `typecheck` ✅ · `lint` ✅ · `test` ✅ **68 test** · `build` ✅. Live: snapshot 401 tanpa secret; dengan secret → github/wakatime/monkeytype `ok`, umami `skipped`; 3 baris `snapshot` di Postgres; `/api/trends/github` mengembalikan poin; beranda memuat seksi "Tren (30 hari)".
- **Home dinamis**: `export const dynamic = "force-dynamic"` agar data dashboard tidak ter-bake saat build; cache tetap dikelola Redis. `next.config.ts` memakai `outputFileTracingIncludes` agar `content/**` ikut ke image standalone.
- Git repo lokal `main`; belum ada remote.

## Yang belum selesai / menunggu

| Item                              | Catatan                                                            |
| --------------------------------- | ------------------------------------------------------------------ |
| Evaluasi manual sub-tahap 1.6     | `POST /api/snapshot`, cek `/api/trends/github` & beranda           |
| Edit konten contoh                | Nama, kompetensi, pengalaman, proyek, `liveUrl` nyata              |
| Adapter Umami                     | Menunggu kredensial Umami                                          |
| Rotasi token (GitHub & WakaTime)  | Token lama pernah terekspos di disk                                |
| Deploy nyata ke EasyPanel         | Butuh registry + env produksi dari pemilik                         |
| Push ke GitHub                    | Menunggu perintah pemilik; `gh` belum dijalankan                   |
| `npm audit` (postcss via Next 15) | Tunda; perbaikan butuh Next 16 (breaking) → pertimbangkan ADR baru |

## Cara menjalankan & menguji

```sh
npm install
docker compose up -d     # Postgres + Redis lokal
npm run dev              # http://localhost:3000
npm run stats:check      # verifikasi live 3 sumber (butuh .env)
npm run lint
npm run typecheck
npm test
npm run build
```

## Rilis

```powershell
powershell -File deploy/easypanel-docker/build-push.ps1 -Image <registry>/portofolio -Tag <versi> -Push
```

→ pasang image di EasyPanel (Source: Docker Image), port 3000, HTTPS. Detail: [`docs/runbooks/`](docs/runbooks/).

## Referensi cepat

- PRD: `PRD.md` · Changelog: `CHANGELOG.md` · ADR: `docs/adr/README.md` · Runbook: `docs/runbooks/`
