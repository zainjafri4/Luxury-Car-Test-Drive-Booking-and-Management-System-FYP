import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Dealership {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  openingTime: string;
  closingTime: string;
  description?: string | null;
  availableVehiclesCount?: number;
}

async function getDealerships(): Promise<Dealership[]> {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  try {
    const res = await fetch(`${API_BASE}/dealerships?limit=50`, {
      next: { revalidate: 60 },
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data || []) as Dealership[];
  } catch {
    return [];
  }
}

export default async function DealershipsPage() {
  const dealerships = await getDealerships();

  return (
    <div className="max-w-container mx-auto px-6 py-12 space-y-12 pb-24">
      {/* Title */}
      <div className="border-b border-white/[0.08] pb-6 space-y-2">
        <p className="eyebrow">Flagship Locations</p>
        <h1 className="font-serif text-4xl sm:text-5xl text-text font-bold">Showroom Boutiques</h1>
        <p className="text-text-muted text-sm sm:text-base max-w-xl">
          Visit our bespoke automotive lounges across Pakistan for personalized vehicle viewings and concierge service.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {dealerships.map((d) => (
          <Card key={d.id} className="p-8 space-y-6 flex flex-col justify-between hover:border-gold/30">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gold tracking-widest uppercase">{d.city}</span>
                <span className="text-xs text-text-faint">
                  {d.openingTime} - {d.closingTime}
                </span>
              </div>

              <h2 className="font-serif text-2xl font-bold text-text">{d.name}</h2>
              <p className="text-xs text-text-muted leading-relaxed">{d.description || d.address}</p>

              <div className="pt-2 space-y-2 text-xs border-t border-white/[0.06]">
                <div className="flex justify-between">
                  <span className="text-text-muted">Direct Line:</span>
                  <span className="font-medium text-text">{d.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Email Concierge:</span>
                  <span className="font-medium text-text">{d.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Physical Bay:</span>
                  <span className="font-medium text-text text-right max-w-[180px] truncate">{d.address}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.06]">
              <Link href={`/vehicles?dealershipId=${d.id}`} className="block">
                <Button variant="secondary" size="sm" className="w-full">
                  Browse Vehicles In {d.city} &rarr;
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

