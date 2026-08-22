'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const STATUS_STYLE: Record<string, string> = {
  PENDING: 'bg-market-100 text-market-600',
  VERIFIED: 'bg-teal-50 text-teal-600',
  SUSPENDED: 'bg-clay/10 text-clay',
};

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  function load() {
    fetch('/api/businesses')
      .then((r) => r.json())
      .then((data) => {
        setBusinesses(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }

  useEffect(load, []);

  async function setStatus(id: string, status: string) {
    await fetch(`/api/admin/businesses/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load();
  }

  const filtered = filter === 'ALL' ? businesses : businesses.filter((b) => b.status === filter);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold mb-6">Businesses</h1>

      <div className="flex gap-2 mb-6">
        {['ALL', 'PENDING', 'VERIFIED', 'SUSPENDED'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`btn text-xs px-3 py-1.5 ${filter === s ? 'btn-secondary' : 'btn-outline'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-night/50 text-sm">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-night/50 text-sm">No businesses here.</p>
      ) : (
        <div className="card divide-y divide-night/10">
          {filtered.map((b) => (
            <div key={b.id} className="p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <Link href={`/business/${b.slug}`} className="font-semibold hover:text-teal-600">
                  {b.name}
                </Link>
                <p className="text-sm text-night/50">
                  📍 {b.location} · 📞 {b.phone} · {b._count.products} products
                </p>
                <p className="text-xs text-night/40">
                  Owner: {b.owner.name} ({b.owner.email})
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${STATUS_STYLE[b.status]}`}>{b.status}</span>
                {b.status !== 'VERIFIED' && (
                  <button onClick={() => setStatus(b.id, 'VERIFIED')} className="btn btn-outline text-xs">
                    Verify
                  </button>
                )}
                {b.status !== 'SUSPENDED' && (
                  <button
                    onClick={() => setStatus(b.id, 'SUSPENDED')}
                    className="btn btn-outline !text-clay !border-clay/30 text-xs"
                  >
                    Suspend
                  </button>
                )}
                {b.status === 'SUSPENDED' && (
                  <button onClick={() => setStatus(b.id, 'PENDING')} className="btn btn-outline text-xs">
                    Reinstate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
