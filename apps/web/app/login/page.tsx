'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { brand } from '@/lib/brand';
import { toast } from 'sonner';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/';
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const user = await login(email.trim(), password);
      toast.success(`Welcome back, ${user.fullName}`);
      if (user.role === 'STAFF') {
        router.push(nextUrl === '/' ? '/admin/dashboard' : nextUrl);
      } else {
        router.push(nextUrl);
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message || 'Invalid email or password.');
      } else {
        setErrorMessage('Authentication failed. Please verify credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-6">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.8)] bg-[#0d0e12]">
        {/* Left Side: Brand Experience Showcase (Desktop) */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#18181f] via-[#101014] to-[#0a0a0d] border-r border-white/[0.06] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(201,162,75,0.15),_transparent_60%)] pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <span className="eyebrow tracking-[0.25em]">{brand.name}</span>
            <h2 className="font-serif text-3xl font-bold text-text leading-tight">
              Experience the world&apos;s finest machines before making them yours.
            </h2>
          </div>

          <div className="relative z-10 p-6 rounded-card bg-black/40 border border-white/5 backdrop-blur-md space-y-2">
            <p className="text-xs text-text-muted italic leading-relaxed">
              &ldquo;The test drive was impeccably organized. The specialist was deeply knowledgeable, and the slot was
              strictly reserved for my arrival.&rdquo;
            </p>
            <p className="text-[11px] font-semibold text-gold">&mdash; Verified Client, Karachi Pavilion</p>
          </div>
        </div>

        {/* Right Side: Login Form (420px max width inner) */}
        <div className="p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-[380px] w-full mx-auto space-y-6">
            <div>
              <p className="eyebrow text-[10px]">Client Access</p>
              <h1 className="font-serif text-3xl font-bold text-text mt-1">Sign In</h1>
              <p className="text-xs text-text-muted mt-1">Enter your credentials to manage your reservations</p>
            </div>

            {errorMessage && (
              <div className="p-3.5 bg-danger/10 border border-danger/40 rounded-input text-xs text-red-300">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                required
                autoComplete="email"
                placeholder="client@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  autoComplete="current-password"
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  Access Concierge
                </Button>
              </div>
            </form>

            <div className="text-center pt-2">
              <p className="text-xs text-text-muted">
                Do not have an account?{' '}
                <Link
                  href={`/register${nextUrl !== '/' ? `?next=${encodeURIComponent(nextUrl)}` : ''}`}
                  className="text-gold font-semibold hover:underline"
                >
                  Create Client Account
                </Link>
              </p>
            </div>

            {/* Quick Demo Credentials hint */}
            <div className="p-3 bg-[#0a0a0d] rounded-input border border-white/[0.04] text-[11px] text-text-faint space-y-1">
              <p className="font-semibold text-text-muted">Demo Credentials:</p>
              <p>Customer: <span className="text-text">demo@example.com</span> / <span className="text-text">Demo1234</span></p>
              <p>Staff: <span className="text-text">staff@example.com</span> / <span className="text-text">ChangeMe123</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-6">
          <div className="w-full max-w-5xl h-[500px] bg-surface-2/40 rounded-2xl animate-pulse" />
        </div>
      }
    >
      <LoginContent />
    </React.Suspense>
  );
}
