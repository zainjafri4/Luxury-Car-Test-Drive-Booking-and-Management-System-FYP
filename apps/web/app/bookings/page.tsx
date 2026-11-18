'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge, type BookingStatusType } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'sonner';

interface BookingItem {
  id: string;
  status: BookingStatusType;
  customerNotes?: string | null;
  staffNote?: string | null;
  createdAt: string;
  slot: {
    id: string;
    startsAt: string;
    endsAt: string;
    vehicle: {
      id: string;
      manufacturer: string;
      model: string;
      imageUrl?: string | null;
    };
    dealership: {
      id: string;
      name: string;
      city: string;
      address: string;
    };
  };
  statusHistory?: Array<{
    id: string;
    fromStatus?: string | null;
    toStatus: string;
    createdAt: string;
    note?: string | null;
  }>;
}

export default function MyBookingsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);
  const [cancelModalBooking, setCancelModalBooking] = useState<BookingItem | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Require auth
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?next=/bookings');
    }
  }, [user, authLoading, router]);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get<{ data: BookingItem[] }>('/bookings');
      setBookings(res.data || []);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) return;
      toast.error('Failed to load your reservations.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user, fetchBookings]);

  const handleCancelBooking = async () => {
    if (!cancelModalBooking) return;
    setIsCancelling(true);

    try {
      await api.post(`/bookings/${cancelModalBooking.id}/cancel`, {
        reason: cancelReason.trim() || undefined,
      });

      toast.success('Reservation successfully cancelled.');
      setCancelModalBooking(null);
      setCancelReason('');
      fetchBookings();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        toast.error(err.message || 'Cannot cancel booking.');
      } else {
        toast.error('Cancellation failed.');
      }
    } finally {
      setIsCancelling(false);
    }
  };

  // Filter bookings by tab
  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'APPROVED') return b.status === 'APPROVED';
    if (activeTab === 'PENDING') return b.status === 'PENDING';
    if (activeTab === 'COMPLETED') return b.status === 'COMPLETED';
    if (activeTab === 'CANCELLED') return b.status === 'CANCELLED' || b.status === 'REJECTED';
    return true;
  });

  const counts = {
    ALL: bookings.length,
    PENDING: bookings.filter((b) => b.status === 'PENDING').length,
    APPROVED: bookings.filter((b) => b.status === 'APPROVED').length,
    COMPLETED: bookings.filter((b) => b.status === 'COMPLETED').length,
    CANCELLED: bookings.filter((b) => b.status === 'CANCELLED' || b.status === 'REJECTED').length,
  };

  if (authLoading || isLoading) {
    return (
      <div className="max-w-container mx-auto px-6 py-16 space-y-6 animate-pulse">
        <div className="h-10 w-60 bg-surface-2 rounded" />
        <div className="h-64 bg-surface-2/40 rounded-card" />
      </div>
    );
  }

  return (
    <div className="max-w-container mx-auto px-6 py-12 space-y-10">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <p className="eyebrow">Client Portal</p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-text font-bold mt-1">My Reservations</h1>
        </div>
        <Link href="/vehicles">
          <Button variant="secondary" size="sm">
            + Reserve Another Vehicle
          </Button>
        </Link>
      </div>

      {/* Tabs Row (§9.7) */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/[0.06]">
        {(['ALL', 'PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 rounded-input text-xs font-semibold tracking-wider uppercase transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab
                ? 'bg-gold/15 text-gold border border-gold/40'
                : 'text-text-muted hover:text-text hover:bg-surface-2/50'
            }`}
          >
            <span>{tab === 'CANCELLED' ? 'Past / Cancelled' : tab}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === tab ? 'bg-gold text-black font-bold' : 'bg-surface-2 text-text-faint'
              }`}
            >
              {counts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const startDate = new Date(b.slot.startsAt);
            const now = new Date();
            const hoursUntil = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);
            const canCancel = (b.status === 'PENDING' || b.status === 'APPROVED') && hoursUntil >= 24;

            return (
              <Card
                key={b.id}
                className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-gold/30 transition-all"
              >
                {/* Left: Thumbnail + Vehicle & Date */}
                <div className="flex items-center gap-5">
                  <div className="relative w-28 h-20 rounded-input overflow-hidden bg-surface-2 flex-shrink-0 border border-white/10">
                    <img
                      src={
                        b.slot.vehicle.imageUrl ||
                        'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=400&q=80'
                      }
                      alt={b.slot.vehicle.model}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <p className="eyebrow text-[10px] tracking-widest">{b.slot.vehicle.manufacturer}</p>
                      <StatusBadge status={b.status} />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-text">{b.slot.vehicle.model}</h3>
                    <p className="text-xs text-text-muted">
                      {startDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      at{' '}
                      {startDate.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}{' '}
                      &bull; <span className="text-gold font-medium">{b.slot.dealership.city}</span>
                    </p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3 self-end md:self-center">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedBooking(b)}>
                    View Details
                  </Button>

                  {canCancel && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        setCancelModalBooking(b);
                        setCancelReason('');
                      }}
                    >
                      Cancel
                    </Button>
                  )}

                  {!canCancel && (b.status === 'PENDING' || b.status === 'APPROVED') && (
                    <span
                      title="Cancellations are only permitted up to 24 hours prior to appointment time."
                      className="text-[11px] text-text-faint cursor-help italic border-b border-dotted border-text-faint"
                    >
                      Non-cancellable (&lt;24h)
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-16 text-center space-y-4 border-white/[0.08]">
          <h3 className="font-serif text-2xl text-text">No reservations in this category</h3>
          <p className="text-sm text-text-muted max-w-sm mx-auto">
            Explore our curated luxury fleet and schedule your next private walkthrough.
          </p>
          <Link href="/vehicles">
            <Button variant="primary" size="sm">
              Explore Available Vehicles
            </Button>
          </Link>
        </Card>
      )}

      {/* Details Modal */}
      <Modal
        isOpen={Boolean(selectedBooking)}
        onClose={() => setSelectedBooking(null)}
        title="Reservation Overview"
      >
        {selectedBooking && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div>
                <p className="eyebrow text-[10px]">{selectedBooking.slot.vehicle.manufacturer}</p>
                <h3 className="font-serif text-xl font-bold text-text">{selectedBooking.slot.vehicle.model}</h3>
              </div>
              <StatusBadge status={selectedBooking.status} />
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-white/[0.04]">
                <span className="text-text-muted">Appointment Slot</span>
                <span className="font-medium text-text">
                  {new Date(selectedBooking.slot.startsAt).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/[0.04]">
                <span className="text-text-muted">Boutique Showroom</span>
                <span className="font-medium text-text">{selectedBooking.slot.dealership.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/[0.04]">
                <span className="text-text-muted">Showroom Address</span>
                <span className="font-medium text-text text-right max-w-xs">{selectedBooking.slot.dealership.address}</span>
              </div>
              {selectedBooking.customerNotes && (
                <div className="py-2 space-y-1">
                  <span className="text-text-muted font-medium">Your Notes:</span>
                  <p className="p-3 bg-[#0c0c0f] rounded-input text-text-muted italic border border-white/5">
                    &ldquo;{selectedBooking.customerNotes}&rdquo;
                  </p>
                </div>
              )}
              {selectedBooking.staffNote && (
                <div className="py-2 space-y-1">
                  <span className="text-gold font-medium">Concierge Feedback:</span>
                  <p className="p-3 bg-[#0c0c0f] rounded-input text-text border border-gold/20">
                    {selectedBooking.staffNote}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="ghost" onClick={() => setSelectedBooking(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={Boolean(cancelModalBooking)}
        onClose={() => setCancelModalBooking(null)}
        title="Cancel Reservation"
      >
        {cancelModalBooking && (
          <div className="space-y-6">
            <p className="text-sm text-text-muted leading-relaxed">
              Are you sure you wish to cancel your test-drive appointment for the{' '}
              <span className="font-semibold text-text">
                {cancelModalBooking.slot.vehicle.manufacturer} {cancelModalBooking.slot.vehicle.model}
              </span>
              ? Your reserved slot will be released back to the showroom schedule.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Reason for Cancellation (Optional)
              </label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Schedule conflict, traveling out of town..."
                className="w-full p-3 bg-[#0c0c0f] border border-white/10 rounded-input text-sm text-text focus:border-danger focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setCancelModalBooking(null)} disabled={isCancelling}>
                Keep Reservation
              </Button>
              <Button variant="danger" onClick={handleCancelBooking} isLoading={isCancelling}>
                Confirm Cancellation
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

