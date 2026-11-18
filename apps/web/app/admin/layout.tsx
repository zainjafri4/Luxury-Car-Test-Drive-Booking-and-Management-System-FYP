'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ShieldAlert, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login?next=/admin/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
        <p className="text-xs text-text-muted uppercase tracking-widest">Validating Concierge Credentials...</p>
      </div>
    );
  }

  if (!user || user.role !== 'STAFF') {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-danger/10 border border-danger/30 flex items-center justify-center text-danger">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2 max-w-md">
          <h1 className="font-serif text-2xl font-bold text-text">Restricted VIP Concierge Area</h1>
          <p className="text-xs text-text-muted leading-relaxed">
            Access to this management interface requires authenticated Staff privileges. Your current account does not have sufficient clearance.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/">
            <Button variant="secondary" size="sm">
              Public Fleet
            </Button>
          </Link>
          <Link href="/login?next=/admin/dashboard">
            <Button variant="primary" size="sm">
              Staff Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex text-text">
      <AdminSidebar />
      <main className="flex-1 overflow-x-hidden min-h-screen bg-bg flex flex-col">
        {children}
      </main>
    </div>
  );
}
