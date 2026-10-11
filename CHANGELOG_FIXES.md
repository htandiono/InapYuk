# Changelog Fixes

### Fix #1 — Email registrasi tidak ditunggu (fire-and-forget): hilang di serverless Vercel

| | |
| --- | --- |
| Tanggal | 2026-10-12 |
| File | `apps/api/src/modules/auth/auth.service.ts`, `README.md` |
| Masalah | Email verifikasi registrasi (tamu & tenant) tidak sampai di `inapyuk.space`; di lokal sampai. |
| Akar | `sendVerificationEmail` memanggil `sendMail(...)` tanpa `await`. Lokal: proses Node hidup, email terkirim ±4 dtk setelah respons 201 (44 ms). Vercel: function dibekukan setelah respons. Terpisah: `SMTP_*` tidak tercantum di tabel env README (reset password di prod: 200 dalam 1,4 dtk tanpa email, vs 3,6-5,4 dtk di lokal, indikasi `hasSmtp` false). |
| Fix | `await` pada pengiriman di `registerUser` dan `registerTenant`; helper `newUserData` agar fungsi ≤ 15 baris; `SMTP_*` + `GOOGLE_CLIENT_ID` ditambahkan ke tabel env README. |
| Verifikasi | Lokal: typecheck bersih, lint 0 error (0 peringatan di file ini), `npm test` 31 file / 100 tes lulus. **PENDING verifikasi di Vercel**: butuh `SMTP_*` di env API + redeploy. |
| Pelajaran | Di serverless, pekerjaan setelah respons tidak dijamin selesai. Tanpa `SMTP_USER`/`SMTP_PASSWORD`, `sendMail` hanya me-log warning dan API tetap menjawab sukses. |
| Log Keyword | `SMTP not configured`, `[MailError]`, `Email sent` |
| Deploy | BELUM DEPLOY |
