'use client';

import { useEffect, useState } from 'react';

function formatTZS(n: number) {
  return 'TZS ' + Math.round(n).toLocaleString('en-US');
}

const STATUS_FLOW = ['NEW', 'CONFIRMED', 'PROCESSING', 'READY', 'DELIVERED', 'CANCELLED'];

const STATUS_STYLE: Record<string, string> = {
  NEW: 'bg-market-100 text-market-600',
  CONFIRMED: 'bg-teal-50 text-teal-600',
  PROCESSING: 'bg-teal-50 text-teal-600',
  READY: 'bg-teal-50 text-teal-600',
  DELIVERED: 'bg-teal-500/10 text-teal-600',
  CANCELLED: 'bg-clay/10 text-clay',
};

export default function BusinessOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  function load() {
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }

  useEffect(load, []);

  async function updateStatus(orderId: string, status: string) {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load();
  }

  const filtered = filter === 'ALL' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold mb-6">Orders</h1>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {['ALL', ...STATUS_FLOW].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`btn text-xs px-3 py-1.5 whitespace-nowrap ${
              filter === s ? 'btn-secondary' : 'btn-outline'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-night/50 text-sm">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-night/50 text-sm">No orders here.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => (
            <div key={o.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{o.customer?.name}</p>
                  <p className="text-sm text-night/50">
                    📞 {o.customer?.phone || 'no phone on file'} · {new Date(o.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm mt-2">
                    {o.items.map((i: any) => `${i.quantity}× ${i.product.name}`).join(', ')}
                  </p>
                  {o.note && <p className="text-sm text-night/50 mt-1">Note: {o.note}</p>}
                  <p className="text-xs text-night/40 mt-1">
                    Delivery: {o.deliveryOption.replaceAll('_', ' ').toLowerCase()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatTZS(o.totalPrice)}</p>
                  <span className={`badge ${STATUS_STYLE[o.status]}`}>{o.status}</span>
                </div>
              </div>
              {o.status !== 'DELIVERED' && o.status !== 'CANCELLED' && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {STATUS_FLOW.filter((s) => s !== o.status).map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(o.id, s)}
                      className="btn btn-outline text-xs"
                    >
                      Mark {s.toLowerCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
