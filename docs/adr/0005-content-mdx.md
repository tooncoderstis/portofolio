# ADR-0005: Konten proyek & profil — MDX in-repo

- **Status**: Diterima
- **Tanggal**: 2026-09-27

## Konteks

Portofolio perlu menyajikan konten naratif: profil/tentang saya, kompetensi, pengalaman, serta daftar proyek (selesai & sedang dikerjakan) dengan detail masalah→solusi, tech stack, dan tautan. Pemilik adalah solo developer tanpa tenggat, dan ingin bisa **mengevaluasi konten per file secara manual** sebelum tayang.

## Keputusan

Konten proyek dan profil dikelola sebagai **file MDX/Markdown ber-frontmatter di dalam repo** (`content/projects/*.mdx`, `content/profile.md`). Frontmatter proyek divalidasi dengan skema (mis. Zod): `title`, `slug`, `status` (`completed | in-progress`), `summary`, `stack`, `repoUrl`, `liveUrl` (opsional), `cover`, `date`.

## Alasan

- Konten berversi di git → perubahan bisa direview/di-rollback manual per file.
- Tanpa infrastruktur DB/CMS tambahan; build bisa memvalidasi frontmatter.
- Mudah dikerjakan bersama agen AI dan direview pemilik.
- Live demo ditautkan ke deployment EasyPanel yang sudah berjalan.

## Konsekuensi

- **Positif**: sederhana, transparan, portabel, tipe-aman saat build.
- **Negatif**: menambah konten berarti commit + rebuild/deploy (bukan edit live).
- **Lain-lain**: perlu menjaga konsistensi skema frontmatter; gambar disimpan di `public/`.

## Alternatif yang dipertimbangkan

- **Database + admin panel** — memungkinkan edit tanpa deploy, tetapi menambah infra, auth, dan permukaan keamanan. Ditolak untuk FASE 1–2.
- **Headless CMS eksternal (Sanity/Contentful)** — fleksibel, tetapi bergantung layanan pihak ketiga dan biaya. Ditolak untuk saat ini.
