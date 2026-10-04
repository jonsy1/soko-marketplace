'use client';

import { useEffect, useState } from 'react';

interface PromoProduct {
  id: string;
  name: string;
  price: number;
  boostedUntil: string | null;
  featuredUntil: string | null;
  business: { name: string } | null;
}

function isActive(d: string | null) {
  return !!d && new Date(d).getTime() > Date.now();
}

function formatDate(d: string) {
  return new Date(d).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminPromotionsPage() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<PromoProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  async function load(q: string) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/promotions?q=' + encodeURIComponent(q));
      const text = await res.text();
      const data = JSON.parse(text);
      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
        setProducts([]);
      } else {
        setProducts(data);
      }
    } catch {
      setError('Could not load products.');
    }
    setSearched(q.trim().length > 0);
    setLoading(false);
  }

  useEffect(() => {
    load('');
  }, []);

  async function act(productId: string, action: string) {
    setBusyId(productId);
    setError('');
    try {
      const res = await fetch('/api/admin/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, action }),
      });
      const text = await res.text();
      const data = JSON.parse(text);
      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
      } else {
        setProducts((prev) => prev.map((p) => (p.id === productId ? data : p)));
      }
    } catch {
      setError('Could not update the product.');
    }
    setBusyId(null);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold mb-2">Promotions</h1>
      <p className="text-night/50 text-sm mb-6">
        Activate Boost (3 days) or Featured (7 days) for a product after the seller has paid.
      </p>

      <div className="flex gap-2 mb-6">
        <input
          className="input flex-1"
          placeholder="Search product by name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') load(query);
          }}
        />
        <button type="button" className="btn btn-primary" onClick={() => load(query)}>
          Search
        </button>
      </div>

      {error && <p className="text-clay-500 text-sm mb-4">{error}</p>}

      {loading && <p className="text-night/50 text-sm">Loading...</p>}

      {!loading && products.length === 0 && !error && (
        <p className="text-night/50 text-sm">
          {searched ? 'No products found.' : 'No active promotions right now. Search for a product to promote it.'}
        </p>
      )}

      <div className="space-y-3">
        {products.map((p) => {
          const boosted = isActive(p.boostedUntil);
          const featured = isActive(p.featuredUntil);
          const busy = busyId === p.id;
          return (
            <div key={p.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                <div>
                  <p className="font-semibold text-night">{p.name}</p>
                  <p className="text-xs text-night/50">
                    {p.business ? p.business.name : 'Unknown shop'} - TZS {Number(p.price).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {boosted && p.boostedUntil && (
                    <span className="badge bg-market-100 text-market-600">
                      Boost until {formatDate(p.boostedUntil)}
                    </span>
                  )}
                  {featured && p.featuredUntil && (
                    <span className="badge bg-teal-100 text-teal-600">
                      Featured until {formatDate(p.featuredUntil)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button type="button" disabled={busy} className="btn btn-primary" onClick={() => act(p.id, 'boost')}>
                  Boost 3 days
                </button>
                <button type="button" disabled={busy} className="btn btn-secondary" onClick={() => act(p.id, 'featured')}>
                  Featured 7 days
                </button>
                {boosted && (
                  <button type="button" disabled={busy} className="btn btn-outline" onClick={() => act(p.id, 'remove-boost')}>
                    Remove Boost
                  </button>
                )}
                {featured && (
                  <button type="button" disabled={busy} className="btn btn-outline" onClick={() => act(p.id, 'remove-featured')}>
                    Remove Featured
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}