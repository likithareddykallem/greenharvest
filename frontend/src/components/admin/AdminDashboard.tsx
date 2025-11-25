import RealtimeStatus from '../RealtimeStatus';
import { farmers } from '../../lib/data';
import type { Product } from '../../lib/types';

const moderationQueue = [
  { id: 'rev-201', type: 'Review', subject: 'Chef Collective NYC', detail: 'Flagged language', status: 'Needs review' },
  { id: 'img-09', type: 'Image', subject: 'Mossy Creek Collective', detail: 'Awaiting certification proof', status: 'On hold' }
];

type Props = {
  products: Product[];
};

const certificationList = (product: Product) =>
  (product.certifications || [])
    .map((cert) => cert.type)
    .filter((value): value is string => Boolean(value));

export default function AdminDashboard({ products }: Props) {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-emerald-100 bg-white/90 p-8 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Platform control</p>
            <h1 className="text-3xl font-semibold text-stone-900">Admin dashboard</h1>
            <p className="text-sm text-stone-600">Manage users, farmers, categories, certifications, and analytics access.</p>
          </div>
          <RealtimeStatus />
        </div>
      </section>

      <section className="section-grid" id="users">
        <div className="rounded-3xl border border-stone-200 bg-white/90 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">User management</p>
            <button className="text-sm font-semibold text-brand-primary">+ Invite admin</button>
          </div>
          <ul className="mt-4 space-y-4 text-sm text-stone-600">
            {['Procurement', 'QA & Compliance', 'Support'].map((team) => (
              <li key={team} className="rounded-2xl border border-stone-100 p-4">
                <p className="font-semibold text-stone-900">{team} team</p>
                <p className="text-xs text-stone-500">SSO enforced · RBAC synced nightly</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-stone-200 bg-white/90 p-6 shadow-lg" id="moderation">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Content moderation</p>
          <div className="mt-4 space-y-3">
            {moderationQueue.map((item) => (
              <div key={item.id} className="rounded-2xl border border-stone-100 p-4 text-sm text-stone-600">
                <p className="font-semibold text-stone-900">{item.type}</p>
                <p>{item.subject}</p>
                <p className="text-xs text-stone-400">{item.detail}</p>
                <span className="mt-2 inline-block rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-600">{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white/90 p-6 shadow-lg" id="catalog">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Catalog & certifications</p>
          <button className="text-sm font-semibold text-brand-primary">+ New certification</button>
        </div>
        <table className="mt-4 w-full text-left text-sm text-stone-600">
          <thead>
            <tr>
              <th className="py-2 text-stone-400">Product</th>
              <th className="py-2 text-stone-400">Farmer</th>
              <th className="py-2 text-stone-400">Certifications</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="border-t border-stone-100">
                <td className="py-3 font-semibold text-stone-900">{product.name}</td>
                <td className="py-3">{product.farmer?.farmName || 'Unassigned'}</td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-2">
                    {certificationList(product).map((cert) => (
                      <span key={`${product._id}-${cert}`} className="rounded-full bg-stone-100 px-2 py-0.5 text-xs">
                        {cert}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="section-grid" id="analytics">
        <div className="rounded-3xl border border-stone-200 bg-white/90 p-6 shadow-lg">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Platform analytics</p>
          <p className="mt-2 text-sm text-stone-600">
            Monitor GMV, order health, and active supply via Prometheus + Grafana dashboards.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {[
              { label: 'GMV (monthly)', value: '$2.8M', delta: '+12%' },
              { label: 'Orders in SLA', value: '96%', delta: '+3%' },
              { label: 'Active farmers', value: farmers.length, delta: '+1' },
              { label: 'Certifications verified', value: '34', delta: '+4' }
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                <p className="text-xs uppercase tracking-wide text-brand-primary">{stat.label}</p>
                <p className="text-2xl font-semibold text-stone-900">{stat.value}</p>
                <p className="text-xs text-emerald-600">{stat.delta} vs last week</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-stone-200 bg-white/90 p-6 shadow-lg">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Farmer profiles</p>
          <div className="mt-4 space-y-3">
            {farmers.map((farmer) => (
              <div key={farmer.id} className="rounded-2xl border border-stone-100 p-4 text-sm text-stone-600">
                <p className="font-semibold text-stone-900">{farmer.name}</p>
                <p>{farmer.location}</p>
                <p className="text-xs text-stone-400">{farmer.certifications.join(', ')}</p>
                <button className="mt-3 text-xs font-semibold text-brand-primary">Manage profile</button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}


