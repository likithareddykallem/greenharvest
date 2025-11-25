import Link from 'next/link';
import { farmers } from '../../lib/data';

export default function FarmersPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Farmer directory</p>
        <h1 className="text-4xl font-semibold text-stone-900">Verified producer profiles</h1>
        <p className="text-sm text-stone-600">
          Every farmer listed below has passed identity, certification, and cold-chain vetting.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2">
        {farmers.map((farmer) => (
          <article key={farmer.id} className="rounded-3xl border border-stone-200 bg-white/90 p-6 shadow-lg">
            <p className="text-sm font-semibold text-stone-900">{farmer.name}</p>
            <p className="text-xs text-stone-500">{farmer.location}</p>
            <p className="mt-4 text-sm text-stone-600">{farmer.story}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {farmer.specialties.map((specialty) => (
                <span key={specialty} className="rounded-full bg-stone-100 px-3 py-1">
                  {specialty}
                </span>
              ))}
            </div>
            <Link href={`/farmers/${farmer.id}`} className="mt-4 inline-block text-sm font-semibold text-brand-primary">
              View profile →
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}







