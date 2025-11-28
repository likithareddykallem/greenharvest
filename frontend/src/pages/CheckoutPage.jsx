import { useState } from 'react';
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
      const { data: checkout } = await client.post(
        '/api/cart/checkout',
        { items },
        { headers }
      );
      setLoading(true);
      const payment = await client.post(
        '/api/payments/simulate',
        { checkoutId: checkout.checkoutId },
        { headers }
      );
      clear();
      setLoading(false);
      navigate(`/orders/${payment.data.orderId}`);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Checkout failed');
    }
  };

  return (
    <div className="container">
      <h2>Checkout</h2>
      {items.length === 0 && <p>Add items first.</p>}
      {items.map((item) => (
        <div key={item.productId} className="card">
          <p>
            {item.name} × {item.quantity}
          </p>
        </div>
      ))}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="button" disabled={!items.length} onClick={handleCheckout}>
        Pay now
      </button>
      <PaymentModal visible={loading} />
    </div>
  );
};

export default CheckoutPage;

