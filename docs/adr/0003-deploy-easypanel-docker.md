# ADR-0003: Deploy — EasyPanel via Docker image (Next.js standalone)

- **Status**: Diterima
- **Tanggal**: 2026-09-27

## Konteks
Portofolio harus berjalan di VPS ringan dengan biaya minimal, mendukung HTTPS otomatis, dan mudah di-rollback. Beberapa proyek pemilik sudah berjalan di EasyPanel, sehingga platform ini sudah dikenal. Aplikasi Next.js membutuhkan Node runtime.

## Keputusan
Deploy menggunakan pola **EasyPanel "Source: Docker Image"**: build image lokal secara multi-stage dengan `output: 'standalone'`, push ke registry, lalu pasang tag image di EasyPanel. Container mendengarkan port **3000**; EasyPanel menangani domain + HTTPS (Let's Encrypt). Rollback = ganti tag ke versi sebelumnya.

## Alasan
- Kontrol penuh atas runtime dan environment; tidak terikat layanan PaaS.
- `standalone` menghasilkan image kecil (hanya dependensi yang dipakai).
- Konsisten dengan proyek lain di EasyPanel → operasional seragam.
- Rollback cepat lewat tag image SemVer.

## Konsekuensi
- **Positif**: biaya rendah, portabel, rollback mudah, HTTPS otomatis.
- **Negatif**: perlu langkah build & push manual (skrip disediakan) dan pengelolaan registry.
- **Lain-lain**: perlu healthcheck (`/api/health`) dan strategi env di panel; template deploy skill yang berorientasi PHP/Laravel tidak dipakai apa adanya.

## Alternatif yang dipertimbangkan
- **Vercel** — paling mulus untuk Next.js, tetapi biaya/limit dan vendor lock-in. Ditolak sebagai target utama.
- **VPS + Docker Compose manual** — lebih fleksibel, tetapi lebih banyak kerja operasional. Ditolak untuk saat ini.
