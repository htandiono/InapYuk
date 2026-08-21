export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/20 px-5 py-8 sm:px-8 mt-16">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-xs text-muted-foreground">
        <p>InapYuk &copy; 2026. Nginap lebih tenang, harganya kelihatan jelas.</p>
        <div className="flex gap-4 mt-4 sm:mt-0">
          <a href="#" className="hover:text-primary transition-colors">Bantuan</a>
          <a href="#" className="hover:text-primary transition-colors">Privasi</a>
          <a href="#" className="hover:text-primary transition-colors">Syarat</a>
        </div>
      </div>
    </footer>
  );
}
