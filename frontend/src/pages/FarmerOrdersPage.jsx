// src/pages/FarmerOrdersPage.jsx
import { useEffect, useState } from 'react';
import client from '../api/client.js';

const transitions = {
  Accepted: ['Packed'],
  Packed: ['Shipped'],
  Shipped: ['Delivered'],
};

export default function FarmerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [updating, setUpdating] = useState('');

  const refresh = () => client.get('/api/farmer/orders').then((res) => setOrders(res.data || []));

  useEffect(() => { refresh(); }, []);

  const updateStatus = (orderId, state) => {
    setUpdating(orderId + state);
    return client.post(`/api/farmer/orders/${orderId}/status`, { state, note: `Set to ${state}` })
      .then(refresh)
      .catch(err => alert('Failed to update status'))
      .finally(() => setUpdating(''));
  };

  return (
    <div className="site-wrap">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--brand)' }}>Order Board</h2>
        <p style={{ color: 'var(--text-muted)' }}>Manage and track your customer orders.</p>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {orders.length === 0 && (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No orders found.
          </div>
        )}

        {orders.map((order) => (
          <article key={order._id} className="card" style={{ padding: '1.5rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--brand)', margin: 0 }}>
                  Order #{order._id.slice(-6)}
                </h3>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Customer: <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{order.customer?.name || 'Guest'}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '999px',
                  background: order.status === 'Delivered' ? '#dcfce7' : order.status === 'Cancelled' ? '#fee2e2' : '#e0f2fe',
                  color: order.status === 'Delivered' ? '#166534' : order.status === 'Cancelled' ? '#991b1b' : '#0369a1',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}>
                  {order.status}
                </span>
                {order.status === 'Pending' && (
                  <div style={{ color: '#f59e0b', fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 500 }}>
                    New Order - Pending Acceptance
                  </div>
                )}
              </div>
            </header>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Items</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {order.items.map((it, i) => (
                  <li key={`${order._id}-${it.product?._id || it.product || i}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px dashed var(--border)' }}>
                    <span>{it.name} <span style={{ color: 'var(--text-muted)' }}>× {it.quantity}</span></span>
                    <span style={{ fontWeight: 600 }}>₹ {it.price * it.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {(transitions[order.status] || []).map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(order._id, s)}
                  disabled={!!updating}
                  className={s === 'Cancelled' || s === 'Rejected' ? 'btn-secondary btn-sm' : 'btn-primary btn-sm'}
                  style={s === 'Cancelled' || s === 'Rejected' ? { color: '#ef4444', borderColor: '#fee2e2', background: '#fef2f2' } : {}}
                >
                  {updating === order._id + s ? 'Updating...' : s}
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
