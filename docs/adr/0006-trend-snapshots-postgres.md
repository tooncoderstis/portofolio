# ADR-0006: Grafik tren — snapshot harian di Postgres

- **Status**: Diterima
- **Tanggal**: 2026-09-27

## Konteks

Dashboard perlu menampilkan **tren** metrik lintas waktu (kontribusi, jam coding, page views, WPM). Meski sebagian API menyediakan data historis, rentang dan formatnya berbeda-beda, dan menyimpan riwayat di Redis (yang bersifat cache ber-TTL) tidak memberi histori permanen. Pemilik memilih menyimpan snapshot agar tren konsisten dan tidak bergantung ketersediaan API historis.

## Keputusan

Simpan **snapshot harian** tiap sumber ke tabel Postgres `snapshot(id, source, captured_on, payload jsonb, created_at)` dengan constraint unik `(source, captured_on)`. Sebuah job terjadwal (cron/EasyPanel scheduled task) menarik data upstream sekali sehari dan melakukan upsert. Endpoint tren membaca deret waktu dari tabel ini; Redis tetap dipakai sebagai cache baca.

## Alasan

- Histori permanen & konsisten lintas sumber, tidak bergantung pada API historis pihak ketiga.
- Satu query sederhana menghasilkan deret waktu untuk grafik.
- Upsert idempotent (`source`, `captured_on`) mencegah duplikasi.

## Konsekuensi

- **Positif**: tren andal, bisa di-backfill, lepas dari keterbatasan rentang API.
- **Negatif**: menambah komponen Postgres + job terjadwal (infra & operasional).
- **Lain-lain**: perlu backup terjadwal (`pg_dump`) dan pemantauan bila job gagal (tren bolong).

## Alternatif yang dipertimbangkan

- **Ambil rentang historis dari API tiap platform saja** — lebih sederhana, tetapi format/rentang tidak seragam dan bergantung ketersediaan API. Ditolak sebagai sumber utama tren (tetap dipakai untuk backfill).
- **Simpan snapshot di Redis dengan TTL panjang** — data bisa hilang saat eviction/restart, bukan penyimpanan permanen. Ditolak.
