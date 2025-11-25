"use client";

import { useState } from 'react';
import RealtimeStatus from '../RealtimeStatus';
import { certifications, farmerOrders, farmers } from '../../lib/data';

const farmer = farmers[0];

export default function FarmerPortalPanel() {
  const [inventory, setInventory] = useState([
    { id: 'prd-01', name: 'Heirloom Tomatoes', certification: ['USDA Organic'], quantity: 320, unit: 'kg' },
    { id: 'prd-05', name: 'Living basil', certification: ['GlobalG.A.P.'], quantity: 210, unit: 'units' }
  ]);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-emerald-100 bg-white/90 p-6 shadow-lg">
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Farmer workspace</p>
            <h1 className="text-3xl font-semibold text-stone-900">{farmer.name}</h1>
            <p className="text-sm text-stone-600">{farmer.location}</p>
          </div>
          <RealtimeStatus />
        </div>
      </section>

      <section className="section-grid">
        <form className="space-y-4 rounded-3xl border border-stone-200 bg-white/90 p-6 text-sm shadow-lg">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Profile</p>
          <label className="text-xs font-medium uppercase tracking-wide text-stone-500">
            About your farm
            <textarea defaultValue={farmer.story} rows={4} className="mt-1 w-full rounded-2xl border border-stone-200 px-3 py-2" />
          </label>
          <label className="text-xs font-medium uppercase tracking-wide text-stone-500">
            Certifications
            <select className="mt-1 w-full rounded-2xl border border-stone-200 px-3 py-2">
              {certifications.map((cert) => (
                <option key={cert}>{cert}</option>
              ))}
            </select>
          </label>
          <button className="w-full rounded-full bg-brand-primary px-4 py-2 text-white" type="button">
            Save profile
          </button>
        </form>

        <div className="space-y-4 rounded-3xl border border-stone-200 bg-white/90 p-6 text-sm shadow-lg">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Add new product</p>
          <label className="text-xs font-medium uppercase tracking-wide text-stone-500">
            Product name
            <input className="mt-1 w-full rounded-2xl border border-stone-200 px-3 py-2" placeholder="e.g. Baby rainbow carrots" />
          </label>
          <label className="text-xs font-medium uppercase tracking-wide text-stone-500">
            Certification tags
            <input className="mt-1 w-full rounded-2xl border border-stone-200 px-3 py-2" placeholder="USDA Organic, Fair-Trade" />
          </label>
          <label className="text-xs font-medium uppercase tracking-wide text-stone-500">
            Upload imagery
            <input type="file" className="mt-1 w-full rounded-2xl border border-dashed border-stone-300 px-3 py-4" />
          </label>
          <button className="w-full rounded-full border border-stone-200 px-4 py-2 text-stone-700" type="button">
            Save draft
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white/90 p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Inventory</p>
          <button
            className="text-sm font-semibold text-brand-primary"
            onClick={() =>
              setInventory((prev) => [
                ...prev,
                { id: `prd-${prev.length + 10}`, name: 'Seasonal special', certification: ['USDA Organic'], quantity: 50, unit: 'cases' }
              ])
            }
            type="button"
          >
            + Add lot
          </button>
        </div>
        <table className="mt-4 w-full text-left text-sm text-stone-600">
          <thead>
            <tr>
              <th className="py-2 text-stone-400">Product</th>
              <th className="py-2 text-stone-400">Certifications</th>
              <th className="py-2 text-stone-400">Inventory</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.id} className="border-t border-stone-100">
                <td className="py-3 font-semibold text-stone-900">{item.name}</td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-2">
                    {item.certification.map((cert) => (
                      <span key={cert} className="rounded-full bg-stone-100 px-2 py-0.5 text-xs">
                        {cert}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3">
                  {item.quantity} {item.unit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="section-grid">
        <div className="space-y-4 rounded-3xl border border-stone-200 bg-white/90 p-6 shadow-lg">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Orders</p>
          <div className="space-y-4">
            {farmerOrders.map((order) => (
              <div key={order.id} className="rounded-2xl border border-stone-100 p-4">
                <div className="flex items-center justify-between text-sm text-stone-600">
                  <p className="font-semibold text-stone-900">{order.id}</p>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-brand-primary">{order.status}</span>
                </div>
                <p className="text-sm text-stone-500">{order.buyer}</p>
                <p className="text-sm text-stone-500">
                  {order.destination} · Ship {order.expectedShip}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-stone-200 bg-white/90 p-6 shadow-lg">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Grafana analytics</p>
          <p className="mt-2 text-sm text-stone-600">
            Access personalized dashboards for conversion funnels, fulfillment SLAs, and sustainability metrics via Grafana.
          </p>
          <div className="mt-4 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-6 text-center">
            <p className="text-sm font-semibold text-stone-900">Grafana workspace</p>
            <p className="text-xs text-stone-500">datasource: postgres-prod · dashboard: farmer-performance</p>
            <button className="mt-4 rounded-full bg-brand-secondary px-4 py-2 text-sm font-semibold text-white" type="button">
              Launch Grafana
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}


