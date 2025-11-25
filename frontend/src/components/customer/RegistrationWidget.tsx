"use client";

import { useState } from 'react';

const roles = ['Chef / Restaurant', 'Retail buyer', 'Food manufacturer', 'Distribution partner'];

export default function RegistrationWidget() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="glass-panel p-6 text-sm text-stone-600">
        <p className="text-base font-semibold text-brand-primary">Request received</p>
        <p className="mt-2">
          Our onboarding team will provision your workspace within the next business day and email SSO instructions.
        </p>
      </div>
    );
  }

  return (
    <form
      className="glass-panel space-y-3 p-6 text-sm"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <p className="text-base font-semibold text-stone-900">Book a 5-minute onboarding</p>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs text-stone-500">
          Full name
          <input className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900" required />
        </label>
        <label className="flex flex-col gap-1 text-xs text-stone-500">
          Work email
          <input
            className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900"
            type="email"
            required
          />
        </label>
      </div>
      <label className="flex flex-col gap-2 text-xs text-stone-500">
        I&rsquo;m sourcing for
        <select className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900" required>
          <option value="">Select a role</option>
          {roles.map((role) => (
            <option key={role}>{role}</option>
          ))}
        </select>
      </label>
      <button className="w-full rounded-full bg-brand-secondary px-4 py-2 text-sm font-semibold text-white">
        Request access
      </button>
    </form>
  );
}


