import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Shield, Clock, Compass, Award } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-0 pb-24 overflow-hidden">
      {/* Editorial Luxury Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center text-center px-6">
        {/* Ambient atmospheric lighting */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(201,162,75,0.12)_0%,_transparent_65%)] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gold/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl space-y-8 z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-surface-2/60 backdrop-blur-md shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-gold animate-ping" />
            <span className="eyebrow text-[10px] tracking-[0.22em]">
              TEST DRIVE REQUESTS, REIMAGINED
            </span>
          </div>

          <h1 className="font-serif text-5xl sm:text-7xl md:text-[5.5rem] font-bold tracking-tight text-text leading-[1.08]">
            Drive the{' '}
            <span className="italic font-normal bg-gradient-to-r from-gold via-gold-soft to-gold bg-clip-text text-transparent">
              extraordinary
            </span>
            .
          </h1>

          <p className="text-text-muted text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light">
            Private test-drive appointments with the world’s most commanding marquees. Handcrafted itineraries, concierge access, uncompromising pedigree.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-5">
            <Link href="/vehicles">
              <Button size="lg" variant="primary" className="shadow-lg shadow-gold/20 font-semibold">
                Explore The Fleet
              </Button>
            </Link>
            <Link href="/dealerships">
              <Button size="lg" variant="secondary" className="backdrop-blur-sm">
                Boutique Showrooms
              </Button>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-border/60 max-w-3xl mx-auto text-left">
            <div>
              <p className="font-serif text-2xl md:text-3xl font-bold text-text tabular-nums">12+</p>
              <p className="text-xs text-text-faint uppercase tracking-wider mt-0.5">Iconic Vehicles</p>
            </div>
            <div>
              <p className="font-serif text-2xl md:text-3xl font-bold text-text tabular-nums">3</p>
              <p className="text-xs text-text-faint uppercase tracking-wider mt-0.5">Metropolitan Salons</p>
            </div>
            <div>
              <p className="font-serif text-2xl md:text-3xl font-bold text-text tabular-nums">100%</p>
              <p className="text-xs text-text-faint uppercase tracking-wider mt-0.5">Private Drives</p>
            </div>
            <div>
              <p className="font-serif text-2xl md:text-3xl font-bold text-gold tabular-nums">Zero</p>
              <p className="text-xs text-text-faint uppercase tracking-wider mt-0.5">Double Bookings</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section divider */}
      <div className="section-divider mx-6 my-16" />

      {/* Featured Fleet Preview Grid */}
      <section className="max-w-container mx-auto px-6 space-y-12 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
          <div className="space-y-1.5">
            <p className="eyebrow">Curated Selection</p>
            <div className="gold-rule mt-2 mb-3" />
            <h2 className="font-serif text-3xl md:text-4xl text-text">Signature Masterpieces</h2>
          </div>
          <Link href="/vehicles" className="text-sm font-medium text-gold hover:text-gold-hover transition-colors">
            View All Automobiles &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              make: 'Porsche',
              model: '911 Carrera 4S',
              type: 'Sports Coupe',
              hp: '443 HP',
              zeroToHundred: '3.4s',
              city: 'Karachi Central',
            },
            {
              make: 'Bentley',
              model: 'Continental GT V8',
              type: 'Grand Tourer',
              hp: '542 HP',
              zeroToHundred: '3.9s',
              city: 'Lahore Heritage',
            },
            {
              make: 'Mercedes-Benz',
              model: 'G 63 AMG 4MATIC',
              type: 'Performance SUV',
              hp: '577 HP',
              zeroToHundred: '4.5s',
              city: 'Islamabad Capital',
            },
          ].map((car, idx) => (
            <Card
              key={idx}
              className="luxury-card group overflow-hidden rounded-card hover:border-gold/50 transition-all duration-base backdrop-blur-sm hover:shadow-xl hover:shadow-gold/5"
            >
              {/* Graphic Placeholder Canvas with metallic aesthetic */}
              <div className="relative h-56 bg-gradient-to-br from-surface-2 via-surface to-bg p-6 flex flex-col justify-between border-b border-border/80 overflow-hidden">
                <div className="absolute top-0 right-0 w-44 h-44 bg-gold/10 rounded-full blur-2xl group-hover:bg-gold/20 transition-all duration-image" />
                <div className="flex justify-between items-start z-10">
                  <span className="eyebrow text-[10px]">{car.make}</span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-surface border border-border text-text-muted">
                    {car.type}
                  </span>
                </div>
                <div className="z-10">
                  <h3 className="font-serif text-2xl font-bold text-text group-hover:text-gold transition-colors">
                    {car.model}
                  </h3>
                  <p className="text-xs text-text-muted mt-1">{car.city}</p>
                </div>
              </div>

              {/* Specs Bar */}
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-2.5 rounded-input bg-surface border border-border">
                    <p className="text-text-faint text-[10px] uppercase tracking-wider">Output</p>
                    <p className="text-text font-semibold mt-0.5">{car.hp}</p>
                  </div>
                  <div className="p-2.5 rounded-input bg-surface border border-border">
                    <p className="text-text-faint text-[10px] uppercase tracking-wider">0 - 100 km/h</p>
                    <p className="text-text font-semibold mt-0.5">{car.zeroToHundred}</p>
                  </div>
                </div>

                <Link href="/vehicles" className="block">
                  <Button variant="secondary" size="md" className="w-full">
                    View Specifications & Slots
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Section divider */}
      <div className="section-divider mx-6 my-16" />

      {/* Philosophy / How it Works — warm section */}
      <section className="section-warm py-24 px-6">
        <div className="max-w-container mx-auto space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <p className="eyebrow">The Zain Reserve Standard</p>
          <div className="gold-rule mt-2 mb-4" />
          <h2 className="font-serif text-3xl md:text-5xl text-text">A Seamless Journey to the Wheel</h2>
          <p className="text-text-muted text-sm leading-relaxed">
            Eliminating dealership friction. Centralized booking, authenticated reservations, zero waiting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative p-8 rounded-card border border-border bg-surface/50 backdrop-blur-sm space-y-4 hover:border-border-strong transition-colors">
            <span className="font-serif text-5xl font-bold text-gold/30">01</span>
            <h3 className="font-serif text-2xl text-text font-semibold">Select Your Automobile</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Browse exhaustive performance figures, engine notes, interior tailoring, and exact availability across our network.
            </p>
          </div>

          <div className="relative p-8 rounded-card border border-border bg-surface/50 backdrop-blur-sm space-y-4 hover:border-border-strong transition-colors">
            <span className="font-serif text-5xl font-bold text-gold/30">02</span>
            <h3 className="font-serif text-2xl text-text font-semibold">Reserve a Dedicated Slot</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Select verified 60-minute driving windows. Our transaction-locked scheduler ensures conflicting bookings are impossible.
            </p>
          </div>

          <div className="relative p-8 rounded-card border border-border bg-surface/50 backdrop-blur-sm space-y-4 hover:border-border-strong transition-colors">
            <span className="font-serif text-5xl font-bold text-gold/30">03</span>
            <h3 className="font-serif text-2xl text-text font-semibold">Private Guided Drive</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Arrive at the salon where your chosen vehicle is fueled, detailed, and pre-warmed for an unhurried driving evaluation.
            </p>
          </div>
        </div>
        </div>
      </section>

      {/* Section divider */}
      <div className="section-divider mx-6 my-16" />

      {/* Salons Overview Section */}
      <section className="max-w-container mx-auto px-6 space-y-8 py-8">
        <div className="space-y-2">
          <p className="eyebrow">Presence</p>
          <div className="gold-rule mt-2 mb-3" />
          <h2 className="font-serif text-3xl md:text-4xl text-text">Boutique Locations</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Zain Reserve Central',
              city: 'Karachi',
              address: 'Plot 14-C, Main Shahrah-e-Faisal',
              hours: '09:00 — 18:00',
            },
            {
              name: 'Zain Reserve Lahore Heritage',
              city: 'Lahore',
              address: '22-A, Gulberg III, MM Alam Road',
              hours: '09:00 — 19:00',
            },
            {
              name: 'Zain Reserve Capital',
              city: 'Islamabad',
              address: 'Diplomatic Enclave Road, Sector G-5/2',
              hours: '09:00 — 18:00',
            },
          ].map((loc, idx) => (
            <Card key={idx} className="p-7 space-y-3 bg-surface-2/30 border-border">
              <span className="eyebrow text-[10px]">{loc.city}</span>
              <h3 className="font-serif text-xl font-bold text-text">{loc.name}</h3>
              <p className="text-xs text-text-muted">{loc.address}</p>
              <div className="pt-2 text-[11px] text-text-faint border-t border-border/50 flex justify-between">
                <span>Daily Operating Hours</span>
                <span className="text-text-muted font-medium">{loc.hours}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Section divider */}
      <div className="section-divider mx-6 my-16" />

      {/* Final Action Band */}
      <section className="max-w-container mx-auto px-6 pb-8">
        <div className="relative rounded-card p-12 md:p-16 text-center space-y-6 border border-gold/40 bg-gradient-to-b from-surface-2 to-surface shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-text font-bold">
            Experience it before you own it.
          </h2>
          <p className="text-text-muted text-sm sm:text-base max-w-xl mx-auto font-light">
            No sales pressure, no shared appointments. Schedule your personalized test-drive evaluation today.
          </p>
          <div className="pt-2">
            <Link href="/vehicles">
              <Button size="lg" variant="primary" className="shadow-lg shadow-gold/20 font-semibold px-8">
                Reserve A Test Drive
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
