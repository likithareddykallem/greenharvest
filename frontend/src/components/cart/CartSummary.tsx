"use client";

import { useEffect, useMemo, useState } from 'react';
import { paymentGateways } from '../../lib/data';
import { apiFetch } from '../../lib/api-client';
import type { Product } from '../../lib/types';

type CartItem = {
  id: string;
  name: string;
  unit?: string;
  price?: number;
  quantity: number;
};

const mapProductsToCartItems = (products: Product[]): CartItem[] =>
  products.slice(0, 2).map((product) => ({
    id: product._id,
    name: product.name,
    unit: product.price?.unit || 'unit',
    price: product.price?.amount || 0,
    quantity: 1
  }));

export default function CartSummary() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [gateway, setGateway] = useState(paymentGateways[0].id);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await apiFetch<Product[]>('/products?limit=5');
        if (!active) return;
        setItems(mapProductsToCartItems(response.data));
      } catch (error) {
        console.warn('Failed to load cart preview', error);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
    const logistics = subtotal * 0.08;
    const total = subtotal + logistics;
    return { subtotal, logistics, total };
  }, [items]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4 rounded-3xl border border-stone-200 bg-white/90 p-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Secure cart</p>
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-4 text-sm text-stone-600">
              <div>
                <p className="font-semibold text-stone-900">{item.name}</p>
                <p>
                  {item.price !== undefined ? `$${item.price.toFixed(2)}` : 'Contact sales'} / {item.unit}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="size-8 rounded-full border border-stone-300 text-lg"
                  onClick={() =>
                    setItems((prev) =>
                      prev.map((entry) =>
                        entry.id === item.id ? { ...entry, quantity: Math.max(1, entry.quantity - 1) } : entry
                      )
                    )
                  }
                  type="button"
                >
                  -
                </button>
                <span className="w-8 text-center text-base font-semibold">{item.quantity}</span>
                <button
                  className="size-8 rounded-full border border-stone-300 text-lg"
                  onClick={() =>
                    setItems((prev) =>
                      prev.map((entry) => (entry.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry))
                    )
                  }
                  type="button"
                >
                  +
                </button>
              </div>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="w-full rounded-full border border-stone-200 py-2 text-sm font-semibold text-stone-600"
          onClick={() =>
            setItems((prev) => [
              ...prev,
              {
                id: `custom-${prev.length + 1}`,
                name: 'Seasonal add-on',
                unit: 'case',
                price: 18,
                quantity: 1
              }
            ])
          }
        >
          + Add product
        </button>
      </div>
      <div className="space-y-4 rounded-3xl border border-stone-200 bg-white/90 p-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Checkout</p>
        <div className="space-y-3 text-sm text-stone-600">
          <p className="flex items-center justify-between">
            Subtotal <span className="font-semibold text-stone-900">${totals.subtotal.toFixed(2)}</span>
          </p>
          <p className="flex items-center justify-between">
            Cold-chain logistics <span className="font-semibold text-stone-900">${totals.logistics.toFixed(2)}</span>
          </p>
          <p className="flex items-center justify-between text-base font-semibold text-stone-900">
            Total <span>${totals.total.toFixed(2)}</span>
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Payment gateway</p>
          <div className="mt-3 space-y-2">
            {paymentGateways.map((option) => (
              <label
                key={option.id}
                className="flex flex-col gap-1 rounded-2xl border border-stone-200 px-4 py-3 text-sm text-stone-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="gateway"
                      checked={gateway === option.id}
                      onChange={() => setGateway(option.id)}
                    />
                    <span className="font-semibold text-stone-900">{option.label}</span>
                  </div>
                  <span className="text-xs text-green-600">{option.status}</span>
                </div>
                <p className="text-xs text-stone-500">{option.features.join(' • ')}</p>
              </label>
            ))}
          </div>
        </div>
        <button className="w-full rounded-full bg-brand-primary px-4 py-3 text-sm font-semibold text-white">
          Place secure order
        </button>
      </div>
    </div>
  );
}


