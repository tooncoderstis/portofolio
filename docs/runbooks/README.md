# Runbooks

Prosedur operasional proyek **Portofolio**.

| Runbook                  | Kapan dipakai                                          |
| ------------------------ | ------------------------------------------------------ |
| [`deploy.md`](deploy.md) | Build image, deploy ke EasyPanel, verifikasi, rollback |

## Konvensi runbook

- Langkah dapat dijalankan apa adanya (perintah lengkap, tanpa asumsi tersembunyi).
- Wajib punya langkah **verifikasi** dan **rollback**.
- Tidak memuat rahasia; rujuk nama environment variable saja.
