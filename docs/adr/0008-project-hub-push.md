# ADR-0008: Project Hub berbasis push — database pusat + API ingest

- **Status**: Diterima
- **Tanggal**: 2026-10-09

## Konteks

Pemilik mengerjakan banyak proyek di `E:\aasatech` dan ingin memantau progres tiap proyek dari situs portofolio yang juga ter-deploy publik di EasyPanel. Situs ter-deploy **tidak dapat** mengakses filesystem lokal, dan tidak semua proyek ada di GitHub. Menjalankan daemon/agent yang selalu menyala di laptop dinilai memberatkan.

## Keputusan

Hub menyimpan progres di **database pusat** (tabel `hub_project`, `hub_phase`, `hub_decision`, `hub_notification`, `push_subscription` di Postgres yang sudah dipakai proyek). Sumber data adalah **push dari proyek**: setelah menyelesaikan fase, opencode menjalankan `scripts/hub-report.mjs` yang mengirim `STATUS.md` + `PRD.md` ke `POST /api/hub/ingest` dengan secret bersama (`HUB_INGEST_SECRET`). Server mem-parse daftar fase dari `STATUS.md`, menyimpan status, dan mendeteksi fase yang **berubah** menjadi selesai. Registrasi proyek memakai endpoint yang sama (`npm run hub:register` memindai folder).

## Alasan

- Laptop tidak perlu selalu menyala; laporan dikirim saat proyeknya benar-benar dikerjakan.
- Tidak bergantung pada GitHub/filesystem host; cocok untuk proyek lokal mana pun.
- Satu mekanisme (ingest) untuk registrasi, sinkronisasi dokumen, dan deteksi penyelesaian fase.
- Dokumen ditampilkan dari markdown terakhir yang dikirim sehingga hub mandiri.

## Konsekuensi

- **Positif**: arsitektur push murni, tanpa polling; perangkat keras/lokasi bebas.
- **Negatif**: status hanya akurat bila proyek benar-benar melapor; fase yang tidak dilaporkan tidak tercatat.
- **Lain-lain**: parser `STATUS.md` harus toleran (format heterogen); payload dibatasi ukurannya dan divalidasi Zod.

## Alternatif yang dipertimbangkan

- **Baca dari GitHub** — proyek lokal belum tentu punya repo dan butuh polling. Ditolak sebagai sumber utama.
- **Agent lokal daemon (polling/SSE)** — laptop harus stand by dan menambah permukaan eksekusi. Ditolak.
- **Baca filesystem langsung dari situs** — hanya mungkin bila situs dijalankan lokal, tidak untuk EasyPanel. Ditolak.
