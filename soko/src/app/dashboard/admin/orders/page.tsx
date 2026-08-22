'use client';

import { useEffect, useState } from 'react';

function formatTZS(n: number) {
  return 'TZS ' + Math.round(n).toLocaleString('en-US');
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold mb-6">All orders</h1>
      {loading ? (
        <p className="text-night/50 text-sm">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="text-night/50 text-sm">No orders yet.</p>
      ) : (
        <div className="card divide-y divide-night/10">
          {orders.map((o) => (
            <div key={o.id} className="p-4 flex items-center justify-between text-sm">
              <div>
                <p className="font-semibold">
                  {o.customer?.name} → {o.business?.name}
                </p>
                <p className="text-night/50">
                  {o.items.map((i: any) => `${i.quantity}× ${i.product.name}`).join(', ')}
                </p>
                <p className="text-xs text-night/40">{new Date(o.createdAt).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatTZS(o.totalPrice)}</p>
                <span className="badge bg-market-100 text-market-600">{o.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
