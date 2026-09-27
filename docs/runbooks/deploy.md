# Runbook Deploy — EasyPanel (Docker Image)

> Target: Next.js `standalone` di EasyPanel "Source: Docker Image". Detail keputusan: [ADR-0003](../adr/0003-deploy-easypanel-docker.md).
> Skrip & Dockerfile: [`deploy/easypanel-docker/`](../../deploy/easypanel-docker/).

## Prasyarat

- Docker lokal berjalan; akses push ke registry (mis. GHCR).
- Layanan Postgres & Redis tersedia (bisa dari template EasyPanel).
- Akun EasyPanel + domain dengan DNS mengarah ke VPS.

## Langkah

1. **Build & push** (lokal):
   `powershell -File deploy/easypanel-docker/build-push.ps1 -Image <registry>/portofolio -Tag <versi> -Push`
2. **EasyPanel**: Project → Create Service → App → **Source: Docker Image** → isi `<registry>/portofolio:<versi>`
   (kredensial registry bila image privat).
3. **Port**: container `3000` → map ke domain. Aktifkan **HTTPS (Let's Encrypt)**.
4. **Environment**: isi variabel dari `.env.production.example` (`GITHUB_TOKEN`, `WAKATIME_API_KEY`, `UMAMI_*`, `MONKEYTYPE_USERNAME`, `DATABASE_URL`, `REDIS_URL`, `SITE_URL`).
5. **Deploy** → cek log container (Next.js start pada port 3000).
6. **Pasca-deploy**: jalankan migrasi/skema snapshot bila ada; aktifkan scheduled task snapshot harian.
7. **Verifikasi**: `GET /api/health` → `200` `{status,version,time}`; beranda memuat; widget dashboard terisi; HTTPS aktif.
8. **Rollback**: ubah tag image ke versi sebelumnya → Deploy.

## Keamanan & operasional

- Rotasi kredensial yang pernah terekspos; gunakan password DB kuat.
- Backup terjadwal Postgres (`pg_dump`).
- Pantau log sinkronisasi untuk mendeteksi upstream down / rate-limit.
- Jangan pernah menaruh rahasia di repo; hanya via environment panel.
