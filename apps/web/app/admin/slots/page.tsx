'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  CalendarClock,
  Plus,
  Layers,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  Lock,
  ExternalLink,
  Car,
} from 'lucide-react';

interface VehicleOption {
  id: string;
  brand: string;
  model: string;
  year: number;
}

interface SlotItem {
  id: string;
  startsAt: string;
  endsAt: string;
  status: 'ACTIVE' | 'INACTIVE';
  isBooked?: boolean;
  booking?: {
    id: string;
    status: string;
    customer: {
      fullName: string;
      email: string;
    };
  } | null;
}

export default function AdminSlotsPage() {
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Week offset (0 = current week)
  const [weekOffset, setWeekOffset] = useState(0);

  // Single Slot Modal
  const [singleModalOpen, setSingleModalOpen] = useState(false);
  const [singleStartsAt, setSingleStartsAt] = useState('');
  const [singleEndsAt, setSingleEndsAt] = useState('');

  // Bulk Generate Drawer/Modal
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkForm, setBulkForm] = useState({
    startDate: '',
    endDate: '',
    dailyStartTime: '10:00',
    dailyEndTime: '17:00',
    durationMinutes: 60,
    gapMinutes: 0,
  });

  // Selected slot detail modal
  const [selectedSlot, setSelectedSlot] = useState<SlotItem | null>(null);
  const [slotDetailOpen, setSlotDetailOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // Load vehicles
  useEffect(() => {
    api
      .get<{ data: VehicleOption[] }>('/vehicles?limit=100')
      .then((res) => {
        const list = res.data || [];
        setVehicles(list);
        if (list[0]) setSelectedVehicleId(list[0]!.id);
      })
      .catch(() => {});
  }, []);

  // Compute week range
  const getWeekDates = (offset: number) => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sunday
    const distanceToMonday = (currentDay + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - distanceToMonday + offset * 7);
    monday.setHours(0, 0, 0, 0);

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDates(weekOffset);
  const weekStart = weekDays[0]!;
  const weekEnd = new Date(weekDays[6]!);
  weekEnd.setHours(23, 59, 59, 999);

  // Load slots for selected vehicle and week
  const fetchSlots = useCallback(async () => {
    if (!selectedVehicleId) return;
    setIsLoading(true);
    setFeedbackMsg(null);

    try {
      const res = await api.get<{ data: SlotItem[] }>(
        `/slots?vehicleId=${selectedVehicleId}&from=${weekStart.toISOString()}&to=${weekEnd.toISOString()}`
      );
      setSlots(res.data || []);
    } catch (err: any) {
      setFeedbackMsg({ text: err.message || 'Failed to fetch slots calendar', type: 'error' });
      setSlots([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedVehicleId, weekOffset]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  // Set default dates for modals
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0]!;
    const nextWeekStr = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]!;
    setBulkForm((prev) => ({ ...prev, startDate: todayStr, endDate: nextWeekStr }));

    const now = new Date();
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + 1);
    const startIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    const endIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000 + 3600000)
      .toISOString()
      .slice(0, 16);
    setSingleStartsAt(startIso);
    setSingleEndsAt(endIso);
  }, []);

  const handleCreateSingleSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setActionLoading(true);

    try {
      await api.post('/slots', {
        vehicleId: selectedVehicleId,
        startsAt: new Date(singleStartsAt).toISOString(),
        endsAt: new Date(singleEndsAt).toISOString(),
      });
      setSingleModalOpen(false);
      setFeedbackMsg({ text: 'Time slot created successfully.', type: 'success' });
      await fetchSlots();
    } catch (err: any) {
      setModalError(err.message || 'Failed to create time slot.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setActionLoading(true);

    try {
      const res = await api.post<{ data: { createdCount: number } }>('/slots/bulk', {
        vehicleId: selectedVehicleId,
        startDate: bulkForm.startDate,
        endDate: bulkForm.endDate,
        dailyStartTime: bulkForm.dailyStartTime,
        dailyEndTime: bulkForm.dailyEndTime,
        durationMinutes: Number(bulkForm.durationMinutes),
        gapMinutes: Number(bulkForm.gapMinutes),
      });

      setBulkModalOpen(false);
      setFeedbackMsg({
        text: `Bulk generation successful: ${res.data?.createdCount ?? 'multiple'} slots created.`,
        type: 'success',
      });
      await fetchSlots();
    } catch (err: any) {
      setModalError(err.message || 'Failed to bulk generate slots.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivateSlot = async () => {
    if (!selectedSlot) return;
    setActionLoading(true);
    setModalError('');

    try {
      await api.delete(`/slots/${selectedSlot.id}`);
      setSlotDetailOpen(false);
      setFeedbackMsg({ text: 'Slot deactivated successfully.', type: 'success' });
      await fetchSlots();
    } catch (err: any) {
      setModalError(err.message || 'Cannot deactivate slot: active booking exists.');
    } finally {
      setActionLoading(false);
    }
  };

  // Group slots by day
  const getSlotsForDay = (date: Date) => {
    const dayStr = date.toISOString().split('T')[0];
    return slots
      .filter((s) => {
        const slotDayStr = new Date(s.startsAt).toISOString().split('T')[0];
        return slotDayStr === dayStr;
      })
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <p className="eyebrow">Capacity & Scheduling</p>
          <h1 className="font-serif text-3xl font-bold text-text">Time Slot Calendar</h1>
          <p className="text-xs text-text-muted mt-1">
            Generate and manage appointment availability windows across the vehicle fleet.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setModalError('');
              setSingleModalOpen(true);
            }}
            disabled={!selectedVehicleId}
            className="flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Single Slot</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setModalError('');
              setBulkModalOpen(true);
            }}
            disabled={!selectedVehicleId}
            className="flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4" />
            <span>Bulk Generate</span>
          </Button>
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
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Vehicle Selector & Week Navigation Bar */}
      <Card className="p-4 flex flex-wrap items-center justify-between gap-4 bg-surface-2/40">
        <div className="flex items-center gap-3">
          <Car className="w-4 h-4 text-gold shrink-0" />
          <label className="text-xs font-medium text-text-muted">Target Vehicle:</label>
          <select
            value={selectedVehicleId}
            onChange={(e) => setSelectedVehicleId(e.target.value)}
            className="h-10 px-3 rounded-input bg-surface border border-border text-text text-xs focus:outline-none focus:border-gold min-w-[260px]"
          >
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.brand} {v.model} ({v.year})
              </option>
            ))}
          </select>
        </div>

        {/* Week navigation */}
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => setWeekOffset((w) => w - 1)}>
            <ChevronLeft className="w-3.5 h-3.5" />
          </Button>
          <span className="text-xs font-semibold text-text min-w-[170px] text-center">
            {weekStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} &ndash;{' '}
            {weekEnd.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <Button variant="secondary" size="sm" onClick={() => setWeekOffset((w) => w + 1)}>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="text-[11px] text-gold hover:underline font-medium ml-2"
            >
              Current Week
            </button>
          )}
        </div>
      </Card>

      {/* Week Grid Calendar (§9.7) */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {weekDays.map((day, idx) => {
          const daySlots = getSlotsForDay(day);
          const isToday = day.toDateString() === new Date().toDateString();

          return (
            <Card
              key={idx}
              className={`p-3 space-y-3 flex flex-col min-h-[360px] ${
                isToday ? 'border-gold/50 bg-gradient-to-b from-gold/5 to-surface' : 'bg-surface'
              }`}
            >
              {/* Day Header */}
              <div className="border-b border-border/60 pb-2 text-center">
                <p className="eyebrow text-[9px]">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <p
                  className={`font-serif text-lg font-bold mt-0.5 ${
                    isToday ? 'text-gold' : 'text-text'
                  }`}
                >
                  {day.getDate()}
                </p>
                <span className="text-[10px] text-text-faint">{daySlots.length} slots</span>
              </div>

              {/* Slot list */}
              <div className="flex-1 space-y-2 overflow-y-auto max-h-[420px] pr-1">
                {daySlots.length === 0 ? (
                  <p className="text-[11px] text-text-faint text-center pt-8">No slots</p>
                ) : (
                  daySlots.map((slot) => {
                    const isBooked = slot.isBooked || slot.booking != null;
                    const isInactive = slot.status === 'INACTIVE';

                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => {
                          setSelectedSlot(slot);
                          setModalError('');
                          setSlotDetailOpen(true);
                        }}
                        className={`w-full text-left p-2 rounded-input text-xs transition-all border block ${
                          isInactive
                            ? 'bg-surface-2/40 border-border/40 text-text-faint opacity-60'
                            : isBooked
                            ? 'bg-warning/15 border-warning/40 text-warning shadow-sm'
                            : 'bg-surface-2 border-gold/30 hover:border-gold text-text shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-semibold">
                          <span>
                            {new Date(slot.startsAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                            })}
                          </span>
                          {isBooked ? (
                            <Lock className="w-3 h-3 text-warning shrink-0" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-success" />
                          )}
                        </div>
                        <p className="text-[9px] text-text-muted mt-0.5 truncate">
                          {isBooked
                            ? slot.booking?.customer?.fullName || 'Booked (Active)'
                            : isInactive
                            ? 'Inactive'
                            : 'Available'}
                        </p>
                      </button>
                    );
                  })
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-text-muted pt-2 border-t border-border/60">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-surface-2 border border-gold/40" />
          <span>Available Free Slot</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-warning/20 border border-warning/40" />
          <span>Booked (Locked)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-surface-2/40 border border-border/40 opacity-60" />
          <span>Inactive / Cancelled</span>
        </div>
      </div>

      {/* Slot Details Modal */}
      <Modal
        isOpen={slotDetailOpen}
        onClose={() => setSlotDetailOpen(false)}
        title="Time Slot Diagnostics"
      >
        {selectedSlot && (
          <div className="space-y-4 text-xs">
            {modalError && (
              <div className="p-3 rounded-input bg-danger/10 border border-danger/30 text-danger text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <div className="p-3 bg-surface-2 rounded-input border border-border space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Window:</span>
                <span className="font-semibold text-text">
                  {new Date(selectedSlot.startsAt).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}{' '}
                  &ndash;{' '}
                  {new Date(selectedSlot.endsAt).toLocaleTimeString('en-US', { timeStyle: 'short' })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted">State:</span>
                <span className="font-semibold text-gold">
                  {selectedSlot.isBooked || selectedSlot.booking ? 'BOOKED' : selectedSlot.status}
                </span>
              </div>
            </div>

            {selectedSlot.booking && (
              <div className="p-3 bg-warning/10 rounded-input border border-warning/30 space-y-1 text-warning">
                <p className="font-semibold text-xs">Active Booking Assigned</p>
                <p className="text-[11px] text-text">Client: {selectedSlot.booking.customer.fullName}</p>
                <p className="text-[10px] text-text-muted">{selectedSlot.booking.customer.email}</p>
                <Link
                  href="/admin/bookings"
                  className="text-[10px] text-gold underline block pt-1 hover:text-gold-hover"
                >
                  Manage in Bookings Dashboard &rarr;
                </Link>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <Button size="sm" variant="secondary" onClick={() => setSlotDetailOpen(false)}>
                Dismiss
              </Button>
              {selectedSlot.status === 'ACTIVE' && (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={handleDeactivateSlot}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Closing...' : 'Deactivate Slot'}
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Add Single Slot Modal */}
      <Modal
        isOpen={singleModalOpen}
        onClose={() => setSingleModalOpen(false)}
        title="Schedule Single Appointment Window"
      >
        <form onSubmit={handleCreateSingleSlot} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded-input bg-danger/10 border border-danger/30 text-danger text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-text-muted">Slot Start Time *</label>
            <input
              type="datetime-local"
              required
              value={singleStartsAt}
              onChange={(e) => setSingleStartsAt(e.target.value)}
              className="w-full h-10 px-3 rounded-input bg-surface border border-border text-text text-xs focus:outline-none focus:border-gold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-text-muted">Slot End Time *</label>
            <input
              type="datetime-local"
              required
              value={singleEndsAt}
              onChange={(e) => setSingleEndsAt(e.target.value)}
              className="w-full h-10 px-3 rounded-input bg-surface border border-border text-text text-xs focus:outline-none focus:border-gold"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setSingleModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={actionLoading}>
              {actionLoading ? 'Scheduling...' : 'Create Slot'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Bulk Generate Modal / Drawer (§9.7) */}
      <Modal
        isOpen={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        title="Bulk Generate Vehicle Availability"
      >
        <form onSubmit={handleBulkGenerate} className="space-y-4 text-xs">
          {modalError && (
            <div className="p-3 rounded-input bg-danger/10 border border-danger/30 text-danger text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <p className="text-text-muted">
            Batch create recurring availability windows. Existing slots or dealership closing overlaps will be automatically validated.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date *"
              type="date"
              required
              value={bulkForm.startDate}
              onChange={(e) => setBulkForm({ ...bulkForm, startDate: e.target.value })}
            />
            <Input
              label="End Date *"
              type="date"
              required
              value={bulkForm.endDate}
              onChange={(e) => setBulkForm({ ...bulkForm, endDate: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Daily Start Time (HH:mm) *"
              placeholder="10:00"
              required
              value={bulkForm.dailyStartTime}
              onChange={(e) => setBulkForm({ ...bulkForm, dailyStartTime: e.target.value })}
            />
            <Input
              label="Daily End Time (HH:mm) *"
              placeholder="17:00"
              required
              value={bulkForm.dailyEndTime}
              onChange={(e) => setBulkForm({ ...bulkForm, dailyEndTime: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Duration (Minutes) *"
              type="number"
              min={15}
              max={240}
              required
              value={bulkForm.durationMinutes}
              onChange={(e) => setBulkForm({ ...bulkForm, durationMinutes: Number(e.target.value) })}
            />
            <Input
              label="Gap Buffer (Minutes)"
              type="number"
              min={0}
              max={60}
              value={bulkForm.gapMinutes}
              onChange={(e) => setBulkForm({ ...bulkForm, gapMinutes: Number(e.target.value) })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setBulkModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={actionLoading}>
              {actionLoading ? 'Generating Pipeline...' : 'Generate Slots'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
