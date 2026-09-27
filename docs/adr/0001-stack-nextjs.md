# ADR-0001: Stack — Next.js App Router + TypeScript + Tailwind + shadcn/ui

- **Status**: Diterima
- **Tanggal**: 2026-09-27

## Konteks

Proyek adalah portofolio pribadi dengan dashboard yang menarik data dari beberapa API eksternal (GitHub, WakaTime, Umami, MonkeyType) dan harus dirender server-side agar token tidak bocor ke browser. Pemilik adalah solo developer yang dibantu agen AI, tanpa tenggat ketat. Referensi desain (`satriabahari.my.id`) dibangun dengan Next.js. Portofolio juga butuh SEO baik dan tampilan ekspresif/animatif.

## Keputusan

Gunakan **Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui** sebagai stack tunggal frontend dan server (API routes untuk agregasi data), dengan animasi via Framer Motion.

## Alasan

- App Router menyatukan UI server-rendered dan API route dalam satu proyek → token API tetap di server.
- TypeScript memberi kontrak tipe untuk skema data eksternal dan frontmatter konten.
- Tailwind + shadcn/ui mempercepat pembuatan UI aksesibel yang bisa dikustom ekspresif.
- Ekosistem besar & dokumentasi melimpah; selaras dengan referensi dan mudah dikerjakan bersama agen AI.
- Integrasi mulus dengan EasyPanel (Docker image) dan Vercel sebagai cadangan.

## Konsekuensi

- **Positif**: satu bahasa (TS) end-to-end; SSR/ISR gratis untuk performa & SEO; komponen siap pakai.
- **Negatif**: bundle lebih berat daripada situs statis murni; butuh Node runtime (bukan static-only).
- **Lain-lain**: mengikat ke perilaku Next.js (App Router); perlu disiplin memisahkan server/client component.

## Alternatif yang dipertimbangkan

- **Astro + React islands** — output lebih ringan, tetapi dashboard interaktif & endpoint server lebih terbatas/lebih rumit.
- **SvelteKit** — DX ringan, namun ekosistem komponen pihak ketiga lebih sedikit.
- **Laravel + Livewire/Inertia** — cocok bila prefer PHP, tetapi kurang idiomatik untuk dashboard data real-time ala JS.
