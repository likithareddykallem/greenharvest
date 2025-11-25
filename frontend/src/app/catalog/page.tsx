import CatalogExplorer from '../../components/catalog/CatalogExplorer';
import { fetchProducts } from '../../lib/api/products';
import { certifications } from '../../lib/data';
import type { Product } from '../../lib/types';

const loadProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetchProducts({ limit: 200 });
    return response.data;
  } catch (error) {
    console.warn('Unable to load catalog products', error);
    return [];
  }
};

export default async function CatalogPage() {
  const products = await loadProducts();

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Marketplace</p>
        <h1 className="text-4xl font-semibold text-stone-900">Advanced product search & filtering</h1>
        <p className="text-sm text-stone-600">
          Filter by certification, farm location, inventory availability, and more—all data is verified before it hits this view.
        </p>
      </header>

      <CatalogExplorer initialProducts={products} certifications={certifications} />
    </div>
  );
}


