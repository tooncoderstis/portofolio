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
