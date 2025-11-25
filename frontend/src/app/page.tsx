import Link from 'next/link';
import ProductCard from '../components/ProductCard';
import RealtimeStatus from '../components/RealtimeStatus';
import RegistrationWidget from '../components/customer/RegistrationWidget';
import { fetchProducts } from '../lib/api/products';
import { farmers, reviews } from '../lib/data';
import type { Product } from '../lib/types';

const getFeaturedProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetchProducts({ limit: 6 });
    return response.data;
  } catch (error) {
    console.warn('Failed to fetch featured products', error);
    return [];
  }
};

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();
  const highlightedReviews = reviews.slice(0, 2);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-12">
      <section className="glass-panel grid gap-10 p-10 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-primary">Climate-smart sourcing</p>
          <h1 className="mt-4 text-5xl font-semibold leading-tight text-stone-900">
            Customer, farmer, and admin tooling on a single trust layer.
          </h1>
          <p className="mt-4 text-lg text-stone-600">
            Register your team, filter by certification, capture reviews, checkout securely, and track every shipment without
            leaving the platform.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/catalog" className="rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white">
              Browse catalog
            </Link>
            <Link
              href="/auth/register"
              className="rounded-full border border-brand-primary px-6 py-3 text-sm font-semibold text-brand-primary"
            >
              Create account
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { label: 'Traceable SKUs', value: '180+' },
              { label: 'Certified farmers', value: '54' },
              { label: 'Avg. delivery SLA', value: '48h' }
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/60 bg-white/60 p-4 shadow">
                <p className="text-2xl font-semibold text-stone-900">{stat.value}</p>
                <p className="text-xs uppercase tracking-wide text-stone-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
        <RegistrationWidget />
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white/90 p-8 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Live infrastructure</p>
            <h2 className="text-3xl font-semibold text-stone-900">Realtime marketplace guardrails</h2>
            <p className="text-sm text-stone-600">Latency-aware sockets + Prometheus metrics keep every SLA observable.</p>
          </div>
          <RealtimeStatus />
        </div>
      </section>

      <section>
        <header className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Advanced discovery</p>
            <h2 className="text-3xl font-semibold text-stone-900">Filter by certification, farm, and terroir</h2>
          </div>
          <Link href="/catalog" className="text-sm font-semibold text-brand-primary">
            Launch advanced search →
          </Link>
        </header>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-stone-200 bg-white/90 p-6 shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Certifications</p>
            <ul className="mt-4 space-y-2 text-sm text-stone-600">
              <li>USDA Organic (54 lots)</li>
              <li>Fair-Trade (21 lots)</li>
              <li>GlobalG.A.P. (33 lots)</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-stone-200 bg-white/90 p-6 shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Micro-climate</p>
            <ul className="mt-4 space-y-2 text-sm text-stone-600">
              <li>North Bay, CA · 32 lots</li>
              <li>Blue Ridge, NC · 18 lots</li>
              <li>Sonoran Desert, AZ · 11 lots</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-stone-200 bg-white/90 p-6 shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Cold-chain</p>
            <ul className="mt-4 space-y-2 text-sm text-stone-600">
              <li>Lineage Logistics · Verified</li>
              <li>UPS Cold Chain · Verified</li>
              <li>Flexe micro-fulfillment · Pilot</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <header className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Featured harvests</p>
            <h2 className="text-3xl font-semibold text-stone-900">Shortlist curated by our agronomists</h2>
          </div>
          <Link href="/catalog" className="text-sm font-semibold text-brand-primary">
            View all →
          </Link>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          {featuredProducts.slice(0, 2).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
          {featuredProducts.length === 0 && (
            <p className="rounded-3xl border border-dashed border-stone-200 bg-white/60 p-8 text-center text-sm text-stone-500">
              Products will appear here once the marketplace API is seeded.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white/90 p-8 shadow-lg">
        <header className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Reviews and ratings</p>
            <h2 className="text-3xl font-semibold text-stone-900">Enterprise buyers trust the signal</h2>
          </div>
          <Link href="/catalog" className="text-sm font-semibold text-brand-primary">
            See ratings →
          </Link>
        </header>
        <div className="grid gap-6 md:grid-cols-2">
          {highlightedReviews.map((review) => (
            <article key={review.id} className="rounded-3xl border border-stone-100 bg-white/80 p-6 shadow">
              <p className="text-sm font-semibold text-stone-900">{review.customer}</p>
              <p className="text-xs uppercase tracking-wide text-stone-400">{review.badges.join(' • ')}</p>
              <p className="mt-4 text-lg font-semibold text-stone-900">“{review.title}”</p>
              <p className="mt-2 text-sm text-stone-600">{review.body}</p>
              <p className="mt-3 text-xs text-stone-400">{review.createdAt}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <header className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Farmer spotlights</p>
            <h2 className="text-3xl font-semibold text-stone-900">Meet the producers powering the marketplace</h2>
          </div>
          <Link href="/farmers" className="text-sm font-semibold text-brand-primary">
            Browse farmers →
          </Link>
        </header>
        <div className="grid gap-6 md:grid-cols-2">
          {farmers.map((farmer) => (
            <article key={farmer.id} className="rounded-3xl border border-stone-200 bg-white/90 p-6 shadow">
              <p className="text-sm font-semibold text-stone-900">{farmer.name}</p>
              <p className="text-xs text-stone-500">{farmer.location}</p>
              <p className="mt-4 text-sm text-stone-600">{farmer.story}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {farmer.certifications.map((cert) => (
                  <span key={cert} className="rounded-full bg-stone-100 px-3 py-1">
                    {cert}
                  </span>
                ))}
              </div>
              <Link href={`/farmers/${farmer.id}`} className="mt-4 inline-block text-sm font-semibold text-brand-primary">
                View profile →
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

