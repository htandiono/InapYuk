import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { cookies } from 'next/headers';
import { BackButton } from '@/components/ui/BackButton';

function FaqItem({ question, answer }: { question: string, answer: string }) {
  return (
    <div className="bg-muted/30 p-5 rounded-2xl border border-border">
      <h4 className="font-semibold mb-2">{question}</h4>
      <p className="text-sm text-muted-foreground leading-relaxed">{answer}</p>
    </div>
  );
}

function FaqSection() {
  return (
    <section>
      <h3 className="text-lg font-semibold mb-4 text-primary">Pertanyaan yang Sering Diajukan (FAQ)</h3>
      <div className="space-y-6">
        <FaqItem question="Bagaimana cara memesan penginapan?" answer="Untuk melakukan pemesanan, Anda dapat mencari penginapan melalui halaman utama tanpa harus login. Namun, ketika Anda siap untuk memesan, Anda diwajibkan untuk mendaftar dan masuk ke dalam akun InapYuk Anda demi keamanan transaksi." />
        <FaqItem question="Apakah saya bisa membatalkan pesanan?" answer="Ya, Anda dapat membatalkan pesanan dengan syarat Anda belum melakukan pembayaran (mengunggah bukti bayar). Jika pembayaran sudah diunggah dan terkonfirmasi, pembatalan dan pengembalian dana harus diselesaikan di luar sistem dengan persetujuan pihak pengelola (Tenant)." />
        <FaqItem question="Berapa batas waktu pembayaran?" answer="Tempat penginapan yang di-booking harus segera dibayarkan paling lambat 2 jam setelah pemesanan dilakukan. Jika tidak, maka sistem akan secara otomatis membatalkan pesanan Anda." />
      </div>
    </section>
  );
}

function BantuanContent() {
  return (
    <div className="space-y-8 text-foreground">
      <section><h2 className="text-xl font-semibold mb-3">Selamat datang di Pusat Bantuan InapYuk</h2><p className="text-muted-foreground leading-relaxed">Kami siap membantu Anda. Jika Anda mengalami kesulitan saat memesan penginapan atau memiliki pertanyaan tentang akun Anda, silakan pelajari artikel bantuan di bawah ini atau hubungi tim dukungan pelanggan kami.</p></section>
      <FaqSection />
      <section className="pt-6 border-t border-border/40"><h3 className="text-lg font-semibold mb-2">Butuh Bantuan Lebih Lanjut?</h3><p className="text-muted-foreground text-sm">Tim kami tersedia Senin - Jumat (09:00 - 18:00 WIB). Hubungi kami melalui email: <a href="mailto:support@inapyuk.space" className="text-primary hover:underline font-medium">support@inapyuk.space</a>.</p></section>
    </div>
  );
}

export default async function BantuanPage() {
  const cookieStore = await cookies(), isAuthenticated = !!cookieStore.get('accessToken')?.value;
  return (
    <div className="flex min-h-full flex-col">
      <Navbar isAuthenticated={isAuthenticated} />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 pt-8 pb-16 sm:px-8">
        <div className="mb-6"><BackButton href="/" label="Kembali ke Beranda" /></div><h1 className="text-3xl font-bold font-heading mb-8">Pusat Bantuan</h1>
        <BantuanContent />
      </main>
      <Footer />
    </div>
  );
}
