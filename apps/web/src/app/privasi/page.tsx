import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { cookies } from 'next/headers';
import { BackButton } from '@/components/ui/BackButton';

function PrivasiSection1() {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold mb-3">1. Informasi yang Kami Kumpulkan</h2>
      <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
        <li><strong>Informasi Pendaftaran:</strong> Nama lengkap dan alamat email yang Anda berikan saat membuat akun.</li>
        <li><strong>Informasi Transaksi:</strong> Data terkait pemesanan penginapan Anda, termasuk tanggal menginap, lokasi, dan bukti pembayaran yang diunggah.</li>
        <li><strong>Informasi Perangkat:</strong> Data log standar seperti alamat IP, jenis peramban (browser), dan waktu akses untuk keperluan keamanan.</li>
      </ul>
    </section>
  );
}

function PrivasiSection2() {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold mb-3">2. Penggunaan Informasi</h2>
      <p className="text-muted-foreground mb-2">Informasi yang kami kumpulkan digunakan secara eksklusif untuk:</p>
      <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
        <li>Memproses dan mengonfirmasi pemesanan penginapan Anda.</li>
        <li>Memverifikasi identitas Anda untuk mencegah penipuan.</li>
        <li>Mengirimkan email konfirmasi, pengingat check-in (H-1), dan pembaruan layanan.</li>
        <li>Menyediakan laporan analitik internal bagi pengelola penginapan (Tenant).</li>
      </ul>
    </section>
  );
}

function PrivasiContent() {
  return (
    <div className="space-y-6 text-foreground leading-relaxed">
      <p className="text-sm text-muted-foreground">Terakhir diperbarui: 24 Agustus 2026</p>
      <p>Di <strong>InapYuk</strong>, privasi dan keamanan data Anda adalah prioritas utama kami. Dokumen Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi pribadi Anda saat Anda menggunakan platform kami.</p>
      <PrivasiSection1 />
      <PrivasiSection2 />
      <section className="mt-8"><h2 className="text-xl font-semibold mb-3">3. Keamanan Data</h2><p className="text-muted-foreground">Kami menggunakan enkripsi berstandar industri (seperti bcrypt untuk kata sandi) dan koneksi aman (HTTPS) untuk melindungi data Anda. Kata sandi Anda di-hash dan tidak pernah disimpan dalam bentuk teks biasa.</p></section>
      <section className="mt-8 border-t border-border/40 pt-6"><p className="text-sm text-muted-foreground">Dengan menggunakan layanan InapYuk, Anda menyetujui pengumpulan dan penggunaan informasi sesuai dengan kebijakan ini. Jika Anda memiliki pertanyaan lebih lanjut, hubungi kami di <a href="mailto:privacy@inapyuk.space" className="text-primary hover:underline">privacy@inapyuk.space</a>.</p></section>
    </div>
  );
}

export default async function PrivasiPage() {
  const cookieStore = await cookies(), isAuthenticated = !!cookieStore.get('accessToken')?.value;
  return (
    <div className="flex min-h-full flex-col">
      <Navbar isAuthenticated={isAuthenticated} />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 pt-8 pb-16 sm:px-8">
        <div className="mb-6"><BackButton href="/" label="Kembali ke Beranda" /></div><h1 className="text-3xl font-bold font-heading mb-6">Kebijakan Privasi</h1>
        <PrivasiContent />
      </main>
      <Footer />
    </div>
  );
}
