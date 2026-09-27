# STATUS — Portofolio

> **Sumber kebenaran status & progres.** Baca file ini dulu sebelum melanjutkan pekerjaan.
> Riwayat rilis: [`CHANGELOG.md`](CHANGELOG.md) · Keputusan: [`docs/adr/`](docs/adr/) · Kebutuhan: [`PRD.md`](PRD.md).
> **Jangan simpan kredensial di file ini.**

- **Terakhir diperbarui**: 2026-09-27
- **Versi produksi aktif**: belum deploy ke EasyPanel (image lokal `portofolio:test` sudah terverifikasi)
- **Platform**: Next.js (App Router) + TypeScript + Tailwind + shadcn/ui · Postgres + Redis · EasyPanel (Docker image)

## TL;DR (konteks 30 detik)

Portofolio developer dengan dashboard live (GitHub, WakaTime, Umami, MonkeyType) plus halaman tentang saya dan proyek. Stack Next.js App Router + TS + Tailwind, data eksternal via API route server-side + ISR/Redis, tren dari snapshot harian Postgres. Deploy di EasyPanel sebagai Docker image. **Tahap 0–5 (scaffold) selesai. Sedang di FASE 1: sub-tahap 1.1 (fondasi data) selesai; berikutnya 1.2 adapter GitHub end-to-end. Kredensial Umami masih kosong.**

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

| Sub | Judul                                                               | Status                 |
| --- | ------------------------------------------------------------------- | ---------------------- |
| 1.1 | Fondasi data (env/http/cache/db + `docker-compose.yml`)             | ✅ (menunggu evaluasi) |
| 1.2 | Adapter per sumber (GitHub → WakaTime → MonkeyType; Umami menyusul) | ⬜                     |
| 1.3 | API route `GET /api/stats/[source]`                                 | ⬜                     |
| 1.4 | UI shell + widget dashboard                                         | ⬜                     |
| 1.5 | Halaman konten (MDX: `/about`, `/projects`)                         | ⬜                     |
| 1.6 | Snapshot harian + grafik tren                                       | ⬜                     |

## Kondisi saat ini

- Next.js 15.5 (App Router) + React 19 + TypeScript 5.9 + Tailwind 4; `output: standalone`.
- Modul fondasi data: `lib/env.ts` (Zod), `lib/http.ts` (timeout+retry), `lib/cache.ts` (Redis/in-memory + snapshot stale), `lib/db.ts` (Postgres snapshot).
- `docker-compose.yml`: Postgres 16 + Redis 7 (keduanya sehat; konektivitas diuji dengan `pg` & `ioredis`).
- `npm run typecheck`, `npm run lint`, `npm test` (Vitest, **15 test**), `npm run build` semuanya **lolos**.
- `GET /api/health` → 200. Image Docker multi-stage berhasil build & run.
- Tanpa `REDIS_URL`/`DATABASE_URL`, sistem otomatis fallback (in-memory / no-op) — app tetap jalan.
- Git repo lokal `main`; belum ada remote. `.env` belum dibuat pemilik.

## Yang belum selesai / menunggu

| Item                              | Catatan                                                            |
| --------------------------------- | ------------------------------------------------------------------ |
| Evaluasi manual sub-tahap 1.1     | `docker compose up -d`, `npm test`, jalankan `npm run dev`         |
| Kredensial API                    | GitHub/WakaTime/MonkeyType siap; **Umami belum**; isi `.env`       |
| Adapter 1.2 & seterusnya          | GitHub end-to-end dulu                                             |
| Deploy nyata ke EasyPanel         | Butuh registry + env produksi dari pemilik                         |
| Push ke GitHub                    | Menunggu perintah pemilik; `gh` belum dijalankan                   |
| `npm audit` (postcss via Next 15) | Tunda; perbaikan butuh Next 16 (breaking) → pertimbangkan ADR baru |

## Cara menjalankan & menguji

```sh
npm install
docker compose up -d   # Postgres + Redis lokal
npm run dev            # http://localhost:3000
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
