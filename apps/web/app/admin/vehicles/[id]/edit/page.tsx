'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { VehicleForm } from '@/components/admin/VehicleForm';
import { Loader2 } from 'lucide-react';

export default function EditVehiclePage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0]! : params.id!;
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    api
      .get<{ data: any }>(`/vehicles/${id}`)
      .then((res) => {
        setVehicle(res.data);
      })
      .catch((err) => {
        setError(err.message || 'Vehicle not found');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-6 h-6 text-gold animate-spin" />
        <span className="text-xs text-text-muted">Loading vehicle specifications...</span>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="p-16 text-center space-y-4">
        <p className="text-sm text-danger">{error || 'Vehicle could not be loaded.'}</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto w-full space-y-6">
      <div className="border-b border-border/80 pb-4">
        <p className="eyebrow">Fleet Modifications</p>
        <h1 className="font-serif text-3xl font-bold text-text">
          Edit {vehicle.brand || vehicle.manufacturer} {vehicle.model}
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Adjust technical details, pricing, features, or attached photography.
        </p>
      </div>

      <VehicleForm initialData={{ ...vehicle, dealershipId: vehicle.dealershipId || vehicle.dealership?.id }} isEdit />
    </div>
  );
}

