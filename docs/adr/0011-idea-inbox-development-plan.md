# ADR-0011: Inbox ide & rencana pengembangan proyek (tabel `hub_idea`)

- **Status**: Diterima
- **Tanggal**: 2026-10-10

## Konteks

Pemilik mengumpulkan ide dari berbagai media (Threads, X, TikTok, Instagram) dan ingin juga menyimpan rencana pengembangan untuk tiap proyek yang sudah ada. Keduanya adalah **catatan ide** dengan siklus hidup mirip, dan sering berpindah: ide mentah dari media bisa berkembang menjadi rencana pengembangan sebuah proyek. Halaman Hub yang sudah ada bersifat owner-only (ADR-0007) dan memakai Postgres pusat dengan push-report (ADR-0008). Konten MDX in-repo (ADR-0005) tidak cocok untuk pencatatan cepat karena memerlukan commit + rebuild, dan tidak dapat ditulis dari web saat runtime (image standalone).

## Keputusan

Simpan ide dan rencana pengembangan dalam **satu tabel Postgres `hub_idea`** (ditambahkan ke skema hub di `lib/hub/store.ts`), dengan kolom opsional `project`:

- `project` kosong → ide umum (inbox dari media); `project` terisi (slug hub) → rencana pengembangan proyek tersebut.
- Kolom: `title`, `summary`, `notes_md`, `platform` (`threads|x|tiktok|instagram|youtube|website|other`), `source_url`, `tags text[]`, `status` (`inbox|exploring|planned|done|archived`), `priority` (1–3), `created_at`, `updated_at`.
- Platform **dideteksi dari hostname** tautan (`lib/ideas/platform.ts`); tanpa scraping atau API pihak ketiga — hanya menyimpan tautan, label platform, dan catatan.
- UI owner-only: `/hub/ideas` (inbox global, filter platform/status/tag, form tambah) dan `/hub/ideas/[id]` (ubah/hapus), plus tab **"Rencana"** di `/hub/[slug]` yang menampilkan ide ber-`project = slug` beserta form tambah. API `GET/POST /api/hub/ideas` dan `GET/PATCH/DELETE /api/hub/ideas/[id]` dijaga sesi owner (401 bila bukan owner).

## Alasan

- Satu model data menghindari duplikasi dan memungkinkan promosi ide → rencana proyek hanya dengan mengisi `project`.
- Postgres sudah tersedia dan konsisten dengan hub lain (fase, keputusan, notifikasi); tidak ada dependensi baru.
- Deteksi platform berbasis hostname andal, legal, dan tanpa token; cukup untuk menandai asal ide.
- Owner-only menjaga catatan internal tetap privat; tidak ada risiko ekspos ke publik maupun scraping ToS.

## Konsekuensi

- **Positif**: pencatatan ide cepat dari web; rencana tiap proyek terpusat; tanpa kredensial media sosial.
- **Negatif**: ide tidak tampil publik (hanya sebagai alat internal); tidak ada preview/thumbnail dari media.
- **Lain-lain**: `tags text[]` dan `platform` divalidasi Zod; tabel dibuat otomatis via `CREATE TABLE IF NOT EXISTS` seperti tabel hub lain.

## Alternatif yang dipertimbangkan

- **Dua tabel terpisah (ide media vs rencana proyek)** — duplikasi skema & logika, sulit memindahkan ide ke rencana. Ditolak.
- **Konten MDX in-repo** — perlu commit + rebuild, tidak dapat ditulis dari web. Ditolak.
- **oEmbed/scraping media otomatis** — bergantung token/API yang dibatasi dan berisiko melanggar ToS. Ditolak.
