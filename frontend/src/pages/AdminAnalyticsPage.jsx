import { useEffect, useState } from 'react';
import client from '../api/client.js';

const grafanaUrl =
  import.meta.env.VITE_GRAFANA_DASHBOARD_URL ||
  'http://localhost:3000/d/greenharvest/overview?orgId=1&kiosk';

const AdminAnalyticsPage = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    client.get('/api/admin/stats').then((res) => setStats(res.data));
  }, []);

  return (
    <div className="container">
      <div className="container-header">
        <div>
          <h2 className="container-title">Platform analytics</h2>
          <p className="container-subtitle">Watch adoption, supply, and fulfillment KPIs.</p>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="card">
          <strong>Total users</strong>
          <span>{stats?.totalUsers ?? '—'}</span>
        </div>
        <div className="card">
          <strong>Active users</strong>
          <span>{stats?.activeUsers ?? '—'}</span>
        </div>
        <div className="card">
          <strong>Approved products</strong>
          <span>{stats?.approvedProducts ?? '—'}</span>
        </div>
      </div>

      <div className="grafana-embed">
        <iframe title="Grafana overview" src={grafanaUrl} loading="lazy" />
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;





