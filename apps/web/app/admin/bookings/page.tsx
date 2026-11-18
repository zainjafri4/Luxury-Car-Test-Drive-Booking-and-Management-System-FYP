'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import {
  CalendarCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  CalendarClock,
  Flag,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';

interface BookingItem {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  customerNote?: string | null;
  staffNote?: string | null;
  cancellationReason?: string | null;
  createdAt: string;
  customer: {
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
  };
  slot: {
    id: string;
    startsAt: string;
    endsAt: string;
    vehicle: {
      id: string;
      brand: string;
      model: string;
      year: number;
    };
    dealership: {
      id: string;
      name: string;
      city: string;
    };
  };
}

interface AvailableSlot {
  id: string;
  startsAt: string;
  endsAt: string;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [customerSearch, setCustomerSearch] = useState<string>('');
  const [sort, setSort] = useState<string>('newest');

  // Modals
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [newSlotId, setNewSlotId] = useState('');
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setFeedbackMsg(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (customerSearch.trim()) params.set('customer', customerSearch.trim());
      params.set('sort', sort);
      params.set('page', String(page));
      params.set('pageSize', '15');

      const res = await api.get<{
        data: BookingItem[];
        meta: { total: number; totalPages: number; page: number };
      }>(`/admin/bookings?${params.toString()}`);

      setBookings(res.data || []);
      setTotalCount(res.meta?.total || 0);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (err: any) {
      setFeedbackMsg({ text: err.message || 'Failed to fetch bookings list', type: 'error' });
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, customerSearch, sort, page]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Load available slots for rescheduling the selected booking (same vehicle only per §7.4)
  const openRescheduleModal = async (booking: BookingItem) => {
    setSelectedBooking(booking);
    setNewSlotId('');
    setRescheduleModalOpen(true);
    setLoadingSlots(true);

    try {
      const now = new Date().toISOString();
      const res = await api.get<{ data: AvailableSlot[] }>(
        `/slots/availability?vehicleId=${booking.slot.vehicle.id}&from=${now}`
      );
      setAvailableSlots(res.data || []);
    } catch {
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      await api.post(`/admin/bookings/${id}/approve`);
      setFeedbackMsg({ text: 'Booking approved successfully. Confirmation sent to customer.', type: 'success' });
      await fetchBookings();
    } catch (err: any) {
      setFeedbackMsg({ text: err.message || 'Failed to approve booking', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (id: string) => {
    setActionLoading(true);
    try {
      await api.post(`/admin/bookings/${id}/complete`);
      setFeedbackMsg({ text: 'Booking marked as completed.', type: 'success' });
      await fetchBookings();
    } catch (err: any) {
      setFeedbackMsg({ text: err.message || 'Failed to complete booking', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !rejectNote.trim()) return;

    setActionLoading(true);
    try {
      await api.post(`/admin/bookings/${selectedBooking.id}/reject`, {
        staffNote: rejectNote.trim(),
      });
      setRejectModalOpen(false);
      setRejectNote('');
      setSelectedBooking(null);
      setFeedbackMsg({ text: 'Booking rejected. Rejection reason recorded and communicated.', type: 'success' });
      await fetchBookings();
    } catch (err: any) {
      setFeedbackMsg({ text: err.message || 'Failed to reject booking', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !newSlotId) return;

    setActionLoading(true);
    try {
      await api.post(`/admin/bookings/${selectedBooking.id}/reschedule`, {
        newSlotId,
      });
      setRescheduleModalOpen(false);
      setNewSlotId('');
      setSelectedBooking(null);
      setFeedbackMsg({ text: 'Booking rescheduled successfully to requested time slot.', type: 'success' });
      await fetchBookings();
    } catch (err: any) {
      setFeedbackMsg({ text: err.message || 'Failed to reschedule booking', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <p className="eyebrow">Registry Management</p>
          <h1 className="font-serif text-3xl font-bold text-text">Test-Drive Reservations</h1>
          <p className="text-xs text-text-muted mt-1">Review, approve, reschedule, or complete customer reservations.</p>
        </div>
        <div className="text-xs text-text-muted">
          Showing <span className="font-semibold text-text">{bookings.length}</span> of{' '}
          <span className="font-semibold text-text">{totalCount}</span> reservations
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-input text-xs flex items-center gap-2 border ${
            feedbackMsg.type === 'success'
              ? 'bg-success/10 border-success/30 text-success'
              : 'bg-danger/10 border-danger/30 text-danger'
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Filter Bar (§9.7) */}
      <Card className="p-4 flex flex-wrap items-center gap-4 bg-surface-2/40">
        <div className="flex-1 min-w-[240px]">
          <Input
            placeholder="Search by customer name or email..."
            value={customerSearch}
            onChange={(e) => {
              setCustomerSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs text-text-muted flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-text-faint" />
            <span>Status:</span>
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 px-3 rounded-input bg-surface border border-border text-text text-xs focus:outline-none focus:border-gold"
          >
            <option value="all">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs text-text-muted">Sort:</label>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="h-10 px-3 rounded-input bg-surface border border-border text-text text-xs focus:outline-none focus:border-gold"
          >
            <option value="newest">Recently Requested</option>
            <option value="slotTimeAsc">Appointment Time (Asc)</option>
            <option value="slotTimeDesc">Appointment Time (Desc)</option>
          </select>
        </div>
      </Card>

      {/* DataTable (§9.7) */}
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-text-faint text-xs">Loading reservation pipeline...</div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center text-text-faint text-xs">No reservations match the specified filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border text-text-muted uppercase tracking-wider text-[10px] bg-surface-2/60">
                <tr>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Vehicle</th>
                  <th className="py-3.5 px-4">Appointment</th>
                  <th className="py-3.5 px-4">Showroom</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Concierge Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-surface-2/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-text">{b.customer.fullName}</p>
                      <p className="text-[11px] text-text-faint">{b.customer.email}</p>
                      {b.customer.phone && <p className="text-[10px] text-text-faint">{b.customer.phone}</p>}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-text">
                        {b.slot.vehicle.brand} {b.slot.vehicle.model}
                      </p>
                      <p className="text-[10px] text-text-faint">{b.slot.vehicle.year}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-text font-medium">
                        {new Date(b.slot.startsAt).toLocaleDateString('en-GB', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                      <p className="text-[11px] text-gold">
                        {new Date(b.slot.startsAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        &ndash;{' '}
                        {new Date(b.slot.endsAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-text">{b.slot.dealership.name}</p>
                      <p className="text-[10px] text-text-faint">{b.slot.dealership.city}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* View Details */}
                        <button
                          onClick={() => {
                            setSelectedBooking(b);
                            setDetailModalOpen(true);
                          }}
                          className="p-1.5 rounded hover:bg-surface-2 text-text-muted hover:text-text transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* PENDING Actions: Approve / Reject */}
                        {b.status === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleApprove(b.id)}
                              disabled={actionLoading}
                              className="h-7 px-2.5 text-[10px] bg-success hover:bg-success/80 text-white"
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => {
                                setSelectedBooking(b);
                                setRejectModalOpen(true);
                              }}
                              disabled={actionLoading}
                              className="h-7 px-2.5 text-[10px]"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}

                        {/* APPROVED Actions: Reschedule / Complete */}
                        {b.status === 'APPROVED' && (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => openRescheduleModal(b)}
                              disabled={actionLoading}
                              className="h-7 px-2.5 text-[10px]"
                            >
                              <CalendarClock className="w-3 h-3 mr-1" />
                              Reschedule
                            </Button>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleComplete(b.id)}
                              disabled={actionLoading}
                              className="h-7 px-2.5 text-[10px]"
                            >
                              <Flag className="w-3 h-3 mr-1" />
                              Complete
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between text-xs">
            <span className="text-text-muted">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Details Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Reservation Details"
      >
        {selectedBooking && (
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <span className="text-text-muted">Status:</span>
              <StatusBadge status={selectedBooking.status} />
            </div>

            <div className="space-y-1">
              <span className="text-text-muted block text-[10px] uppercase tracking-wider">Customer</span>
              <p className="font-semibold text-text">{selectedBooking.customer.fullName}</p>
              <p className="text-text-faint">{selectedBooking.customer.email}</p>
              {selectedBooking.customer.phone && (
                <p className="text-text-faint">{selectedBooking.customer.phone}</p>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-text-muted block text-[10px] uppercase tracking-wider">Vehicle & Showroom</span>
              <p className="font-semibold text-text">
                {selectedBooking.slot.vehicle.brand} {selectedBooking.slot.vehicle.model} ({selectedBooking.slot.vehicle.year})
              </p>
              <p className="text-text-faint">
                {selectedBooking.slot.dealership.name} &bull; {selectedBooking.slot.dealership.city}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-text-muted block text-[10px] uppercase tracking-wider">Time Slot</span>
              <p className="text-text font-medium">
                {new Date(selectedBooking.slot.startsAt).toLocaleString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                &ndash;{' '}
                {new Date(selectedBooking.slot.endsAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            {selectedBooking.customerNote && (
              <div className="p-3 bg-surface-2 rounded-input border border-border">
                <span className="text-[10px] uppercase tracking-wider text-text-muted block mb-1">
                  Customer Request Note
                </span>
                <p className="text-text italic">&ldquo;{selectedBooking.customerNote}&rdquo;</p>
              </div>
            )}

            {selectedBooking.staffNote && (
              <div className="p-3 bg-surface-2 rounded-input border border-border">
                <span className="text-[10px] uppercase tracking-wider text-gold block mb-1">
                  Staff Internal Note
                </span>
                <p className="text-text">{selectedBooking.staffNote}</p>
              </div>
            )}

            {selectedBooking.cancellationReason && (
              <div className="p-3 bg-danger/10 rounded-input border border-danger/30">
                <span className="text-[10px] uppercase tracking-wider text-danger block mb-1">
                  Cancellation Reason
                </span>
                <p className="text-text">{selectedBooking.cancellationReason}</p>
              </div>
            )}

            <div className="pt-3 border-t border-border flex justify-end">
              <Button size="sm" variant="secondary" onClick={() => setDetailModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Decline Test-Drive Appointment"
      >
        <form onSubmit={handleRejectSubmit} className="space-y-4">
          <p className="text-xs text-text-muted">
            State the reason for rejection. This explanation will be logged and communicated to the customer.
          </p>
          <Input
            label="Rejection Reason (Mandatory)"
            required
            placeholder="e.g. Conflicting VIP event at showroom."
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setRejectModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              disabled={actionLoading || !rejectNote.trim()}
            >
              {actionLoading ? 'Declining...' : 'Confirm Rejection'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reschedule Modal (Same vehicle only per §7.4 & Phase 0 Decisions) */}
      <Modal
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        title="Reschedule Test-Drive Session"
      >
        <form onSubmit={handleRescheduleSubmit} className="space-y-4 text-xs">
          <p className="text-text-muted">
            Per system rules, reservations are rescheduled to another available slot for the{' '}
            <strong className="text-text">
              same vehicle ({selectedBooking?.slot.vehicle.brand} {selectedBooking?.slot.vehicle.model})
            </strong>
            .
          </p>

          {loadingSlots ? (
            <p className="text-text-faint py-4">Checking slot availability...</p>
          ) : availableSlots.length === 0 ? (
            <div className="p-3 bg-surface-2 rounded-input border border-border text-text-faint">
              No upcoming open slots found for this vehicle. Please generate or activate slots first in the Slot Calendar.
            </div>
          ) : (
            <div className="space-y-2">
              <label className="font-medium text-text">Select Replacement Slot:</label>
              <select
                required
                value={newSlotId}
                onChange={(e) => setNewSlotId(e.target.value)}
                className="w-full h-10 px-3 rounded-input bg-surface border border-border text-text focus:outline-none focus:border-gold"
              >
                <option value="">&mdash; Choose Slot &mdash;</option>
                {availableSlots.map((s) => (
                  <option key={s.id} value={s.id}>
                    {new Date(s.startsAt).toLocaleString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    &ndash; {new Date(s.endsAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setRescheduleModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={actionLoading || !newSlotId}
            >
              {actionLoading ? 'Rescheduling...' : 'Confirm Reschedule'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

