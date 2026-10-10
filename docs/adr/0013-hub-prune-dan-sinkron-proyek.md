# ADR-0013: Prune proyek hub & sinkron progres ke halaman Proyek publik

- **Status**: Diterima
- **Tanggal**: 2026-10-10

## Konteks

Hub menyimpan daftar proyek di Postgres via ingest/registrasi (ADR-0008), tetapi tidak pernah menghapus proyek: saat folder proyek dihapus dari laptop, entri lama tetap muncul di `/hub`. Di sisi lain, halaman publik `/projects` bersumber dari MDX (`content/projects/*`) sementara `/hub` bersumber dari database, sehingga daftar dan identitas proyek bisa berbeda (mis. slug `klinik` di hub vs `klinix` di MDX).

## Keputusan

1. **Prune saat registrasi**: endpoint `POST /api/hub/register` (auth secret ingest) menerima `{ projects, prune }`; server meng-`upsert` semua proyek lalu, bila `prune: true`, menghapus `hub_project` yang **tidak** ada di daftar (beserta `hub_phase`/`hub_decision`/`hub_notification`; `hub_idea.project` di-`NULL`-kan). `scripts/hub-register.ts` mengirim daftar folder `E:\aasatech` **sekali** ke endpoint ini, membaca `.env` tiap proyek untuk `HUB_PROJECT_SLUG`/`HUB_PROJECT_NAME` (agar selaras dengan `hub:report`), dan hanya prune bila `--prune`/`HUB_PRUNE=1` diberikan (menolak bila daftar kosong).
2. **Sinkron progres ke publik**: `/projects` dan `/projects/[slug]` membaca `listProjects()`/`getProject()` dari hub dan menampilkan **progres fase** untuk proyek yang punya konten MDX (join berdasarkan slug). Proyek internal tanpa MDX tidak ditampilkan ke publik.

## Alasan

- Prune menjaga hub = folder yang benar-benar ada di laptop, tanpa perlu hapus manual; slug kanonik (`klinix`) ikut konsisten karena register membaca `.env` proyek.
- Menampilkan progres hub di `/projects` membuat halaman publik dan hub memakai satu sumber kebenaran untuk status/progres, tanpa mengekspos data owner (keputusan/notifikasi).
- Guardrail (prune opsional, tolak daftar kosong) mencegah penghapusan massal tak sengaja.

## Konsekuensi

- **Positif**: daftar proyek hub selalu sinkron dengan laptop; halaman publik menampilkan progres nyata; identitas proyek konsisten.
- **Negatif**: register kini butuh akses `.env` proyek untuk slug/name; prune menghapus data fase/keputusan proyek yang tidak ada foldernya (tidak dapat dibatalkan).
- **Lain-lain**: prune tidak aktif secara default; `/projects` menjadi dinamis (`force-dynamic`) karena membaca DB saat request.

## Alternatif yang dipertimbangkan

- **Tombol hapus manual di UI saja** — tidak otomatis dan mudah terlewat. Tetap mungkin ditambahkan kelak, tetapi prune yang dipilih.
- **`/projects` dari database sepenuhnya** — menghilangkan konten kaya MDX. Ditolak; MDX tetap sumber konten, hub sumber progres.
- **Batasi hub ke proyek portfolio saja** — menghalangi pemantauan proyek internal. Ditolak.
