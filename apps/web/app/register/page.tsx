'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { brand } from '@/lib/brand';
import { toast } from 'sonner';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/';
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const user = await register({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
      });

      toast.success(`Account created! Welcome to ${brand.name}, ${user.fullName}`);
      router.push(nextUrl);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message || 'Registration failed. Email may already be in use.');
      } else {
        setErrorMessage('Registration failed. Please check your information.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-6">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.8)] bg-[#0d0e12]">
        {/* Left Side: Brand Showcase */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#18181f] via-[#101014] to-[#0a0a0d] border-r border-white/[0.06] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(201,162,75,0.15),_transparent_60%)] pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <span className="eyebrow tracking-[0.25em]">{brand.name}</span>
            <h2 className="font-serif text-3xl font-bold text-text leading-tight">
              Begin your luxury automotive journey with private appointment privileges.
            </h2>
          </div>

          <div className="relative z-10 p-6 rounded-card bg-black/40 border border-white/5 backdrop-blur-md space-y-2">
            <p className="text-xs text-text-muted leading-relaxed">
              &bull; Instant confirmation of available test drive windows.<br />
              &bull; Access to bespoke automotive specifications.<br />
              &bull; Private concierge support across Karachi, Lahore, and Islamabad.
            </p>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-[400px] w-full mx-auto space-y-6">
            <div>
              <p className="eyebrow text-[10px]">Client Registration</p>
              <h1 className="font-serif text-3xl font-bold text-text mt-1">Create Account</h1>
              <p className="text-xs text-text-muted mt-1">Join Zain Reserve for personalized test drive appointments</p>
            </div>

            {errorMessage && (
              <div className="p-3.5 bg-danger/10 border border-danger/40 rounded-input text-xs text-red-300">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <Input
                label="Full Legal Name"
                required
                placeholder="e.g. Zain Jafri"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />

              <Input
                label="Email Address"
                type="email"
                required
                autoComplete="email"
                placeholder="client@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                label="Mobile Phone (Optional)"
                type="tel"
                placeholder="+92 300 1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-medium text-text-muted uppercase tracking-wider">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-gold hover:underline focus:outline-none"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[44px] px-3.5 bg-[#0e0e12] border border-white/[0.09] rounded-input text-text text-sm transition-all focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-text-muted uppercase tracking-wider">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-[44px] px-3.5 bg-[#0e0e12] border border-white/[0.09] rounded-input text-text text-sm transition-all focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                />
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  type="submit"
                  isLoading={isLoading}
                  className="w-full font-semibold shadow-lg"
                >
                  Create Client Account
                </Button>
              </div>
            </form>

            <div className="text-center pt-2">
              <p className="text-xs text-text-muted">
                Already registered?{' '}
                <Link
                  href={`/login${nextUrl !== '/' ? `?next=${encodeURIComponent(nextUrl)}` : ''}`}
                  className="text-gold font-semibold hover:underline"
                >
                  Sign In to Concierge
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-6">
          <div className="w-full max-w-5xl h-[500px] bg-surface-2/40 rounded-2xl animate-pulse" />
        </div>
      }
    >
      <RegisterContent />
    </React.Suspense>
  );
}
