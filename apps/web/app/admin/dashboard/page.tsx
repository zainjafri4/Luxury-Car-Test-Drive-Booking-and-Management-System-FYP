'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import {
  Clock,
  Calendar,
  CalendarCheck2,
  Car,
  PieChart as PieIcon,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface DashboardSummary {
  bookingsByStatus: {
    pending: number;
    approved: number;
    rejected: number;
    cancelled: number;
    completed: number;
  };
  pendingNeedingAction: number;
  todayBookings: number;
  upcomingNext7Days: number;
  activeVehicles: number;
  activeDealerships: number;
  slotUtilisationPercent: number;
  totalActiveFutureSlots: number;
  bookedActiveFutureSlots: number;
}

interface TrendPoint {
  date: string;
  count: number;
}

interface PendingBooking {
  id: string;
  status: 'PENDING';
  createdAt: string;
  customerNote?: string | null;
  customer: {
    fullName: string;
    email: string;
    phone?: string | null;
  };
  slot: {
    startsAt: string;
    endsAt: string;
    vehicle: {
      id: string;
      brand: string;
      model: string;
      year: number;
    };
    dealership: {
      name: string;
      city: string;
    };
  };
}

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Reject modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [sumRes, trendRes, pendingRes] = await Promise.all([
        api.get<{ data: DashboardSummary }>('/admin/dashboard/summary'),
        api.get<{ data: TrendPoint[] }>('/admin/dashboard/trends?days=30'),
        api.get<{ data: PendingBooking[] }>('/admin/bookings?status=PENDING&pageSize=10'),
      ]);

      setSummary(sumRes.data);
      setTrends(trendRes.data || []);
      setPendingBookings(pendingRes.data || []);
    } catch {
      // Graceful fallback for mock/local without active records
      setSummary({
        bookingsByStatus: { pending: 0, approved: 0, rejected: 0, cancelled: 0, completed: 0 },
        pendingNeedingAction: 0,
        todayBookings: 0,
        upcomingNext7Days: 0,
        activeVehicles: 0,
        activeDealerships: 0,
        slotUtilisationPercent: 0,
        totalActiveFutureSlots: 0,
        bookedActiveFutureSlots: 0,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    setErrorMsg('');
    try {
      await api.post(`/admin/bookings/${id}/approve`);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to approve booking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId || !rejectReason.trim()) return;

    setActionLoading(true);
    setErrorMsg('');
    try {
      await api.post(`/admin/bookings/${selectedBookingId}/reject`, {
        staffNote: rejectReason.trim(),
      });
      setRejectModalOpen(false);
      setRejectReason('');
      setSelectedBookingId(null);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reject booking');
    } finally {
      setActionLoading(false);
    }
  };

  // Pie chart data
  const statusPieData = summary
    ? [
        { name: 'Pending', value: summary.bookingsByStatus.pending, color: '#e0a93b' },
        { name: 'Approved', value: summary.bookingsByStatus.approved, color: '#4caf7a' },
        { name: 'Completed', value: summary.bookingsByStatus.completed, color: '#5b9bd5' },
        { name: 'Rejected', value: summary.bookingsByStatus.rejected, color: '#e5604f' },
        { name: 'Cancelled', value: summary.bookingsByStatus.cancelled, color: '#736f66' },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <p className="eyebrow">Executive Telemetry</p>
          <h1 className="font-serif text-3xl font-bold text-text">VIP Concierge Dashboard</h1>
          <p className="text-xs text-text-muted mt-1">Live overview of test-drive reservations, inventory capacity, and pipeline velocity.</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => loadData()}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-input bg-danger/10 border border-danger/30 text-danger text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Row 1: 5 Stat Cards (§9.7) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Pending Card (Gold Highlight) */}
        <Card className="p-5 border-gold/40 bg-gradient-to-br from-gold/10 via-surface to-surface shadow-[0_0_20px_rgba(201,162,75,0.08)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gold">Action Required</span>
            <Clock className="w-4 h-4 text-gold" />
          </div>
          <p className="font-serif text-3xl font-bold text-text mt-3">
            {summary?.pendingNeedingAction ?? '—'}
          </p>
          <p className="text-[11px] text-text-muted mt-1">Pending Reservations</p>
        </Card>

        {/* Today */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Today</span>
            <Calendar className="w-4 h-4 text-text-faint" />
          </div>
          <p className="font-serif text-3xl font-bold text-text mt-3">
            {summary?.todayBookings ?? '—'}
          </p>
          <p className="text-[11px] text-text-muted mt-1">Scheduled Today</p>
        </Card>

        {/* Next 7 Days */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">7-Day Horizon</span>
            <CalendarCheck2 className="w-4 h-4 text-text-faint" />
          </div>
          <p className="font-serif text-3xl font-bold text-text mt-3">
            {summary?.upcomingNext7Days ?? '—'}
          </p>
          <p className="text-[11px] text-text-muted mt-1">Approved Upcoming</p>
        </Card>

        {/* Active Vehicles */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Fleet Size</span>
            <Car className="w-4 h-4 text-text-faint" />
          </div>
          <p className="font-serif text-3xl font-bold text-text mt-3">
            {summary?.activeVehicles ?? '—'}
          </p>
          <p className="text-[11px] text-text-muted mt-1">Active Vehicles</p>
        </Card>

        {/* Slot Utilisation */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Utilisation</span>
            <PieIcon className="w-4 h-4 text-text-faint" />
          </div>
          <p className="font-serif text-3xl font-bold text-text mt-3">
            {summary?.slotUtilisationPercent != null ? `${summary.slotUtilisationPercent}%` : '—'}
          </p>
          <p className="text-[11px] text-text-muted mt-1">Active Future Slots Booked</p>
        </Card>
      </div>

      {/* Row 2: Charts (§9.7) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bookings by Status — 1/3 width */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold text-text">Pipeline Breakdown</h2>
            <p className="text-xs text-text-muted mt-0.5">Reservations by lifecycle status</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center my-4">
            {statusPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#161618',
                      borderColor: '#2a2a30',
                      borderRadius: '8px',
                      color: '#f5f2ea',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-text-faint text-xs">No reservation data recorded yet</div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-[11px]">
            {statusPieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-text-muted">{item.name}:</span>
                <span className="text-text font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* 30-Day Trend — 2/3 width */}
        <Card className="p-6 lg:col-span-2 flex flex-col justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold text-text">30-Day Demand Velocity</h2>
            <p className="text-xs text-text-muted mt-0.5">Daily volume of newly submitted test-drive requests</p>
          </div>

          <div className="h-64 w-full my-4">
            {trends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c9a24b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#c9a24b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke="#6f6c66"
                    fontSize={10}
                    tickFormatter={(str) => str.slice(5)}
                  />
                  <YAxis stroke="#6f6c66" fontSize={10} allowDecimals={false} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#161618',
                      borderColor: '#2a2a30',
                      borderRadius: '8px',
                      color: '#f5f2ea',
                      fontSize: '12px',
                    }}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Requests"
                    stroke="#c9a24b"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#goldGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-text-faint text-xs">
                No reservation requests in the last 30 days
              </div>
            )}
          </div>

          <div className="flex justify-between items-center text-xs text-text-faint pt-2 border-t border-border/60">
            <span>Historical telemetry window</span>
            <span>Refreshed in real-time</span>
          </div>
        </Card>
      </div>

      {/* Row 3: Pending Requests Table (§9.7) */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold text-text">Pending Concierge Approvals</h2>
            <p className="text-xs text-text-muted mt-0.5">Test-drive requests awaiting dealer confirmation</p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-gold/15 text-gold text-xs font-semibold">
            {pendingBookings.length} In Queue
          </span>
        </div>

        {pendingBookings.length === 0 ? (
          <div className="p-8 text-center text-text-faint text-xs bg-surface-2/40 rounded-card border border-border/40">
            No pending reservations awaiting approval at this moment.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border text-text-muted uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Vehicle</th>
                  <th className="py-3 px-3">Appointment Slot</th>
                  <th className="py-3 px-3">Boutique</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {pendingBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-surface-2/40 transition-colors">
                    <td className="py-3.5 px-3">
                      <p className="font-medium text-text">{b.customer.fullName}</p>
                      <p className="text-[11px] text-text-faint">{b.customer.email}</p>
                      {b.customer.phone && (
                        <p className="text-[10px] text-text-faint">{b.customer.phone}</p>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-medium text-text">
                        {b.slot.vehicle.brand} {b.slot.vehicle.model}
                      </p>
                      <p className="text-[10px] text-text-faint">{b.slot.vehicle.year}</p>
                    </td>
                    <td className="py-3.5 px-3">
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
                    <td className="py-3.5 px-3">
                      <p className="text-text">{b.slot.dealership.name}</p>
                      <p className="text-[10px] text-text-faint">{b.slot.dealership.city}</p>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleApprove(b.id)}
                          disabled={actionLoading}
                          className="h-8 px-3 text-[11px] bg-success hover:bg-success/80 text-white"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            setSelectedBookingId(b.id);
                            setRejectModalOpen(true);
                          }}
                          disabled={actionLoading}
                          className="h-8 px-3 text-[11px]"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Reject Reason Modal (§7.3, §9.7: mandatory staff note) */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Test-Drive Reservation"
      >
        <form onSubmit={handleRejectSubmit} className="space-y-4">
          <p className="text-xs text-text-muted">
            Per dealership policy, a mandatory explanation is required when declining a test-drive appointment. The customer will be notified with this message.
          </p>

          <Input
            label="Staff Rejection Note (Mandatory)"
            required
            placeholder="e.g. Vehicle undergoing scheduled maintenance during requested time."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setRejectModalOpen(false)}
              disabled={actionLoading}
            >
              Dismiss
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              disabled={actionLoading || !rejectReason.trim()}
            >
              {actionLoading ? 'Declining...' : 'Confirm Rejection'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
