import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function HomePage() {
  return (
    <div className="space-y-24">
      {/* Hero Section (§9.7) */}
      <section className="relative min-h-[85vh] flex items-center justify-center text-center px-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-surface-2 via-bg to-bg">
        <div className="max-w-3xl space-y-6">
          <p className="eyebrow tracking-[0.2em]">TEST DRIVE REQUESTS, REIMAGINED</p>
          <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-text leading-tight">
            Drive the <span className="text-gold italic font-normal">extraordinary</span>.
          </h1>
          <p className="text-text-muted text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Experience the world's most distinguished automobiles on your terms. Effortless scheduling, curated showrooms, uncompromised performance.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link href="/vehicles">
              <Button size="lg" variant="primary">
                Explore Vehicles
              </Button>
            </Link>
            <Link href="/dealerships">
              <Button size="lg" variant="secondary">
                Find Showrooms
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works (§9.7) */}
      <section className="max-w-container mx-auto px-6 space-y-12">
        <div className="text-center space-y-2">
          <p className="eyebrow">The Experience</p>
          <h2 className="font-serif text-3xl md:text-4xl text-text">Three Steps to the Driver&apos;s Seat</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-8 space-y-4">
            <span className="font-serif text-4xl text-gold font-bold">01</span>
            <h3 className="font-serif text-xl text-text font-semibold">Choose Your Machine</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Explore our fleet of sedans, grand tourers, and performance SUVs from Mercedes-Benz, Porsche, Bentley, and more.
            </p>
          </Card>

          <Card className="p-8 space-y-4">
            <span className="font-serif text-4xl text-gold font-bold">02</span>
            <h3 className="font-serif text-xl text-text font-semibold">Select Slot & Showroom</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Pick your preferred date, hour, and city boutique across Karachi, Lahore, or Islamabad with real-time slot conflict locking.
            </p>
          </Card>

          <Card className="p-8 space-y-4">
            <span className="font-serif text-4xl text-gold font-bold">03</span>
            <h3 className="font-serif text-xl text-text font-semibold">Take the Wheel</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Receive status notifications upon approval and enjoy an unhurried, private test drive guided by our product specialists.
            </p>
          </Card>
        </div>
      </section>

      {/* Featured CTA Band */}
      <section className="max-w-container mx-auto px-6">
        <Card className="p-12 text-center space-y-6 bg-surface-2 border-gold/30">
          <h2 className="font-serif text-3xl md:text-4xl text-text">Ready to experience true velocity?</h2>
          <p className="text-text-muted text-sm max-w-lg mx-auto">
            Reserve your complimentary private test-drive session today.
          </p>
          <Link href="/vehicles">
            <Button size="lg" variant="primary">
              Browse Entire Fleet
            </Button>
          </Link>
        </Card>
      </section>
    </div>
  );
}
