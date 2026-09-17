import { BookingChrome } from '@/components/booking/BookingChrome';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return <BookingChrome wide>{children}</BookingChrome>;
}
