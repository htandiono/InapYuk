'use client';

import { useEffect, useState } from 'react';

// Counts down from the payment deadline the server sent, one second at a time.
export function PaymentCountdown({ deadline }: { deadline: string }) {
  const [label, setLabel] = useState(() => remaining(deadline));

  useEffect(() => {
    const id = window.setInterval(() => setLabel(remaining(deadline)), 1000);
    return () => window.clearInterval(id);
  }, [deadline]);

  if (!label) return <p className="text-sm text-destructive">Waktu bayar sudah habis.</p>;
  return <p className="text-sm text-accent">Sisa waktu bayar: {label}</p>;
}

function remaining(deadline: string): string | null {
  const ms = new Date(deadline).getTime() - Date.now();
  if (ms <= 0) return null;
  const total = Math.floor(ms / 1000);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return `${hours} jam ${minutes} menit ${seconds} detik`;
}
