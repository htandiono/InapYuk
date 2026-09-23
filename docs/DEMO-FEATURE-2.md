# Catatan demo — Feature 2

Bagian Hendrik. Password semua akun seed: `Inapyuk123!`.

Seed sudah punya satu pesanan di tiap status, jadi tidak perlu bikin data dari nol kalau waktunya mepet. Kalau mau alur lengkap dari awal, ikuti urutan di bawah.

## Yang mau diceritain

Tamu pesan, bayar, pemilik konfirmasi. Setelah menginap, tamu bisa kasih ulasan dan pemilik bisa balas. Pemilik juga lihat laporan penjualan dan kalender kamar.

## Urutan demo (sekitar 8 menit)

1. Masuk sebagai `budi@inapyuk.space`. Buka satu properti di Bali, pilih tanggal yang masih kosong, lalu lanjut ke checkout. Tunjukkan rincian harga per malam.
2. Di halaman pesanan, unggah bukti bayar. File harus `.jpg` atau `.png`, paling besar 1MB. Status berubah jadi menunggu konfirmasi. Ada hitung mundur selama bukti belum diunggah.
3. Keluar, masuk sebagai `tenant.bali@inapyuk.space`. Buka **Transaksi**. Saring daftarnya, buka pesanan Budi, lalu terima. Tolak dan batal ada di pesanan lain — batal selalu tanya dulu.
4. Masuk lagi sebagai Budi. Lonceng di kanan atas ada kabar pesanan. Email "pembayaran diterima" ikut terkirim kalau SMTP-nya hidup. Pengingat H-1 jalan otomatis, tidak perlu ditunggu di demo.
5. Untuk ulasan, pakai pesanan yang statusnya sudah selesai (akun `andre@inapyuk.space` punya satu). Kirim ulasan dari detail pesanan. Balik ke tenant, buka **Ulasan**, balas.
6. Buka **Penjualan**. Ganti pengelompokan (properti, transaksi, atau tamu) dan rentang tanggal. Lalu buka **Kalender** dan pilih bulan yang ada menginap.
7. Sempitkan jendela ke lebar HP. Daftar pesanan dan laporan tetap bisa dipakai.

## Kalau ditanya

- Tamu hanya melihat pesanannya sendiri. Tenant hanya melihat properti miliknya.
- Harga dikunci per malam saat pesanan dibuat, jadi perubahan harga musim di kemudian hari tidak mengubah pesanan lama.
- Pesanan yang tidak dibayar dibatalkan sendiri. Pesanan yang sudah lewat tanggal check-out ditandai selesai, baru bisa diulas.

## Slide singkat

1. Judul: alur pesanan, ulasan, laporan.
2. Status pesanan, dari menunggu bayar sampai selesai atau batal.
3. Cuplikan checkout dan konfirmasi tenant.
4. Ulasan tamu dan balasan pemilik.
5. Laporan penjualan dan kalender okupansi.
6. Pembagian tugas: Feature 2 ini, Feature 1 milik Awan.
