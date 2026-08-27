'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function BackButton({ 
  label = 'Kembali', 
  href,
  fallbackHref = '/',
  className = '' 
}: { 
  label?: string; 
  href?: string;
  fallbackHref?: string;
  className?: string;
}) {
  const router = useRouter();
  const baseClasses = `inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors ${className}`;
  
  const icon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );

  // If a strict href is provided, render as a Link (best for static pages to go back home)
  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {icon}
        {label}
      </Link>
    );
  }

  // Otherwise, use router.back() to preserve search filters, with a fallback
  const handleBack = () => {
    // A simple heuristic: if history length is minimal, they probably opened a direct link.
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button onClick={handleBack} className={baseClasses}>
      {icon}
      {label}
    </button>
  );
}
