# Portofolio

Portofolio developer personal dengan dashboard live yang mengagregasi data dari GitHub, WakaTime, Umami, dan MonkeyType, plus halaman tentang saya dan proyek.

## Fitur

- Dashboard real-time (GitHub Contributions, WakaTime, Umami, MonkeyType).
- Grafik tren dari snapshot harian.
- Halaman tentang saya, kompetensi, dan pengalaman.
- Daftar proyek (selesai / sedang dikerjakan) + halaman detail.
- Fallback cache berlabel "stale" saat API upstream gagal.

## Stack

- Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
- Postgres (snapshot tren) + Redis (cache)
- Deploy: EasyPanel via Docker image

## Menjalankan

```sh
npm install
cp .env.example .env   # isi nilai
npm run dev            # http://localhost:3000
```

## Testing

```sh
npm run lint
npm run typecheck
npm test
```

## Dokumentasi

- Kebutuhan: [`PRD.md`](PRD.md)
- Status: [`STATUS.md`](STATUS.md)
- Riwayat rilis: [`CHANGELOG.md`](CHANGELOG.md)
- Keputusan: [`docs/adr/`](docs/adr/)
- Runbook: [`docs/runbooks/`](docs/runbooks/)

## Kontribusi

Lihat [`CONTRIBUTING.md`](CONTRIBUTING.md).
