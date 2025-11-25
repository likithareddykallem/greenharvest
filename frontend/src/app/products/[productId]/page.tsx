import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchProductDetail } from '../../../lib/api/products';
import type { Product } from '../../../lib/types';

const placeholderImage =
  'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=60';

const getPrimaryMedia = (product: Product) => {
  const media = product.media || [];
  if (media.length === 0) {
    return [{ url: placeholderImage, alt: product.name }];
  }
  return media;
};

const formatPrice = (price?: Product['price']) => {
  if (!price?.amount || !price?.unit) return null;
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: price.currency || 'USD',
    minimumFractionDigits: 0
  });
  return `${formatter.format(price.amount)} / ${price.unit}`;
};

const formatLocation = (product: Product) => {
  const address = product.farmer?.locations?.[0]?.address;
  if (!address) return 'Fulfillment location verified';
  return [address.city, address.state, address.country].filter(Boolean).join(', ');
};

const formatCertifications = (product: Product) =>
  (product.certifications || [])
    .map((cert) => ({
      label: cert.type,
      status: cert.issuedBy ? `Issued by ${cert.issuedBy}` : undefined,
      validUntil: cert.validUntil
    }))
    .filter((cert) => !!cert.label);

const getTraceability = (product: Product) => {
  if (!product.traceability) return [];
  const entries = [
    { label: 'Harvest', value: product.traceability.harvestDate ? new Date(product.traceability.harvestDate).toDateString() : null },
    { label: 'Batch', value: product.traceability.batchId },
    { label: 'Lot number', value: product.traceability.lotNumber },
    { label: 'Storage', value: product.traceability.storageConditions }
  ];
  return entries.filter((entry) => entry.value);
};

const loadProduct = async (productId: string): Promise<Product> => {
  try {
    const response = await fetchProductDetail(productId);
    if (!response.data) throw new Error('Product missing');
    return response.data;
  } catch (error) {
    console.warn(`Failed to fetch product ${productId}`, error);
    notFound();
  }
};

type Props = {
  params: { productId: string };
};

export default async function ProductDetailPage({ params }: Props) {
  const product = await loadProduct(params.productId);
  const mediaAssets = getPrimaryMedia(product);
  const certifications = formatCertifications(product);
  const traceability = getTraceability(product);
  const availableQuantity =
    product.inventory?.totalQuantity !== undefined && product.inventory?.reservedQuantity !== undefined
      ? Math.max(0, (product.inventory.totalQuantity ?? 0) - (product.inventory.reservedQuantity ?? 0))
      : product.inventory?.totalQuantity;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <nav className="mb-6 text-xs text-stone-500">
        <Link href="/" className="hover:text-brand-primary">
          Home
        </Link>{' '}
        /{' '}
        <Link href="/catalog" className="hover:text-brand-primary">
          Catalog
        </Link>{' '}
        / <span className="text-stone-800">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-6 rounded-3xl border border-stone-200 bg-white/90 p-6 shadow-lg">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">
              {product.farmer?.farmName || 'Verified farmer'}
            </p>
            <h1 className="text-4xl font-semibold text-stone-900">{product.name}</h1>
            <p className="text-sm text-stone-500">{formatLocation(product)}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {mediaAssets.map((asset) => (
              <div key={asset.url} className="relative h-64 overflow-hidden rounded-2xl border border-stone-100 bg-stone-100">
                <Image
                  src={asset.url || placeholderImage}
                  alt={asset.alt || product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
          <p className="text-lg text-stone-700">{product.description || 'Detailed description coming soon.'}</p>
          {traceability.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Traceability</p>
              <dl className="mt-3 grid gap-3 text-sm text-stone-600 md:grid-cols-2">
                {traceability.map((entry) => (
                  <div key={entry.label} className="rounded-2xl border border-stone-100 bg-stone-50 p-3">
                    <dt className="text-xs uppercase tracking-wide text-stone-400">{entry.label}</dt>
                    <dd className="text-stone-800">{entry.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </section>

        <aside className="space-y-6 rounded-3xl border border-emerald-100 bg-white/90 p-6 shadow-lg">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Pricing</p>
            <p className="text-3xl font-semibold text-brand-primary">
              {formatPrice(product.price) || 'Request pricing'}
            </p>
            {availableQuantity !== undefined && (
              <p className="text-sm text-stone-500">{availableQuantity} units available</p>
            )}
          </div>
          <div className="space-y-2 text-sm text-stone-600">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Farmer contact</p>
            <p>{product.farmer?.supportEmail || product.farmer?.phone || 'Connect via GreenHarvest admin'}</p>
            {product.farmer?.website && (
              <a href={product.farmer.website} className="text-brand-primary underline">
                {product.farmer.website}
              </a>
            )}
          </div>
          {certifications.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Certifications</p>
              <ul className="mt-3 space-y-2 text-sm text-stone-600">
                {certifications.map((cert) => (
                  <li key={`${product._id}-${cert.label}`} className="rounded-2xl border border-stone-100 bg-stone-50 p-3">
                    <p className="font-semibold text-stone-900">{cert.label}</p>
                    {cert.status && <p className="text-xs text-stone-500">{cert.status}</p>}
                    {cert.validUntil && (
                      <p className="text-xs text-stone-400">
                        Valid until {new Date(cert.validUntil).toLocaleDateString()}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button className="w-full rounded-full bg-brand-primary px-4 py-3 text-sm font-semibold text-white">
            Request sample
          </button>
          <button className="w-full rounded-full border border-stone-200 px-4 py-3 text-sm font-semibold text-stone-700">
            Add to sourcing plan
          </button>
        </aside>
      </div>
    </div>
  );
}


