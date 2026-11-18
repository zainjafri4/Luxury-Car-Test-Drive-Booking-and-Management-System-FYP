import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from './Card';
import { Button } from './Button';

export interface Vehicle {
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
  imageUrl?: string | null;
  images?: string[];
  dealership?: {
    id: string;
    name: string;
    city: string;
  } | null;
}

export const VehicleCard: React.FC<{ vehicle: Vehicle }> = ({ vehicle }) => {
  const displayImage =
    vehicle.imageUrl ||
    vehicle.images?.[0] ||
    'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80';

  return (
    <Card className="group overflow-hidden flex flex-col justify-between hover:border-gold/40 transition-all duration-300">
      <div>
        {/* Image Container with Luxury aspect ratio */}
        <div className="relative w-full h-52 bg-surface-2 overflow-hidden">
          <img
            src={displayImage}
            alt={`${vehicle.manufacturer} ${vehicle.model}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e11] via-transparent to-transparent opacity-80" />

          {/* Badges on top of image */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase bg-black/60 backdrop-blur-md text-gold rounded-full border border-gold/30">
              {vehicle.year}
            </span>
            <span className="px-2.5 py-1 text-[11px] font-medium tracking-wide uppercase bg-black/60 backdrop-blur-md text-text-muted rounded-full border border-white/10">
              {vehicle.type}
            </span>
          </div>

          {vehicle.dealership && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs text-text-muted bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/5">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              <span>{vehicle.dealership.city}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <div>
            <p className="eyebrow text-[10px] tracking-[0.2em]">{vehicle.manufacturer}</p>
            <h3 className="font-serif text-xl font-bold text-text group-hover:text-gold transition-colors">
              {vehicle.model}
            </h3>
          </div>

          {/* Specs Snippet */}
          <div className="grid grid-cols-3 gap-2 py-2 border-y border-white/[0.06] text-center text-xs">
            <div>
              <p className="text-[10px] text-text-faint uppercase">Fuel</p>
              <p className="font-medium text-text mt-0.5">{vehicle.fuelType}</p>
            </div>
            <div>
              <p className="text-[10px] text-text-faint uppercase">0-100 km/h</p>
              <p className="font-medium text-text mt-0.5">{vehicle.acceleration || '3.2s'}</p>
            </div>
            <div>
              <p className="text-[10px] text-text-faint uppercase">Power</p>
              <p className="font-medium text-text mt-0.5">{vehicle.horsepower ? `${vehicle.horsepower} HP` : '580 HP'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Card Action footer */}
      <div className="px-5 pb-5 pt-1">
        <Link href={`/vehicles/${vehicle.id}`} className="block">
          <Button variant="secondary" size="sm" className="w-full">
            Reserve Test Drive
          </Button>
        </Link>
      </div>
    </Card>
  );
};

