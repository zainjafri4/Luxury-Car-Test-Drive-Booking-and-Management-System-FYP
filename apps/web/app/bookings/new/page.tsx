'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

interface SlotDetails {
  id: string;
  startsAt: string;
  endsAt: string;
  vehicle: {
    id: string;
    manufacturer: string;
    model: string;
    year: number;
    imageUrl?: string | null;
  };
  dealership: {
    id: string;
    name: string;
    city: string;
    address: string;
  };
}

function NewBookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slotId = searchParams.get('slotId');
  const { user, isLoading: authLoading } = useAuth();

  const [slot, setSlot] = useState<SlotDetails | null>(null);
  const [customerNotes, setCustomerNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [slotConflictError, setSlotConflictError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Require login
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?next=/bookings/new?slotId=${slotId || ''}`);
    }
  }, [user, authLoading, router, slotId]);

  // Load slot & vehicle summary
  useEffect(() => {
    if (!slotId) {
      setIsLoading(false);
      return;
    }

    api
      .get<{ data: SlotDetails }>(`/slots/${slotId}`)
      .then((res) => setSlot(res.data))
      .catch((err) => {
        toast.error('Could not load appointment details.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [slotId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotId) return;

    setIsSubmitting(true);
    setSlotConflictError(false);

    try {
      const res = await api.post<{ data: { id: string } }>('/bookings', {
        slotId,
        customerNotes: customerNotes.trim() || undefined,
      });

      toast.success('Test drive requested successfully! Our team will review your slot.');
      router.push('/bookings');
    } catch (err: unknown) {
      if (err instanceof ApiError && (err.status === 409 || err.code === 'SLOT_ALREADY_BOOKED')) {
        setSlotConflictError(true);
        toast.error('Slot was just taken by another client.');
      } else if (err instanceof ApiError) {
        toast.error(err.message || 'Failed to submit booking request.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="max-w-[720px] mx-auto px-6 py-20 animate-pulse">
        <div className="h-96 bg-surface-2/40 rounded-card" />
      </div>
    );
  }

  if (!slotId || !slot) {
    return (
      <div className="max-w-[720px] mx-auto px-6 py-24 text-center space-y-4">
        <h2 className="font-serif text-3xl text-text">Invalid Appointment Slot</h2>
        <p className="text-sm text-text-muted">Please select an available test drive slot from our fleet catalog.</p>
        <Link href="/vehicles">
          <Button variant="secondary">Browse Vehicles</Button>
        </Link>
      </div>
    );
  }

  const startDate = new Date(slot.startsAt);
  const formattedDate = startDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = startDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="max-w-[720px] mx-auto px-6 py-12 space-y-8">
      {/* Title */}
      <div>
        <p className="eyebrow">Reservation Confirmation</p>
        <h1 className="font-serif text-3xl sm:text-4xl text-text font-bold mt-1">Review Your Test Drive Request</h1>
      </div>

      {/* 409 Conflict Banner (§9.7) */}
      {slotConflictError && (
        <Card className="p-5 border-danger bg-danger/10 text-red-200 space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-xl">&#9888;</span>
            <div className="space-y-1">
              <h4 className="font-semibold text-sm text-white">That appointment slot was just reserved</h4>
              <p className="text-xs text-red-300">
                Another client confirmed this window moments ago. Please choose another preferred date or hour.
              </p>
            </div>
          </div>
          <Link href={`/vehicles/${slot.vehicle.id}`}>
            <Button variant="secondary" size="sm" className="w-full mt-2">
              Choose Another Slot
            </Button>
          </Link>
        </Card>
      )}

      {/* Summary Card */}
      <Card className="p-6 md:p-8 space-y-6 border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        {/* Vehicle Header Snippet */}
        <div className="flex items-center gap-5 pb-6 border-b border-white/[0.08]">
          <div className="relative w-28 h-20 rounded-input overflow-hidden bg-surface-2 flex-shrink-0 border border-white/10">
            <img
              src={
                slot.vehicle.imageUrl ||
                'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=400&q=80'
              }
              alt={slot.vehicle.model}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="eyebrow text-[10px] tracking-widest">{slot.vehicle.manufacturer}</p>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-text">{slot.vehicle.model}</h3>
            <p className="text-xs text-text-muted mt-0.5">{slot.vehicle.year} Model Edition</p>
          </div>
        </div>

        {/* Appointment Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2 text-xs">
          <div className="p-4 bg-[#0c0c0f] border border-white/[0.06] rounded-input space-y-1">
            <p className="text-[10px] text-text-faint uppercase tracking-wider font-semibold">Appointment Time</p>
            <p className="font-semibold text-text text-sm">{formattedDate}</p>
            <p className="text-gold font-medium">{formattedTime} (PKT)</p>
          </div>
          <div className="p-4 bg-[#0c0c0f] border border-white/[0.06] rounded-input space-y-1">
            <p className="text-[10px] text-text-faint uppercase tracking-wider font-semibold">Showroom Location</p>
            <p className="font-semibold text-text text-sm">{slot.dealership.name}</p>
            <p className="text-text-muted truncate">{slot.dealership.address}</p>
          </div>
        </div>

        {/* Form & Notes */}
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="notes" className="font-semibold text-text-muted uppercase tracking-wider">
                Special Requests or Notes (Optional)
              </label>
              <span className="text-[11px] text-text-faint">{customerNotes.length} / 500</span>
            </div>
            <textarea
              id="notes"
              rows={3}
              maxLength={500}
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              placeholder="e.g. Interested in custom paint options, trading in current vehicle, or specific highway route..."
              className="w-full p-3.5 bg-[#0e0e12] border border-white/[0.09] rounded-input text-text text-sm placeholder:text-text-faint focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
            />
          </div>

          {/* Rules & Terms Notice (§9.7) */}
          <div className="p-4 rounded-input bg-surface-2/40 border border-white/[0.06] text-xs text-text-muted space-y-1.5">
            <p className="font-medium text-text">Reservation Policy & Terms:</p>
            <ul className="list-disc list-inside space-y-1 text-text-faint text-[11px]">
              <li>All test drives require verified identification and a valid driver&apos;s license upon arrival.</li>
              <li>Cancellations are permitted up to 24 hours prior to scheduled appointment.</li>
              <li>Your reservation is tentative until confirmed by a dealership concierge specialist.</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
            <Link href={`/vehicles/${slot.vehicle.id}`} className="w-full sm:w-auto">
              <Button variant="ghost" type="button" className="w-full sm:w-auto">
                Cancel / Choose Another
              </Button>
            </Link>
            <Button
              variant="primary"
              size="lg"
              type="submit"
              isLoading={isSubmitting}
              className="w-full sm:w-auto px-8 font-semibold shadow-lg"
            >
              Confirm Reservation Request
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function NewBookingPage() {
  return (
    <React.Suspense
      fallback={
        <div className="max-w-[720px] mx-auto px-6 py-20 animate-pulse">
          <div className="h-96 bg-surface-2/40 rounded-card" />
        </div>
      }
    >
      <NewBookingContent />
    </React.Suspense>
  );
}
