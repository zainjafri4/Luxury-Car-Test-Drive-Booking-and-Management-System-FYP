'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  Car,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface VehicleAdminItem {
  id: string;
  brand: string;
  model: string;
  year: number;
  type: string;
  fuelType: string;
  images: string[];
  isActive: boolean;
  dealership: {
    id: string;
    name: string;
    city: string;
  };
  _count?: {
    slots: number;
  };
}

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleAdminItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Deactivate modal
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleAdminItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchVehicles = useCallback(async () => {
    setIsLoading(true);
    setFeedbackMsg(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('q', search.trim());
      if (typeFilter !== 'all') params.set('type', typeFilter);
      params.set('page', String(page));
      params.set('pageSize', '15');

      const res = await api.get<{
        data: VehicleAdminItem[];
        meta: { total: number; totalPages: number; page: number };
      }>(`/vehicles?${params.toString()}`);

      setVehicles(res.data || []);
      setTotalCount(res.meta?.total || 0);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (err: any) {
      setFeedbackMsg({ text: err.message || 'Failed to fetch vehicles', type: 'error' });
      setVehicles([]);
    } finally {
      setIsLoading(false);
    }
  }, [search, typeFilter, page]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleDeactivate = async () => {
    if (!selectedVehicle) return;
    setActionLoading(true);
    try {
      await api.delete(`/vehicles/${selectedVehicle.id}`);
      setDeactivateModalOpen(false);
      setSelectedVehicle(null);
      setFeedbackMsg({
        text: `Vehicle "${selectedVehicle.brand} ${selectedVehicle.model}" deactivated. Future slots closed and pending appointments notified.`,
        type: 'success',
      });
      await fetchVehicles();
    } catch (err: any) {
      setFeedbackMsg({ text: err.message || 'Failed to deactivate vehicle', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <p className="eyebrow">Fleet Operations</p>
          <h1 className="font-serif text-3xl font-bold text-text">Vehicle Inventory</h1>
          <p className="text-xs text-text-muted mt-1">Configure luxury automobiles, upload galleries, and manage active status.</p>
        </div>
        <Link href="/admin/vehicles/new">
          <Button variant="primary" size="sm" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>Add Vehicle</span>
          </Button>
        </Link>
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

      {/* Filter Bar */}
      <Card className="p-4 flex flex-wrap items-center gap-4 bg-surface-2/40">
        <div className="flex-1 min-w-[240px]">
          <Input
            placeholder="Search make or model..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs text-text-muted flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-text-faint" />
            <span>Class:</span>
          </label>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 px-3 rounded-input bg-surface border border-border text-text text-xs focus:outline-none focus:border-gold"
          >
            <option value="all">All Vehicle Types</option>
            <option value="SEDAN">Sedan</option>
            <option value="COUPE">Coupe</option>
            <option value="SUV">SUV</option>
            <option value="CONVERTIBLE">Convertible</option>
            <option value="HYPERCAR">Hypercar</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-text-faint text-xs">Loading fleet catalog...</div>
        ) : vehicles.length === 0 ? (
          <div className="p-12 text-center text-text-faint text-xs">No vehicles in inventory matching criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border text-text-muted uppercase tracking-wider text-[10px] bg-surface-2/60">
                <tr>
                  <th className="py-3.5 px-4">Vehicle</th>
                  <th className="py-3.5 px-4">Class & Fuel</th>
                  <th className="py-3.5 px-4">Showroom Boutique</th>
                  <th className="py-3.5 px-4">Fleet Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-surface-2/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-9 rounded bg-surface-2 overflow-hidden shrink-0 border border-border">
                          {v.images?.[0] ? (
                            <img
                              src={v.images[0]}
                              alt={`${v.brand} ${v.model}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-text-faint text-[9px]">
                              No img
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-text">
                            {v.brand} {v.model}
                          </p>
                          <p className="text-[10px] text-text-faint">{v.year}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-text font-medium">{v.type}</p>
                      <p className="text-[10px] text-text-faint">{v.fuelType}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-text">{v.dealership?.name || 'Unassigned'}</p>
                      <p className="text-[10px] text-text-faint">{v.dealership?.city}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          v.isActive
                            ? 'bg-success/15 text-success border border-success/30'
                            : 'bg-text-faint/15 text-text-faint border border-text-faint/30'
                        }`}
                      >
                        {v.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/vehicles/${v.id}`}
                          target="_blank"
                          className="p-1.5 rounded hover:bg-surface-2 text-text-muted hover:text-text transition-colors"
                          title="View Public Page"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/admin/vehicles/${v.id}/edit`}
                          className="p-1.5 rounded hover:bg-surface-2 text-text-muted hover:text-gold transition-colors"
                          title="Edit Vehicle"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        {v.isActive && (
                          <button
                            onClick={() => {
                              setSelectedVehicle(v);
                              setDeactivateModalOpen(true);
                            }}
                            className="p-1.5 rounded hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"
                            title="Soft Deactivate Vehicle"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Deactivation Modal (§7.1, §9.7: states consequence on customer) */}
      <Modal
        isOpen={deactivateModalOpen}
        onClose={() => setDeactivateModalOpen(false)}
        title="Deactivate Vehicle from Fleet"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-input bg-warning/10 border border-warning/30 flex items-start gap-2.5 text-warning">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Consequence Warning:</p>
              <p className="text-[11px] mt-0.5 text-text-muted">
                Deactivating <strong className="text-text">{selectedVehicle?.brand} {selectedVehicle?.model}</strong> will soft-delete this record. Any unfulfilled pending or approved reservations will be cancelled, future slot availability will close, and affected customers will be automatically notified.
              </p>
            </div>
          </div>

          <p className="text-text-muted">
            Are you sure you want to proceed with deactivation?
          </p>

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setDeactivateModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleDeactivate}
              disabled={actionLoading}
            >
              {actionLoading ? 'Deactivating...' : 'Confirm Deactivation'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

