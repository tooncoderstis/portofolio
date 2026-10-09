# Konvensi Proyek untuk Hub

Hub portofolio menampilkan progres fase semua proyek yang melapor. Proyek **mendorong (push)** laporannya; hub tidak membaca filesystem atau polling Git.

## Cara kerja

1. Proyek menyimpan `STATUS.md` (format di bawah) dan `PRD.md`.
2. Setelah menyelesaikan satu fase, jalankan `node scripts/hub-report.mjs`.
3. Script mengirim isi `STATUS.md` + `PRD.md` ke `POST /api/hub/ingest`.
4. Hub mem-parse daftar fase, menyimpan status, dan saat sebuah fase berubah menjadi **selesai** → kirim notifikasi (inbox + Web Push).

> Laporan pertama hanya menyinkronkan status (tidak memicu notifikasi). Notifikasi hanya muncul saat status fase **berubah** menjadi selesai.

## Variabel `.env` (di proyek, jangan commit)

```sh
HUB_INGEST_URL=https://portofolio.example.com
HUB_INGEST_SECRET=<sama dengan HUB_INGEST_SECRET di server portofolio>
HUB_PROJECT_SLUG=sigma-lab
HUB_PROJECT_NAME=SigmaLab
```

`HUB_PROJECT_SLUG` dan `HUB_PROJECT_NAME` opsional; bila kosong, diambil dari `package.json`/nama folder.

## Pemasangan di proyek

1. Salin `scripts/hub-report.mjs` dari template skill `aasaprojectkit` (atau dari repo portofolio).
2. Tambahkan skrip npm:
   ```json
   { "scripts": { "hub:report": "node scripts/hub-report.mjs" } }
   ```
3. Isi `.env` lalu jalankan `npm run hub:report`.

## Format `STATUS.md` yang didukung

Fase ditulis sebagai baris tabel markdown dengan **id fase numerik** di kolom pertama dan **penanda status** berupa emoji:

```md
| Fase | Judul               | Status |
| ---- | ------------------- | ------ |
| 1.1  | Fondasi data        | ✅     |
| 1.2  | Adapter GitHub      | 🔄     |
| 1.3  | API route statistik | ⬜     |
```

Penanda status:

| Emoji    | Status hub    |
| -------- | ------------- |
| ✅ ✔ ✓   | `done`        |
| 🔄 🚧 ⏳ | `in_progress` |
| ⬜ ❌ ⛔ | `todo`        |

Baris dengan id non-numerik (mis. `—`) diabaikan. Format tabel bebas (3–4 kolom) selama id berada di kolom pertama dan judul di kolom kedua.

## Tips

- Satu proyek = satu `STATUS.md` di root.
- Jaga id fase tetap stabil; jangan mengganti id fase yang sudah pernah dilaporkan.
- Fase yang belum dilaporkan tidak akan tercatat di hub.
