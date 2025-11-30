// src/pages/CatalogPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import client from '../api/client.js';
import ProductCard from '../components/ProductCard.jsx';

const CatalogPage = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const searchTerm = (searchParams.get('search') || '').toLowerCase();

  const [categories, setCategories] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedCertification, setSelectedCertification] = useState(searchParams.get('certification') || '');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch taxonomy with safety checks
    client.get('/api/products/taxonomy?type=category')
      .then(res => setCategories(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error('Failed to load categories', err));

    client.get('/api/products/taxonomy?type=certification')
      .then(res => setCertifications(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error('Failed to load certifications', err));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = {
      page,
      limit: 24,
      search: searchTerm,
      category: selectedCategory,
      certification: selectedCertification
    };

    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    if (selectedCategory) newParams.set('category', selectedCategory); else newParams.delete('category');
    if (selectedCertification) newParams.set('certification', selectedCertification); else newParams.delete('certification');
    if (searchTerm) newParams.set('search', searchTerm); else newParams.delete('search');
    // We don't navigate here to avoid loop, but we could if we want deep linking to work perfectly with back button
    // For now, let's just fetch. Ideally, we should sync state from URL.

    client
      .get('/api/products', { params })
      .then((res) => {
        console.log('Catalog fetch success:', res.data);
        setProducts(res.data.items || []);
        setPages(res.data.pages || 1);
      })
      .catch((err) => {
        console.error('Catalog fetch error:', err);
        setError('Failed to load products. Please check your connection.');
        setProducts([]);
        setPages(1);
      })
      .finally(() => setLoading(false));
  }, [page, searchTerm, selectedCategory, selectedCertification]);

  // Server-side filtering now
  const filteredProducts = products;

  return (
    <div className="site-wrap">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--brand)' }}>
          Marketplace
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Direct from verified sustainable farms.
        </p>
      </div>

      <div className="catalog-layout">
        {/* Sidebar Filters */}
        <aside className="catalog-sidebar">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--brand)' }}>Filters</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Search in Sidebar */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Search</label>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const q = e.currentTarget.q.value.trim();
                  if (q) navigate(`/catalog?search=${encodeURIComponent(q)}`);
                  else navigate('/catalog');
                }}
              >
                <input
                  name="q"
                  defaultValue={searchParams.get('search') || ''}
                  placeholder="Search..."
                  style={{ width: '100%', padding: '0.5rem' }}
                />
              </form>
            </div>

            {/* Category Filter */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                style={{ width: '100%', padding: '0.5rem' }}
              >
                <option value="">All Categories</option>
                {categories.map(c => <option key={c._id} value={c.label}>{c.label}</option>)}
              </select>
            </div>

            {/* Certification Filter */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Certification</label>
              <select
                value={selectedCertification}
                onChange={(e) => { setSelectedCertification(e.target.value); setPage(1); }}
                style={{ width: '100%', padding: '0.5rem' }}
              >
                <option value="">All Certifications</option>
                {certifications.map(c => <option key={c._id} value={c.label}>{c.label}</option>)}
              </select>
            </div>

            {(selectedCategory || selectedCertification || searchTerm) && (
              <button
                onClick={() => { setSelectedCategory(''); setSelectedCertification(''); navigate('/catalog'); }}
                className="btn-secondary btn-sm"
                style={{ width: '100%' }}
              >
                Reset All
              </button>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main>
          <div className="grid-cards-compact">
            {loading &&
              Array.from({ length: 8 }).map((_, index) => (
                <div className="card" key={index} style={{ height: 260 }} />
              ))}

            {!loading && filteredProducts.map((product) => <ProductCard key={product._id} product={product} />)}

            {!loading && !error && filteredProducts.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <p>No products found matching your criteria.</p>
                <button
                  onClick={() => { setSelectedCategory(''); setSelectedCertification(''); navigate('/catalog'); }}
                  className="btn-primary btn-sm"
                  style={{ marginTop: '1rem' }}
                >
                  Clear Filters
                </button>
              </div>
            )}

            {error && (
              <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: '#ef4444', background: '#fef2f2', borderRadius: '8px' }}>
                {error}
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 32 }}>
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="btn-secondary btn-sm"
                disabled={page === 1}
              >
                Prev
              </button>
              <div style={{ alignSelf: 'center', color: 'var(--muted)', fontSize: '0.9rem' }}>
                Page <strong style={{ color: 'var(--brand)' }}>{page}</strong> of {pages}
              </div>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                className="btn-secondary btn-sm"
                disabled={page === pages}
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CatalogPage;
