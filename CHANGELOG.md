# Changelog

Semua perubahan penting didokumentasikan di file ini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com) dan proyek ini menganut [Semantic Versioning](https://semver.org).

Status terkini: [`STATUS.md`](STATUS.md).

## [Unreleased]

### Added

- Scaffold dokumentasi awal: `PRD.md`, `STATUS.md`, `docs/adr/` (ADR-0001..0006), `docs/README.md`, runbook deploy.
- Bootstrap agen: `AGENTS.md` (seksi Project Bootstrap) + `opencode.json` (`instructions` + `skills.paths`).
- Repo & health files: git init (branch `main`), `.gitignore` (Next.js + `.env` di-ignore), `.gitattributes` (LF), `README.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CODEOWNERS`, `.github/` (PR & issue templates, dependabot).
- CI GitHub Actions: lint, typecheck, test, build, dan secret scan (gitleaks).
- `.env.example` & `.env.production.example` (placeholder, tanpa rahasia).
- Kerangka Next.js: App Router + TypeScript + Tailwind CSS 4, `output: standalone`, ESLint (flat config), Prettier (+ plugin Tailwind), Vitest.
- Endpoint `GET /api/health` + test; foundation shadcn/ui (`components.json`, `lib/utils.ts`, token tema di `app/globals.css`).
- Deploy EasyPanel: `deploy/easypanel-docker/Dockerfile` (Next.js multi-stage standalone, user non-root), `build-push.ps1`, `RUNBOOK.md`, dan `.dockerignore`.
- Runbook kredensial: `docs/runbooks/credentials.md` (panduan GitHub, WakaTime, MonkeyType, Umami).
- FASE 1.1 — fondasi data: `lib/env.ts` (validasi env Zod), `lib/http.ts` (fetch + timeout/retry), `lib/cache.ts` (Redis dengan fallback in-memory + snapshot stale), `lib/db.ts` (Postgres snapshot upsert/query), `docker-compose.yml` (Postgres 16 + Redis 7 lokal), dan 14 test baru.
- FASE 1.2 — adapter GitHub: `lib/adapters/github.ts` (GraphQL contributions + kalender + streak, REST top bahasa, skema Zod), script `npm run stats:check`, `dotenv` + `tsx` (dev), dan 5 test baru.
- FASE 1.3 — API route: `lib/stats.ts` (cache Redis + fallback snapshot stale + upsert Postgres) dan `GET /api/stats/[source]` (404/501/503/502), dengan 11 test baru.
- FASE 1.4 — UI dashboard: komponen shadcn/ui (card/badge/skeleton/button/separator), tema gelap/terang (`next-themes`), animasi masuk (`framer-motion`), `lib/stats-loader.ts`, widget GitHub (statistik + heatmap kontribusi + top bahasa), placeholder sumber lain, hero + grid di halaman utama. Termasuk cache key versioned (`cacheKey`) dan 10 test baru.
- FASE 1.4b — adapter WakaTime (`lib/adapters/wakatime.ts`: profil + stats all-time + ringkasan 7 hari, fallback bahasa dari ringkasan) dan MonkeyType (`lib/adapters/monkeytype.ts`: personal best per durasi); widget WakaTime & MonkeyType; `MONKEYTYPE_API_KEY` opsional; `formatDuration`; `stats:check` kini memeriksa tiga sumber.
- FASE 1.5 — halaman konten: `lib/content.ts` (gray-matter + Zod untuk `content/profile.mdx` & `content/projects/*.mdx`), render MDX (`next-mdx-remote/rsc` + `components/mdx/mdx-components.tsx`), komponen `ProjectList`/`StatusBadge`, halaman `/about`, `/projects`, `/projects/[slug]` (SSG + 404), navigasi header, dan `outputFileTracingIncludes` agar `content/**` masuk image standalone.
- FASE 1.6 — snapshot & tren: `refreshStats` di `lib/stats.ts`, `lib/snapshot.ts`, `POST/GET /api/snapshot` (dilindungi `SNAPSHOT_SECRET`), `lib/trends.ts` + `GET /api/trends/[source]`, widget `TrendWidget`/`TrendChart` di beranda, dan dokumentasi scheduled task di runbook deploy.
- Konten nyata: `content/profile.mdx` (Tooncoder, BPS Kabupaten Bengkulu Tengah, kompetensi & kontak) dan proyek `sigmalab`, `klinix`, `portofolio`; tautan email dirender `mailto:`.
- Repo dipublikasikan ke GitHub (`tooncoderstis/portofolio`) dengan CI (lint, typecheck, test, build, gitleaks). Secret scan diganti ke gitleaks CLI (memindai seluruh history) karena action bawaan gagal pada push pertama.
- CI publikasi image: `.github/workflows/docker-publish.yml` membangun `deploy/easypanel-docker/Dockerfile` dan push ke `ghcr.io/tooncoderstis/portofolio` (tag `latest`/`main`/`sha` + semver). Runbook deploy diperluas (Opsi GHCR, env, scheduled snapshot, paket publik).
- FASE 3 — Project Hub owner-only:
  - Auth owner: `lib/hub/auth.ts` (scrypt + session cookie HMAC), `lib/hub/session.ts`, `POST /api/hub/auth/{login,logout}`, halaman `/login`, guard `app/hub/layout.tsx`, dan skrip `npm run hub:hash`.
  - Data & ingest: skema `hub_project`/`hub_phase`/`hub_decision`/`hub_notification`/`push_subscription` di `lib/hub/store.ts`, parser `STATUS.md` (`lib/hub/parse.ts`), validasi Zod (`lib/hub/schema.ts`), `lib/hub/ingest.ts`, `POST /api/hub/ingest` (secret `HUB_INGEST_SECRET`), dan `npm run hub:register` (scan `E:\aasatech`).
  - UI Hub: `/hub` (daftar + progres), `/hub/[slug]` (tab Ringkasan/STATUS.md/PRD.md/Keputusan), `/hub/notifications` (inbox), komponen `components/hub/*` dengan `react-markdown` + `remark-gfm`.
  - Keputusan fase: `POST /api/hub/projects/[slug]/decision` + formulir lanjut/tahan (murni catatan, tanpa eksekusi).
  - Notifikasi: `lib/hub/push.ts` (`web-push` + VAPID), service worker `public/sw.js`, subscribe/unsubscribe, `npm run hub:vapid`; fase yang selesai mengirim inbox + Web Push.
  - Integrasi skill `aasaprojectkit`: template `hub-report.mjs` + langkah pelaporan fase; `docs/hub/project-convention.md`.
  - ADR-0007 (auth owner), ADR-0008 (hub push), ADR-0009 (notifikasi Web Push).
- Deploy produksi ke EasyPanel: project `m`/service `portofolio` (source Docker Image `ghcr.io/tooncoderstis/portofolio:latest`), Postgres `m/db`, Redis `m/redis`, domain HTTPS `https://m-portofolio.hgteop.easypanel.host`. Diverifikasi `/api/health` 200, halaman publik 200, `/hub` redirect ke `/login`, `/api/hub/*` 401.
- FASE 4 — PWA: `app/manifest.ts` (`display: standalone`, ikon 192/512 + maskable), favicon `app/icon.svg` + `app/apple-icon.png`, skrip `npm run icons` (`scripts/generate-icons.ts` dengan `sharp`), `public/sw.js` diperluas (precache `/offline` + aset, navigasi network-first → `/offline`, aset statis cache-first, versi cache + cleanup, handler push dipertahankan), halaman `/offline`, komponen `ServiceWorkerRegister` (produksi) & `InstallPrompt` (`beforeinstallprompt`), serta `viewport.themeColor` + `appleWebApp` di layout.
- FASE 4 — Ide & rencana pengembangan: tabel `hub_idea` (ide umum dari media + rencana per proyek via kolom `project` opsional) dengan `status`/`priority`/`tags`; deteksi platform dari hostname (`lib/ideas/platform.ts`); skema Zod (`lib/hub/schema.ts`), store `listIdeas/getIdea/createIdea/updateIdea/deleteIdea` (`lib/hub/store.ts`); API owner-only `GET/POST /api/hub/ideas` + `GET/PATCH/DELETE /api/hub/ideas/[id]`; UI `/hub/ideas` (filter platform/status, form tambah auto-deteksi platform) dan `/hub/ideas/[id]` (ubah/hapus), tab **"Rencana"** di `/hub/[slug]`, nav hub "Ide".

- Hub multi-proyek: `hub:register` mendaftarkan 6 proyek `E:\aasatech` (ckphelper, klinik, opendots, portofolio, sigmalab, simdasikcda; kecuali `materi sigmalab`) dan laporan fase dijalankan (portofolio 22, sigmalab 9, ckphelper 8, klinik 3, opendots 3). Pelaporan disiapkan untuk klinik & OpenDots (`scripts/hub-report.mjs` + skrip npm `hub:report` + `.env` HUB_* + `STATUS.md` starter). Runbook `docs/runbooks/hub.md` diselaraskan dengan alur dua momen (ADR-0012).

### Changed

- Notifikasi hub kini juga muncul saat fase **mulai dikerjakan** (`→ in_progress`, tipe `phase_started`), bukan hanya saat **selesai** (`→ done`, tipe `phase_completed`). Deteksi transisi diekstrak ke `diffPhaseTransitions` (memetakan `from`/`to`), dan `runIngest` mengembalikan `started` + `completed`. Parser/laporan proyek (`hub-report.mjs`) diperbarui agar menjalankan `hub:report` di dua momen (🔄 mulai, ✅ selesai). ADR-0012 menggantikan ADR-0009; `docs/hub/project-convention.md` diperbarui.

### Fixed

- Tampilan mobile dirapikan: grid dashboard/tren memakai `grid-cols-1` (memperbaiki widget GitHub/heatmap yang memaksa halaman lebih lebar dari layar HP); heatmap kontribusi kini scroll di dalam kartu dan default ke tanggal terbaru; header memakai menu hamburger (`SiteNav`), sub-nav hub dapat diskrol horizontal, tombol notifikasi ringkas di mobile, tab detail proyek dapat digeser; padding halaman responsif.
- Parser `STATUS.md` kini menerima **id fase huruf** (mis. `A`, `B`) selain numerik (`1.1`, `2`), sehingga proyek seperti SigmaLab yang memakai tahap A–H ikut terbaca; pengurutan fase campuran juga diperbaiki.
- Sinkronisasi `package-lock.json` lintas-platform: menambahkan `@emnapi/core` & `@emnapi/runtime` sebagai devDependency agar `npm ci` berhasil di Linux/CI (dep opsional `sharp`-wasm/`@napi-rs/wasm-runtime` yang di-prune di Windows).
