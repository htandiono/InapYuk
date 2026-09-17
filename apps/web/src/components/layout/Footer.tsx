import Link from 'next/link';

function FooterLinks() {
  return (
    <div className="flex gap-4 sm:mt-0">
      <Link href="/bantuan" className="hover:text-primary transition-colors">Bantuan</Link>
      <Link href="/privasi" className="hover:text-primary transition-colors">Privasi</Link>
      <Link href="/syarat" className="hover:text-primary transition-colors">Syarat</Link>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/20 px-5 py-8 sm:px-8 mt-16">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-xs text-muted-foreground gap-4">
        <p>InapYuk &copy; 2026. Nginap lebih tenang, harganya kelihatan jelas.</p>
        <FooterLinks />
      </div>
    </footer>
  );
}
