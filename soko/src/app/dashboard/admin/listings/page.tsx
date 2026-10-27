'use client';

import { useEffect, useState } from 'react';

type Tab = 'PENDING' | 'APPROVED' | 'REJECTED';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function ListingCard({ item, onChanged }: { item: any; onChanged: (updated: any) => void }) {
  const [days, setDays] = useState('30');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function send(action: string) {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, action: action, days: days, reason: reason }),
      });
      const text = await res.text();
      const data = JSON.parse(text);
      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
      } else {
        onChanged(data);
      }
    } catch {
      setError('Could not update this listing.');
    }
    setBusy(false);
  }

  const expired = item.activeUntil && new Date(item.activeUntil).getTime() < Date.now();

  return (
    <div className="card p-4">
      {item.bannerUrl && (
        <div className="w-full h-32 rounded-card overflow-hidden bg-market-100 mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.bannerUrl} alt={item.name} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-night">{item.name}</p>
          <p className="text-xs text-night/50">
            {item.category}
            {item.location ? ' - ' + item.location : ''}
          </p>
        </div>
        {item.status === 'APPROVED' && item.activeUntil && (
          <span className={expired ? 'badge bg-clay-50 text-clay-600' : 'badge bg-teal-100 text-teal-600'}>
            {expired ? 'Expired ' : 'Until '}
            {formatDate(item.activeUntil)}
          </span>
        )}
      </div>

      <p className="text-sm text-night/70 mt-2 whitespace-pre-line">{item.description}</p>

      <div className="text-xs text-night/50 mt-2 space-y-0.5">
        <p>Phone: {item.phone}</p>
        {item.website && <p>Website: {item.website}</p>}
        <p>
          Owner: {item.owner ? item.owner.name : 'Unknown'}
          {item.owner && item.owner.email ? ' (' + item.owner.email + ')' : ''}
        </p>
        <p>Submitted: {formatDate(item.createdAt)}</p>
        {item.status === 'REJECTED' && item.rejectionReason && (
          <p className="text-clay-600">Reason: {item.rejectionReason}</p>
        )}
      </div>

      {error && <p className="text-clay-500 text-sm mt-2">{error}</p>}

      {item.status === 'PENDING' && (
        <div className="mt-3 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-xs text-night/60">Days to show:</label>
            <input
              type="number"
              min={1}
              max={365}
              className="input w-24"
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
            <button type="button" disabled={busy} className="btn btn-primary" onClick={() => send('approve')}>
              Approve
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              className="input flex-1 min-w-[200px]"
              placeholder="Reason for rejecting (the owner will see this)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <button type="button" disabled={busy} className="btn btn-outline" onClick={() => send('reject')}>
              Reject
            </button>
          </div>
        </div>
      )}

      {item.status === 'APPROVED' && (
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <label className="text-xs text-night/60">Add days:</label>
          <input
            type="number"
            min={1}
            max={365}
            className="input w-24"
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />
          <button type="button" disabled={busy} className="btn btn-secondary" onClick={() => send('extend')}>
            Extend
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminListingsPage() {
  const [tab, setTab] = useState<Tab>('PENDING');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load(status: Tab) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/listings?status=' + status);
      const text = await res.text();
      const data = JSON.parse(text);
      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
        setItems([]);
      } else {
        setItems(Array.isArray(data) ? data : []);
      }
    } catch {
      setError('Could not load listings.');
      setItems([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    load(tab);
  }, [tab]);

  function handleChanged(updated: any) {
    // The listing moved to another tab, so remove it from this list.
    setItems((prev) => prev.filter((p) => p.id !== updated.id || updated.status === tab));
    setItems((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'PENDING', label: 'Pending' },
    { key: 'APPROVED', label: 'Approved' },
    { key: 'REJECTED', label: 'Rejected' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold mb-2">Company listings</h1>
      <p className="text-night/50 text-sm mb-6">
        Review company ads before they appear on Soko. Approve after you have received payment.
      </p>

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={
              tab === t.key
                ? 'rounded-full text-xs px-5 py-2 bg-night text-market-50'
                : 'rounded-full text-xs px-5 py-2 bg-white border border-night/15 text-night/60'
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="text-clay-500 text-sm mb-4">{error}</p>}
      {loading && <p className="text-night/50 text-sm">Loading...</p>}

      {!loading && !error && items.length === 0 && (
        <p className="text-night/50 text-sm">No listings here yet.</p>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <ListingCard key={item.id} item={item} onChanged={handleChanged} />
        ))}
      </div>
    </div>
  );
}