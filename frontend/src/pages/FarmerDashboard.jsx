// src/pages/FarmerDashboard.jsx
import { useEffect, useState, useRef } from 'react';
import client from '../api/client.js';
import { currency, getImageUrl } from '../utils/format.js';
import Chart from 'chart.js/auto';





const SalesChart = ({ orders }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !orders) return;
    if (chartRef.current) chartRef.current.destroy();

    // Process orders for the last 7 days
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const salesData = last7Days.map(date => {
      return orders
        .filter(o => o.createdAt.startsWith(date))
        .reduce((sum, o) => sum + (o.total || 0), 0);
    });

    const labels = last7Days.map(date => new Date(date).toLocaleDateString('en-US', { weekday: 'short' }));

    const ctx = canvasRef.current.getContext('2d');
    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Sales (₹)',
          data: salesData,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#064e3b',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#064e3b',
            padding: 12,
            titleFont: { size: 13 },
            bodyFont: { size: 14, weight: 'bold' },
            displayColors: false,
            callbacks: {
              label: (context) => `₹ ${context.parsed.y}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#f1f5f9' },
            ticks: { callback: (value) => '₹' + value }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });

    return () => chartRef.current?.destroy();
  }, [orders]);

  return <div style={{ height: 300, width: '100%' }}><canvas ref={canvasRef} /></div>;
};

import ConfirmationModal from '../components/ConfirmationModal.jsx';

export default function FarmerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);

  // Product Form
  const [form, setForm] = useState({ name: '', price: '', stock: '', category: '' });
  const [image, setImage] = useState(null);
  const [certImage, setCertImage] = useState(null);

  // Duplicate Modal State
  const [duplicateModal, setDuplicateModal] = useState({ show: false, product: null, newStock: 0 });

  const load = async () => {
    setLoading(true);
    try {
      const [p, o, prof] = await Promise.all([
        client.get('/api/farmer/products'),
        client.get('/api/farmer/orders'),
        client.get('/api/farmer/profile'),
      ]);
      setProducts(p.data || []);
      setOrders(o.data || []);
      setProfile(prof.data || {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', form.name);


    formData.append('price', form.price);
    formData.append('stock', form.stock);
    formData.append('categories', form.category);
    if (image) formData.append('image', image);
    if (certImage) formData.append('certifications', certImage);
    if (form.certificationTags?.length) formData.append('certificationTags', JSON.stringify(form.certificationTags));

    try {
      await client.post('/api/products/farmer', formData);
      setForm({ name: '', price: '', stock: '', category: '', image: null, certificationTags: [], certificationType: '', customCertification: '' });

      load();
      alert('Product published successfully!');
    } catch (err) {
      if (err.response?.status === 409) {
        setDuplicateModal({
          show: true,
          product: { id: err.response.data.productId, name: form.name },
          newStock: Number(form.stock)
        });
      } else {
        alert('Failed to publish product');
      }
    }
  };

  const handleRestockConfirm = async () => {
    try {
      await client.patch(`/api/farmer/products/${duplicateModal.product.id}/inventory`, {
        addedStock: duplicateModal.newStock
      });
      setDuplicateModal({ show: false, product: null, newStock: 0 });
      setForm({ name: '', price: '', stock: '', category: '', image: null, certificationTags: [], certificationType: '', customCertification: '' });
      load();
      alert('Stock updated successfully!');
    } catch (err) {
      alert('Failed to update stock');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'products', label: 'Products' },
  ];

  return (
    <div className="site-wrap">
      <ConfirmationModal
        isOpen={duplicateModal.show}
        title="Product Already Exists"
        message={`A product named "${duplicateModal.product?.name}" already exists. Do you want to add the new stock (${duplicateModal.newStock}) to the existing product instead?`}
        confirmText="Yes, Add Stock"
        cancelText="No, Cancel"
        onConfirm={handleRestockConfirm}
        onCancel={() => setDuplicateModal({ show: false, product: null, newStock: 0 })}
      />

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--brand)' }}>Farmer Workspace</h2>
        <p style={{ color: 'var(--text-muted)' }}>Welcome back, {profile.name || 'Farmer'}</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.75rem 1.5rem',
              borderBottom: activeTab === tab.id ? '2px solid var(--brand)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--brand)' : 'var(--text-muted)',
              fontWeight: 600,
              background: 'none',
              border: activeTab === tab.id ? undefined : 'none',
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gap: '2rem' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: 'var(--brand)' }}>Weekly Sales Performance</h3>
            </div>
            <SalesChart orders={orders} />
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--brand)' }}>Quick Stats</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
              <div style={{ padding: '1.5rem', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#166534' }}>{products.length}</div>
                <div style={{ color: '#15803d', fontWeight: 600 }}>Active Products</div>
              </div>
              <div style={{ padding: '1.5rem', background: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e40af' }}>{orders.length}</div>
                <div style={{ color: '#1d4ed8', fontWeight: 600 }}>Total Orders</div>
              </div>
              <div style={{ padding: '1.5rem', background: '#fff7ed', borderRadius: '12px', border: '1px solid #fed7aa' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#9a3412' }}>₹ {orders.reduce((acc, o) => acc + (o.total || 0), 0)}</div>
                <div style={{ color: '#c2410c', fontWeight: 600 }}>Total Revenue</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h3>Add New Product</h3>
            <form onSubmit={handleSubmit} className="card" style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
              <input
                placeholder="Product Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px' }}
              />
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px' }}
              >
                <option value="">Select Category</option>
                <option value="Leafy Greens">Leafy Greens</option>
                <option value="Roots & Tubers">Roots & Tubers</option>
                <option value="Fruits">Fruits</option>
                <option value="Exotic">Exotic</option>
                <option value="Flowers">Flowers</option>
              </select>
              <div>
                <label>Certifications</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <select
                    value={form.certificationType}
                    onChange={(e) => setForm({ ...form, certificationType: e.target.value })}
                  >
                    <option value="">Select Certification</option>
                    <option value="AGMARK">AGMARK</option>
                    <option value="FPO">FPO</option>
                    <option value="Jaivik Bharat">Jaivik Bharat</option>
                    <option value="PGS-India">PGS-India</option>
                    <option value="Other">Other</option>
                  </select>
                  {form.certificationType === 'Other' && (
                    <input
                      type="text"
                      placeholder="Enter certification name"
                      value={form.customCertification}
                      onChange={(e) => setForm({ ...form, customCertification: e.target.value })}
                    />
                  )}
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      const cert = form.certificationType === 'Other' ? form.customCertification : form.certificationType;
                      if (cert && !form.certificationTags?.includes(cert)) {
                        setForm({
                          ...form,
                          certificationTags: [...(form.certificationTags || []), cert],
                          certificationType: '',
                          customCertification: ''
                        });
                      }
                    }}
                  >
                    Add
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {form.certificationTags?.map((tag) => (
                    <span key={tag} style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      {tag}
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, certificationTags: form.certificationTags.filter(t => t !== tag) })}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#0369a1', fontWeight: 'bold' }}
                      >×</button>
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input
                  type="number"
                  placeholder="Price"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                  style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px' }}
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  required
                  style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Certification (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCertImage(e.target.files[0])}
                  style={{ width: '100%' }}
                />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Upload a certificate to get the "Certified" badge.</p>
              </div>
              <button type="submit" className="btn-primary">Publish Product</button>
            </form>
          </div>

          <div>
            <h3>Your Inventory</h3>
            <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
              {products.map(p => (
                <div key={p._id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', background: '#f1f5f9' }}>
                      <img src={getImageUrl(p.imageUrl)} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{currency(p.price)} • Stock: {p.stock}</div>
                      <div style={{ fontSize: '0.8rem', color: p.approvals?.status === 'approved' ? 'green' : 'orange' }}>
                        Status: {p.approvals?.status}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => {
                        const qty = prompt('How much stock to add?', '1');
                        if (qty && !isNaN(qty) && Number(qty) > 0) {
                          client.patch(`/api/farmer/products/${p._id}/inventory`, { addedStock: Number(qty) }).then(load);
                        }
                      }}
                      className="btn-secondary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                    >
                      + Stock
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this product?')) {
                          client.delete(`/api/farmer/products/${p._id}`).then(load).catch(() => alert('Failed to delete product'));
                        }
                      }}
                      className="btn-secondary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', color: '#ef4444', borderColor: '#fca5a5', background: '#fef2f2' }}
                    >
                      Delete
                    </button>
                    {p.approvals?.status === 'rejected' && (
                      <button
                        onClick={() => {
                          if (window.confirm('Resubmit this product for approval?')) {
                            client.post(`/api/products/${p._id}/resubmit`).then(load).catch(() => alert('Failed to resubmit'));
                          }
                        }}
                        className="btn-primary"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', background: '#f59e0b', borderColor: '#d97706' }}
                      >
                        Resubmit
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {products.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No products yet.</p>}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
