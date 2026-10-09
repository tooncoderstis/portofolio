# STATUS — Portofolio

> **Sumber kebenaran status & progres.** Baca file ini dulu sebelum melanjutkan pekerjaan.
> Riwayat rilis: [`CHANGELOG.md`](CHANGELOG.md) · Keputusan: [`docs/adr/`](docs/adr/) · Kebutuhan: [`PRD.md`](PRD.md).
> **Jangan simpan kredensial di file ini.**

- **Terakhir diperbarui**: 2026-10-09
- **Versi produksi aktif**: terpasang di EasyPanel — https://m-portofolio.hgteop.easypanel.host (project `m`, service `portofolio`; db `m/db`, cache `m/redis`; source Docker Image `ghcr.io/tooncoderstis/portofolio:latest`)
- **Platform**: Next.js (App Router) + TypeScript + Tailwind + shadcn/ui · Postgres + Redis · EasyPanel (Docker image)

## TL;DR (konteks 30 detik)

Portofolio developer dengan dashboard live (GitHub, WakaTime, Umami, MonkeyType) plus halaman tentang saya dan proyek. Stack Next.js App Router + TS + Tailwind, data eksternal via API route server-side + ISR/Redis, tren dari snapshot harian Postgres. Deploy di EasyPanel sebagai Docker image. **FASE 1: 1.1–1.6 selesai. Dashboard live, halaman `/about` & `/projects`, dan grafik tren dari snapshot harian semua jalan. Sisa FASE 1: adapter Umami (butuh kredensial). FASE 3: Project Hub owner-only sudah terimplementasi (login, progres proyek, keputusan fase, notifikasi Web Push).**

> ⚠️ **Catatan keamanan**: `.env` sementara memakai token GitHub/WakaTime lama yang pernah terekspos di disk. **Rotasi token** sebelum push/deploy.
>
> 📝 **Konten**: profil (`Tooncoder`, BPS Kabupaten Bengkulu Tengah) dan proyek (SigmaLab, Klinix, Portofolio) sudah diisi dari data pemilik. Proyek "Portofolio" (situs ini) dipertahankan — boleh dihapus bila ingin. "Laravel" ada di kategori Frontend sesuai input; bisa dipindah ke Backend.

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

## FASE 3 — Project Hub (owner-only)

| Sub | Judul                                                          | Status |
| --- | -------------------------------------------------------------- | ------ |
| 3.1 | Auth owner (password + session cookie, `/login`, guard `/hub`) | ✅     |
| 3.2 | Skema hub + API ingest + registrasi proyek                     | ✅     |
| 3.3 | UI Hub (daftar, detail, STATUS.md/PRD.md, markdown)            | ✅     |
| 3.4 | Keputusan lanjut/tidak (catatan, tanpa eksekusi)               | ✅     |
| 3.5 | Notifikasi fase selesai (inbox + Web Push)                     | ✅     |
| 3.6 | Integrasi skill `aasaprojectkit` + CLI lapor + konvensi        | ✅     |
| 3.7 | ADR, PRD, STATUS, CHANGELOG, runbook                           | ✅     |

## Kondisi saat ini

