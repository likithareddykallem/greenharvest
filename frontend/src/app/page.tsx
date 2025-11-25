import CatalogExplorer from '../components/catalog/CatalogExplorer';
import { fetchProducts } from '../lib/api/products';
import { certifications } from '../lib/data';
import type { Product } from '../lib/types';

const loadMarketplaceInventory = async (): Promise<Product[]> => {
  try {
    const response = await fetchProducts({ limit: 200 });
    return response.data;
  } catch (error) {
    console.warn('Failed to hydrate marketplace inventory', error);
    return [];
  }
};

export default async function HomePage() {
  const products = await loadMarketplaceInventory();

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Marketplace</p>
        <h1 className="text-4xl font-semibold text-stone-900">Shop the latest harvests</h1>
        <p className="text-sm text-stone-600">
          The home page now focuses exclusively on the live marketplace so visitors immediately land on the catalog.
        </p>
      </header>

      <CatalogExplorer initialProducts={products} certifications={certifications} />
    </div>
  );
}

