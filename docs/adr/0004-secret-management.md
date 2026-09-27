# ADR-0004: Manajemen rahasia — environment variable server-only

- **Status**: Diterima
- **Tanggal**: 2026-09-27

## Konteks
Aplikasi memegang beberapa kredensial sensitif: `GITHUB_TOKEN`, `WAKATIME_API_KEY`, `UMAMI_*`, koneksi `DATABASE_URL`/`REDIS_URL`. Kebocoran token dapat disalahgunakan pihak lain dan berujung penangguhan akun. Repo bersifat publik.

## Keputusan
Semua rahasia hanya dibaca dari **environment variable di server**. Tidak ada rahasia yang diberi prefix `NEXT_PUBLIC_`. `.env` dan variannya **di-ignore git**; disediakan `.env.example` dan `.env.production.example` berisi placeholder. **Secret scan (gitleaks)** dijalankan di CI dan sebelum commit pertama.

## Alasan
- Next.js hanya mengekspos var ber-prefix `NEXT_PUBLIC_` ke client; dengan tidak memakainya, token aman.
- Repo publik tetap aman karena hanya placeholder yang di-commit.
- Secret scan mencegah kebocoran tak sengaja.

## Konsekuensi
- **Positif**: aman, tidak ada kredensial di riwayat git, mudah dirotasi (cukup ubah env).
- **Negatif**: onboarding butuh mengisi env manual; build tanpa env yang benar akan gagal saat runtime.
- **Lain-lain**: rotasi kredensial berkala; bila ada token terekspos, segera revoke & ganti.

## Alternatif yang dipertimbangkan
- **Menyimpan default/placeholder di kode** — berisiko dan membingungkan. Ditolak.
- **Secret manager eksternal (Vault/Doppler)** — berlebihan untuk proyek solo. Ditolak untuk saat ini.
