'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

function formatTZS(n: number) {
  return 'TZS ' + Math.round(n).toLocaleString('en-US');
}

export default function BusinessDashboard() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;
    fetch('/api/orders')
      .then((r) => r.json())
      .then((o) => {
        setOrders(Array.isArray(o) ? o : []);
        setLoading(false);
      });
  }, [session]);

  const today = new Date().toDateString();
  const salesToday = orders
    .filter((o) => new Date(o.createdAt).toDateString() === today && o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.totalPrice, 0);
  const newOrders = orders.filter((o) => o.status === 'NEW').length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">My Store</h1>
        <div className="flex gap-2">
          <Link href="/dashboard/business/products/new" className="btn btn-primary">
            + Add product
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-4">
          <p className="text-xs text-night/50 uppercase font-semibold">Sales today</p>
          <p className="font-display text-xl font-bold mt-1">{formatTZS(salesToday)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-night/50 uppercase font-semibold">New orders</p>
          <p className="font-display text-xl font-bold mt-1">{newOrders}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-night/50 uppercase font-semibold">Total orders</p>
          <p className="font-display text-xl font-bold mt-1">{orders.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-night/50 uppercase font-semibold">Products</p>
          <p className="font-display text-xl font-bold mt-1">
            <Link href="/dashboard/business/products" className="text-teal-600">
              Manage →
            </Link>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Recent orders</h2>
        <Link href="/dashboard/business/orders" className="text-sm text-teal-600 font-semibold">
          View all →
        </Link>
      </div>

      {loading ? (
        <p className="text-night/50 text-sm">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="text-night/50 text-sm">No orders yet.</p>
      ) : (
        <div className="card divide-y divide-night/10">
          {orders.slice(0, 5).map((o) => (
            <div key={o.id} className="p-4 flex items-center justify-between text-sm">
              <div>
                <p className="font-semibold">{o.customer?.name}</p>
                <p className="text-night/50">
                  {o.items.map((i: any) => `${i.quantity}× ${i.product.name}`).join(', ')}
                </p>
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
