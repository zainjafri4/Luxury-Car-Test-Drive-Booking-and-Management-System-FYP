'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { VehicleCard, type Vehicle } from '@/components/ui/VehicleCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Dealership {
  id: string;
  name: string;
  city: string;
}

function VehiclesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [manufacturers, setManufacturers] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [fuelTypes, setFuelTypes] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState<string>(searchParams.get('q') || '');
  const [manufacturer, setManufacturer] = useState<string>(searchParams.get('manufacturer') || '');
  const [type, setType] = useState<string>(searchParams.get('type') || '');
  const [fuelType, setFuelType] = useState<string>(searchParams.get('fuelType') || '');
  const [dealershipId, setDealershipId] = useState<string>(searchParams.get('dealershipId') || '');
  const [sort, setSort] = useState<string>(searchParams.get('sort') || 'year');
  const [page, setPage] = useState<number>(Number(searchParams.get('page')) || 1);

  // Load filter options once
  useEffect(() => {
    api
      .get<{ data: Dealership[] }>('/dealerships?limit=50')
      .then((res) => setDealerships(res.data || []))
      .catch(() => {});
  }, []);

  // Fetch vehicles
  const fetchVehicles = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get<{
        data: Vehicle[];
        meta: { total: number; totalPages: number; page: number };
        facets?: {
          manufacturers?: string[];
          types?: string[];
          fuelTypes?: string[];
        };
      }>('/vehicles', {
        params: {
          q: search || undefined,
          manufacturer: manufacturer || undefined,
          type: type || undefined,
          fuelType: fuelType || undefined,
          dealershipId: dealershipId || undefined,
          sort: sort || undefined,
          page,
          limit: 9,
        },
      });

      setVehicles(res.data || []);
      setTotalCount(res.meta?.total || 0);
      setTotalPages(res.meta?.totalPages || 1);

      if (res.facets?.manufacturers) setManufacturers(res.facets.manufacturers);
      if (res.facets?.types) setTypes(res.facets.types);
      if (res.facets?.fuelTypes) setFuelTypes(res.facets.fuelTypes);
    } catch {
      setVehicles([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [search, manufacturer, type, fuelType, dealershipId, sort, page]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const clearFilters = () => {
    setSearch('');
    setManufacturer('');
    setType('');
    setFuelType('');
    setDealershipId('');
    setSort('year');
    setPage(1);
  };

  const hasActiveFilters = Boolean(search || manufacturer || type || fuelType || dealershipId);

  return (
    <div className="max-w-container mx-auto px-6 py-12 space-y-10">
      {/* Title & Count */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <p className="eyebrow">The Fleet</p>
          <h1 className="font-serif text-4xl md:text-5xl text-text mt-1">Available Automobiles</h1>
        </div>
        <p className="text-sm text-text-muted">
          Showing <span className="text-text font-semibold">{vehicles.length}</span> of{' '}
          <span className="text-gold font-semibold">{totalCount}</span> luxury vehicles
        </p>
      </div>

      {/* Main Content Layout (§9.7) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left Sticky Filter Sidebar (Desktop 280px / 1 col) */}
        <aside className="lg:col-span-1 sticky top-28 space-y-6">
          <Card className="p-6 space-y-6 bg-gradient-to-b from-[#141418] to-[#0e0e12] border-white/[0.08]">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h2 className="font-serif text-lg font-semibold text-text">Filters</h2>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs text-gold hover:underline">
                  Clear All
                </button>
              )}
            </div>

            {/* Manufacturer Filter */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Manufacturer</label>
              <select
                value={manufacturer}
                onChange={(e) => {
                  setManufacturer(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 px-3 bg-[#0a0a0d] border border-white/10 rounded-input text-xs text-text focus:border-gold focus:outline-none"
              >
                <option value="">All Manufacturers</option>
                {manufacturers.length > 0
                  ? manufacturers.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))
                  : ['Porsche', 'Mercedes-Benz', 'BMW', 'Bentley', 'Aston Martin', 'Ferrari', 'Lamborghini', 'Audi'].map(
                      (m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ),
                    )}
              </select>
            </div>

            {/* Vehicle Type Filter */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Body Category</label>
              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 px-3 bg-[#0a0a0d] border border-white/10 rounded-input text-xs text-text focus:border-gold focus:outline-none"
              >
                <option value="">All Categories</option>
                {['COUPE', 'SEDAN', 'SUV', 'SPORTS', 'CONVERTIBLE', 'SUPERCAR'].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Fuel / Powertrain */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Powertrain</label>
              <select
                value={fuelType}
                onChange={(e) => {
                  setFuelType(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 px-3 bg-[#0a0a0d] border border-white/10 rounded-input text-xs text-text focus:border-gold focus:outline-none"
              >
                <option value="">All Powertrains</option>
                {['PETROL', 'HYBRID', 'ELECTRIC', 'DIESEL'].map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            {/* Dealership / City */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Showroom City</label>
              <select
                value={dealershipId}
                onChange={(e) => {
                  setDealershipId(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 px-3 bg-[#0a0a0d] border border-white/10 rounded-input text-xs text-text focus:border-gold focus:outline-none"
              >
                <option value="">All Showrooms</option>
                {dealerships.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.city} — {d.name}
                  </option>
                ))}
              </select>
            </div>
          </Card>
        </aside>

        {/* Right Vehicles Grid (3 cols xl, 2 md) */}
        <main className="lg:col-span-3 space-y-8">
          {/* Top Search & Sort Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="w-full sm:max-w-md">
              <Input
                placeholder="Search by model, series, or keyword..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <label className="text-xs text-text-muted whitespace-nowrap">Sort By:</label>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="h-[44px] px-3 bg-[#0e0e12] border border-white/10 rounded-input text-xs text-text focus:border-gold focus:outline-none"
              >
                <option value="year">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="manufacturer">Manufacturer (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-text-faint">Active:</span>
              {manufacturer && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-2 border border-white/10 rounded-full text-xs text-gold">
                  {manufacturer}
                  <button onClick={() => setManufacturer('')} className="hover:text-white">
                    &times;
                  </button>
                </span>
              )}
              {type && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-2 border border-white/10 rounded-full text-xs text-gold">
                  {type}
                  <button onClick={() => setType('')} className="hover:text-white">
                    &times;
                  </button>
                </span>
              )}
              {fuelType && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-2 border border-white/10 rounded-full text-xs text-gold">
                  {fuelType}
                  <button onClick={() => setFuelType('')} className="hover:text-white">
                    &times;
                  </button>
                </span>
              )}
              {dealershipId && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-2 border border-white/10 rounded-full text-xs text-gold">
                  Showroom Filtered
                  <button onClick={() => setDealershipId('')} className="hover:text-white">
                    &times;
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Vehicles List */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="h-96 animate-pulse bg-surface-2/40 border-white/5" />
              ))}
            </div>
          ) : vehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {vehicles.map((v) => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </div>
          ) : (
            <Card className="p-16 text-center space-y-4">
              <h3 className="font-serif text-2xl text-text font-semibold">No vehicles match your criteria</h3>
              <p className="text-sm text-text-muted max-w-md mx-auto">
                Try adjusting your search terms or clearing selected body categories and powertrains.
              </p>
              <Button variant="secondary" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </Card>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6 border-t border-white/[0.08]">
              <Button
                variant="ghost"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                &larr; Previous
              </Button>
              <span className="text-xs text-text-muted">
                Page <span className="text-text font-medium">{page}</span> of {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next &rarr;
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function VehiclesPage() {
  return (
    <React.Suspense
      fallback={
        <div className="max-w-container mx-auto px-6 py-20 animate-pulse">
          <div className="h-96 bg-surface-2/40 rounded-card" />
        </div>
      }
    >
      <VehiclesContent />
    </React.Suspense>
  );
}
