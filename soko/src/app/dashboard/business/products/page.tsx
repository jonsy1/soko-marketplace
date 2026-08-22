'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

function formatTZS(n: number) {
  return 'TZS ' + Math.round(n).toLocaleString('en-US');
}

export default function ManageProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    fetch('/api/products?mine=1')
      .then((r) => r.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }

  useEffect(load, []);

  async function toggleActive(p: any) {
    await fetch(`/api/products/${p.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !p.active }),
    });
    load();
  }

  async function remove(p: any) {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    await fetch(`/api/products/${p.id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">My Products</h1>
        <Link href="/dashboard/business/products/new" className="btn btn-primary">
          + Add product
        </Link>
      </div>

      {loading ? (
        <p className="text-night/50 text-sm">Loading…</p>
      ) : products.length === 0 ? (
        <p className="text-night/50 text-sm">You haven&apos;t listed any products yet.</p>
      ) : (
        <div className="card divide-y divide-night/10">
          {products.map((p) => (
            <div key={p.id} className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-card bg-market-100 flex items-center justify-center overflow-hidden shrink-0">
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-market-600 font-bold">{p.name[0]?.toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{p.name}</p>
                <p className="text-sm text-night/50">
                  {formatTZS(p.price)} · {p.quantity} in stock
                </p>
              </div>
              <span
                className={`badge ${p.active ? 'bg-teal-50 text-teal-600' : 'bg-night/10 text-night/50'}`}
              >
                {p.active ? 'Live' : 'Hidden'}
              </span>
              <div className="flex gap-2">
                <Link href={`/dashboard/business/products/${p.id}/edit`} className="btn btn-outline text-xs">
                  Edit
                </Link>
                <button onClick={() => toggleActive(p)} className="btn btn-outline text-xs">
                  {p.active ? 'Hide' : 'Unhide'}
                </button>
                <button onClick={() => remove(p)} className="btn btn-outline !text-clay !border-clay/30 text-xs">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
