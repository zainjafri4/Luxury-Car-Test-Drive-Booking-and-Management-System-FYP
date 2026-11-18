'use client';

import React from 'react';
import { VehicleForm } from '@/components/admin/VehicleForm';

export default function NewVehiclePage() {
  return (
    <div className="p-8 max-w-5xl mx-auto w-full space-y-6">
      <div className="border-b border-border/80 pb-4">
        <p className="eyebrow">Fleet Additions</p>
        <h1 className="font-serif text-3xl font-bold text-text">Commission New Vehicle</h1>
        <p className="text-xs text-text-muted mt-1">
          Introduce a high-performance vehicle into the test-drive fleet catalog.
        </p>
      </div>

      <VehicleForm />
    </div>
  );
}

