# STATUS — Portofolio

> **Sumber kebenaran status & progres.** Baca file ini dulu sebelum melanjutkan pekerjaan.
> Riwayat rilis: [`CHANGELOG.md`](CHANGELOG.md) · Keputusan: [`docs/adr/`](docs/adr/) · Kebutuhan: [`PRD.md`](PRD.md).
> **Jangan simpan kredensial di file ini.**

- **Terakhir diperbarui**: 2026-09-27
- **Versi produksi aktif**: belum ada (belum deploy)
- **Platform**: Next.js (App Router) + TypeScript + Tailwind + shadcn/ui · Postgres + Redis · EasyPanel (Docker image)

## TL;DR (konteks 30 detik)

Portofolio developer dengan dashboard live (GitHub, WakaTime, Umami, MonkeyType) plus halaman tentang saya dan proyek. Stack Next.js App Router + TS + Tailwind, data eksternal via API route server-side + ISR/Redis, tren dari snapshot harian Postgres. Deploy di EasyPanel sebagai Docker image. **Tahap 0–4 selesai (dokumentasi, agen, repo+CI, kerangka Next.js); berikutnya Tahap 5 (deploy EasyPanel).**

## Checklist Tahap

| Tahap | Judul                                     | Status                 |
| ----- | ----------------------------------------- | ---------------------- |
| 0     | Discovery & keputusan stack               | ✅                     |
| 1     | Scaffold dokumentasi                      | ✅                     |
| 2     | Bootstrap agen (AGENTS.md, opencode.json) | ✅                     |
| 3     | Repo & health files + CI                  | ✅                     |
| 4     | Kerangka Next.js                          | ✅ (menunggu evaluasi) |
| 5     | Deploy EasyPanel                          | ⬜                     |

## Kondisi saat ini

- Next.js 15.5 (App Router) + React 19 + TypeScript 5.9 + Tailwind 4; `output: standalone`.
- `npm run typecheck`, `npm run lint`, `npm test` (Vitest, 1 test), `npm run build` semuanya **lolos**.
- `GET /api/health` → 200 `{status,version,time}` (diverifikasi pada server standalone).
- Git repo lokal `main`; health files + CI sudah ada; belum ada remote.

## Yang belum selesai / menunggu

| Item                    | Catatan                                                      |
| ----------------------- | ------------------------------------------------------------ |
| Evaluasi manual Tahap 4 | `npm run dev` → buka `http://localhost:3000` & `/api/health` |
| Deploy EasyPanel        | Tahap 5                                                      |
| Fitur dashboard FASE 1  | GitHub/WakaTime/Umami/MonkeyType + tren                      |

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

`powershell -File deploy/easypanel-docker/build-push.ps1 -Image <registry>/portofolio -Tag <versi> -Push` → deploy di EasyPanel. Detail: [`docs/runbooks/`](docs/runbooks/).

## Referensi cepat

- PRD: `PRD.md` · Changelog: `CHANGELOG.md` · ADR: `docs/adr/README.md` · Runbook: `docs/runbooks/`
