/**
 * Placeholder home. Feature 1 (awanstywn) owns the real landing page in Sprint 2.
 * This is just a visual direction so the app does not look like a blank scaffold.
 */
export default function HomePage() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center justify-between px-5 py-4 sm:px-8">
        <p className="font-heading text-2xl tracking-tight text-primary">InapYuk</p>
        <nav className="flex items-center gap-5 text-sm">
          <span className="hidden text-muted-foreground sm:inline">Cari penginapan</span>
          <span className="text-muted-foreground">Masuk</span>
          <span className="rounded-full bg-primary px-3 py-1.5 text-primary-foreground">Daftar</span>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 pb-16 pt-8 sm:px-8">
        <p className="text-sm text-accent">Untuk liburan yang nggak bikin kantong kaget.</p>
        <h1 className="font-heading mt-3 max-w-xl text-4xl leading-tight tracking-tight sm:text-5xl">
          Bandingkan harga nginap, baru deh pesan.
        </h1>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
          Harga kamar bisa naik pas long weekend atau tanggal merah. Di InapYuk kamu lihat dulu
          kalender harganya, baru booking.
        </p>

        <div className="mt-10 rounded-2xl border border-border bg-card p-3 shadow-sm">
          <div className="grid gap-2 sm:grid-cols-3">
            <label className="rounded-xl bg-muted/70 px-3 py-2">
              <span className="block text-xs text-muted-foreground">Kota</span>
              <span className="text-sm">Bali, Yogyakarta, ...</span>
            </label>
            <label className="rounded-xl bg-muted/70 px-3 py-2">
              <span className="block text-xs text-muted-foreground">Tanggal nginap</span>
              <span className="text-sm">Pilih check-in</span>
            </label>
            <label className="rounded-xl bg-muted/70 px-3 py-2">
              <span className="block text-xs text-muted-foreground">Tamu</span>
              <span className="text-sm">2 orang</span>
            </label>
          </div>
          <p className="mt-3 px-1 text-xs text-muted-foreground">
            Form pencarian ini masih dummy — Awan yang ngerjain di Sprint 2.
          </p>
        </div>
      </main>

      <footer className="px-5 py-6 text-xs text-muted-foreground sm:px-8">
        InapYuk · nginap lebih tenang, harganya kelihatan jelas.
      </footer>
    </div>
  );
}
