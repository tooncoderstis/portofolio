# Runbook — Mendapatkan Kredensial API

Panduan mengumpulkan kredensial untuk dashboard live. **Jangan pernah menaruh nilai rahasia di file ini atau di repo** — simpan hanya di `.env` (di-ignore git) dan di panel environment EasyPanel.

## Ringkasan variabel

| Sumber     | Variabel `.env`                                      | Wajib di FASE 1          |
| ---------- | ---------------------------------------------------- | ------------------------ |
| GitHub     | `GITHUB_TOKEN`, `GITHUB_USERNAME`                    | Ya                       |
| WakaTime   | `WAKATIME_API_KEY`                                   | Ya                       |
| MonkeyType | `MONKEYTYPE_USERNAME`                                | Ya                       |
| Umami      | `UMAMI_API_URL`, `UMAMI_API_KEY`, `UMAMI_WEBSITE_ID` | Ya                       |
| Infra      | `DATABASE_URL`, `REDIS_URL`                          | Ya (dev: Docker Compose) |
| Situs      | `SITE_URL`                                           | Ya                       |

## 1. GitHub

1. Login GitHub → **Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token (classic)**.
2. Nama: `portofolio-local`; Expiration: 90 hari (perpanjang berkala).
3. Centang scope **`read:user`** (wajib untuk contribution calendar). Opsional `public_repo` bila ingin statistik repo.
4. **Generate** → salin token `ghp_...` (hanya tampil sekali).
5. Salin token ke variabel `GITHUB_TOKEN` **di `.env`** (jangan tulis nilainya di dokumen ini), dan `GITHUB_USERNAME` = username GitHub-mu.

Catatan: contribution calendar diambil via **GraphQL `contributionsCollection`**; token classic dengan `read:user` paling sederhana dan pasti didukung.

## 2. WakaTime

1. Daftar/login di **wakatime.com**.
2. Pasang plugin editor (VS Code, dll.) dan ngoding sebentar agar ada data (akun baru statistiknya nol).
3. **Settings → API Key** → salin **Secret API Key** ke variabel `WAKATIME_API_KEY` **di `.env`**.

## 3. MonkeyType

1. Daftar/login di **monkeytype.com**, lakukan beberapa sesi tes agar ada data.
2. Set `MONKEYTYPE_USERNAME` **di `.env`** = username MonkeyType-mu.
3. Endpoint profil (`/users/{username}/profile`) dapat diakses **tanpa API key**. Bila suatu endpoint menolak, buat **ApeKey** dari pengaturan akun lalu isi `MONKEYTYPE_API_KEY` (opsional).

## 4. Umami (pilih salah satu)

- **Umami Cloud (paling cepat):** daftar di **cloud.umami.is** → **Add website** (isi domain) → salin **Website ID** (`UMAMI_WEBSITE_ID`). Buat **API Key** di Settings (`UMAMI_API_KEY`), set `UMAMI_API_URL` ke base API cloud.
- **Self-host di EasyPanel (nanti):** pasang template Umami, set domain, lalu ambil **Website ID** + **API Key** dari Settings.

Karena portofolio belum live, data Umami boleh masih kosong; widget tetap dibangun dan diverifikasi dengan data apa adanya.

## 5. Infra lokal (dev)

`DATABASE_URL` dan `REDIS_URL` disediakan oleh `docker-compose.yml` (sub-tahap 1.1). Nilai default lokal akan didokumentasikan di sana.

## Verifikasi & keamanan

```powershell
cd E:\aasatech\portofolio
Copy-Item .env.example .env   # lalu isi nilainya
git check-ignore .env          # harus ter-ignore (tidak ada output = BELUM di-ignore)
```

- `.env` **tidak boleh** di-commit; hanya `.env.example` / `.env.production.example` (placeholder).
- Token server-only; tidak ada `NEXT_PUBLIC_` untuk rahasia.
- Bila token terekspos: segera **revoke** lalu buat baru (rotasi).
- Jangan simpan kredensial di dokumen, issue, atau log.
