import { useEffect, useState } from 'react';
import client from '../api/client.js';

const transitions = {
  Pending: ['Accepted', 'Rejected', 'Cancelled'],
  Accepted: ['Packed', 'Cancelled'],
  Packed: ['Shipped'],
  Shipped: ['Delivered'],
};

const FarmerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [updating, setUpdating] = useState('');

  const refresh = () =>
    client.get('/api/farmer/orders').then((res) => {
      setOrders(res.data);
    });

  useEffect(() => {
    refresh();
  }, []);

  const updateStatus = (orderId, state) => {
    setUpdating(orderId + state);
    return client
      .post(`/api/farmer/orders/${orderId}/status`, { state, note: `Set to ${state}` })
      .then(refresh)
      .finally(() => setUpdating(''));
  };

  return (
    <div className="container">
      <div className="container-header">
        <div>
          <h2 className="container-title">Order board</h2>
          <p className="container-subtitle">
            Review customer orders and keep customers updated as you accept, pack, and ship items.
          </p>
        </div>
      </div>

      <div className="orders-grid">
        {orders.map((order) => (
          <article className="card order-card" key={order._id}>
            <header>
              <div>
                <h3>Order #{order._id.slice(-6)}</h3>
                <p>Customer: {order.customer?.name || 'Customer'}</p>
              </div>
              <span className="status-pill">{order.status}</span>
            </header>

            <ul>
              {order.items.map((item) => (
                <li key={`${order._id}-${item.product}`}>{item.name} × {item.quantity}</li>
              ))}
            </ul>

            <div className="status-actions">
              {(transitions[order.status] || []).map((state) => (
                <button
                  key={state}
                  type="button"
                  className="btn-secondary"
                  disabled={updating === order._id + state}
                  onClick={() => updateStatus(order._id, state)}
                >
                  {state}
                </button>
              ))}
            </div>
          </article>
        ))}

        {orders.length === 0 && <p>No orders yet.</p>}
      </div>
    </div>
  );
};

export default FarmerOrdersPage;


