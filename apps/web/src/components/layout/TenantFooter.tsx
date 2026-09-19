import Link from 'next/link';

export function TenantFooter() {
  return (
    <footer className="border-t border-border/40 bg-muted/20 px-5 py-6 sm:px-8 mt-auto shrink-0">
      <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-muted-foreground gap-4">
        <p>
          InapYuk Tenant &copy; {new Date().getFullYear()}. Nginap lebih tenang, harganya kelihatan
          jelas.
        </p>
        <div className="flex gap-4">
          <Link href="/bantuan" className="hover:text-primary transition-colors">
            Bantuan
          </Link>
          <Link href="/privasi" className="hover:text-primary transition-colors">
            Privasi
          </Link>
          <Link href="/syarat" className="hover:text-primary transition-colors">
            Syarat Ketentuan
          </Link>
        </div>
      </div>
    </footer>
  );
}
