# ADR-0012: Notifikasi transisi fase mulai & selesai

- **Status**: Diterima
- **Tanggal**: 2026-10-10

## Konteks

ADR-0009 menetapkan notifikasi (inbox + Web Push) **hanya** saat sebuah fase berubah menjadi `done`. Namun alur kerja nyata juga butuh penanda saat sebuah fase **mulai dikerjakan** (`in_progress`), supaya pemilik tahu proyek sedang berjalan dari aplikasi portofolio. Setelah data transisi fase tersedia dari ingest (ADR-0008), hub dapat mendeteksi semua perubahan status, bukan hanya ke `done`.

## Keputusan

Hub membuat notifikasi + push untuk **dua transisi** status fase:

- `→ in_progress` (fase **mulai dikerjakan**) dengan tipe `phase_started`.
- `→ done` (fase **selesai**) dengan tipe `phase_completed`.

Transisi lain (mis. reopen `done → in_progress`, atau pause `in_progress → todo` menuju status selain dua di atas) **tidak** memicu notifikasi. Laporan pertama/laporan fase baru (belum pernah tercatat) tetap **senyap** agar tidak ada spam. Deteksi dilakukan dengan membandingkan status sebelumnya di `hub_phase` terhadap status baru (`diffPhaseTransitions`), bukan hardcode "→ done".

ADR ini **menggantikan ADR-0009**.

## Alasan

- Penanda "mulai dikerjakan" penting agar pemilik melihat proyek aktif tanpa membuka hub.
- Membatasi ke dua transisi menghindari noise dari perubahan administratif.
- Membandingkan status sebelumnya menangani naik/turun status secara umum dan tetap toleran terhadap format `STATUS.md`.

## Konsekuensi

- **Positif**: notifikasi mencerminkan seluruh siklus fase (mulai → selesai); tipe notifikasi eksplisit (`phase_started`/`phase_completed`).
- **Negatif**: dua notifikasi per fase (mulai dan selesai) bila agen melapor di kedua momen.
- **Lain-lain**: laporan pertama tetap hanya menyinkronkan; pengiriman push tetap dilewati bila VAPID tidak dikonfigurasi (inbox tetap jalan).

## Alternatif yang dipertimbangkan

- **Tetap hanya `done`** (ADR-0009) — pemilik tidak tahu saat fase mulai; tidak memenuhi kebutuhan. Ditolak.
- **Notifikasi semua perubahan status** — informatif tetapi berisik (reopen/pause). Ditolak untuk saat ini.
