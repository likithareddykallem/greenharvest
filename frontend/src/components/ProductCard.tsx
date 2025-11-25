import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '../lib/types';

type Props = {
  product: Product;
  accent?: 'primary' | 'secondary';
};

const placeholderImage =
  'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=60';

const formatPrice = (price?: Product['price']) => {
  if (!price?.amount || !price?.unit) return 'Price on request';
  try {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: price.currency || 'USD',
      minimumFractionDigits: 0
    });
    return `${formatter.format(price.amount)} / ${price.unit}`;
  } catch {
    return `$${price.amount} / ${price.unit}`;
  }
};

const getPrimaryImage = (media?: Product['media']) => {
  if (!media || media.length === 0) return placeholderImage;
  const primary = media.find((asset) => asset.isPrimary && asset.url);
  return primary?.url || media[0]?.url || placeholderImage;
};

const getLocationLabel = (product: Product) => {
  const location = product.farmer?.locations?.find((loc) => !!loc.address?.city || !!loc.address?.state);
  if (location?.address) {
    const parts = [location.address.city, location.address.state, location.address.country].filter(Boolean);
    if (parts.length) return parts.join(', ');
  }
  return 'Location verified';
};

const getCertifications = (product: Product) =>
  (product.certifications || [])
    .map((cert) => cert.type)
    .filter((value): value is string => Boolean(value))
    .slice(0, 3);

export default function ProductCard({ product, accent = 'primary' }: Props) {
  const linkHref = `/products/${product._id}`;
  const priceLabel = formatPrice(product.price);
  const availableQuantity =
    product.inventory?.totalQuantity && product.inventory?.reservedQuantity !== undefined
      ? Math.max(0, (product.inventory.totalQuantity ?? 0) - (product.inventory.reservedQuantity ?? 0))
      : product.inventory?.totalQuantity;
  const certifications = getCertifications(product);

  return (
    <Link
      href={linkHref}
      className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white/80 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative h-48 w-full overflow-hidden bg-stone-100">
        <Image
          src={getPrimaryImage(product.media)}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            {product.farmer?.farmName || 'Verified farmer'}
          </p>
          <h3 className="mt-1 text-xl font-semibold text-stone-900">{product.name}</h3>
          <p className="mt-1 text-sm text-stone-500">{getLocationLabel(product)}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {certifications.map((label) => (
              <span key={`${product._id}-${label}`} className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs text-brand-primary">
                {label}
              </span>
            ))}
          </div>
          <p className="mt-3 text-2xl font-semibold text-brand-primary">{priceLabel}</p>
          {availableQuantity !== undefined && (
            <p className="text-sm text-stone-500">{availableQuantity} units available</p>
          )}
        </div>
        <button
          className={`mt-4 rounded-full px-4 py-2 text-center text-sm font-semibold text-white ${
            accent === 'primary' ? 'bg-brand-primary hover:bg-brand-primary/90' : 'bg-brand-secondary hover:bg-brand-secondary/90'
          }`}
        >
          View details
        </button>
      </div>
    </Link>
  );
}

