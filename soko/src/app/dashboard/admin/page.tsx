'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

function formatTZS(n: number) {
  return 'TZS ' + Math.round(n).toLocaleString('en-US');
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(setStats);
  }, []);

  if (!stats) return <div className="max-w-6xl mx-auto px-4 py-10 text-night/50">Loading…</div>;

  const cards = [
    { label: 'Registered businesses', value: stats.businesses },
    { label: 'Products listed', value: stats.products },
    { label: 'Total orders', value: stats.orders },
    { label: 'Customers', value: stats.customers },
    { label: 'Gross order value', value: formatTZS(stats.revenue) },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold mb-6">Platform overview</h1>

      {stats.pendingBusinesses > 0 && (
        <div className="card p-4 mb-6 bg-market-50 border-market-400/40 flex items-center justify-between">
          <p className="text-sm">
            <strong>{stats.pendingBusinesses}</strong> business
            {stats.pendingBusinesses === 1 ? '' : 'es'} waiting for review.
          </p>
          <Link href="/dashboard/admin/businesses" className="btn btn-secondary text-xs">
            Review now
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-4">
            <p className="text-xs text-night/50 uppercase font-semibold">{c.label}</p>
            <p className="font-display text-xl font-bold mt-1">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
