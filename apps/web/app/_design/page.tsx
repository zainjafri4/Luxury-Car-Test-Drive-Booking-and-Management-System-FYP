'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { StatusBadge, type BookingStatusType } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { SlotPicker } from '@/components/ui/SlotPicker';

export default function DesignReviewPage() {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedSlot, setSelectedSlot] = React.useState<string>('slot-1');

  const demoSlots = [
    {
      id: 'slot-1',
      startsAt: new Date(Date.now() + 86400000).toISOString(),
      endsAt: new Date(Date.now() + 90000000).toISOString(),
      isBooked: false,
    },
    {
      id: 'slot-2',
      startsAt: new Date(Date.now() + 93600000).toISOString(),
      endsAt: new Date(Date.now() + 97200000).toISOString(),
      isBooked: true,
    },
  ];

  const statuses: BookingStatusType[] = [
    'PENDING',
    'APPROVED',
    'REJECTED',
    'CANCELLED',
    'COMPLETED',
  ];

  return (
    <div className="max-w-container mx-auto px-6 py-12 space-y-12">
      <div>
        <p className="eyebrow">Design System Verification</p>
        <h1 className="text-4xl font-serif text-gold mt-1">Aurum Drive Component Catalog</h1>
        <p className="text-text-muted mt-2">
          Dark, quiet, premium foundations (§9.5, §9.6). All tokens wired into CSS variables.
        </p>
      </div>

      {/* Buttons */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-serif text-text border-b border-border pb-2">Buttons</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="primary" size="lg">
            Primary Large
          </Button>
          <Button variant="primary" size="md">
            Primary Medium
          </Button>
          <Button variant="secondary" size="md">
            Secondary Outline
          </Button>
          <Button variant="ghost" size="md">
            Ghost Action
          </Button>
          <Button variant="danger" size="md">
            Destructive
          </Button>
          <Button variant="primary" size="md" isLoading>
            Loading
          </Button>
        </div>
      </Card>

      {/* Badges */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-serif text-text border-b border-border pb-2">Status Badges</h2>
        <div className="flex flex-wrap items-center gap-3">
          {statuses.map((s) => (
            <StatusBadge key={s} status={s} />
          ))}
        </div>
      </Card>

      {/* Form Inputs */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-serif text-text border-b border-border pb-2">Form Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
          <Input label="Email Address" placeholder="client@aurumdrive.com" />
          <Input label="Full Name" placeholder="Zain Jafri" />
          <Input label="With Error" value="invalid-input" error="Please enter a valid email format" readOnly />
        </div>
      </Card>

      {/* Slot Picker Component */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-serif text-text border-b border-border pb-2">
          Slot Picker (Date Strip & Time Chips)
        </h2>
        <div className="max-w-xl">
          <SlotPicker
            slots={demoSlots}
            selectedSlotId={selectedSlot}
            onSelectSlot={(id) => setSelectedSlot(id)}
          />
        </div>
      </Card>

      {/* Modal Dialog */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-serif text-text border-b border-border pb-2">Dialog / Modal</h2>
        <Button variant="secondary" onClick={() => setModalOpen(true)}>
          Trigger Luxury Modal
        </Button>
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Confirm Reservation">
          <p className="text-sm text-text-muted mb-6">
            Review your appointment terms. Aurum Drive concierge ensures a personalized luxury walkthrough.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setModalOpen(false)}>
              Confirm Request
            </Button>
          </div>
        </Modal>
      </Card>
    </div>
  );
}

