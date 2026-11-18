import React from 'react';
import Link from 'next/link';
import { brand } from '@/lib/brand';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-border bg-surface mt-24 text-sm text-text-muted">
      <div className="max-w-container mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-4 md:col-span-1">
          <span className="font-serif text-xl font-bold tracking-widest text-gold uppercase">
            {brand.name}
          </span>
          <p className="text-xs text-text-faint leading-relaxed">{brand.tagline}</p>
        </div>

        <div>
          <h4 className="eyebrow mb-4">Fleet & Showrooms</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/vehicles" className="hover:text-gold transition-colors">
                All Automobiles
              </Link>
            </li>
            <li>
              <Link href="/dealerships" className="hover:text-gold transition-colors">
                Boutique Locations
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="eyebrow mb-4">Client Experience</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/bookings" className="hover:text-gold transition-colors">
                Manage Reservations
              </Link>
            </li>
            <li>
              <Link href="/account" className="hover:text-gold transition-colors">
                Profile & Security
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="eyebrow mb-4">Concierge Inquiries</h4>
          <p className="text-xs text-text-faint leading-relaxed">
            Personal test-drive concierge available 7 days a week. Experience true driving excellence.
          </p>
        </div>
      </div>

      <div className="border-t border-border/40 py-6 text-center text-xs text-text-faint">
        © {new Date().getFullYear()} {brand.name}. Final Year Project by Zain Raza Jafri. All rights reserved.
      </div>
    </footer>
  );
};

