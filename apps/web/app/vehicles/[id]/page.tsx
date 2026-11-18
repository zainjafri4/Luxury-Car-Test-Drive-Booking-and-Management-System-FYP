'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SlotPicker, type SlotItem } from '@/components/ui/SlotPicker';
import { toast } from 'sonner';

interface VehicleDetail {
  id: string;
  manufacturer: string;
  model: string;
  year: number;
  type: string;
  fuelType: string;
  priceUsd?: string | number | null;
  horsepower?: number | null;
  acceleration?: string | null;
  topSpeed?: number | null;
  engineCapacity?: string | null;
  transmission?: string | null;
  drivetrain?: string | null;
  seats?: number | null;
  description?: string | null;
  features?: string[] | null;
  imageUrl?: string | null;
  images?: string[];
  dealership?: {
    id: string;
    name: string;
    city: string;
    address: string;
    phone: string;
    openingTime: string;
    closingTime: string;
  } | null;
}

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const vehicleId = params['id'] as string;

  const [vehicle, setVehicle] = useState<VehicleDetail | null>(null);
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!vehicleId) return;

    Promise.all([
      api.get<{ data: VehicleDetail }>(`/vehicles/${vehicleId}`),
      api.get<{ data: Array<{ id: string; startsAt: string; endsAt: string; isBooked?: boolean; bookingsCount?: number }> }>(
        `/vehicles/${vehicleId}/slots`,
      ),
    ])
      .then(([vehRes, slotsRes]) => {
        setVehicle(vehRes.data);
        const mappedSlots: SlotItem[] = (slotsRes.data || []).map((s) => ({
          id: s.id,
          startsAt: s.startsAt,
          endsAt: s.endsAt,
          isBooked: Boolean(s.isBooked || (s.bookingsCount && s.bookingsCount > 0)),
        }));
        setSlots(mappedSlots);
        const firstAvailable = mappedSlots.find((s) => !s.isBooked);
        if (firstAvailable) {
          setSelectedSlotId(firstAvailable.id);
        }
      })
      .catch((err) => {
        toast.error('Could not load vehicle details.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [vehicleId]);

  if (isLoading) {
    return (
      <div className="max-w-container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-pulse">
          <div className="lg:col-span-7 h-[500px] bg-surface-2/40 rounded-card" />
          <div className="lg:col-span-5 space-y-6">
            <div className="h-8 w-48 bg-surface-2/60 rounded" />
            <div className="h-12 w-80 bg-surface-2/60 rounded" />
            <div className="h-40 bg-surface-2/40 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="max-w-container mx-auto px-6 py-24 text-center space-y-4">
        <h2 className="font-serif text-3xl text-text">Automobile Not Found</h2>
        <p className="text-text-muted text-sm">The vehicle requested is no longer available in the fleet.</p>
        <Link href="/vehicles">
          <Button variant="secondary">Back to Vehicles</Button>
        </Link>
      </div>
    );
  }

  const galleryImages =
    vehicle.images && vehicle.images.length > 0
      ? vehicle.images
      : [
          vehicle.imageUrl ||
            'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80',
        ];

  const handleBookClick = () => {
    if (!selectedSlotId) {
      toast.error('Please select an available appointment slot first.');
      return;
    }

    if (!user) {
      toast.info('Please sign in or create an account to reserve your slot.');
      router.push(`/login?next=/bookings/new?slotId=${selectedSlotId}`);
      return;
    }

    router.push(`/bookings/new?slotId=${selectedSlotId}`);
  };

  return (
    <div className="max-w-container mx-auto px-6 py-10 space-y-16">
      {/* Breadcrumb Navigation (§9.7) */}
      <nav className="flex items-center gap-2 text-xs text-text-muted">
        <Link href="/" className="hover:text-gold transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/vehicles" className="hover:text-gold transition-colors">
          Vehicles
        </Link>
        <span>/</span>
        <span className="text-text font-medium">
          {vehicle.manufacturer} {vehicle.model}
        </span>
      </nav>

      {/* Main Showcase Grid (§9.7) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column (60% / 7 cols): Gallery */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Image */}
          <div className="relative w-full h-[380px] sm:h-[480px] rounded-card overflow-hidden border border-white/[0.08] bg-[#0c0d10] shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
            <img
              src={galleryImages[activeImageIndex]}
              alt={`${vehicle.manufacturer} ${vehicle.model}`}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0c]/80 via-transparent to-transparent opacity-60" />

            <div className="absolute bottom-4 left-4 flex gap-2">
              <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-semibold text-gold border border-gold/30">
                {vehicle.year}
              </span>
              <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-medium text-text-muted border border-white/10">
                {vehicle.type}
              </span>
            </div>
          </div>

          {/* Thumbnail Row */}
          {galleryImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-24 h-16 rounded-input overflow-hidden border-2 transition-all flex-shrink-0 ${
                    idx === activeImageIndex
                      ? 'border-gold shadow-[0_0_12px_rgba(201,162,75,0.4)] scale-105'
                      : 'border-white/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (40% / 5 cols, sticky): Details & SlotPicker */}
        <div className="lg:col-span-5 space-y-8 sticky top-28">
          <div className="space-y-3">
            <p className="eyebrow tracking-[0.2em]">{vehicle.manufacturer}</p>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-text tracking-tight">
              {vehicle.model}
            </h1>
            {vehicle.priceUsd && (
              <p className="text-xl font-serif text-gold font-medium">
                ${Number(vehicle.priceUsd).toLocaleString()} USD <span className="text-xs text-text-muted font-sans">(MSRP)</span>
              </p>
            )}
            <p className="text-sm text-text-muted leading-relaxed pt-2">
              {vehicle.description ||
                `Engineered for the discerning driver. Experience handcrafted precision, responsive dynamics, and bespoke comfort.`}
            </p>
          </div>

          {/* Specs Mini-Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gradient-to-b from-[#141419] to-[#0e0e12] border border-white/[0.08] rounded-card text-center">
            <div>
              <p className="text-[10px] text-text-faint uppercase tracking-wider">Power</p>
              <p className="text-sm font-semibold text-text mt-0.5">{vehicle.horsepower ? `${vehicle.horsepower} HP` : '580 HP'}</p>
            </div>
            <div>
              <p className="text-[10px] text-text-faint uppercase tracking-wider">0-100</p>
              <p className="text-sm font-semibold text-text mt-0.5">{vehicle.acceleration || '3.2s'}</p>
            </div>
            <div>
              <p className="text-[10px] text-text-faint uppercase tracking-wider">Top Speed</p>
              <p className="text-sm font-semibold text-text mt-0.5">{vehicle.topSpeed ? `${vehicle.topSpeed} km/h` : '310 km/h'}</p>
            </div>
            <div>
              <p className="text-[10px] text-text-faint uppercase tracking-wider">Seats</p>
              <p className="text-sm font-semibold text-text mt-0.5">{vehicle.seats || 2}</p>
            </div>
          </div>

          {/* Dealership Info Snippet */}
          {vehicle.dealership && (
            <div className="flex items-center justify-between p-4 bg-surface/50 border border-white/[0.06] rounded-input text-xs">
              <div>
                <p className="text-text-muted">Assigned Showroom:</p>
                <p className="font-medium text-text mt-0.5">
                  {vehicle.dealership.name} ({vehicle.dealership.city})
                </p>
              </div>
              <span className="text-gold font-semibold uppercase tracking-wider">
                {vehicle.dealership.openingTime} - {vehicle.dealership.closingTime}
              </span>
            </div>
          )}

          {/* SlotPicker & Booking Action */}
          <Card className="p-6 space-y-6 border-gold/30 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <h2 className="font-serif text-xl font-bold text-text border-b border-white/[0.08] pb-3">
              Reserve Your Test Drive
            </h2>

            {slots.length > 0 ? (
              <SlotPicker
                slots={slots}
                selectedSlotId={selectedSlotId}
                onSelectSlot={(id) => setSelectedSlotId(id)}
              />
            ) : (
              <p className="text-xs text-text-muted text-center py-4">
                No active slots published for this vehicle currently. Check back shortly.
              </p>
            )}

            <Button
              variant="primary"
              size="lg"
              className="w-full font-semibold shadow-lg"
              disabled={!selectedSlotId}
              onClick={handleBookClick}
            >
              Confirm Appointment Slot
            </Button>
          </Card>
        </div>
      </div>

      {/* Full Specs Table & Features Below (§9.7) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-white/[0.08]">
        {/* Technical Specifications */}
        <div className="space-y-6">
          <h2 className="font-serif text-2xl font-bold text-text">Technical Specifications</h2>
          <div className="divide-y divide-white/[0.06] text-sm">
            <div className="py-3 flex justify-between">
              <span className="text-text-muted">Powertrain</span>
              <span className="font-medium text-text">{vehicle.fuelType}</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-text-muted">Transmission</span>
              <span className="font-medium text-text">{vehicle.transmission || 'Dual-Clutch 8-Speed Automatic'}</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-text-muted">Drivetrain</span>
              <span className="font-medium text-text">{vehicle.drivetrain || 'All-Wheel Drive (AWD)'}</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-text-muted">Engine / Displacement</span>
              <span className="font-medium text-text">{vehicle.engineCapacity || '4.0L Twin-Turbocharged V8'}</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-text-muted">Year of Manufacture</span>
              <span className="font-medium text-text">{vehicle.year}</span>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="space-y-6">
          <h2 className="font-serif text-2xl font-bold text-text">Bespoke Highlights</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              'Burmester 3D High-End Surround Sound',
              'Adaptive Air Suspension with PASM',
              'Carbon Ceramic Braking System (PCCB)',
              'Matrix LED Headlights with Dynamic Light System',
              'Full Grain Nappa Leather Interior',
              'Sport Chrono Package with Mode Switch',
              'Heated & Ventilated Massage Seats',
              'Head-Up Display with Augmented Navigation',
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-text-muted">
                <span className="text-gold font-bold">&#10003;</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

