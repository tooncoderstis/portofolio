# STATUS — Portofolio

> **Sumber kebenaran status & progres.** Baca file ini dulu sebelum melanjutkan pekerjaan.
> Riwayat rilis: [`CHANGELOG.md`](CHANGELOG.md) · Keputusan: [`docs/adr/`](docs/adr/) · Kebutuhan: [`PRD.md`](PRD.md).
> **Jangan simpan kredensial di file ini.**

- **Terakhir diperbarui**: 2026-09-27
- **Versi produksi aktif**: belum deploy ke EasyPanel (image lokal `portofolio:test` sudah terverifikasi)
- **Platform**: Next.js (App Router) + TypeScript + Tailwind + shadcn/ui · Postgres + Redis · EasyPanel (Docker image)

## TL;DR (konteks 30 detik)

Portofolio developer dengan dashboard live (GitHub, WakaTime, Umami, MonkeyType) plus halaman tentang saya dan proyek. Stack Next.js App Router + TS + Tailwind, data eksternal via API route server-side + ISR/Redis, tren dari snapshot harian Postgres. Deploy di EasyPanel sebagai Docker image. **FASE 1: 1.1–1.5 selesai. Dashboard (GitHub/WakaTime/MonkeyType) + halaman `/about` & `/projects` (MDX) sudah jalan. Berikutnya 1.6 (snapshot harian + grafik tren) atau Umami (butuh kredensial).**

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
| 1.5 | Halaman konten MDX (`/about`, `/projects`, `/projects/[slug]`) | ✅ (menunggu evaluasi) |
| 1.6 | Snapshot harian + grafik tren                                  | ⬜                     |
| —   | Adapter Umami                                                  | ⬜ (butuh kredensial)  |

## Kondisi saat ini

- **Konten**: `lib/content.ts` (gray-matter + Zod) memvalidasi `content/profile.mdx` dan `content/projects/*.mdx` (schema ketat; slug file ↔ frontmatter divalidasi). Render MDX via `next-mdx-remote/rsc` + komponen styling di `components/mdx/`.
- **Halaman**: `/` (hero + dashboard, `force-dynamic`), `/about` (bio, kompetensi, pengalaman), `/projects` (filter status client-side), `/projects/[slug]` (SSG via `generateStaticParams`, 404 untuk slug tak dikenal). Navigasi di header.
- **Home dinamis**: `export const dynamic = "force-dynamic"` agar data dashboard tidak ter-bake saat build; cache tetap dikelola Redis.
- **Deploy**: `next.config.ts` memakai `outputFileTracingIncludes` agar `content/**` ikut ke image standalone (terverifikasi ada di `.next/standalone/content`).
- Verifikasi: `typecheck` ✅ · `lint` ✅ · `test` ✅ **56 test** · `build` ✅ · live: `/about`, `/projects`, `/projects/portofolio`, `/projects/contoh-proyek` 200; slug tak dikenal 404.
- Git repo lokal `main`; belum ada remote.

## Yang belum selesai / menunggu

| Item                              | Catatan                                                            |
| --------------------------------- | ------------------------------------------------------------------ |
| Evaluasi manual sub-tahap 1.5     | `npm run dev` → buka `/about`, `/projects`, detail proyek          |
| Edit konten contoh                | Nama, kompetensi, pengalaman, proyek, `liveUrl` nyata              |
| Snapshot harian + tren (1.6)      | Job terjadwal + grafik                                             |
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
