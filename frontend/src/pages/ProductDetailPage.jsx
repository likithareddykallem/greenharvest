import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client.js';
import { useCartStore } from '../store/cartStore.js';
import { useAuthStore } from '../store/authStore.js';
import { currency, getImageUrl } from '../utils/format.js';

const fallbackImage = '/images/placeholder-veg.jpg';

import { useToastStore } from '../store/toastStore.js';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const addItem = useCartStore((s) => s.addItem);
  const addToast = useToastStore((s) => s.addToast);

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    client.get(`/api/products/${id}`)
      .then((res) => {
        setProduct(res.data);
        setActiveImage(getImageUrl(res.data.imageUrl || res.data.gallery?.[0]));
      })
      .catch(() => setProduct(null));
  }, [id]);

  if (!product) return (
    <div className="page-content">
      <div className="max-site" style={{ padding: '4rem 0', textAlign: 'center' }}>
        Loading product details...
      </div>
    </div>
  );

  const gallery = [product.imageUrl, ...(product.gallery || [])].filter(Boolean).map(getImageUrl);

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    addItem(product, quantity);
    addToast(`Added ${quantity} ${product.name} to cart`);
    // navigate('/cart'); // Optional: stay on page or go to cart? User usually prefers staying.
  };

  return (
    <div className="page-content">
      <div className="max-site">
        {/* Breadcrumb / Back */}
        <button
          onClick={() => navigate('/catalog')}
          className="btn-secondary"
          style={{ marginBottom: '2rem', border: 'none', paddingLeft: 0, background: 'transparent' }}
        >
          ← Back to Marketplace
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '4rem', alignItems: 'start' }}>

          {/* Left: Gallery */}
          <div>
            <div style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              aspectRatio: '4/3',
              marginBottom: '1rem',
              background: '#f8fafc'
            }}>
              <img
                src={activeImage}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {gallery.length > 1 && (
              <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {gallery.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(src)}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      border: activeImage === src ? '2px solid var(--brand)' : '2px solid transparent',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{
                background: 'var(--brand)',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {product.status === 'published' ? 'In Stock' : 'Unavailable'}
              </span>
            </div>

            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--brand)', lineHeight: 1.1, marginBottom: '0.5rem' }}>
              {product.name}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
              <span>Sold by</span>
              <span style={{ color: 'var(--brand)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>
                {product.farmer?.name || 'Verified Farmer'}
              </span>
            </div>

            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--brand)', marginBottom: '2rem' }}>
              {currency(product.price)}
              <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '0.25rem' }}>
                / unit
              </span>
            </div>

            <p style={{ fontSize: '1.1rem', color: 'var(--text-main)', lineHeight: 1.7, marginBottom: '2.5rem' }}>
              {product.description}
            </p>

            {/* Certifications */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Certifications & Tags
              </h3>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {(product.certificationTags || []).map((t) => (
                  <span key={t} style={{
                    background: '#ecfdf5',
                    color: '#065f46',
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.9rem',
                    fontWeight: 500
                  }}>
                    {t}
                  </span>
                ))}
                {product.metadata?.method && (
                  <span style={{
                    background: '#eef2ff',
                    color: '#0f4ea0',
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.9rem',
                    fontWeight: 500
                  }}>
                    {product.metadata.method}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-md)'
            }}>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'end' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      fontSize: '1.1rem',
                      fontWeight: 600
                    }}
                  />
                </div>
                <button
                  className="btn-primary"
                  onClick={handleAddToCart}
                  style={{ flex: 2, height: '52px', fontSize: '1.1rem' }}
                >
                  Add to Cart
                </button>
              </div>
              {!user && (
                <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  Please <span style={{ color: 'var(--brand)', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('/login')}>log in</span> to purchase items.
                </p>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
