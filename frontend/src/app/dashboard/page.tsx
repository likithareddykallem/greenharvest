import AdminDashboard from '../../components/admin/AdminDashboard';
import ProtectedContent from '../../components/auth/ProtectedContent';
import { fetchProducts } from '../../lib/api/products';
import type { Product } from '../../lib/types';

const loadProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetchProducts({ limit: 50 });
    return response.data;
  } catch (error) {
    console.warn('Admin dashboard failed to load products', error);
    return [];
  }
};

export default async function DashboardPage() {
  const products = await loadProducts();

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <ProtectedContent allowedRoles={['admin']}>
        <AdminDashboard products={products} />
      </ProtectedContent>
    </div>
  );
}

