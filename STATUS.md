# STATUS — Portofolio

> **Sumber kebenaran status & progres.** Baca file ini dulu sebelum melanjutkan pekerjaan.
> Riwayat rilis: [`CHANGELOG.md`](CHANGELOG.md) · Keputusan: [`docs/adr/`](docs/adr/) · Kebutuhan: [`PRD.md`](PRD.md).
> **Jangan simpan kredensial di file ini.**

- **Terakhir diperbarui**: 2026-09-27
- **Versi produksi aktif**: belum deploy ke EasyPanel (image lokal `portofolio:test` sudah terverifikasi)
- **Platform**: Next.js (App Router) + TypeScript + Tailwind + shadcn/ui · Postgres + Redis · EasyPanel (Docker image)

## TL;DR (konteks 30 detik)

Portofolio developer dengan dashboard live (GitHub, WakaTime, Umami, MonkeyType) plus halaman tentang saya dan proyek. Stack Next.js App Router + TS + Tailwind, data eksternal via API route server-side + ISR/Redis, tren dari snapshot harian Postgres. Deploy di EasyPanel sebagai Docker image. **Tahap 0–5 (scaffold) selesai; berikutnya FASE 1: membangun fitur dashboard + halaman konten.**

## Checklist Tahap

| Tahap | Judul                                     | Status                                     |
| ----- | ----------------------------------------- | ------------------------------------------ |
| 0     | Discovery & keputusan stack               | ✅                                         |
| 1     | Scaffold dokumentasi                      | ✅                                         |
| 2     | Bootstrap agen (AGENTS.md, opencode.json) | ✅                                         |
| 3     | Repo & health files + CI                  | ✅                                         |
| 4     | Kerangka Next.js                          | ✅                                         |
| 5     | Deploy EasyPanel                          | ✅ (scaffold; belum push/deploy ke server) |

## Kondisi saat ini

- Next.js 15.5 (App Router) + React 19 + TypeScript 5.9 + Tailwind 4; `output: standalone`.
- `npm run typecheck`, `npm run lint`, `npm test` (Vitest, 1 test), `npm run build` semuanya **lolos**.
- `GET /api/health` → 200 `{status,version,time}` (diverifikasi di server standalone & container Docker).
- Image Docker multi-stage (`deploy/easypanel-docker/Dockerfile`) berhasil di-build & dijalankan (port 3000, user non-root).
- Git repo lokal `main`; health files + CI ada; belum ada remote.

## Yang belum selesai / menunggu

| Item                              | Catatan                                                            |
| --------------------------------- | ------------------------------------------------------------------ |
| Evaluasi manual Tahap 5           | `docker build` + `docker run`; cek `/api/health`                   |
| Deploy nyata ke EasyPanel         | Butuh registry + env produksi dari pemilik                         |
| Fitur dashboard FASE 1            | GitHub/WakaTime/Umami/MonkeyType, tren, halaman konten             |
| Push ke GitHub                    | Menunggu perintah pemilik; `gh` belum dijalankan                   |
| `npm audit` (postcss via Next 15) | Tunda; perbaikan butuh Next 16 (breaking) → pertimbangkan ADR baru |

## Cara menjalankan & menguji

```sh
npm install
npm run dev        # http://localhost:3000
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
