import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { VehicleCard, type Vehicle } from '@/components/ui/VehicleCard';

async function getFeaturedData() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  try {
    const [vehiclesRes, dealershipsRes] = await Promise.all([
      fetch(`${API_BASE}/vehicles?limit=3&sort=year`, {
        next: { revalidate: 60 },
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      }),
      fetch(`${API_BASE}/dealerships?limit=3`, {
        next: { revalidate: 60 },
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      }),
    ]);

    const vehiclesData = vehiclesRes.ok ? await vehiclesRes.json() : { data: [] };
    const dealershipsData = dealershipsRes.ok ? await dealershipsRes.json() : { data: [] };

    return {
      vehicles: (vehiclesData.data || []) as Vehicle[],
      dealerships: (dealershipsData.data || []) as Array<{
        id: string;
        name: string;
        city: string;
        address: string;
        phone: string;
        openingTime: string;
        closingTime: string;
        availableVehiclesCount?: number;
      }>,
    };
  } catch {
    return { vehicles: [], dealerships: [] };
  }
}

export default async function HomePage() {
  const { vehicles, dealerships } = await getFeaturedData();

  return (
    <div className="space-y-32 pb-24">
      {/* Hero Section (§9.7) */}
      <section className="relative min-h-[88vh] flex items-center justify-center text-center px-6 overflow-hidden">
        {/* Layered ambient glow — gold bloom top, warm amber bottom-right */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_0%,_rgba(201,162,75,0.13),_transparent_65%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_90%_100%,_rgba(160,100,20,0.08),_transparent_70%)]" />
          {/* Fine dot pattern — luxury watch/supercar UI texture */}
          <div className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(201,162,75,0.9) 1px, transparent 1px)',
              backgroundSize: '32px 32px'
            }}
          />
        </div>

        <div className="max-w-5xl space-y-8 relative z-10 pt-12">
          <p className="eyebrow tracking-[0.25em] text-xs">TEST DRIVE REQUESTS, REIMAGINED</p>

          {/* Single-line hero: clamp font so it stays on one line down to ~700px wide */}
          <h1
            className="font-serif font-bold tracking-tight text-text leading-[1.06]"
            style={{ fontSize: 'clamp(2.6rem, 6vw, 5.5rem)' }}
          >
            Drive the{' '}
            <span className="text-gold-gradient italic font-normal">extraordinary</span>.
          </h1>

          <p className="text-text-muted text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-light">
            Experience the world&apos;s most distinguished automobiles on your terms. Effortless scheduling,
            verified slots, private boutique walkthroughs.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-5">
            <Link href="/vehicles">
              <Button size="lg" variant="primary" className="px-8 font-semibold">
                Explore Vehicles
              </Button>
            </Link>
            <Link href="/dealerships">
              <Button size="lg" variant="secondary" className="px-8">
                Find Showrooms
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Vehicles Section (§9.7) */}
      <section className="max-w-container mx-auto px-6 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div>
            <p className="eyebrow">The Fleet</p>
            <h2 className="font-serif text-3xl md:text-4xl text-text mt-1">Featured Automobiles</h2>
          </div>
          <Link href="/vehicles" className="text-sm font-semibold text-gold hover:text-gold-hover transition-colors flex items-center gap-1">
            View All Vehicles &rarr;
          </Link>
        </div>

        {vehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vehicles.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center text-text-muted space-y-3">
            <p>Our fleet catalog is refreshing. Browse all vehicles in the directory.</p>
            <Link href="/vehicles">
              <Button variant="secondary" size="sm">
                Open Directory
              </Button>
            </Link>
          </Card>
        )}
      </section>

      {/* How it Works (§9.7) */}
      <section className="max-w-container mx-auto px-6 space-y-14">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <p className="eyebrow">Private Concierge Flow</p>
          <h2 className="font-serif text-3xl md:text-4xl xl:text-5xl text-text">Three Steps to the Driver&apos;s Seat</h2>
          <p className="text-text-muted text-sm md:text-base">
            No pressure, no waiting rooms. A tailored experience designed around your schedule.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-8 space-y-5 relative overflow-hidden group hover:border-gold/30">
            <span className="font-serif text-5xl font-bold text-gold-gradient">01</span>
            <h3 className="font-serif text-2xl text-text font-semibold">Choose Your Machine</h3>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Explore meticulously maintained vehicles from Porsche, Bentley, Ferrari, and Aston Martin. Filter by
              powertrain, horsepower, and prestige category.
            </p>
          </Card>

          <Card className="p-8 space-y-5 relative overflow-hidden group hover:border-gold/30">
            <span className="font-serif text-5xl font-bold text-gold-gradient">02</span>
            <h3 className="font-serif text-2xl text-text font-semibold">Reserve Your Exclusive Slot</h3>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Select an available appointment at our Karachi, Lahore, or Islamabad luxury pavilion. Zero double bookings
              guaranteed with real-time atomic locking.
            </p>
          </Card>

          <Card className="p-8 space-y-5 relative overflow-hidden group hover:border-gold/30">
            <span className="font-serif text-5xl font-bold text-gold-gradient">03</span>
            <h3 className="font-serif text-2xl text-text font-semibold">VIP Showroom Walkthrough</h3>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Upon staff confirmation, arrive to your private bay. A dedicated vehicle specialist guides you through an
              unrushed dynamic test drive.
            </p>
          </Card>
        </div>
      </section>

      {/* Dealerships Preview (§9.7) */}
      <section className="max-w-container mx-auto px-6 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div>
            <p className="eyebrow">Locations</p>
            <h2 className="font-serif text-3xl md:text-4xl text-text mt-1">Private Showrooms</h2>
          </div>
          <Link href="/dealerships" className="text-sm font-semibold text-gold hover:text-gold-hover transition-colors flex items-center gap-1">
            All Dealership Details &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {dealerships.map((d) => (
            <Card key={d.id} className="p-7 space-y-4 hover:border-gold/30 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-gold tracking-widest uppercase">
                    {d.city}
                  </span>
                  <span className="text-[11px] text-text-faint">
                    {d.openingTime} - {d.closingTime}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-bold text-text">{d.name}</h3>
                <p className="text-xs text-text-muted leading-relaxed">{d.address}</p>
              </div>

              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
                <span className="text-text-muted">Tel: {d.phone}</span>
                <Link href={`/vehicles?dealershipId=${d.id}`} className="text-gold font-medium hover:underline">
                  Browse Fleet &rarr;
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Band (§9.7) */}
      <section className="max-w-container mx-auto px-6">
        <Card className="p-12 md:p-16 text-center space-y-6 bg-gradient-to-b from-[#18181f] to-[#101014] border-gold/30 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
          <p className="eyebrow">Your Journey Begins</p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-text">
            Ready to experience pure exhilaration?
          </h2>
          <p className="text-text-muted text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Reserve your complimentary test-drive session with Zain Reserve concierge. Choose your vehicle and preferred
            boutique time.
          </p>
          <div className="pt-2">
            <Link href="/vehicles">
              <Button size="lg" variant="primary" className="px-10 font-semibold shadow-lg">
                Browse Entire Fleet
              </Button>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
