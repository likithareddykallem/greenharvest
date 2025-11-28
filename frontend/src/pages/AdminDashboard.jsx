import { useEffect, useState } from 'react';
import client from '../api/client.js';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [pendingFarmers, setPendingFarmers] = useState([]);
  const [taxonomy, setTaxonomy] = useState({ categories: [], certifications: [] });
  const [categoryForm, setCategoryForm] = useState({ label: '', description: '' });
  const [certForm, setCertForm] = useState({ label: '', description: '' });

  const load = () => {
    client.get('/api/admin/users').then((res) => setUsers(res.data));
    client.get('/api/admin/stats').then((res) => setStats(res.data));
    client.get('/api/products', { params: { limit: 50 } }).then((res) => {
      setPendingProducts(res.data.items.filter((item) => item.approvals?.status === 'pending'));
    });
    client.get('/api/orders').then((res) => setOrders(res.data || []));
    client.get('/api/admin/farmers/pending').then((res) => setPendingFarmers(res.data));
    Promise.all([
      client.get('/api/admin/taxonomy', { params: { type: 'category' } }),
      client.get('/api/admin/taxonomy', { params: { type: 'certification' } }),
    ]).then(([catRes, certRes]) => setTaxonomy({ categories: catRes.data, certifications: certRes.data }));
  };

  useEffect(() => {
    load();
  }, []);

  const approveProduct = (id) =>
    client.post(`/api/products/${id}/approve`, { status: 'approved' }).then(() => load());

  const rejectProduct = (id, adminNote) =>
    client.post(`/api/products/${id}/approve`, { status: 'rejected', adminNote }).then(() => load());

  const toggleUser = (id, active) =>
    client.post(`/api/admin/users/${id}/active`, { active: !active }).then(() => load());

  const updateOrderStatus = (id, state) =>
    client.post(`/api/orders/${id}/status`, { state, note: `Set to ${state} by admin` }).then(() => load());

  const handleFarmerDecision = (id, approved) =>
    client.post(`/api/admin/farmers/${id}/approve`, { approved }).then(() => load());

  const createTaxonomy = (type, payload) =>
    client.post('/api/admin/taxonomy', { type, ...payload }).then(() => load());

  return (
    <div className="container">
      <div className="container-header">
        <div>
          <h2 className="container-title">Admin dashboard</h2>
          <p className="container-subtitle">
            Review products and certifications, manage users and keep orders flowing smoothly.
          </p>
        </div>
      </div>

      {stats && (
        <div className="grid" style={{ marginBottom: '2rem' }}>
          <div className="card">
            <strong>Users</strong>
            <span>
              {stats.activeUsers} active / {stats.totalUsers} total
            </span>
          </div>
          <div className="card">
            <strong>Products</strong>
            <span>
              {stats.approvedProducts} approved, {stats.pendingProducts} pending
            </span>
          </div>
          <div className="card">
            <strong>Orders by status</strong>
            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
              {(stats.ordersByStatus || [])
                .map((o) => `${o._id}: ${o.count}`)
                .join(' · ') || 'No orders yet'}
            </span>
          </div>
        </div>
      )}

      <h3>Users</h3>
      {users.map((user) => (
        <div key={user._id} className="card">
          <strong>{user.name}</strong> — {user.role}{' '}
          <span style={{ fontSize: '0.85rem', color: user.active ? '#16a34a' : '#b91c1c' }}>
            {user.active ? 'Active' : 'Deactivated'}
          </span>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => toggleUser(user._id, user.active)}
            style={{ marginLeft: 'auto' }}
          >
            {user.active ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      ))}

      <h3>Pending products</h3>
      {pendingProducts.length === 0 && <p>None</p>}
      {pendingProducts.map((product) => (
        <div key={product._id} className="card">
          <strong>{product.name}</strong>
          {product.imageUrl && (
            <div style={{ margin: '0.5rem 0' }}>
              <img
                src={product.imageUrl}
                alt={product.name}
                style={{ maxWidth: '160px', borderRadius: '8px' }}
              />
            </div>
          )}
          {product.certifications?.length > 0 && (
            <div style={{ marginBottom: '0.5rem', fontSize: '0.85rem' }}>
              <strong>Certifications</strong>
              <ul style={{ paddingLeft: '1.25rem' }}>
                {product.certifications.map((cert) => (
                  <li key={cert.fileUrl}>
                    <a href={cert.fileUrl} target="_blank" rel="noreferrer">
                      {cert.fileName || cert.fileUrl}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn-primary" onClick={() => approveProduct(product._id)}>
              Approve
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                // lightweight prompt for now
                // eslint-disable-next-line no-alert
                const note = window.prompt('Reason for rejection?');
                if (note) rejectProduct(product._id, note);
              }}
            >
              Reject
            </button>
          </div>
        </div>
      ))}

      <h3>Orders</h3>
      {orders.map((order) => (
        <div key={order._id} className="card">
          <strong>Order #{order._id}</strong> — {order.status}
          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['Placed', 'Confirmed', 'Packed', 'OutForDelivery', 'Delivered'].map((state) => (
              <button
                key={state}
                type="button"
                className="btn-secondary"
                disabled={order.status === state}
                onClick={() => updateOrderStatus(order._id, state)}
              >
                {state}
              </button>
            ))}
          </div>
        </div>
      ))}
      <h3>Farmer applications</h3>
      {pendingFarmers.length === 0 && <p>All farmers are approved.</p>}
      {pendingFarmers.map((farmer) => (
        <div key={farmer._id} className="card">
          <strong>{farmer.name}</strong> — {farmer.email}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn-primary" onClick={() => handleFarmerDecision(farmer._id, true)}>
              Approve
            </button>
            <button type="button" className="btn-secondary" onClick={() => handleFarmerDecision(farmer._id, false)}>
              Request info
            </button>
          </div>
        </div>
      ))}

      <h3>Categories & certifications</h3>
      <div className="grid" style={{ marginBottom: '1.5rem' }}>
        <form
          className="card"
          onSubmit={(event) => {
            event.preventDefault();
            createTaxonomy('category', categoryForm);
            setCategoryForm({ label: '', description: '' });
          }}
        >
          <strong>Add category</strong>
          <input
            placeholder="Label"
            value={categoryForm.label}
            onChange={(event) => setCategoryForm({ ...categoryForm, label: event.target.value })}
            required
          />
          <textarea
            placeholder="Description"
            value={categoryForm.description}
            onChange={(event) => setCategoryForm({ ...categoryForm, description: event.target.value })}
          />
          <button type="submit" className="btn-primary">
            Save
          </button>
        </form>
        <form
          className="card"
          onSubmit={(event) => {
            event.preventDefault();
            createTaxonomy('certification', certForm);
            setCertForm({ label: '', description: '' });
          }}
        >
          <strong>Add certification</strong>
          <input
            placeholder="Label"
            value={certForm.label}
            onChange={(event) => setCertForm({ ...certForm, label: event.target.value })}
            required
          />
          <textarea
            placeholder="Description"
            value={certForm.description}
            onChange={(event) => setCertForm({ ...certForm, description: event.target.value })}
          />
          <button type="submit" className="btn-primary">
            Save
          </button>
        </form>
      </div>
      <div className="grid">
        <div className="card">
          <strong>Categories</strong>
          <ul>
            {taxonomy.categories.map((cat) => (
              <li key={cat._id}>{cat.label}</li>
            ))}
          </ul>
        </div>
        <div className="card">
          <strong>Certifications</strong>
          <ul>
            {taxonomy.certifications.map((cert) => (
              <li key={cert._id}>{cert.label}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

