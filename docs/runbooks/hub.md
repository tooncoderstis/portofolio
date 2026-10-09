# Runbook: Project Hub (owner-only)

Hub menampilkan progres semua proyek yang melapor. Proyek **mendorong** laporannya; hub tidak membaca filesystem atau polling. Lihat ADR-0007/0008/0009 dan [`docs/hub/project-convention.md`](../hub/project-convention.md).

## 1. Konfigurasi server (portofolio)

Set env berikut (server-only, jangan commit):

```sh
HUB_PASSWORD_HASH=   # npm run hub:hash -- "<password>"
HUB_SESSION_SECRET=  # dihasilkan sekaligus oleh perintah di atas
HUB_INGEST_SECRET=   # rahasia bersama untuk laporan proyek
VAPID_PUBLIC_KEY=    # npm run hub:vapid
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:you@example.com
```

Pada EasyPanel, isi env ini di service, lalu redeploy. Web Push **wajib HTTPS**.

## 2. Registrasi proyek

Dari repo portofolio (folder `E:\aasatech`), jalankan:

```sh
npm run hub:register
```

Opsional: `HUB_PROJECTS_ROOT`, `HUB_IGNORE_PROJECTS` (daftar nama folder yang dilewati, dipisah koma).

## 3. Menghubungkan proyek lain

Untuk setiap proyek yang mau melapor:

1. Salin `scripts/hub-report.mjs` ke proyek tersebut (template tersedia di skill `aasaprojectkit`).
2. Tambahkan `"hub:report": "node scripts/hub-report.mjs"` ke `scripts` di `package.json`.
3. Isi `.env` proyek:
   ```sh
   HUB_INGEST_URL=https://<domain-portofolio>
   HUB_INGEST_SECRET=<rahasia sama>
   HUB_PROJECT_SLUG=<slug>
   HUB_PROJECT_NAME=<nama>
   ```
4. Pastikan `STATUS.md` memakai id fase numerik + emoji status (lihat konvensi).

## 4. Alur harian

- Selesaikan satu fase, perbarui `STATUS.md`.
- Jalankan `npm run hub:report` di proyek (langkah DoD).
- Hub mendeteksi fase yang berubah ke selesai → mengirim **inbox** + **Web Push** ke perangkat owner.

## 5. Verifikasi

```sh
# inggest tanpa secret harus 401 di produksi
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://<domain>/api/hub/ingest -H "content-type: application/json" -d "{}"
```

- Buka `/hub` (login dulu) → proyek & progres tampil.
- Buka `/hub/notifications` → notifikasi fase selesai.
- Klik "Aktifkan notifikasi fase" di header hub → izinkan notifikasi browser.

## 6. Troubleshooting

| Gejala                             | Sebab / solusi                                                              |
| ---------------------------------- | --------------------------------------------------------------------------- |
| `/hub` redirect ke `/login`        | `HUB_PASSWORD_HASH`/`HUB_SESSION_SECRET` belum valid. Jalankan `hub:hash`.  |
| Ingest 401                         | `HUB_INGEST_SECRET` server ≠ `.env` proyek.                                 |
| Progres tidak bertambah            | `STATUS.md` proyek belum memakai id numerik/emoji, atau belum `hub:report`. |
| Web Push tidak masuk               | Bukan HTTPS, izin diblokir, atau `VAPID_*` belum diisi.                     |
| Halaman proyek kosong (DB offline) | `DATABASE_URL` tidak valid / Postgres mati.                                 |
