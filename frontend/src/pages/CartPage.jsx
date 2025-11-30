// src/pages/CartPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore.js';
import client from '../api/client.js';

const CartPage = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity } = useCartStore();
  const [stockMap, setStockMap] = useState({});
  const [loadingStock, setLoadingStock] = useState(false);

  useEffect(() => {
    const fetchStock = async () => {
      const ids = items.map(i => i.productId);
      if (ids.length === 0) return;
      setLoadingStock(true);
      try {
        const stocks = {};
        await Promise.all(ids.map(async (id) => {
          try {
            const res = await client.get(`/api/products/${id}`);
            stocks[id] = res.data.stock;
          } catch (e) {
            console.error(`Failed to fetch stock for ${id}`, e);
          }
        }));
        setStockMap(stocks);
      } catch (err) {
        console.error('Failed to fetch stock', err);
      } finally {
        setLoadingStock(false);
      }
    };
    fetchStock();
  }, [items.length]);

  const enrichedItems = items.map(item => ({
    ...item,
    stock: stockMap[item.productId]
  }));

  const total = enrichedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    try {
      const { data: checkout } = await client.post('/api/cart/checkout', { items });
      navigate(`/checkout?id=${checkout.checkoutId}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Checkout failed');
    }
  };

  return (
    <div className="site-wrap">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--brand)' }}>Your Cart</h2>
        <p style={{ color: 'var(--text-muted)' }}>Review your items before checkout.</p>
      </div>

      <div className="cart-grid">
        <div className="cart-items">
          {enrichedItems.length === 0 && (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>Your cart is empty.</p>
              <button onClick={() => navigate('/catalog')} className="btn-primary" style={{ marginTop: '1rem' }}>
                Start Shopping
              </button>
            </div>
          )}

          {enrichedItems.map((item) => (
            <div key={item.productId} className="card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', padding: '1.5rem', marginBottom: '1rem' }}>
              {/* Image Left */}
              <div style={{ width: 100, height: 100, borderRadius: '12px', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border)' }}>
                <img
                  src={item.image || '/images/placeholder-veg.jpg'}
                  alt={item.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Details Right */}
              <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--brand)', margin: 0 }}>{item.name}</h3>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>₹ {item.price} / unit</div>
                  {item.stock !== undefined && (
                    <div style={{ fontSize: '0.8rem', color: item.quantity >= item.stock ? 'crimson' : 'green', marginTop: '0.25rem' }}>
                      {item.quantity >= item.stock ? 'Max stock reached' : `${item.stock} available`}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                    <button
                      onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                      style={{ padding: '0.5rem 1rem', background: '#f8fafc', border: 'none', cursor: 'pointer', color: 'var(--brand)' }}
                    >-</button>
                    <span style={{ width: '40px', textAlign: 'center', fontWeight: 600, display: 'inline-block' }}>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.stock !== undefined && item.quantity >= item.stock}
                      style={{
                        padding: '0.5rem 1rem',
                        background: item.stock !== undefined && item.quantity >= item.stock ? '#e2e8f0' : '#f8fafc',
                        border: 'none',
                        cursor: item.stock !== undefined && item.quantity >= item.stock ? 'not-allowed' : 'pointer',
                        color: item.stock !== undefined && item.quantity >= item.stock ? '#94a3b8' : 'var(--brand)'
                      }}
                    >+</button>
                  </div>
                  <div style={{ fontWeight: 700, minWidth: '80px', textAlign: 'right', fontSize: '1.1rem', color: 'var(--brand)' }}>
                    ₹ {item.price * item.quantity}
                  </div>
                  <button
                    className="btn-secondary btn-sm"
                    onClick={() => removeItem(item.productId)}
                    style={{ color: '#ef4444', borderColor: '#fee2e2', background: '#fef2f2' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {enrichedItems.length > 0 && (
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'white', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--brand)' }}>Total: ₹ {total}</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Taxes and shipping calculated at checkout</div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-secondary" onClick={() => navigate('/catalog')}>Continue Shopping</button>
              <button className="btn-primary" onClick={handleCheckout}>Checkout</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
