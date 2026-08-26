export function HeroCarousel() {
  return (
    <section className="relative w-full rounded-3xl bg-primary/5 overflow-hidden border border-primary/10">
      <div className="absolute inset-0 bg-linear-to-r from-primary/10 to-transparent pointer-events-none" />
      <div className="relative z-10 mx-auto max-w-2xl px-6 py-20 text-center sm:py-32 sm:px-12">
        <p className="text-sm font-semibold tracking-wider text-accent uppercase mb-4">
          Liburan Nggak Bikin Kantong Kaget
        </p>
        <h1 className="font-heading text-4xl leading-tight tracking-tight sm:text-6xl text-foreground">
          Bandingkan harga nginap, <br className="hidden sm:block"/>
          <span className="text-primary">baru deh pesan.</span>
        </h1>
        <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg max-w-xl mx-auto">
          Harga kamar bisa naik pas long weekend atau tanggal merah. Di InapYuk kamu lihat dulu
          kalender harganya, baru booking.
        </p>
      </div>
    </section>
  );
}
