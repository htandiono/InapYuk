import Link from 'next/link';

export function AuthGate({
  title,
  body,
  href,
  action,
}: {
  title: string;
  body: string;
  href: string;
  action: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="font-heading text-xl text-primary">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      <Link
        href={href}
        className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        {action}
      </Link>
    </div>
  );
}

export function NeedLogin() {
  return (
    <AuthGate
      title="Masuk dulu ya"
      body="Daftar pesanan cuma kelihatan setelah kamu login."
      href="/login"
      action="Masuk"
    />
  );
}
