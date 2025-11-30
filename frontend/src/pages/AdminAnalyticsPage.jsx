// src/pages/AdminAnalyticsPage.jsx
import { useEffect, useState } from 'react';
import client from '../api/client.js';

const grafanaUrl = import.meta.env.VITE_GRAFANA_DASHBOARD_URL || 'http://localhost:3000/d/greenharvest/overview?orgId=1&kiosk';

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    client.get('/api/admin/stats').then((res) => setStats(res.data));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Platform analytics</h2>
        <p className="text-sm text-gray-600">Watch adoption, supply and fulfillment KPIs.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <strong>Total users</strong>
          <div>{stats?.totalUsers ?? '—'}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <strong>Active users</strong>
          <div>{stats?.activeUsers ?? '—'}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <strong>Approved products</strong>
          <div>{stats?.approvedProducts ?? '—'}</div>
        </div>
      </div>

      <div className="bg-white rounded shadow p-4">
        <iframe title="Grafana overview" src={grafanaUrl} className="w-full h-96" loading="lazy" />
      </div>
    </div>
  );
}

