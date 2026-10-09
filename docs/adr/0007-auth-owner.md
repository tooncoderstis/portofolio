# ADR-0007: Autentikasi owner untuk Hub — password + session cookie

- **Status**: Diterima
- **Tanggal**: 2026-10-09

## Konteks

Halaman Hub menampilkan progres seluruh proyek pemilik dan menerima keputusan fase. Halaman ini harus dibatasi hanya untuk pemilik, sementara semua halaman publik lain tetap tanpa login (lihat PRD §3). Proyek dikerjakan solo; tidak ada kebutuhan multi-user, RBAC, atau SSO.

## Keputusan

Gunakan **satu akun owner**: password disimpan sebagai hash **scrypt** di `HUB_PASSWORD_HASH` (env, server-only), dan sesi berupa **cookie bertanda-tangan HMAC-SHA256** (`HUB_SESSION_SECRET`), `httpOnly`, `sameSite=lax`, `secure` di produksi, TTL 7 hari. Verifikasi dilakukan server-side di layout `/hub` dan pada tiap route ber-mutasi. Tidak memakai `middleware.ts` agar `node:crypto` aman (hindari keterbatasan edge runtime). Tidak ada dependensi auth pihak ketiga.

## Alasan

- Kebutuhan hanya satu pengguna → autentikasi minimal menurunkan permukaan serangan dan kompleksitas.
- `node:crypto` (scrypt + HMAC) sudah tersedia sehingga **tanpa dependensi baru**.
- Cookie `httpOnly` mencegah akses token dari JavaScript klien.

## Konsekuensi

- **Positif**: sederhana, tanpa layanan eksternal, tanpa sesi tersimpan di server (stateless).
- **Negatif**: satu password untuk semua akses; bila bocor harus diganti (`npm run hub:hash`).
- **Lain-lain**: tidak ada logout massal / daftar sesi; rotasi secret otomatis membatalkan semua sesi.

## Alternatif yang dipertimbangkan

- **GitHub OAuth (Auth.js/NextAuth)** — lebih formal tetapi menambah dependensi, konfigurasi OAuth, dan kompleksitas untuk satu pengguna. Ditolak untuk saat ini.
- **Magic link email** — memerlukan penyedia email. Ditolak.
- **Simpan sesi di Redis** — stateful dan tidak memberi manfaat untuk pengguna tunggal. Ditolak.
