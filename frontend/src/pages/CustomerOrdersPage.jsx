import { useEffect, useState } from 'react';
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
    client
      .get('/api/orders/mine')
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container">
      <div className="container-header">
        <div>
          <h2 className="container-title">Your recent orders</h2>
          <p className="container-subtitle">
            Track fulfillment, request support, and jump back into the catalog with one click.
          </p>
        </div>
      </div>

      {loading && <div className="card skeleton">Loading orders…</div>}

      <div className="orders-grid">
        {orders.map((order) => (
          <article key={order._id} className="card order-card">
            <header>
              <div>
                <h3>Order #{order._id.slice(-6)}</h3>
                <p>{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <span
                className="status-pill"
                style={{ backgroundColor: `${statusPalette[order.status] || '#6b7280'}20`, color: statusPalette[order.status] }}
              >
                {order.status}
              </span>
            </header>
            <ul>
              {order.items.map((item) => (
                <li key={`${order._id}-${item.product}`}>{item.name} × {item.quantity}</li>
              ))}
            </ul>
            <footer>
              <Link to={`/orders/${order._id}`} className="btn-pill">
                Track order
              </Link>
            </footer>
          </article>
        ))}

        {!loading && orders.length === 0 && <p>No orders yet. Visit the catalog to get started.</p>}
      </div>
    </div>
  );
};

export default CustomerOrdersPage;





