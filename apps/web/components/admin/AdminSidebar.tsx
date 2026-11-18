'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { brand } from '@/lib/brand';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard,
  CalendarCheck,
  Car,
  Building2,
  CalendarClock,
  Users,
  LogOut,
  ExternalLink,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
  { href: '/admin/vehicles', label: 'Fleet Vehicles', icon: Car },
  { href: '/admin/dealerships', label: 'Showrooms', icon: Building2 },
  { href: '/admin/slots', label: 'Slot Calendar', icon: CalendarClock },
  { href: '/admin/users', label: 'Users & Staff', icon: Users },
];

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 border-r border-border bg-surface flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Brand / Title */}
        <div className="p-6 border-b border-border/80 flex items-center justify-between">
          <div>
            <Link href="/" className="font-serif text-lg font-bold tracking-wider text-text uppercase block">
              {brand.name}
            </Link>
            <span className="eyebrow text-[9px] text-gold tracking-widest block mt-0.5">Concierge Console</span>
          </div>
          <span className="px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded bg-gold/15 text-gold border border-gold/30">
            Staff
          </span>
        </div>

        {/* Navigation links */}
        <nav className="p-4 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-input text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gold/15 text-gold border border-gold/30 shadow-[0_0_15px_rgba(201,162,75,0.12)]'
                    : 'text-text-muted hover:text-text hover:bg-surface-2'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-gold' : 'text-text-faint'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-border/80 space-y-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 text-xs text-text-muted hover:text-gold hover:bg-surface-2 rounded-input transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-text-faint" />
            <span>Public Showroom</span>
          </span>
          <span className="text-[10px] text-text-faint">&rarr;</span>
        </Link>

        <div className="p-3 bg-surface-2/60 rounded-input border border-border/60 flex items-center justify-between">
          <div className="truncate mr-2">
            <p className="text-xs font-medium text-text truncate">{user?.fullName || 'Staff Member'}</p>
            <p className="text-[10px] text-text-faint truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => logout()}
            title="Sign out"
            className="p-1.5 rounded text-text-faint hover:text-danger hover:bg-danger/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

