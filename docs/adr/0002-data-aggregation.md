# ADR-0002: Agregasi data eksternal — server-side + ISR/revalidate + Redis

- **Status**: Diterima
- **Tanggal**: 2026-09-27

## Konteks
Dashboard bergantung pada empat API pihak ketiga dengan rate-limit dan ketersediaan yang tidak dijamin: GitHub (GraphQL/REST), WakaTime, Umami, MonkeyType. Token akses harus dirahasiakan. Bila setiap kunjungan memanggil upstream langsung, kita berisiko kena rate-limit, lambat, dan rentan ketika salah satu layanan down.

## Keputusan
Semua panggilan ke API eksternal dilakukan **hanya di server** melalui route `GET /api/stats/[source]` (proxy + agregator + normalisasi skema). Hasil di-cache dengan **ISR `revalidate`** dan **Redis** (TTL 1 jam). Saat upstream gagal atau rate-limited, sajikan **snapshot cache terakhir** dan tandai "stale, last synced ...". Setiap sumber diisolasi dalam adapter sendiri.

## Alasan
- Token tetap di server; browser hanya menerima JSON yang sudah dinormalisasi.
- Cache menekan request upstream (<= 1 per sumber per jam) → menghindari rate-limit & mempercepat respons.
- Skema respons tetap stabil walau bentuk API upstream berubah → UI tidak ikut rusak.
- Degradasi anggun: widget selalu punya sesuatu untuk ditampilkan.

## Konsekuensi
- **Positif**: cepat, hemat kuota, tahan gangguan upstream, aman.
- **Negatif**: data bisa tertinggal hingga TTL; butuh infra Redis; kerumitan cache invalidation.
- **Lain-lain**: perlu strategi retry/backoff dan observability (log sinkronisasi + timestamp).

## Alternatif yang dipertimbangkan
- **Fetch langsung dari client** — membocorkan token, kena CORS, dan rate-limit per pengguna. Ditolak.
- **Tanpa cache (server fetch setiap request)** — lambat dan boros kuota. Ditolak.
- **Build-time static generation saja** — data tidak segar. Ditolak (dashboard butuh "live").
