import type { Metadata, Viewport } from 'next';
import { Fraunces, Figtree } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { clientEnv } from '@/lib/env';
import { UnverifiedBanner } from '@/components/UnverifiedBanner';
import './globals.css';

const figtree = Figtree({ variable: '--font-figtree', subsets: ['latin'] });
const fraunces = Fraunces({ variable: '--font-fraunces', subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(clientEnv.siteUrl),
  title: {
    default: 'InapYuk - Cari & Bandingkan Harga Penginapan',
    template: '%s | InapYuk',
  },
  description:
    'InapYuk membantu kamu membandingkan harga penginapan berdasarkan tanggal menginap, lalu memesan langsung dari pemilik properti.',
  keywords: ['penginapan', 'villa', 'hotel', 'homestay', 'booking', 'Indonesia'],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: 'InapYuk',
    title: 'InapYuk - Cari & Bandingkan Harga Penginapan',
    description: 'Bandingkan harga penginapan berdasarkan tanggal, lalu pesan langsung.',
  },
};

export const viewport: Viewport = {
  themeColor: '#0f766e',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${figtree.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <UnverifiedBanner />
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
