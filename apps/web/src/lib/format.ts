const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const longDate = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const shortDate = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' });

export function formatRupiah(value: number): string {
  return rupiah.format(value);
}

export function formatDate(value: string | Date): string {
  return longDate.format(new Date(value));
}

export function formatDateRange(from: string | Date, to: string | Date): string {
  return `${shortDate.format(new Date(from))} - ${longDate.format(new Date(to))}`;
}
