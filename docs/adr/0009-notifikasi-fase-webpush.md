# ADR-0009: Notifikasi penyelesaian fase via Web Push + inbox

- **Status**: Digantikan oleh ADR-0012
- **Tanggal**: 2026-10-09

## Konteks

Pemilik ingin selalu diberi tahu saat sebuah fase proyek selesai, tanpa harus membuka hub atau menjalankan daemon. Data penyelesaian fase sudah tersedia saat ingest (ADR-0008).

## Keputusan

Saat ingest mendeteksi fase berubah menjadi selesai, server (1) menulis baris ke `hub_notification` (**inbox** di `/hub/notifications`) dan (2) mengirim **Web Push** ke semua langganan tersimpan (`push_subscription`) memakai `web-push` dengan kunci **VAPID** (`VAPID_PUBLIC_KEY/PRIVATE_KEY/SUBJECT`). Langganan dibuat dari browser owner melalui service worker `public/sw.js` dan route `POST /api/hub/push/subscribe`. Langganan yang tidak valid (HTTP 404/410) dihapus otomatis. Bila VAPID tidak dikonfigurasi, pengiriman push dilewati (inbox tetap berjalan).

## Alasan

- Web Push bekerja tanpa layanan pihak ketiga dan tanpa `NEXT_PUBLIC_` untuk rahasia (kunci publik VAPID bukan rahasia; kunci privat server-only).
- Inbox memberi jejak persisten meski izin push ditolak atau browser tertutup.
- Pengiriman hanya saat ada transisi → tidak ada spam.

## Konsekuensi

- **Positif**: notifikasi proaktif lintas perangkat; tetap ada di inbox.
- **Negatif**: butuh HTTPS + dukungan browser + izin pengguna; menambah dependensi `web-push`.
- **Lain-lain**: hanya transisi ke `done` yang memicu notifikasi; laporan pertama hanya menyinkronkan status.

## Alternatif yang dipertimbangkan

- **Email/Telegram** — menambah penyedia/layanan dan kredensial; ditunda.
- **Cukup inbox di web** — tidak proaktif. Ditolak sebagai satu-satunya kanal.
