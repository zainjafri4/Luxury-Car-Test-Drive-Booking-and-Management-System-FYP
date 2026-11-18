'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Clock,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface DealershipItem {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  email?: string | null;
  openingTime: string;
  closingTime: string;
  description?: string | null;
  isActive: boolean;
  availableVehiclesCount?: number;
}

export default function AdminDealershipsPage() {
  const [dealerships, setDealerships] = useState<DealershipItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDealership, setEditingDealership] = useState<DealershipItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    address: '',
    phone: '',
    email: '',
    openingTime: '09:00',
    closingTime: '18:00',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchDealerships = useCallback(async () => {
    setIsLoading(true);
    setFeedbackMsg(null);
    try {
      const res = await api.get<{ data: DealershipItem[] }>('/dealerships?limit=50&includeInactive=true');
      setDealerships(res.data || []);
    } catch (err: any) {
      setFeedbackMsg({ text: err.message || 'Failed to fetch dealerships', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDealerships();
  }, [fetchDealerships]);

  const openCreateModal = () => {
    setEditingDealership(null);
    setFormData({
      name: '',
      city: '',
      address: '',
      phone: '',
      email: '',
      openingTime: '09:00',
      closingTime: '18:00',
      description: '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (d: DealershipItem) => {
    setEditingDealership(d);
    setFormData({
      name: d.name,
      city: d.city,
      address: d.address,
      phone: d.phone,
      email: d.email || '',
      openingTime: d.openingTime,
      closingTime: d.closingTime,
      description: d.description || '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (formData.closingTime <= formData.openingTime) {
      setFormError('Closing time must be after opening time.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingDealership) {
        await api.patch(`/dealerships/${editingDealership.id}`, formData);
        setFeedbackMsg({ text: `Dealership "${formData.name}" updated successfully.`, type: 'success' });
      } else {
        await api.post('/dealerships', formData);
        setFeedbackMsg({ text: `Showroom "${formData.name}" established successfully.`, type: 'success' });
      }
      setModalOpen(false);
      await fetchDealerships();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save dealership details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to deactivate ${name}?`)) return;
    try {
      await api.delete(`/dealerships/${id}`);
      setFeedbackMsg({ text: `Showroom "${name}" deactivated.`, type: 'success' });
      await fetchDealerships();
    } catch (err: any) {
      setFeedbackMsg({ text: err.message || 'Failed to deactivate showroom', type: 'error' });
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <p className="eyebrow">Locations & Physical Presence</p>
          <h1 className="font-serif text-3xl font-bold text-text">Boutique Showrooms</h1>
          <p className="text-xs text-text-muted mt-1">
            Configure dealership lounges, operating hours, and location contact channels.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={openCreateModal} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>New Showroom</span>
        </Button>
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

      {/* Grid of Showroom Cards (§9.7) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="p-12 text-center text-text-faint text-xs col-span-3">Loading boutique salons...</div>
        ) : dealerships.length === 0 ? (
          <div className="p-12 text-center text-text-faint text-xs col-span-3">No showrooms configured.</div>
        ) : (
          dealerships.map((d) => (
            <Card key={d.id} className="p-6 space-y-4 flex flex-col justify-between hover:border-gold/30">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="eyebrow text-[10px]">{d.city}</span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                      d.isActive
                        ? 'bg-success/15 text-success border border-success/30'
                        : 'bg-text-faint/15 text-text-faint border border-text-faint/30'
                    }`}
                  >
                    {d.isActive ? 'Active' : 'Closed'}
                  </span>
                </div>

                <h3 className="font-serif text-xl font-bold text-text">{d.name}</h3>

                <div className="space-y-2 text-xs text-text-muted pt-2 border-t border-border/60">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-text-faint shrink-0 mt-0.5" />
                    <span>{d.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-gold shrink-0" />
                    <span className="text-text">
                      {d.openingTime} &ndash; {d.closingTime} (Daily)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-text-faint shrink-0" />
                    <span>{d.phone}</span>
                  </div>
                  {d.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-text-faint shrink-0" />
                      <span>{d.email}</span>
                    </div>
                  )}
                </div>

                {d.description && (
                  <p className="text-xs text-text-faint italic line-clamp-2 pt-1">{d.description}</p>
                )}
              </div>

              <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                <span className="text-[11px] text-text-muted">
                  <strong className="text-gold">{d.availableVehiclesCount ?? '—'}</strong> Fleet Vehicles
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(d)}
                    className="p-1.5 rounded hover:bg-surface-2 text-text-muted hover:text-gold transition-colors"
                    title="Edit Showroom"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  {d.isActive && (
                    <button
                      onClick={() => handleDeactivate(d.id, d.name)}
                      className="p-1.5 rounded hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"
                      title="Deactivate"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal for Create/Edit (Decisions: showrooms in modal) */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingDealership ? 'Modify Showroom Boutique' : 'Commission New Boutique'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-input bg-danger/10 border border-danger/30 text-danger text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <Input
            label="Showroom Name *"
            required
            placeholder="e.g. Zain Reserve Coastal Flagship"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City *"
              required
              placeholder="e.g. Karachi"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <Input
              label="Contact Phone *"
              required
              placeholder="+92 21 34567890"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <Input
            label="Full Physical Address *"
            required
            placeholder="Plot 14-C, Main Shahrah-e-Faisal"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <Input
            label="Official Inquiries Email"
            type="email"
            placeholder="concierge.karachi@zainreserve.example"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Opening Time (HH:mm) *"
              required
              placeholder="09:00"
              value={formData.openingTime}
              onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
            />
            <Input
              label="Closing Time (HH:mm) *"
              required
              placeholder="18:00"
              value={formData.closingTime}
              onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-text-muted">Boutique Notes & Amenities</label>
            <textarea
              rows={3}
              placeholder="Describe VIP lounge, private delivery bays..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2.5 rounded-input bg-surface border border-border text-text text-xs focus:outline-none focus:border-gold resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingDealership ? 'Save Changes' : 'Establish Showroom'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
