# Architecture Decision Records (ADR)

Kumpulan keputusan arsitektur proyek **Portofolio**, mengikuti format [Nygard](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions).

## Daftar ADR

| # | Judul | Status | Tanggal |
|---|---|---|---|
| [0001](0001-stack-nextjs.md) | Stack: Next.js App Router + TypeScript + Tailwind + shadcn/ui | Diterima | 2026-09-27 |
| [0002](0002-data-aggregation.md) | Agregasi data eksternal server-side + ISR/revalidate + Redis | Diterima | 2026-09-27 |
| [0003](0003-deploy-easypanel-docker.md) | Deploy EasyPanel via Docker image (Next.js standalone) | Diterima | 2026-09-27 |
| [0004](0004-secret-management.md) | Manajemen rahasia: environment variable server-only | Diterima | 2026-09-27 |
| [0005](0005-content-mdx.md) | Konten proyek & profil sebagai MDX in-repo | Diterima | 2026-09-27 |
| [0006](0006-trend-snapshots-postgres.md) | Grafik tren dari snapshot harian Postgres | Diterima | 2026-09-27 |

## Cara menambah ADR

1. Salin [`0000-template.md`](0000-template.md) → `NNNN-judul-singkat.md` (nomor urut berikutnya).
2. Isi Konteks, Keputusan, Alasan, Konsekuensi, Alternatif.
3. Tambahkan baris di tabel di atas.
4. ADR lama **tidak dihapus**; bila diganti, set status `Digantikan oleh ADR-XXXX`.
