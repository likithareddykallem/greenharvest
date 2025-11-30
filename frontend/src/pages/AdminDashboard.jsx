import { useEffect, useState, useRef } from 'react';
import client from '../api/client.js';
import Chart from 'chart.js/auto';

const PlatformGrowthChart = ({ stats }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!stats || !canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const ctx = canvasRef.current.getContext('2d');
    const labels = stats.ordersByStatus?.map(s => s._id) || [];
    const data = stats.ordersByStatus?.map(s => s.count) || [];

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Orders by Status',
          data: data,
          backgroundColor: 'rgba(16, 185, 129, 0.5)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: { display: true, text: 'Order Distribution' }
        },
        scales: {
          y: { beginAtZero: true, ticks: { precision: 0 } }
        }
      }
    });

    return () => chartRef.current?.destroy();
  }, [stats]);

  return <div style={{ height: 300, width: '100%' }}><canvas ref={canvasRef} /></div>;
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [stats, setStats] = useState(null);

  const load = () => {
    client.get('/api/admin/users').then((r) => setUsers(r.data || []));
    client.get('/api/admin/stats').then((r) => setStats(r.data || null));
    client.get('/api/products', { params: { limit: 50 } }).then((r) => {
      setPendingProducts((r.data?.items || []).filter((i) => i.approvals?.status === 'pending'));
    });
  };

  useEffect(() => { load(); }, []);

  const approveProduct = (id) => client.post(`/api/products/${id}/approve`, { status: 'approved' }).then(load);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'products', label: 'Pending Products' },
    { id: 'users', label: 'Users' },
  ];

  return (
    <div className="site-wrap">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--brand)' }}>Admin Dashboard</h2>
        <p style={{ color: 'var(--text-muted)' }}>Platform overview and management.</p>
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

      {activeTab === 'overview' && stats && (
        <div style={{ display: 'grid', gap: '2rem' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--brand)' }}>Platform Stats</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
              <div style={{ padding: '1.5rem', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#166534' }}>{stats.totalUsers}</div>
                <div style={{ color: '#15803d', fontWeight: 600 }}>Total Users</div>
              </div>
              <div style={{ padding: '1.5rem', background: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e40af' }}>{stats.totalProducts}</div>
                <div style={{ color: '#1d4ed8', fontWeight: 600 }}>Total Products</div>
              </div>
              <div style={{ padding: '1.5rem', background: '#fff7ed', borderRadius: '12px', border: '1px solid #fed7aa' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#9a3412' }}>{stats.pendingProducts}</div>
                <div style={{ color: '#c2410c', fontWeight: 600 }}>Pending Approvals</div>
              </div>
            </div>
          </div>
          <div className="card" style={{ padding: '2rem' }}>
            <PlatformGrowthChart stats={stats} />
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div>
          <h3 style={{ marginBottom: '1.5rem' }}>Pending Approvals</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {pendingProducts.map((p) => (
              <div key={p._id} className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ width: 80, height: 80, borderRadius: '12px', overflow: 'hidden', background: '#f1f5f9', flexShrink: 0, border: '1px solid var(--border)' }}>
                  <img
                    src={p.imageUrl || '/images/placeholder-veg.jpg'}
                    alt={p.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--brand)' }}>{p.name}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Submitted by <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{p.farmer?.name}</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{p.description}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => approveProduct(p._id)} className="btn-primary" style={{ padding: '0.5rem 1.5rem' }}>Approve</button>
                </div>
              </div>
            ))}
            {pendingProducts.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No pending products.</p>}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <h3>All Users</h3>
          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            {users.map((u) => (
              <div key={u._id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{u.name}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{u.email}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '999px',
                    background: u.role === 'admin' ? '#fee2e2' : u.role === 'farmer' ? '#dcfce7' : '#f3f4f6',
                    color: u.role === 'admin' ? '#991b1b' : u.role === 'farmer' ? '#166534' : '#374151',
                    fontSize: '0.8rem',
                    fontWeight: 500
                  }}>
                    {u.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
