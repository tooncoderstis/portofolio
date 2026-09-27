# Runbook Deploy — EasyPanel (Docker Image)

Panduan operasional lengkap ada di [`docs/runbooks/deploy.md`](../../docs/runbooks/deploy.md).
Keputusan arsitektur: [ADR-0003](../../docs/adr/0003-deploy-easypanel-docker.md).

## Ringkas

1. Build & push (dari root repo):
   `powershell -File deploy/easypanel-docker/build-push.ps1 -Image <registry>/portofolio -Tag <versi> -Push`
2. EasyPanel → Create Service → App → **Source: Docker Image** → `<registry>/portofolio:<versi>`.
3. Port container `3000` → map ke domain, aktifkan HTTPS (Let's Encrypt).
4. Environment: isi dari `.env.production.example`.
5. Verifikasi: `GET /api/health` → `200`.
6. Rollback: ubah tag image ke versi sebelumnya → Deploy.
