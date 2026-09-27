# STATUS — Portofolio

> **Sumber kebenaran status & progres.** Baca file ini dulu sebelum melanjutkan pekerjaan.
> Riwayat rilis: [`CHANGELOG.md`](CHANGELOG.md) · Keputusan: [`docs/adr/`](docs/adr/) · Kebutuhan: [`PRD.md`](PRD.md).
> **Jangan simpan kredensial di file ini.**

- **Terakhir diperbarui**: 2026-09-27
- **Versi produksi aktif**: belum deploy ke EasyPanel (image lokal `portofolio:test` sudah terverifikasi)
- **Platform**: Next.js (App Router) + TypeScript + Tailwind + shadcn/ui · Postgres + Redis · EasyPanel (Docker image)

## TL;DR (konteks 30 detik)

Portofolio developer dengan dashboard live (GitHub, WakaTime, Umami, MonkeyType) plus halaman tentang saya dan proyek. Stack Next.js App Router + TS + Tailwind, data eksternal via API route server-side + ISR/Redis, tren dari snapshot harian Postgres. Deploy di EasyPanel sebagai Docker image. **FASE 1: 1.1 & 1.2 selesai (adapter GitHub terverifikasi live); berikutnya 1.3 (`/api/stats/[source]`) lalu adapter WakaTime/MonkeyType.**

> ⚠️ **Catatan keamanan**: `.env` sementara memakai token GitHub/WakaTime lama yang pernah terekspos di disk. **Rotasi token** sebelum push/deploy.

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

| Sub | Judul                                                   | Status                 |
| --- | ------------------------------------------------------- | ---------------------- |
| 1.1 | Fondasi data (env/http/cache/db + `docker-compose.yml`) | ✅                     |
| 1.2 | Adapter GitHub end-to-end (GraphQL + REST)              | ✅ (menunggu evaluasi) |
| 1.3 | API route `GET /api/stats/[source]`                     | ⬜                     |
| 1.4 | UI shell + widget dashboard                             | ⬜                     |
| 1.5 | Halaman konten (MDX: `/about`, `/projects`)             | ⬜                     |
| 1.6 | Snapshot harian + grafik tren                           | ⬜                     |

Adapter lain: WakaTime ⬜ · MonkeyType ⬜ · Umami ⬜ (kredensial belum ada).

## Kondisi saat ini

- Modul fondasi: `lib/env.ts` (Zod), `lib/http.ts` (timeout+retry, tanpa server-only agar bisa dipakai script), `lib/cache.ts`, `lib/db.ts`.
- **Adapter GitHub** `lib/adapters/github.ts`: GraphQL `contributionsCollection` (kalender 365 hari + total + streak) dan REST repo (top bahasa). Kredensial diberikan sebagai argumen (route yang membaca `env`).
- Verifikasi **live** via `npm run stats:check` → user `tooncoderstis`, 17 kontribusi, streak terpanjang 2, top bahasa TS/Python.
- `npm run typecheck`, `npm run lint`, `npm test` (Vitest, **20 test**), `npm run build` semuanya **lolos**.
- `docker-compose.yml` (Postgres 16 + Redis 7) sehat; fallback in-memory/no-op tanpa env infra.

## Yang belum selesai / menunggu

| Item                              | Catatan                                                            |
| --------------------------------- | ------------------------------------------------------------------ |
| Evaluasi manual sub-tahap 1.2     | `npm run stats:check`                                              |
| Rotasi token (GitHub & WakaTime)  | Token lama pernah terekspos di disk                                |
| Adapter WakaTime / MonkeyType     | 1.2 lanjutan                                                       |
| Adapter Umami                     | Menunggu kredensial Umami                                          |
| Deploy nyata ke EasyPanel         | Butuh registry + env produksi dari pemilik                         |
| Push ke GitHub                    | Menunggu perintah pemilik; `gh` belum dijalankan                   |
| `npm audit` (postcss via Next 15) | Tunda; perbaikan butuh Next 16 (breaking) → pertimbangkan ADR baru |

## Cara menjalankan & menguji

```sh
npm install
docker compose up -d     # Postgres + Redis lokal
npm run dev              # http://localhost:3000
npm run stats:check      # verifikasi live adapter GitHub (butuh .env)
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
