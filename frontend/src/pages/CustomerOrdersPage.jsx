// src/pages/CustomerOrdersPage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client.js';

const statusPalette = {
  Pending: '#f59e0b',
  Accepted: '#10b981',
  Rejected: '#ef4444',
  Cancelled: '#ef4444',
  Packed: '#0ea5e9',
  Shipped: '#3b82f6',
  Delivered: '#16a34a',
};

const CustomerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/api/orders/mine').then((res) => setOrders(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="site-wrap">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <h2 style={{ margin: 0 }}>Your recent orders</h2>
          <p style={{ color: 'var(--muted)' }}>Track fulfillment, request support, and jump back into the catalog with one click.</p>
        </div>
      </div>

      {loading && <div className="card" style={{ padding: 16 }}>Loading orders…</div>}

      <div style={{ display: 'grid', gap: 12 }}>
        {orders.map((order) => (
          <article key={order._id} className="card" style={{ padding: 12 }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0 }}>Order #{order._id.slice(-6)}</h3>
                <p style={{ margin: 0, color: 'var(--muted)' }}>{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <span style={{ padding: '6px 10px', borderRadius: 999, background: `${(statusPalette[order.status] || '#6b7280')}22`, color: statusPalette[order.status] }}>{order.status}</span>
            </header>

            <ul style={{ paddingLeft: 16, marginTop: 8 }}>
              {order.items.map((item) => <li key={`${order._id}-${item.product}`}>{item.name} × {item.quantity}</li>)}
            </ul>

            <footer style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              {['Pending', 'Accepted'].includes(order.status) && (
                <button
                  className="btn-secondary btn-sm"
                  onClick={() => {
                    if (confirm('Are you sure you want to cancel this order?')) {
                      client.post(`/api/orders/${order._id}/cancel`)
                        .then(() => {
                          alert('Order cancelled');
                          setOrders(orders.map(o => o._id === order._id ? { ...o, status: 'Cancelled' } : o));
                        })
                        .catch(err => alert(err.response?.data?.message || 'Failed to cancel'));
                    }
                  }}
                  style={{ color: '#ef4444', borderColor: '#fee2e2', background: '#fef2f2' }}
                >
                  Cancel Order
                </button>
              )}
              <Link className="btn-primary btn-sm" to={`/orders/${order._id}`}>Track order</Link>
            </footer>
          </article>
        ))}

        {!loading && orders.length === 0 && <div className="card" style={{ padding: 12 }}>No orders yet. Visit the catalog to get started.</div>}
      </div>
    </div>
  );
};

export default CustomerOrdersPage;
