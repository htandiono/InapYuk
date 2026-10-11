# Changelog Fixes

### Fix #2 — Pin lokasi tidak muncul di form tambah/edit properti dan peta kosong di detail customer

| | |
| --- | --- |
| Tanggal | 2026-10-12 |
| File | `apps/web/src/components/tenant/` — `PropertyFormNew.tsx`, `usePropertyFormLogic.ts` (baru), `property-form-submit.ts` (baru), `PropertyFormLocation.tsx`, `PropertyFormImage.tsx`, `useGeocodingEffects.ts`, `useProvinceCityGeocoder.ts`, `useAddressGeocoder.ts`, `geocoding-utils.ts`; dihapus: `PropertyLocationFields.tsx`, `usePropertyForm.ts`, `useAddressSearch.ts` |
| Masalah | Form tenant hanya menampilkan peta setelah memilih saran "Cari Alamat Cepat". Properti seed produksi (8 dari 8) punya `latitude`/`longitude` null, jadi detail customer menampilkan "Peta Belum Tersedia". Lokal tampak sehat hanya karena 4 properti lokal sudah berkoordinat sejak 2026-09-04. |
| Akar | Commit `d8f3ea7` (2026-09-02, refactor batas baris) membuat `PropertyFormNew` baru dan memindahkan `PropertyListComponents` ke sana, tanpa membawa sinkronisasi provinsi/kota/alamat ke peta (hook lama `usePropertyForm`/`useGeocodingEffects` jadi kode mati). Seed tidak pernah berisi koordinat. Temuan tambahan: (a) `useGeocodingEffects` memperbarui `lastProvinceCityRef` sebelum `useProvinceCityGeocoder` membandingkannya, sehingga geocoder provinsi/kota tidak pernah jalan; (b) query provinsi/kota dikirim dengan kota+provinsi+"Indonesia" ganda, API menambahkannya lagi, Nominatim mengembalikan kosong; (c) form edit meng-geocode ulang alamat saat dibuka dan menimpa pin tersimpan; (d) `PropertyFormImages` dan logika submit memakai dua instance `usePropertyFormImages` yang terpisah (foto baru tidak ikut terkirim); (e) kota seed "Bantul" tidak cocok dengan opsi "Kabupaten Bantul". |
| Fix | `PropertyFormNew` memakai `usePropertyFormLogic` yang memasang `useGeocodingEffects`; pin otomatis saat provinsi/kota dipilih dan saat alamat diketik, dengan cadangan ke pusat kota jika alamat tidak ditemukan; pin tersimpan tidak ditimpa saat edit; hook gambar dibagi satu instance; kota seed dicocokkan lewat `matchCity`; kode mati dihapus. |
| Verifikasi | Lokal (Chrome headless, `tenant.jogja`): form tambah — provinsi dipilih → peta muncul, kota → pin pindah, alamat diketik → pin pindah (3 panggilan `/geo/autocomplete`); form edit Bantul berkoordinat → peta muncul, kota "Kabupaten Bantul", 0 panggilan geocode; form edit dengan koordinat dikosongkan (meniru seed produksi) → peta muncul lewat cadangan pusat kota. Batas 15/200 baris bersih di semua 16 file yang disentuh (komponen form dipecah, `FieldParts.tsx`, `select-styles.ts`, `geocoding-sync.ts` baru; log debug dihapus), `tsc` bersih, `eslint` 0 error (peringatan 320 → 286, 0 di file yang disentuh), `npm test` 12 file / 48 tes lulus, skenario browser diulang setelah refactor dengan hasil sama. **PENDING verifikasi di produksi** dan **koordinat 8 properti seed produksi belum diisi** (butuh simpan ulang lewat form edit atau skrip geocode). |
| Pelajaran | Refactor batas baris wajib memindahkan perilaku, bukan hanya memecah file; cek tiap hook lama yang tidak diimpor lagi. Ref yang dibagi antar efek bergantung pada urutan efek. |
| Log Keyword | `/geo/autocomplete`, `Peta Belum Tersedia`, `useGeocodingEffects`, `selectedGeo` |
| Deploy | BELUM DEPLOY |

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
