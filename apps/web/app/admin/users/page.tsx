'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Users,
  UserCheck,
  Shield,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  Lock,
  UserX,
} from 'lucide-react';

interface CustomerItem {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  isActive: boolean;
  totalBookings: number;
  createdAt: string;
  lastLoginAt?: string | null;
}

interface StaffItem {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  isActive: boolean;
  role: 'STAFF';
  createdAt: string;
  lastLoginAt?: string | null;
}

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState<'customers' | 'staff'>('customers');
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Add staff modal
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [staffForm, setStaffForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Customer details modal
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [loadingCustomer, setLoadingCustomer] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setFeedbackMsg(null);
    try {
      if (activeTab === 'customers') {
        const params = new URLSearchParams();
        if (search.trim()) params.set('q', search.trim());
        const res = await api.get<{ data: CustomerItem[] }>(`/admin/customers?${params.toString()}`);
        setCustomers(res.data || []);
      } else {
        const res = await api.get<{ data: StaffItem[] }>('/admin/staff');
        setStaffList(res.data || []);
      }
    } catch (err: any) {
      setFeedbackMsg({ text: err.message || 'Failed to fetch users', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setIsSubmitting(true);

    try {
      await api.post('/admin/staff', staffForm);
      setStaffModalOpen(false);
      setStaffForm({ fullName: '', email: '', password: '', phone: '' });
      setFeedbackMsg({ text: 'Staff account created successfully.', type: 'success' });
      await fetchUsers();
    } catch (err: any) {
      setModalError(err.message || 'Failed to create staff account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleCustomerStatus = async (customer: CustomerItem) => {
    const action = customer.isActive ? 'deactivate' : 'activate';
    try {
      await api.post(`/admin/customers/${customer.id}/${action}`);
      setFeedbackMsg({
        text: `Customer ${customer.fullName} ${action}d successfully.`,
        type: 'success',
      });
      await fetchUsers();
    } catch (err: any) {
      setFeedbackMsg({ text: err.message || `Failed to ${action} customer`, type: 'error' });
    }
  };

  const openCustomerDetail = async (id: string) => {
    setCustomerModalOpen(true);
    setLoadingCustomer(true);
    try {
      const res = await api.get<{ data: any }>(`/admin/customers/${id}`);
      setSelectedCustomer(res.data);
    } catch {
      setSelectedCustomer(null);
    } finally {
      setLoadingCustomer(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <p className="eyebrow">Personnel & Clientele</p>
          <h1 className="font-serif text-3xl font-bold text-text">User Administration</h1>
          <p className="text-xs text-text-muted mt-1">
            Oversee registered test-drive clientele, review booking history, and manage internal concierge staff credentials.
          </p>
        </div>

        {activeTab === 'staff' && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setModalError('');
              setStaffModalOpen(true);
            }}
            className="flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Staff Account</span>
          </Button>
        )}
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

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-border">
        <button
          onClick={() => setActiveTab('customers')}
          className={`pb-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'customers'
              ? 'border-gold text-gold'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Clientele Registry ({customers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`pb-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'staff'
              ? 'border-gold text-gold'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Concierge Staff Roster ({staffList.length})</span>
        </button>
      </div>

      {/* Search Bar for customers */}
      {activeTab === 'customers' && (
        <div className="max-w-md">
          <Input
            placeholder="Search by customer name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* Content Table */}
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-text-faint text-xs">Loading user registry...</div>
        ) : activeTab === 'customers' ? (
          customers.length === 0 ? (
            <div className="p-12 text-center text-text-faint text-xs">No registered customers found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border text-text-muted uppercase tracking-wider text-[10px] bg-surface-2/60">
                  <tr>
                    <th className="py-3.5 px-4">Client Name</th>
                    <th className="py-3.5 px-4">Contact Info</th>
                    <th className="py-3.5 px-4">Test Drives</th>
                    <th className="py-3.5 px-4">Member Since</th>
                    <th className="py-3.5 px-4">Account Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-surface-2/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-text">{c.fullName}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="text-text">{c.email}</p>
                        {c.phone && <p className="text-[10px] text-text-faint">{c.phone}</p>}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-gold">{c.totalBookings}</span> reservations
                      </td>
                      <td className="py-3.5 px-4 text-text-muted">
                        {new Date(c.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            c.isActive
                              ? 'bg-success/15 text-success border border-success/30'
                              : 'bg-danger/15 text-danger border border-danger/30'
                          }`}
                        >
                          {c.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openCustomerDetail(c.id)}
                            className="p-1.5 rounded hover:bg-surface-2 text-text-muted hover:text-text transition-colors"
                            title="View History"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleCustomerStatus(c)}
                            className={`p-1.5 rounded transition-colors ${
                              c.isActive
                                ? 'hover:bg-danger/10 text-text-muted hover:text-danger'
                                : 'hover:bg-success/10 text-text-muted hover:text-success'
                            }`}
                            title={c.isActive ? 'Suspend Customer' : 'Activate Customer'}
                          >
                            {c.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* Staff Roster Table */
          staffList.length === 0 ? (
            <div className="p-12 text-center text-text-faint text-xs">No staff accounts registered.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border text-text-muted uppercase tracking-wider text-[10px] bg-surface-2/60">
                  <tr>
                    <th className="py-3.5 px-4">Staff Member</th>
                    <th className="py-3.5 px-4">Official Email</th>
                    <th className="py-3.5 px-4">Clearance Role</th>
                    <th className="py-3.5 px-4">Created At</th>
                    <th className="py-3.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {staffList.map((s) => (
                    <tr key={s.id} className="hover:bg-surface-2/30 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-text">{s.fullName}</td>
                      <td className="py-3.5 px-4 text-text-muted">{s.email}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gold/15 text-gold border border-gold/30">
                          CONCIERGE STAFF
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-text-muted">
                        {new Date(s.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-success font-medium">Verified Active</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </Card>

      {/* Customer Detail & Reservation History Modal */}
      <Modal
        isOpen={customerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
        title="Client Profile & History"
      >
        {loadingCustomer ? (
          <p className="text-xs text-text-faint py-8 text-center">Loading client dossier...</p>
        ) : selectedCustomer ? (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-surface-2 rounded-input border border-border space-y-1">
              <p className="font-serif text-lg font-bold text-text">{selectedCustomer.fullName}</p>
              <p className="text-text-muted">{selectedCustomer.email}</p>
              {selectedCustomer.phone && <p className="text-text-faint">{selectedCustomer.phone}</p>}
            </div>

            <div>
              <h3 className="font-serif text-sm font-bold text-text mb-2">Test-Drive History</h3>
              {selectedCustomer.customerBookings?.length === 0 ? (
                <p className="text-text-faint italic py-2">No reservation appointments on file.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {selectedCustomer.customerBookings.map((b: any) => (
                    <div
                      key={b.id}
                      className="p-3 rounded-input bg-surface border border-border/80 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-text">
                          {b.slot.vehicle.brand} {b.slot.vehicle.model}
                        </p>
                        <p className="text-[10px] text-text-faint">
                          {new Date(b.slot.startsAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}{' '}
                          &bull; {b.slot.dealership.city}
                        </p>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-border">
              <Button size="sm" variant="secondary" onClick={() => setCustomerModalOpen(false)}>
                Close Dossier
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-danger">Client profile not found.</p>
        )}
      </Modal>

      {/* Add Staff Account Modal (§8.8, §9.7: staff creation) */}
      <Modal
        isOpen={staffModalOpen}
        onClose={() => setStaffModalOpen(false)}
        title="Commission Concierge Staff Member"
      >
        <form onSubmit={handleCreateStaff} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded-input bg-danger/10 border border-danger/30 text-danger text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <Input
            label="Full Name *"
            required
            placeholder="e.g. Alexander Vance"
            value={staffForm.fullName}
            onChange={(e) => setStaffForm({ ...staffForm, fullName: e.target.value })}
          />

          <Input
            label="Official Staff Email *"
            type="email"
            required
            placeholder="vance@aurumdrive.example"
            value={staffForm.email}
            onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
          />

          <Input
            label="Initial Secure Password *"
            type="password"
            required
            placeholder="Min. 8 chars, 1 letter, 1 number"
            value={staffForm.password}
            onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
          />

          <Input
            label="Contact Phone"
            placeholder="+92 300 0000000"
            value={staffForm.phone}
            onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setStaffModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Clearance...' : 'Create Staff User'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

