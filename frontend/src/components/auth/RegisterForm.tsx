"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { registerUser } from '../../lib/auth-client';
import type { RegisterPayload } from '../../lib/auth-client';
import type { UserRole } from '../../lib/types';

const roleOptions: { label: string; value: UserRole; description: string }[] = [
  { value: 'consumer', label: 'Consumer', description: 'Shop certified produce and track orders.' },
  { value: 'farmer', label: 'Farmer', description: 'List products, manage inventory, and access analytics.' },
  { value: 'admin', label: 'Admin', description: 'Oversee the marketplace and operations.' }
];

type RegistrationState = 'idle' | 'submitting' | 'success';

export default function RegisterForm() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>('consumer');
  const [state, setState] = useState<RegistrationState>('idle');
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  });

  const [farmDetails, setFarmDetails] = useState({
    farmName: '',
    specialties: '',
    city: '',
    state: '',
    country: '',
    postalCode: ''
  });

  const disabled = state === 'submitting';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState('submitting');
    setError(null);

    try {
      const baseAddress =
        profile.street || profile.city || profile.state || profile.postalCode || profile.country
          ? {
              street: profile.street || undefined,
              city: profile.city || undefined,
              state: profile.state || undefined,
              postalCode: profile.postalCode || undefined,
              country: profile.country || undefined
            }
          : undefined;

      const payload: RegisterPayload = {
        email: profile.email,
        password: profile.password,
        role,
        profile: {
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone || undefined,
          ...(baseAddress ? { address: baseAddress } : {})
        }
      };

      if (role === 'farmer') {
        payload.farmDetails = {
          farmName: farmDetails.farmName,
          specialties: farmDetails.specialties
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
          farmLocation: {
            label: 'Primary farm',
            address: {
              city: farmDetails.city,
              state: farmDetails.state,
              country: farmDetails.country,
              postalCode: farmDetails.postalCode
            }
          }
        };
      }

      await registerUser(payload);
      setState('success');
      setTimeout(() => router.push('/auth/login?registered=1'), 900);
    } catch (err) {
      setState('idle');
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    }
  };

  const updateProfile = (field: keyof typeof profile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const updateFarm = (field: keyof typeof farmDetails, value: string) => {
    setFarmDetails((prev) => ({ ...prev, [field]: value }));
  };

  if (state === 'success') {
    return (
      <div className="rounded-3xl border border-emerald-100 bg-white p-8 text-center shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Registration complete</p>
        <p className="mt-3 text-2xl font-semibold text-stone-900">Welcome to GreenHarvest</p>
        <p className="mt-2 text-sm text-stone-600">Redirecting you to the login page…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-emerald-100 bg-white p-8 shadow-xl">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Create your account</p>
        <h1 className="mt-2 text-3xl font-semibold text-stone-900">Register for GreenHarvest</h1>
        <p className="text-sm text-stone-600">Select a role to unlock the right dashboard experience.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {roleOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setRole(option.value)}
            className={`rounded-2xl border px-4 py-4 text-left ${
              role === option.value
                ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                : 'border-stone-200 bg-white text-stone-600'
            }`}
          >
            <p className="text-sm font-semibold">{option.label}</p>
            <p className="text-xs">{option.description}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">
          First name
          <input
            className="mt-1 w-full rounded-2xl border border-stone-200 px-3 py-3 text-sm"
            required
            value={profile.firstName}
            onChange={(e) => updateProfile('firstName', e.target.value)}
            disabled={disabled}
          />
        </label>
        <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">
          Last name
          <input
            className="mt-1 w-full rounded-2xl border border-stone-200 px-3 py-3 text-sm"
            required
            value={profile.lastName}
            onChange={(e) => updateProfile('lastName', e.target.value)}
            disabled={disabled}
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">
          Work email
          <input
            className="mt-1 w-full rounded-2xl border border-stone-200 px-3 py-3 text-sm"
            type="email"
            required
            value={profile.email}
            onChange={(e) => updateProfile('email', e.target.value)}
            disabled={disabled}
          />
        </label>
        <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">
          Phone
          <input
            className="mt-1 w-full rounded-2xl border border-stone-200 px-3 py-3 text-sm"
            value={profile.phone}
            onChange={(e) => updateProfile('phone', e.target.value)}
            disabled={disabled}
          />
        </label>
      </div>

      <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">
        Password
        <input
          className="mt-1 w-full rounded-2xl border border-stone-200 px-3 py-3 text-sm"
          type="password"
          required
          minLength={8}
          value={profile.password}
          onChange={(e) => updateProfile('password', e.target.value)}
          disabled={disabled}
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">
          Street
          <input
            className="mt-1 w-full rounded-2xl border border-stone-200 px-3 py-3 text-sm"
            value={profile.street}
            onChange={(e) => updateProfile('street', e.target.value)}
            disabled={disabled}
          />
        </label>
        <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">
          City
          <input
            className="mt-1 w-full rounded-2xl border border-stone-200 px-3 py-3 text-sm"
            value={profile.city}
            onChange={(e) => updateProfile('city', e.target.value)}
            disabled={disabled}
          />
        </label>
        <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">
          State / Region
          <input
            className="mt-1 w-full rounded-2xl border border-stone-200 px-3 py-3 text-sm"
            value={profile.state}
            onChange={(e) => updateProfile('state', e.target.value)}
            disabled={disabled}
          />
        </label>
        <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">
          Postal code
          <input
            className="mt-1 w-full rounded-2xl border border-stone-200 px-3 py-3 text-sm"
            value={profile.postalCode}
            onChange={(e) => updateProfile('postalCode', e.target.value)}
            disabled={disabled}
          />
        </label>
        <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">
          Country
          <input
            className="mt-1 w-full rounded-2xl border border-stone-200 px-3 py-3 text-sm"
            value={profile.country}
            onChange={(e) => updateProfile('country', e.target.value)}
            disabled={disabled}
          />
        </label>
      </div>

      {role === 'farmer' && (
        <div className="space-y-4 rounded-2xl border border-stone-200 bg-stone-50/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-primary">Farmer details</p>
          <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Farm name
            <input
              className="mt-1 w-full rounded-2xl border border-stone-200 px-3 py-3 text-sm"
              required
              value={farmDetails.farmName}
              onChange={(e) => updateFarm('farmName', e.target.value)}
              disabled={disabled}
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Specialties (comma separated)
            <input
              className="mt-1 w-full rounded-2xl border border-stone-200 px-3 py-3 text-sm"
              value={farmDetails.specialties}
              onChange={(e) => updateFarm('specialties', e.target.value)}
              disabled={disabled}
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              Farm city
              <input
                className="mt-1 w-full rounded-2xl border border-stone-200 px-3 py-3 text-sm"
                value={farmDetails.city}
                onChange={(e) => updateFarm('city', e.target.value)}
                disabled={disabled}
              />
            </label>
            <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              Farm state
              <input
                className="mt-1 w-full rounded-2xl border border-stone-200 px-3 py-3 text-sm"
                value={farmDetails.state}
                onChange={(e) => updateFarm('state', e.target.value)}
                disabled={disabled}
              />
            </label>
            <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              Farm country
              <input
                className="mt-1 w-full rounded-2xl border border-stone-200 px-3 py-3 text-sm"
                value={farmDetails.country}
                onChange={(e) => updateFarm('country', e.target.value)}
                disabled={disabled}
              />
            </label>
            <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              Farm postal code
              <input
                className="mt-1 w-full rounded-2xl border border-stone-200 px-3 py-3 text-sm"
                value={farmDetails.postalCode}
                onChange={(e) => updateFarm('postalCode', e.target.value)}
                disabled={disabled}
              />
            </label>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={disabled}
        className="w-full rounded-full bg-brand-primary px-4 py-3 text-base font-semibold text-white disabled:opacity-60"
      >
        {state === 'submitting' ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
}


