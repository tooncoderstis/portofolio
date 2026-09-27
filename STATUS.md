# STATUS — Portofolio

> **Sumber kebenaran status & progres.** Baca file ini dulu sebelum melanjutkan pekerjaan.
> Riwayat rilis: [`CHANGELOG.md`](CHANGELOG.md) · Keputusan: [`docs/adr/`](docs/adr/) · Kebutuhan: [`PRD.md`](PRD.md).
> **Jangan simpan kredensial di file ini.**

- **Terakhir diperbarui**: 2026-09-27
- **Versi produksi aktif**: belum deploy ke EasyPanel (image lokal `portofolio:test` sudah terverifikasi)
- **Platform**: Next.js (App Router) + TypeScript + Tailwind + shadcn/ui · Postgres + Redis · EasyPanel (Docker image)

## TL;DR (konteks 30 detik)

Portofolio developer dengan dashboard live (GitHub, WakaTime, Umami, MonkeyType) plus halaman tentang saya dan proyek. Stack Next.js App Router + TS + Tailwind, data eksternal via API route server-side + ISR/Redis, tren dari snapshot harian Postgres. Deploy di EasyPanel sebagai Docker image. **FASE 1: 1.1–1.3 selesai (route `/api/stats/[source]` terverifikasi live dengan cache Redis + snapshot Postgres); berikutnya 1.4 (UI widget dashboard) atau adapter WakaTime/MonkeyType.**

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

| Sub | Judul                                                          | Status                 |
| --- | -------------------------------------------------------------- | ---------------------- |
| 1.1 | Fondasi data (env/http/cache/db + `docker-compose.yml`)        | ✅                     |
| 1.2 | Adapter GitHub end-to-end (GraphQL + REST)                     | ✅                     |
| 1.3 | API route `GET /api/stats/[source]` (cache + stale + snapshot) | ✅ (menunggu evaluasi) |
| 1.4 | UI shell + widget dashboard                                    | ⬜                     |
| 1.5 | Halaman konten (MDX: `/about`, `/projects`)                    | ⬜                     |
| 1.6 | Snapshot harian + grafik tren                                  | ⬜                     |

Adapter lain: WakaTime ⬜ · MonkeyType ⬜ · Umami ⬜ (kredensial belum ada).

## Kondisi saat ini

- `lib/stats.ts`: service agregasi — cache Redis (TTL 1 jam) → fetch adapter → simpan cache + snapshot stale (7 hari) + upsert Postgres; saat upstream gagal → **fallback snapshot stale** (`meta.stale=true`).
- `app/api/stats/[source]/route.ts`: `github`→200, tak dikenal→404, belum diimplementasi→501, belum dikonfigurasi→503, upstream gagal→502.
- Verifikasi **live** (server produksi lokal): call #1 `cached:false` (fetch segar), call #2 `cached:true` (dari Redis); `wakatime`→501; `foo`→404; baris `snapshot` (source=github) masuk Postgres.
- `npm run typecheck`, `npm run lint`, `npm test` (Vitest, **31 test**), `npm run build` semuanya **lolos**.
- `docker-compose.yml` (Postgres 16 + Redis 7) sehat.

## Yang belum selesai / menunggu

| Item                              | Catatan                                                            |
| --------------------------------- | ------------------------------------------------------------------ |
| Evaluasi manual sub-tahap 1.3     | `npm run dev` → buka `/api/stats/github` (dua kali)                |
| Adapter WakaTime / MonkeyType     | Sub-tahap 1.2 lanjutan                                             |
| Adapter Umami                     | Menunggu kredensial Umami                                          |
| UI dashboard (1.4) & konten (1.5) | Belum dimulai                                                      |
| Rotasi token (GitHub & WakaTime)  | Token lama pernah terekspos di disk                                |
| Deploy nyata ke EasyPanel         | Butuh registry + env produksi dari pemilik                         |
| Push ke GitHub                    | Menunggu perintah pemilik; `gh` belum dijalankan                   |
| `npm audit` (postcss via Next 15) | Tunda; perbaikan butuh Next 16 (breaking) → pertimbangkan ADR baru |

## Cara menjalankan & menguji

```sh
npm install
docker compose up -d                 # Postgres + Redis lokal
npm run dev                          # http://localhost:3000
# GET /api/stats/github  (dipanggil 2x: pertama fresh, kedua cached:true)
npm run stats:check                  # verifikasi live adapter GitHub (butuh .env)
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
