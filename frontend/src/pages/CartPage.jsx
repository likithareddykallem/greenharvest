import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore.js';

const CartPage = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity } = useCartStore();
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="container">
      <h2>Your cart</h2>
      {items.length === 0 && <p>Cart is empty</p>}
      {items.map((item) => (
        <div key={item.productId} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <strong>{item.name}</strong>
            <span>${item.price}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.85rem', color: '#6b7280' }}>Qty</label>
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => updateQuantity(item.productId, Number(e.target.value) || 1)}
              style={{ width: '80px', marginBottom: 0 }}
            />
            <span style={{ marginLeft: 'auto', fontSize: '0.9rem' }}>
              Line total: <strong>${item.price * item.quantity}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => removeItem(item.productId)}
            className="btn-secondary"
            style={{ marginTop: '0.5rem' }}
          >
            Remove
          </button>
        </div>
      ))}
      {items.length > 0 && (
        <>
          <p>
            Total: <strong>${total}</strong>
          </p>
          <button type="button" onClick={() => navigate('/checkout')} className="btn-primary">
            Checkout
          </button>
        </>
      )}
    </div>
  );
};

export default CartPage;

