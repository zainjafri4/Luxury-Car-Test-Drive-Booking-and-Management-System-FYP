'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Upload,
  X,
  Plus,
  AlertCircle,
  Save,
  ArrowLeft,
  Sparkles,
  Info,
} from 'lucide-react';

interface DealershipOption {
  id: string;
  name: string;
  city: string;
}

interface VehicleFormData {
  dealershipId: string;
  manufacturer: string;
  model: string;
  year: number;
  type: string;
  fuelType: string;
  transmission: string;
  engine: string;
  powerHp: number | '';
  topSpeedKmh: number | '';
  acceleration0to100: number | '';
  seats: number;
  color: string;
  priceUsd: number | '';
  description: string;
  features: string[];
  imageUrls: string[];
  isAvailable: boolean;
}

interface VehicleFormProps {
  initialData?: Partial<VehicleFormData> & { id?: string };
  isEdit?: boolean;
}

export const VehicleForm: React.FC<VehicleFormProps> = ({ initialData, isEdit }) => {
  const router = useRouter();

  const [formData, setFormData] = useState<VehicleFormData>({
    dealershipId: initialData?.dealershipId || '',
    manufacturer: (initialData as any)?.manufacturer || (initialData as any)?.brand || '',
    model: initialData?.model || '',
    year: initialData?.year || new Date().getFullYear(),
    type: initialData?.type || 'SEDAN',
    fuelType: initialData?.fuelType || 'PETROL',
    transmission: initialData?.transmission || '8-Speed Dual-Clutch Automatic',
    engine: initialData?.engine || '4.0L Twin-Turbo V8',
    powerHp: initialData?.powerHp || 500,
    topSpeedKmh: initialData?.topSpeedKmh || 310,
    acceleration0to100: initialData?.acceleration0to100 || 3.8,
    seats: initialData?.seats || 4,
    color: initialData?.color || 'Obsidian Black',
    priceUsd: initialData?.priceUsd || 220000,
    description:
      initialData?.description ||
      'Exquisite performance machine hand-crafted for the most discerning automotive enthusiasts.',
    features: initialData?.features || ['Carbon Ceramic Brakes', 'Massage Seats', 'Night Vision Assist'],
    imageUrls: initialData?.imageUrls || (initialData as any)?.images || [],
    isAvailable: initialData?.isAvailable ?? true,
  });

  const [dealerships, setDealerships] = useState<DealershipOption[]>([]);
  const [featureInput, setFeatureInput] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    api
      .get<{ data: DealershipOption[] }>('/dealerships?limit=50')
      .then((res) => {
        const list = res.data || [];
        setDealerships(list);
        if (!formData.dealershipId && list[0]) {
          setFormData((prev) => ({ ...prev, dealershipId: list[0]!.id }));
        }
      })
      .catch(() => {});
  }, []);

  const addFeature = () => {
    if (!featureInput.trim()) return;
    if (!formData.features.includes(featureInput.trim())) {
      setFormData((prev) => ({ ...prev, features: [...prev.features, featureInput.trim()] }));
    }
    setFeatureInput('');
  };

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const addImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setFormData((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, imageUrlInput.trim()] }));
    setImageUrlInput('');
  };

  const removeImageUrl = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  const makeCoverImage = (index: number) => {
    if (index === 0) return;
    setFormData((prev) => {
      const arr = [...prev.imageUrls];
      const [item] = arr.splice(index, 1);
      if (item) arr.unshift(item);
      return { ...prev, imageUrls: arr };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.dealershipId) {
      setErrorMsg('Please select a showroom dealership location.');
      return;
    }
    if (!formData.manufacturer.trim() || !formData.model.trim()) {
      setErrorMsg('Manufacturer and model are required.');
      return;
    }
    if (formData.description.length < 10) {
      setErrorMsg('Vehicle description must be at least 10 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        dealershipId: formData.dealershipId,
        manufacturer: formData.manufacturer.trim(),
        model: formData.model.trim(),
        year: Number(formData.year),
        type: formData.type,
        fuelType: formData.fuelType,
        transmission: formData.transmission.trim(),
        engine: formData.engine.trim(),
        powerHp: formData.powerHp !== '' ? Number(formData.powerHp) : undefined,
        topSpeedKmh: formData.topSpeedKmh !== '' ? Number(formData.topSpeedKmh) : undefined,
        acceleration0to100:
          formData.acceleration0to100 !== '' ? Number(formData.acceleration0to100) : undefined,
        seats: Number(formData.seats),
        color: formData.color.trim() || undefined,
        priceUsd: formData.priceUsd !== '' ? Number(formData.priceUsd) : undefined,
        description: formData.description.trim(),
        features: formData.features,
        imageUrls: formData.imageUrls,
        isAvailable: formData.isAvailable,
      };

      if (isEdit && initialData?.id) {
        await api.patch(`/vehicles/${initialData.id}`, payload);
      } else {
        await api.post('/vehicles', payload);
      }

      router.push('/admin/vehicles');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save vehicle details');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-24">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push('/admin/vehicles')}
          className="flex items-center gap-2 text-xs text-text-muted hover:text-gold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Fleet List</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-input bg-danger/10 border border-danger/30 text-danger text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SECTION 1: Basics (§9.7) */}
      <Card className="p-6 space-y-5">
        <div className="border-b border-border pb-3">
          <h2 className="font-serif text-lg font-bold text-text">1. Core Identification</h2>
          <p className="text-xs text-text-muted">Primary marque, showroom attribution, and taxonomy</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Input
            label="Marque / Manufacturer *"
            required
            placeholder="e.g. Aston Martin"
            value={formData.manufacturer}
            onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
          />

          <Input
            label="Model Designation *"
            required
            placeholder="e.g. DB12 Coupe"
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
          />

          <Input
            label="Model Year *"
            type="number"
            required
            min={1990}
            max={new Date().getFullYear() + 2}
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-muted">Showroom Boutique Location *</label>
            <select
              required
              value={formData.dealershipId}
              onChange={(e) => setFormData({ ...formData, dealershipId: e.target.value })}
              className="w-full h-10 px-3 rounded-input bg-surface border border-border text-text text-xs focus:outline-none focus:border-gold"
            >
              <option value="">&mdash; Select Showroom &mdash;</option>
              {dealerships.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.city})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-text-muted">Body Class *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full h-10 px-3 rounded-input bg-surface border border-border text-text text-xs focus:outline-none focus:border-gold"
            >
              <option value="SEDAN">Sedan</option>
              <option value="COUPE">Coupe</option>
              <option value="SUV">SUV</option>
              <option value="CONVERTIBLE">Convertible</option>
              <option value="HYPERCAR">Hypercar</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-text-muted">Powertrain / Fuel *</label>
            <select
              value={formData.fuelType}
              onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
              className="w-full h-10 px-3 rounded-input bg-surface border border-border text-text text-xs focus:outline-none focus:border-gold"
            >
              <option value="PETROL">Petrol</option>
              <option value="HYBRID">Hybrid</option>
              <option value="ELECTRIC">Electric</option>
              <option value="DIESEL">Diesel</option>
            </select>
          </div>
        </div>
      </Card>

      {/* SECTION 2: Technical Specs (§9.7) */}
      <Card className="p-6 space-y-5">
        <div className="border-b border-border pb-3">
          <h2 className="font-serif text-lg font-bold text-text">2. Technical Specifications</h2>
          <p className="text-xs text-text-muted">Powertrain metrics and performance data</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="Engine Architecture *"
            required
            placeholder="e.g. 4.0L Twin-Turbo V8"
            value={formData.engine}
            onChange={(e) => setFormData({ ...formData, engine: e.target.value })}
          />

          <Input
            label="Transmission *"
            required
            placeholder="e.g. 8-Speed Paddle-Shift Dual Clutch"
            value={formData.transmission}
            onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <Input
            label="Power Output (HP)"
            type="number"
            placeholder="671"
            value={formData.powerHp}
            onChange={(e) =>
              setFormData({ ...formData, powerHp: e.target.value ? Number(e.target.value) : '' })
            }
          />

          <Input
            label="Top Speed (km/h)"
            type="number"
            placeholder="325"
            value={formData.topSpeedKmh}
            onChange={(e) =>
              setFormData({ ...formData, topSpeedKmh: e.target.value ? Number(e.target.value) : '' })
            }
          />

          <Input
            label="0-100 km/h (seconds)"
            type="number"
            step="0.1"
            placeholder="3.5"
            value={formData.acceleration0to100}
            onChange={(e) =>
              setFormData({
                ...formData,
                acceleration0to100: e.target.value ? Number(e.target.value) : '',
              })
            }
          />

          <Input
            label="Seating Capacity *"
            type="number"
            required
            min={1}
            max={12}
            value={formData.seats}
            onChange={(e) => setFormData({ ...formData, seats: Number(e.target.value) })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="Exterior Color Finish"
            placeholder="e.g. Racing Green"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
          />

          <Input
            label="Indicative Valuation (USD)"
            type="number"
            placeholder="245000"
            value={formData.priceUsd}
            onChange={(e) =>
              setFormData({ ...formData, priceUsd: e.target.value ? Number(e.target.value) : '' })
            }
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-text-muted">Vehicle Narrative & Description *</label>
          <textarea
            required
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe provenance, cockpit amenities, and driving character..."
            className="w-full p-3 rounded-input bg-surface border border-border text-text text-xs focus:outline-none focus:border-gold resize-none"
          />
        </div>
      </Card>

      {/* SECTION 3: Features & Highlights (§9.7) */}
      <Card className="p-6 space-y-5">
        <div className="border-b border-border pb-3">
          <h2 className="font-serif text-lg font-bold text-text">3. Luxury Amenities & Equipment</h2>
          <p className="text-xs text-text-muted">Distinctive options that make this model exceptional</p>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Add amenity (e.g. Bowers & Wilkins 3D Sound, Carbon Roof)..."
            value={featureInput}
            onChange={(e) => setFeatureInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addFeature();
              }
            }}
          />
          <Button type="button" variant="secondary" size="sm" onClick={addFeature}>
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {formData.features.map((f, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-2 text-text text-xs border border-border"
            >
              <Sparkles className="w-3 h-3 text-gold" />
              <span>{f}</span>
              <button
                type="button"
                onClick={() => removeFeature(i)}
                className="text-text-faint hover:text-danger ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </Card>

      {/* SECTION 4: Gallery & Media (§9.7) */}
      <Card className="p-6 space-y-5">
        <div className="border-b border-border pb-3">
          <h2 className="font-serif text-lg font-bold text-text">4. High-Resolution Gallery</h2>
          <p className="text-xs text-text-muted">
            The first image serves as the primary catalogue cover. Click &ldquo;Make Cover&rdquo; to elevate any image.
          </p>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Paste high-res image URL (e.g. Unsplash luxury automotive photo)..."
            value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addImageUrl();
              }
            }}
          />
          <Button type="button" variant="secondary" size="sm" onClick={addImageUrl}>
            <Plus className="w-4 h-4 mr-1" />
            Add Image
          </Button>
        </div>

        {formData.imageUrls.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            {formData.imageUrls.map((url, idx) => (
              <div
                key={idx}
                className="relative group rounded-card overflow-hidden border border-border bg-surface-2 aspect-video"
              >
                <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                {idx === 0 && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-gold text-on-gold shadow">
                    Cover Badge
                  </span>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                  {idx !== 0 && (
                    <button
                      type="button"
                      onClick={() => makeCoverImage(idx)}
                      className="px-2 py-1 rounded bg-surface text-text text-[10px] hover:text-gold border border-border"
                    >
                      Set Cover
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImageUrl(idx)}
                    className="p-1.5 rounded bg-danger/20 text-danger hover:bg-danger/40 border border-danger/40"
                    title="Remove Image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-text-faint text-xs bg-surface-2/40 rounded-card border border-dashed border-border flex flex-col items-center gap-2">
            <Upload className="w-6 h-6 text-text-faint" />
            <span>No images attached yet. Add at least one imagery link above.</span>
          </div>
        )}
      </Card>

      {/* SECTION 5: Availability Switch (§9.7) */}
      <Card className="p-6 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-base font-bold text-text">Fleet Availability Status</h2>
          <p className="text-xs text-text-muted">
            When active, eligible appointment slots can be reserved by verified clientele.
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isAvailable}
            onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-surface-2 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
        </label>
      </Card>

      {/* Sticky Save Bar (§9.7) */}
      <div className="sticky bottom-0 z-30 p-4 -mx-8 bg-surface/90 backdrop-blur-md border-t border-border flex items-center justify-between shadow-2xl">
        <span className="text-xs text-text-faint">All changes must be confirmed via the save action.</span>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => router.push('/admin/vehicles')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
            <Save className="w-4 h-4 mr-1.5" />
            <span>{isSubmitting ? 'Saving...' : isEdit ? 'Update Vehicle' : 'Create Vehicle'}</span>
          </Button>
        </div>
      </div>
    </form>
  );
};

