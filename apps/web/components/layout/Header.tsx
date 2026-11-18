import React from 'react';
import Link from 'next/link';
import { brand } from '@/lib/brand';
import { Button } from '@/components/ui/Button';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.07] bg-[#0b0b0c]/80 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-colors">
      <div className="max-w-container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif text-2xl font-bold tracking-widest text-gold-gradient uppercase">
            {brand.name}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/vehicles" className="text-text-muted hover:text-gold transition-colors">
            Vehicles
          </Link>
          <Link href="/dealerships" className="text-text-muted hover:text-gold transition-colors">
            Dealerships
          </Link>
          <Link href="/bookings" className="text-text-muted hover:text-gold transition-colors">
            My Bookings
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/vehicles">
            <Button variant="primary" size="sm">
              Explore Fleet
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

