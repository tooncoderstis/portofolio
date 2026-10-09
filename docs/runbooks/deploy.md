# Runbook Deploy — EasyPanel (Docker Image)

> Target: Next.js `standalone` di EasyPanel "Source: Docker Image". Detail keputusan: [ADR-0003](../adr/0003-deploy-easypanel-docker.md).
> Dockerfile: [`deploy/easypanel-docker/Dockerfile`](../../deploy/easypanel-docker/Dockerfile).

## Deployment saat ini

| Item              | Nilai                                                                          |
| ----------------- | ------------------------------------------------------------------------------ |
| Domain            | https://m-portofolio.hgteop.easypanel.host                                     |
| Project / service | `m` / `portofolio`                                                             |
| Database          | Postgres `m/db` (internal `m_db:5432`, db/user `portofolio`)                   |
| Cache             | Redis `m/redis` (internal `m_redis:6379`)                                      |
| Source            | Docker Image `ghcr.io/tooncoderstis/portofolio:latest` (paket GHCR **public**) |
| Port container    | 3000                                                                           |

> Deploy memakai **pull image** (tanpa build di server). Untuk merilis versi baru: push ke `main` (CI membangun image) lalu **Deploy / Redeploy** service `m/portofolio` di EasyPanel.

## Env produksi (EasyPanel → service `portofolio` → Environment)

Non-rahasia (sudah terpasang): `NODE_ENV`, `APP_VERSION`, `SITE_URL`, `DATABASE_URL`, `REDIS_URL`.
Rahasia (isi sendiri, jangan commit): `GITHUB_TOKEN`, `GITHUB_USERNAME`, `WAKATIME_API_KEY`, `MONKEYTYPE_USERNAME`, `MONKEYTYPE_API_KEY`, `SNAPSHOT_SECRET`, `HUB_PASSWORD_HASH`, `HUB_SESSION_SECRET`, `HUB_INGEST_SECRET`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`. Lihat `.env.production.example`.

## Prasyarat

- Akun EasyPanel + VPS + domain (DNS mengarah ke VPS).
- Layanan **Postgres** & **Redis** (bisa dari template EasyPanel).
- Akses ke image (GHCR paket publik, atau kredensial registry).

## Opsi A — Image dari CI (direkomendasikan)

Workflow [`.github/workflows/docker-publish.yml`](../../.github/workflows/docker-publish.yml) otomatis build & push image ke GHCR saat push ke `main` atau tag `v*`.

- Image: `ghcr.io/tooncoderstis/portofolio`
- Tag: `latest`, `main`, `sha-<commit>`; tag semver (`v1.2.3` → `1.2.3`, `1.2`) saat membuat tag rilis.

Agar EasyPanel bisa menarik tanpa kredensial, jadikan paket **publik**:

1. GitHub → profilmu → **Packages** → `portofolio` → **Package settings** → **Danger Zone** → **Change visibility** → **Public**.
2. Alternatif (paket privat): daftarkan kredensial registry di EasyPanel (username GitHub + PAT dengan scope `read:packages`).

Untuk rilis: `git tag v0.1.0 && git push origin v0.1.0` → image `:1.0.0`/`:1`/`:latest`.

## Opsi B — Build & push lokal

```powershell
powershell -File deploy/easypanel-docker/build-push.ps1 -Image ghcr.io/tooncoderstis/portofolio -Tag <versi> -Push
```

Butuh `docker login ghcr.io` dengan PAT ber-scope `write:packages`.

## Langkah EasyPanel (berlaku kedua opsi)

1. **Project → Create Service → App → Source: Docker Image** → isi `ghcr.io/tooncoderstis/portofolio:latest`.
2. **Port**: container `3000` → map ke domain. Aktifkan **HTTPS (Let's Encrypt)**.
3. **Environment**: isi variabel (lihat daftar di bawah).
4. **Deploy** → cek log container (Next.js listen di port 3000).
5. **Pasca-deploy**: aktifkan scheduled task snapshot harian (bagian di bawah).
6. **Verifikasi**: `GET /api/health` → `200`; beranda, `/about`, `/projects` memuat; widget terisi; HTTPS aktif.
7. **Rollback**: ubah tag image ke versi sebelumnya → Deploy.

### Environment (produksi)

`GITHUB_TOKEN`, `GITHUB_USERNAME`, `WAKATIME_API_KEY`, `MONKEYTYPE_USERNAME`, `MONKEYTYPE_API_KEY` (opsional), `UMAMI_*` (bila sudah ada), `DATABASE_URL`, `REDIS_URL`, `SITE_URL`, `SNAPSHOT_SECRET`, `APP_VERSION` (opsional). Contoh: [`.env.production.example`](../../.env.production.example).

> Image **tidak memuat rahasia**: `.env` ada di `.dockerignore` dan build tidak menyematkan token; semua rahasia disuntik saat runtime lewat env.

## Snapshot harian (job terjadwal)

Endpoint: `POST /api/snapshot` (atau `GET`) dengan header `x-snapshot-secret: <SNAPSHOT_SECRET>`.

- **EasyPanel → Schedule**, mis. harian `0 1 * * *`:
  `curl -fsS -X POST -H "x-snapshot-secret: <SNAPSHOT_SECRET>" https://<domain>/api/snapshot`
- **Lokal** (dev, tanpa secret): `curl -X POST http://localhost:3000/api/snapshot`.
- Menulis satu baris per sumber per hari (upsert `(source, captured_on)`), dipakai `GET /api/trends/[source]`.

## Keamanan & operasional

- Rotasi kredensial yang pernah terekspos; gunakan password DB kuat.
- Backup terjadwal Postgres (`pg_dump`).
- Pantau log sinkronisasi untuk mendeteksi upstream down / rate-limit.
- Jangan pernah menaruh rahasia di repo; hanya via environment panel.
