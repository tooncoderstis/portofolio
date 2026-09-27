# STATUS — Portofolio

> **Sumber kebenaran status & progres.** Baca file ini dulu sebelum melanjutkan pekerjaan.
> Riwayat rilis: [`CHANGELOG.md`](CHANGELOG.md) · Keputusan: [`docs/adr/`](docs/adr/) · Kebutuhan: [`PRD.md`](PRD.md).
> **Jangan simpan kredensial di file ini.**

- **Terakhir diperbarui**: 2026-09-27
- **Versi produksi aktif**: belum ada (belum deploy)
- **Platform**: Next.js (App Router) + TypeScript + Tailwind + shadcn/ui · Postgres + Redis · EasyPanel (Docker image)

## TL;DR (konteks 30 detik)
Portofolio developer dengan dashboard live (GitHub, WakaTime, Umami, MonkeyType) plus halaman tentang saya dan proyek. Stack Next.js App Router + TS + Tailwind, data eksternal via API route server-side + ISR/Redis, tren dari snapshot harian Postgres. Deploy di EasyPanel sebagai Docker image. **Tahap 1–2 selesai (dokumentasi + bootstrap agen); berikutnya Tahap 3 (repo & health files + CI).**

## Checklist Tahap
| Tahap | Judul | Status |
|---|---|---|
| 0 | Discovery & keputusan stack | ✅ |
| 1 | Scaffold dokumentasi | ✅ |
| 2 | Bootstrap agen (AGENTS.md, opencode.json) | ✅ (menunggu evaluasi) |
| 3 | Repo & health files + CI | ⬜ |
| 4 | Kerangka Next.js | ⬜ |
| 5 | Deploy EasyPanel | ⬜ |

## Kondisi saat ini
- Workspace `E:\aasatech\portofolio` berisi dokumen proyek + `AGENTS.md` + `opencode.json`; belum ada kode aplikasi.
- Belum ada git repository.
- Belum ada test suite, CI, atau deploy.

## Yang belum selesai / menunggu
| Item | Catatan |
|---|---|
| Evaluasi manual Tahap 2 | Cek `AGENTS.md` + `opencode.json`; sesi baru harus auto-load `STATUS.md` |
| Repo & CI | Tahap 3 |
| Kerangka Next.js | Tahap 4 |
| Deploy EasyPanel | Tahap 5 |

## Cara menjalankan & menguji
```sh
# Belum ada kode aplikasi (Tahap 1 = dokumentasi).
# Setelah Tahap 4:
npm install
npm run dev      # http://localhost:3000
npm run lint
npm test
npm run build
```

## Rilis
`powershell -File deploy/easypanel-docker/build-push.ps1 -Image <registry>/portofolio -Tag <versi> -Push` → deploy di EasyPanel. Detail: [`docs/runbooks/`](docs/runbooks/).

## Referensi cepat
- PRD: `PRD.md` · Changelog: `CHANGELOG.md` · ADR: `docs/adr/README.md` · Runbook: `docs/runbooks/`
