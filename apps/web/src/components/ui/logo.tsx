import { Home } from 'lucide-react';
import React from 'react';

interface LogoProps {
  className?: string;
  isTenant?: boolean;
}

export function Logo({ className = '', isTenant = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-1.5 font-heading font-bold tracking-tight text-primary ${className}`}>
      <Home className="w-[1.15em] h-[1.15em] stroke-[2.5]" />
      <span className="leading-none mt-0.5">
        InapYuk
        {isTenant && <span className="text-muted-foreground text-[0.6em] font-normal ml-1.5 align-middle">Tenant</span>}
      </span>
    </div>
  );
}
