// src/pages/CheckoutPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client.js';
import { useCartStore } from '../store/cartStore.js';
import { useAuthStore } from '../store/authStore.js';
import PaymentModal from '../components/PaymentModal.jsx';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, clear } = useCartStore();
  const { accessToken } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;

  const handleCheckout = async () => {
    setError('');
    try {
      const { data: checkout } = await client.post('/api/cart/checkout', { items }, { headers });
      setLoading(true);
      const payment = await client.post('/api/payments/simulate', { checkoutId: checkout.checkoutId }, { headers });
      clear();
      setLoading(false);
      navigate(`/orders/${payment.data.orderId}`);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Checkout failed');
    }
  };

  return (
    <div className="site-wrap">
      <h2>Checkout</h2>
      <div className="card" style={{ padding: 16 }}>
        {items.length === 0 && <p>Add items first.</p>}
        {items.map((item) => (
          <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>{item.name} × {item.quantity}</div>
            <div>₹ {item.price * item.quantity}</div>
          </div>
        ))}
        <div style={{ borderTop: '1px solid #eee', marginTop: 16, paddingTop: 16, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.2rem' }}>
          <span>Total</span>
          <span>₹ {items.reduce((sum, i) => sum + i.price * i.quantity, 0)}</span>
        </div>

        {error && <p style={{ color: 'crimson' }}>{error}</p>}

        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button className="btn-primary" disabled={!items.length} onClick={handleCheckout}>Pay now</button>
          <button className="btn-secondary" onClick={() => navigate('/cart')}>Back to cart</button>
        </div>
      </div>

      <PaymentModal visible={loading} />
    </div>
  );
};

export default CheckoutPage;
