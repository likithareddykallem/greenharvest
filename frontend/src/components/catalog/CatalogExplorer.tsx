"use client";

import { useMemo, useState } from 'react';
import ProductCard from '../ProductCard';
import type { Product } from '../../lib/types';

type Props = {
  initialProducts: Product[];
  certifications: string[];
};

const getLocationLabel = (product: Product) => {
  const address = product.farmer?.locations?.[0]?.address;
  if (!address) return null;
  return [address.city, address.state, address.country].filter(Boolean).join(', ');
};

const getUniqueLocations = (products: Product[]) => {
  const locations = new Set<string>();
  products.forEach((product) => {
    const label = getLocationLabel(product);
    if (label) locations.add(label);
  });
  return Array.from(locations).sort();
};

const getCertificationsFromProduct = (product: Product) =>
  (product.certifications || [])
    .map((cert) => cert.type)
    .filter((value): value is string => Boolean(value));

export default function CatalogExplorer({ initialProducts, certifications }: Props) {
  const [search, setSearch] = useState('');
  const [certFilter, setCertFilter] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [availability, setAvailability] = useState<'all' | 'inStock'>('all');

  const locationOptions = useMemo(() => getUniqueLocations(initialProducts), [initialProducts]);

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
      const productCertifications = getCertificationsFromProduct(product);
      const matchesCert = certFilter ? productCertifications.includes(certFilter) : true;
      const locationLabel = getLocationLabel(product);
      const matchesLocation = locationFilter ? locationLabel === locationFilter : true;
      const availableQuantity =
        (product.inventory?.totalQuantity ?? 0) - (product.inventory?.reservedQuantity ?? 0);
      const matchesAvailability =
        availability === 'all' ? true : (availableQuantity || 0) > (product.inventory?.lowStockThreshold ?? 0);

      return matchesSearch && matchesCert && matchesLocation && matchesAvailability;
    });
  }, [availability, certFilter, initialProducts, locationFilter, search]);

  return (
    <>
      <section className="rounded-3xl border border-stone-200 bg-white/90 p-6 shadow-lg">
        <div className="grid gap-4 md:grid-cols-4">
          <label className="text-xs font-medium uppercase tracking-wide text-stone-500 md:col-span-2">
            Search
            <input
              className="mt-1 w-full rounded-2xl border border-stone-200 px-3 py-2 text-sm"
              placeholder="Heirloom tomatoes, kale..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <label className="text-xs font-medium uppercase tracking-wide text-stone-500">
            Certification
            <select
              className="mt-1 w-full rounded-2xl border border-stone-200 px-3 py-2 text-sm"
              value={certFilter ?? ''}
              onChange={(event) => setCertFilter(event.target.value || null)}
            >
              <option value="">Any</option>
              {certifications.map((cert) => (
                <option key={cert}>{cert}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium uppercase tracking-wide text-stone-500">
            Farm location
            <select
              className="mt-1 w-full rounded-2xl border border-stone-200 px-3 py-2 text-sm"
              value={locationFilter ?? ''}
              onChange={(event) => setLocationFilter(event.target.value || null)}
            >
              <option value="">Any</option>
              {locationOptions.map((location) => (
                <option key={location}>{location}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-stone-600">
          <button
            className={`rounded-full border px-4 py-1 transition ${
              availability === 'all'
                ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                : 'border-stone-200 bg-white'
            }`}
            onClick={() => setAvailability('all')}
          >
            All inventory
          </button>
          <button
            className={`rounded-full border px-4 py-1 transition ${
              availability === 'inStock'
                ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                : 'border-stone-200 bg-white'
            }`}
            onClick={() => setAvailability('inStock')}
          >
            Ready to ship
          </button>
          <button
            className="text-xs text-stone-500 underline"
            onClick={() => {
              setSearch('');
              setCertFilter(null);
              setLocationFilter(null);
              setAvailability('all');
            }}
          >
            Reset
          </button>
        </div>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        {filteredProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
        {filteredProducts.length === 0 && (
          <p className="rounded-3xl border border-dashed border-stone-200 bg-white/60 p-8 text-center text-sm text-stone-500">
            No products match that combination yet—expand your filters or invite more farmers.
          </p>
        )}
      </section>
    </>
  );
}




