'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api, ApiError } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';

export default function AccountPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?next=/account');
    }
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
    }
  }, [user, authLoading, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);

    try {
      await api.patch('/users/me', {
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
      });

      toast.success('Profile updated successfully.');
      await refreshProfile();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        toast.error(err.message || 'Failed to update profile.');
      } else {
        toast.error('An error occurred.');
      }
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long.');
      return;
    }

    setIsChangingPassword(true);

    try {
      await api.post('/users/me/change-password', {
        currentPassword,
        newPassword,
      });

      toast.success('Security password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        toast.error(err.message || 'Current password incorrect.');
      } else {
        toast.error('Password change failed.');
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-surface-2 rounded" />
        <div className="h-64 bg-surface-2/40 rounded-card" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 space-y-10">
      <div>
        <p className="eyebrow">Client Settings</p>
        <h1 className="font-serif text-3xl sm:text-4xl text-text font-bold mt-1">My Account</h1>
        <p className="text-xs text-text-muted mt-1">Manage personal contact details and account security</p>
      </div>

      {/* Stacked Cards (§9.7) */}
      <div className="space-y-8">
        {/* Profile Card */}
        <Card className="p-6 md:p-8 space-y-6 border-white/[0.08]">
          <div className="border-b border-white/[0.08] pb-3">
            <h2 className="font-serif text-xl font-bold text-text">Profile Information</h2>
            <p className="text-xs text-text-muted mt-0.5">Contact details used by our dealership specialists</p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <Input label="Email Address" type="email" value={user.email} disabled className="opacity-60 cursor-not-allowed" />

            <Input
              label="Full Legal Name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <Input
              label="Mobile Phone"
              type="tel"
              placeholder="+92 300 1234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <div className="flex justify-end pt-2">
              <Button variant="primary" size="md" type="submit" isLoading={isUpdatingProfile}>
                Save Profile Changes
              </Button>
            </div>
          </form>
        </Card>

        {/* Change Password Card */}
        <Card className="p-6 md:p-8 space-y-6 border-white/[0.08]">
          <div className="border-b border-white/[0.08] pb-3">
            <h2 className="font-serif text-xl font-bold text-text">Security & Password</h2>
            <p className="text-xs text-text-muted mt-0.5">Ensure your account is protected with a robust password</p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />

            <Input
              label="New Password"
              type="password"
              required
              placeholder="Minimum 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <Input
              label="Confirm New Password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="md" type="submit" isLoading={isChangingPassword}>
                Update Password
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

