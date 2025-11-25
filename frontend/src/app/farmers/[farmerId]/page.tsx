import { notFound } from 'next/navigation';
import Link from 'next/link';
import { farmers } from '../../../lib/data';

type Props = {
  params: { farmerId: string };
};

export function generateStaticParams() {
  return farmers.map((farmer) => ({ farmerId: farmer.id }));
}

export default function FarmerProfilePage({ params }: Props) {
  const farmer = farmers.find((entry) => entry.id === params.farmerId);
  if (!farmer) return notFound();

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <section className="rounded-3xl border border-emerald-100 bg-white/90 p-10 shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Farmer profile</p>
        <h1 className="mt-2 text-4xl font-semibold text-stone-900">{farmer.name}</h1>
        <p className="text-sm text-stone-600">{farmer.location}</p>
        <p className="mt-4 text-lg text-stone-700">{farmer.story}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-stone-500">On-time delivery</p>
            <p className="text-2xl font-semibold text-stone-900">{farmer.fulfillmentStats.onTimeRate}%</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-stone-500">Sustainability score</p>
            <p className="text-2xl font-semibold text-stone-900">{farmer.fulfillmentStats.sustainabilityScore}/100</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-stone-500">Avg. lead time</p>
            <p className="text-2xl font-semibold text-stone-900">{farmer.fulfillmentStats.avgLeadTimeDays} days</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3 text-xs">
          {farmer.certifications.map((cert) => (
            <span key={cert} className="rounded-full bg-stone-100 px-3 py-1 font-semibold text-brand-primary">
              {cert}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-stone-200 bg-white/90 p-6 shadow-lg">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Specialties</p>
          <ul className="mt-4 space-y-2 text-sm text-stone-600">
            {farmer.specialties.map((specialty) => (
              <li key={specialty}>{specialty}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-stone-200 bg-white/90 p-6 shadow-lg">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Contact & logistics</p>
          <p className="text-sm text-stone-600">Email: {farmer.contact.email}</p>
          <p className="text-sm text-stone-600">Phone: {farmer.contact.phone}</p>
          {farmer.contact.site && (
            <p className="text-sm text-stone-600">
              Site: <a href={farmer.contact.site}>{farmer.contact.site}</a>
            </p>
          )}
          <p className="mt-3 text-xs uppercase tracking-wide text-stone-500">Logistics partners</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-stone-600">
            {farmer.logisticsPartners.map((partner) => (
              <span key={partner} className="rounded-full bg-stone-100 px-3 py-1">
                {partner}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-10 rounded-3xl border border-dashed border-stone-200 bg-white/70 p-8 text-center text-sm text-stone-600">
        Live product availability for each farmer now lives in the unified catalog.
        <Link href="/catalog" className="ml-2 font-semibold text-brand-primary underline">
          Browse catalog →
        </Link>
      </section>
    </div>
  );
}


