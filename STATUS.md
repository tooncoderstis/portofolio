# STATUS — Portofolio

> **Sumber kebenaran status & progres.** Baca file ini dulu sebelum melanjutkan pekerjaan.
> Riwayat rilis: [`CHANGELOG.md`](CHANGELOG.md) · Keputusan: [`docs/adr/`](docs/adr/) · Kebutuhan: [`PRD.md`](PRD.md).
> **Jangan simpan kredensial di file ini.**

- **Terakhir diperbarui**: 2026-09-27
- **Versi produksi aktif**: belum deploy ke EasyPanel (image lokal `portofolio:test` sudah terverifikasi)
- **Platform**: Next.js (App Router) + TypeScript + Tailwind + shadcn/ui · Postgres + Redis · EasyPanel (Docker image)

## TL;DR (konteks 30 detik)

Portofolio developer dengan dashboard live (GitHub, WakaTime, Umami, MonkeyType) plus halaman tentang saya dan proyek. Stack Next.js App Router + TS + Tailwind, data eksternal via API route server-side + ISR/Redis, tren dari snapshot harian Postgres. Deploy di EasyPanel sebagai Docker image. **FASE 1: 1.1–1.4 selesai (dashboard UI tampil dengan data GitHub asli, tema gelap/terang, animasi); berikutnya adapter WakaTime/MonkeyType untuk mengisi widget sisanya, lalu 1.5 halaman konten.**

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
| 1.3 | API route `GET /api/stats/[source]` (cache + stale + snapshot) | ✅                     |
| 1.4 | UI shell + widget dashboard                                    | ✅ (menunggu evaluasi) |
| 1.5 | Halaman konten (MDX: `/about`, `/projects`)                    | ⬜                     |
| 1.6 | Snapshot harian + grafik tren                                  | ⬜                     |

Adapter lain: WakaTime ⬜ · MonkeyType ⬜ · Umami ⬜ (kredensial Umami belum ada).

## Kondisi saat ini

- **UI**: shadcn/ui (`card`, `badge`, `skeleton`, `button`, `separator`), `next-themes` (tombol gelap/terang), `framer-motion` (`Reveal`), ikon `lucide-react`.
- **Home** (`app/page.tsx`): hero + grid dashboard. Widget GitHub merender data asli (tile statistik, heatmap kontribusi, top bahasa) via `loadStats()` + `Suspense` (fallback skeleton). WakaTime/Umami/MonkeyType menampilkan placeholder "Segera hadir".
- **Cache versioned**: `cacheKey()` = `<source>:v1` (`CACHE_VERSION`) agar perubahan skema tidak menyajikan bentuk cache lama.
- Verifikasi: `typecheck` ✅ · `lint` ✅ · `test` ✅ **41 test** · `build` ✅ · HTML `/` memuat widget GitHub + heatmap + placeholder.
- `docker-compose.yml` (Postgres 16 + Redis 7) sehat.

## Yang belum selesai / menunggu

| Item                              | Catatan                                                            |
| --------------------------------- | ------------------------------------------------------------------ |
| Evaluasi manual sub-tahap 1.4     | `npm run dev` → lihat dashboard & toggle tema                      |
| Adapter WakaTime / MonkeyType     | Isi 3 widget yang masih placeholder                                |
| Adapter Umami                     | Menunggu kredensial Umami                                          |
| Halaman konten (1.5)              | `/about`, `/projects` (MDX)                                        |
| Snapshot harian + tren (1.6)      | Job terjadwal + grafik                                             |
| Rotasi token (GitHub & WakaTime)  | Token lama pernah terekspos di disk                                |
| Deploy nyata ke EasyPanel         | Butuh registry + env produksi dari pemilik                         |
| Push ke GitHub                    | Menunggu perintah pemilik; `gh` belum dijalankan                   |
| `npm audit` (postcss via Next 15) | Tunda; perbaikan butuh Next 16 (breaking) → pertimbangkan ADR baru |

## Cara menjalankan & menguji

```sh
npm install
docker compose up -d                 # Postgres + Redis lokal
npm run dev                          # http://localhost:3000
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
