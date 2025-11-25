"use client";

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { loginUser } from '../../lib/auth-client';
import { saveAuthSession } from '../../lib/auth-storage';
import type { UserRole } from '../../lib/types';

const roleOptions: { label: string; value: UserRole }[] = [
  { value: 'consumer', label: 'Consumer' },
  { value: 'farmer', label: 'Farmer' },
  { value: 'admin', label: 'Admin' }
];

type LoginState = 'idle' | 'submitting';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('consumer');
  const [state, setState] = useState<LoginState>('idle');
  const [error, setError] = useState<string | null>(null);

  const disabled = state === 'submitting';
  const registeredFlag = searchParams?.get('registered');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState('submitting');
    setError(null);

    try {
      const session = await loginUser({ email, password, role });
      saveAuthSession(session);
      router.push(session.redirectPath || '/catalog');
    } catch (err) {
      setState('idle');
      setError(err instanceof Error ? err.message : 'Unable to log in. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-emerald-100 bg-white p-8 shadow-xl">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Welcome back</p>
        <h1 className="mt-2 text-3xl font-semibold text-stone-900">Sign in to GreenHarvest</h1>
        <p className="text-sm text-stone-600">Choose your role to access the correct dashboard.</p>
      </div>

      {registeredFlag && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-sm text-brand-primary">
          Registration successful. You can sign in now.
        </p>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        {roleOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setRole(option.value)}
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
              role === option.value
                ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                : 'border-stone-200 text-stone-600'
            }`}
            disabled={disabled}
          >
            {option.label}
          </button>
        ))}
      </div>

      <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">
        Email
        <input
          className="mt-1 w-full rounded-2xl border border-stone-200 px-3 py-3 text-sm"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={disabled}
        />
      </label>

      <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">
        Password
        <input
          className="mt-1 w-full rounded-2xl border border-stone-200 px-3 py-3 text-sm"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={disabled}
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={disabled}
        className="w-full rounded-full bg-brand-primary px-4 py-3 text-base font-semibold text-white disabled:opacity-60"
      >
        {state === 'submitting' ? 'Signing in…' : 'Sign in'}
      </button>

      <p className="text-center text-sm text-stone-600">
        Need an account?{' '}
        <Link href="/auth/register" className="font-semibold text-brand-primary">
          Register here
        </Link>
      </p>
    </form>
  );
}




