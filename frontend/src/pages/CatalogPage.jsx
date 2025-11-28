import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import client from '../api/client.js';
import ProductCard from '../components/ProductCard.jsx';

const CatalogPage = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const searchTerm = (searchParams.get('search') || '').toLowerCase();

  useEffect(() => {
    setLoading(true);
    client
      .get('/api/products', { params: { page } })
      .then((res) => {
        setProducts(res.data.items);
        setPages(res.data.pages);
      })
      .finally(() => setLoading(false));
  }, [page]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter((product) => {
      const text = `${product.name} ${product.description} ${product.farmer?.name || ''}`.toLowerCase();
      return text.includes(searchTerm);
    });
  }, [products, searchTerm]);

  return (
    <div className="container">
      <div className="hero">
        <div>
          <p className="eyebrow">Direct from farmers</p>
          <h1>Modern marketplace for traceable produce</h1>
          <p>
            Curated catalog of approved farmers, transparent certifications, and real-time inventory ensures consumers get
            the freshest harvest with full context.
          </p>
          <div className="hero-badges">
            <span>Verified farms</span>
            <span>Tracked logistics</span>
            <span>Fair payouts</span>
          </div>
        </div>
      </div>

      <div className="grid">
        {loading &&
          Array.from({ length: 6 }).map((_, index) => (
            <div className="product-card skeleton" key={`skeleton-${index}`} aria-hidden="true" />
          ))}
        {!loading && filteredProducts.map((product) => <ProductCard key={product._id} product={product} />)}
        {!loading && filteredProducts.length === 0 && <p>No products found.</p>}
      </div>

      <div className="pagination">
        <button type="button" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          Prev
        </button>
        <span>
          {page} / {pages}
        </span>
        <button type="button" disabled={page === pages} onClick={() => setPage((p) => p + 1)}>
          Next
        </button>
      </div>
    </div>
  );
};

export default CatalogPage;