- **Konten**: `lib/content.ts` (gray-matter + Zod) memvalidasi `content/profile.mdx` dan `content/projects/*.mdx` (schema ketat; slug file ↔ frontmatter divalidasi). Render MDX via `next-mdx-remote/rsc` + komponen styling di `components/mdx/`.
- **Halaman**: `/` (hero + dashboard, `force-dynamic`), `/about` (bio, kompetensi, pengalaman), `/projects` (filter status client-side), `/projects/[slug]` (SSG via `generateStaticParams`, 404 untuk slug tak dikenal). Navigasi di header.
- **Snapshot & tren**: `lib/snapshot.ts` (`snapshotAll` → `refreshStats` paksa fetch + upsert), `POST/GET /api/snapshot` (dilindungi `SNAPSHOT_SECRET`; 401 tanpa secret di produksi), `lib/trends.ts` (+ `extractMetric`), `GET /api/trends/[source]?days=30`, dan widget `TrendWidget`/`TrendChart` di beranda.
- Verifikasi: `typecheck` ✅ · `lint` ✅ · `test` ✅ **68 test** · `build` ✅. Live: snapshot 401 tanpa secret; dengan secret → github/wakatime/monkeytype `ok`, umami `skipped`; 3 baris `snapshot` di Postgres; `/api/trends/github` mengembalikan poin; beranda memuat seksi "Tren (30 hari)".
- **Home dinamis**: `export const dynamic = "force-dynamic"` agar data dashboard tidak ter-bake saat build; cache tetap dikelola Redis. `next.config.ts` memakai `outputFileTracingIncludes` agar `content/**` ikut ke image standalone.
- Repo publik: **https://github.com/tooncoderstis/portofolio** (branch `main`), CI hijau (lint, typecheck, test, build, gitleaks).
- CI juga **membangun & mempublikasikan image** ke `ghcr.io/tooncoderstis/portofolio` (workflow `docker-publish`, tag `latest`/`main`/`sha` + semver saat tag).
- `.env` tidak ter-commit (di-ignore); gitleaks memindai seluruh history di CI.
- **Project Hub (FASE 3)**: auth owner (`lib/hub/auth.ts` scrypt + cookie HMAC, `/login`, guard `app/hub/layout.tsx`); skema `hub_project`/`hub_phase`/`hub_decision`/`hub_notification`/`push_subscription` di `lib/hub/store.ts`; ingest `POST /api/hub/ingest` (secret `HUB_INGEST_SECRET`, parser `lib/hub/parse.ts`); UI `/hub`, `/hub/[slug]`, `/hub/notifications` (markdown via `react-markdown`+`remark-gfm`); keputusan fase `POST /api/hub/projects/[slug]/decision`; Web Push (`web-push` + VAPID, `public/sw.js`); skrip `hub:hash`/`hub:register`/`hub:vapid`/`hub:report`. Template pelaporan + langkah DoD ditambahkan ke skill `aasaprojectkit`; konvensi di `docs/hub/project-convention.md`, runbook `docs/runbooks/hub.md`.
- Sesi 2026-09-27 diakhiri: dev infra dihentikan (`docker compose down`; volume tetap). Lanjutkan dengan `docker compose up -d` lalu `npm run dev`.

## Yang belum selesai / menunggu

| Item                              | Catatan                                                                                 |
| --------------------------------- | --------------------------------------------------------------------------------------- |
| Evaluasi manual sub-tahap 1.6     | `POST /api/snapshot`, cek `/api/trends/github` & beranda                                |
| Review kategori kompetensi        | "Laravel" saat ini di Frontend; boleh dipindah ke Backend                               |
| Adapter Umami                     | Menunggu kredensial Umami                                                               |
| Rotasi token (GitHub & WakaTime)  | Token lama pernah terekspos di disk                                                     |
| Deploy nyata ke EasyPanel         | ✅ https://m-portofolio.hgteop.easypanel.host (project `m`)                             |
| Env rahasia di EasyPanel          | Isi `GITHUB_*`/`WAKATIME_*`/`MONKEYTYPE_*`/`HUB_*`/`VAPID_*`/`SNAPSHOT_SECRET`          |
| Dependabot PR (Next 16, dll.)     | Muncul otomatis; bump Next 16 breaking → tinjau manual                                  |
| `npm audit` (postcss via Next 15) | Tunda; perbaikan butuh Next 16 (breaking) → pertimbangkan ADR baru                      |
| Env hub di produksi               | Set `HUB_PASSWORD_HASH`/`HUB_SESSION_SECRET`/`HUB_INGEST_SECRET`/`VAPID_*` di EasyPanel |
| Registrasi & lapor proyek         | Jalankan `npm run hub:register`, lalu `hub:report` di tiap proyek                       |

## Cara menjalankan & menguji

```sh
npm install
docker compose up -d     # Postgres + Redis lokal
npm run dev              # http://localhost:3000
npm run stats:check      # verifikasi live 3 sumber (butuh .env)
npm run hub:hash         # buat HUB_PASSWORD_HASH + HUB_SESSION_SECRET
npm run hub:vapid        # buat kunci VAPID untuk Web Push
npm run hub:register     # daftarkan folder E:\aasatech ke hub
npm run hub:report       # lapor STATUS.md/PRD.md proyek ini ke hub
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
