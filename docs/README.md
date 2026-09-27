# Dokumentasi Proyek

Index dokumen proyek **Portofolio**.

| Dokumen                              | Isi                                                 | Kapan dibaca                    |
| ------------------------------------ | --------------------------------------------------- | ------------------------------- |
| [`../PRD.md`](../PRD.md)             | Kebutuhan, peran, fase, NFR, KPI (**apa & kenapa**) | Saat merencanakan fitur         |
| [`../STATUS.md`](../STATUS.md)       | Kondisi & progres terkini (**sumber kebenaran**)    | **Setiap awal sesi**            |
| [`../CHANGELOG.md`](../CHANGELOG.md) | Riwayat rilis (Keep a Changelog)                    | Saat menyiapkan rilis           |
| [`adr/`](adr/)                       | Architecture Decision Records                       | Saat menyentuh keputusan teknis |
| [`runbooks/`](runbooks/)             | Prosedur operasional (deploy, insiden)              | Saat operasi/deploy             |

## Prinsip

- **Hemat token**: baca `STATUS.md` dulu; jangan baca `PRD.md` penuh — ambil section terkait saja.
- **Satu sumber kebenaran**: status hanya di `STATUS.md`, jangan duplikasi progres di dokumen lain.
- **Dokumen = hasil proses**: PRD (apa/kenapa), ADR (keputusan), CHANGELOG (kapan), STATUS (kini), runbook (cara).

## Konvensi

- Conventional Commits, trunk-based, tag SemVer.
- DoD: `kode → test → formatter → CHANGELOG → STATUS → ADR bila keputusan`.
- Rahasia hanya lewat environment variable; `.env` tidak pernah di-commit.
