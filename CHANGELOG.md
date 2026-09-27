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
