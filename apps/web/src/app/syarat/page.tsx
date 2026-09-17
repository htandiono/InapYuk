import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { cookies } from 'next/headers';
import { BackButton } from '@/components/ui/BackButton';

function SyaratSection1() {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold mb-3">1. Penggunaan Layanan</h2>
      <p className="text-muted-foreground">Platform InapYuk berfungsi sebagai perantara antara pengguna (tamu) dan pengelola penginapan (Tenant). Anda setuju untuk menggunakan layanan ini hanya untuk tujuan yang sah, tidak untuk melakukan penipuan, pemesanan fiktif, atau tindakan yang melanggar hukum di Indonesia.</p>
    </section>
  );
}

function SyaratSection2() {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold mb-3">2. Akun Pengguna</h2>
      <p className="text-muted-foreground">Untuk melakukan pemesanan, Anda wajib membuat akun dengan data yang valid. Anda bertanggung jawab penuh atas kerahasiaan kata sandi dan semua aktivitas yang terjadi di bawah akun Anda.</p>
    </section>
  );
}

function SyaratContent() {
  return (
    <div className="space-y-6 text-foreground leading-relaxed">
      <p className="text-sm text-muted-foreground">Terakhir diperbarui: 24 Agustus 2026</p>
      <p>Selamat datang di <strong>InapYuk</strong>. Dengan mengakses dan menggunakan layanan web kami, Anda setuju untuk mematuhi dan terikat oleh Syarat dan Ketentuan berikut ini. Harap baca dengan saksama sebelum melakukan pemesanan.</p>
      <SyaratSection1 />
      <SyaratSection2 />
      <section className="mt-8"><h2 className="text-xl font-semibold mb-3">3. Pemesanan dan Pembayaran</h2><ul className="list-disc pl-5 space-y-2 text-muted-foreground"><li>Harga yang tertera pada kalender sudah termasuk penyesuaian tarif musim libur (peak season rate) yang diatur oleh Tenant.</li><li>Pemesanan hanya dianggap sah setelah Anda mengunggah bukti pembayaran yang valid dalam batas waktu maksimal <strong>2 jam</strong> sejak pemesanan dibuat.</li><li>Kegagalan melakukan pembayaran dalam batas waktu tersebut akan mengakibatkan pembatalan pesanan secara otomatis oleh sistem.</li></ul></section>
      <section className="mt-8"><h2 className="text-xl font-semibold mb-3">4. Pembatalan dan Pengembalian Dana (Refund)</h2><p className="text-muted-foreground">Pembatalan yang dilakukan oleh pengguna sebelum mengunggah bukti pembayaran dapat dilakukan kapan saja tanpa dikenakan biaya. Jika pembayaran telah diunggah dan pesanan dikonfirmasi oleh Tenant, setiap permintaan pengembalian dana harus diselesaikan di luar platform InapYuk, sesuai dengan kebijakan masing-masing Tenant.</p></section>
    </div>
  );
}

export default async function SyaratPage() {
  const cookieStore = await cookies(), isAuthenticated = !!cookieStore.get('accessToken')?.value;
  return (
    <div className="flex min-h-full flex-col">
      <Navbar isAuthenticated={isAuthenticated} />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 pt-8 pb-16 sm:px-8">
        <div className="mb-6"><BackButton href="/" label="Kembali ke Beranda" /></div><h1 className="text-3xl font-bold font-heading mb-6">Syarat & Ketentuan</h1>
        <SyaratContent />
      </main>
      <Footer />
    </div>
  );
}
