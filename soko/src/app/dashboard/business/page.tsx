'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

function formatTZS(n: number) {
  return 'TZS ' + Math.round(n).toLocaleString('en-US');
}

const PERIOD_LABELS: Record<string, string> = {
  day: 'Today',
  week: 'This week',
  month: 'This month',
  year: 'This year',
};

export default function BusinessDashboard() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [closing, setClosing] = useState<any>(null);
  const [closingLoading, setClosingLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;
    Promise.all([
      fetch('/api/orders').then((r) => r.json()),
      fetch('/api/products?mine=1').then((r) => r.json()),
    ])
      .then(([o, p]) => {
        setOrders(Array.isArray(o) ? o : []);
        setProducts(Array.isArray(p) ? p : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session]);

  useEffect(() => {
    setClosingLoading(true);
    fetch(`/api/business/closing?period=${period}`)
      .then((r) => r.json())
      .then((d) => {
        setClosing(d);
        setClosingLoading(false);
      })
      .catch(() => setClosingLoading(false));
  }, [period]);

  const now = new Date();
  const isWithinPeriod = (dateStr: string) => {
    const d = new Date(dateStr);
    const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    if (period === 'day') return d.toDateString() === now.toDateString();
    if (period === 'week') return diffDays <= 7;
    if (period === 'month') return diffDays <= 30;
    return diffDays <= 365;
  };

  const periodOrders = orders.filter((o) => o.status !== 'CANCELLED' && isWithinPeriod(o.createdAt));
  const lowStockProducts = products.filter((p) => (p.quantity ?? 0) <= 5 && p.active !== false);

  const greeting = () => {
    const h = now.getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Simple 14-point trend from orders (period-independent, always last 14 days) for the "performance" chart
  const trendDays = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d;
  });
  const trendRevenue = trendDays.map((d) => {
    const dayTotal = orders
      .filter((o) => o.status !== 'CANCELLED' && new Date(o.createdAt).toDateString() === d.toDateString())
      .reduce((sum, o) => sum + (o.totalPrice || o.total || 0), 0);
    return { date: d, revenue: dayTotal };
  });
  const maxTrendRevenue = Math.max(...trendRevenue.map((d) => d.revenue), 1);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-28 md:pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-night">Seller dashboard</h1>
          <p className="text-night/50 text-sm mt-0.5">
            {greeting()}, {session?.user?.name?.split(' ')[0] || 'there'} 👋
          </p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="text-sm font-semibold border border-night/15 rounded-full px-4 py-2 bg-white text-night"
        >
          {Object.entries(PERIOD_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 mb-8">
        <div className="card p-4">
          <div className="w-9 h-9 rounded-full bg-market-500 text-white flex items-center justify-center mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3v18h18" />
              <path d="M7 15l4-4 3 3 5-6" />
            </svg>
          </div>
          <p className="text-xs text-night/50 font-medium">Total sales</p>
          <p className="font-display text-lg font-bold text-night mt-0.5">
            {closingLoading ? '…' : formatTZS(closing?.revenue || 0)}
          </p>
        </div>

        <div className="card p-4">
          <div className="w-9 h-9 rounded-full bg-market-100 text-market-600 flex items-center justify-center mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 8h12l1 12H5L6 8z" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
          </div>
          <p className="text-xs text-night/50 font-medium">Orders</p>
          <p className="font-display text-lg font-bold text-night mt-0.5">{periodOrders.length}</p>
        </div>

        <div className="card p-4">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center mb-3 ${
              (closing?.profit || 0) >= 0 ? 'bg-teal-500 text-white' : 'bg-clay-500 text-white'
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="6" width="20" height="14" rx="2" />
              <path d="M2 10h20" />
              <circle cx="17" cy="15" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <p className="text-xs text-night/50 font-medium">Net earnings</p>
          <p className={`font-display text-lg font-bold mt-0.5 ${(closing?.profit || 0) >= 0 ? 'text-teal-600' : 'text-clay-600'}`}>
            {closingLoading ? '…' : formatTZS(closing?.profit || 0)}
          </p>
          <p className="text-[10px] text-night/40 mt-0.5">
            {closingLoading ? '' : (closing?.profit || 0) >= 0 ? 'Profit this period' : 'Loss this period'}
          </p>
        </div>

        <Link href="/dashboard/business/stock" className="card p-4 block hover:shadow-md transition">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-3 ${lowStockProducts.length > 0 ? 'bg-clay-500 text-white' : 'bg-market-100 text-market-600'}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 8l-9-5-9 5 9 5 9-5z" />
              <path d="M3 8v8l9 5 9-5V8" />
            </svg>
          </div>
          <p className="text-xs text-night/50 font-medium">Low stock</p>
          <p className="font-display text-lg font-bold text-night mt-0.5">{lowStockProducts.length}</p>
        </Link>
      </div>

      {closing?.hasIncompleteCostData && (
        <p className="text-xs text-night/40 -mt-5 mb-6">
          Some sales don't have a purchase cost recorded yet, so net earnings here may be understated. Add cost prices in the Stock Ledger.
        </p>
      )}

      {/* Sales performance */}
      <div className="card p-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-night">Sales performance</h2>
          <span className="text-xs text-night/40">Last 14 days</span>
        </div>
        <div className="flex items-end gap-1.5 h-32">
          {trendRevenue.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
              <div
                className="w-full bg-market-500 rounded-t hover:bg-market-600 transition"
                style={{ height: `${Math.max((d.revenue / maxTrendRevenue) * 100, d.revenue > 0 ? 4 : 0)}%` }}
                title={`${d.date.toDateString()}: ${formatTZS(d.revenue)}`}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-night/40 mt-2">
          <span>{trendRevenue[0]?.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
          <span>{trendRevenue[trendRevenue.length - 1]?.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
        </div>
      </div>

      {/* Low stock alert */}
      {lowStockProducts.length > 0 && (
        <Link
          href="/dashboard/business/stock"
          className="flex items-center gap-3 bg-clay-50 border border-clay-500/20 rounded-2xl p-4 mb-8 hover:bg-clay-50/70 transition"
        >
          <div className="w-10 h-10 rounded-full bg-clay-500 text-white flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 9v4M12 17h.01" />
              <path d="M10.3 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-clay-700 text-sm">Low stock alert</p>
            <p className="text-clay-600 text-xs">{lowStockProducts.length} products are running low on stock.</p>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-clay-500 shrink-0">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>
      )}

      {/* Recent orders */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-night">Recent orders</h2>
        <Link href="/dashboard/business/orders" className="text-sm text-market-500 font-semibold">View all →</Link>
      </div>

      {loading ? (
        <p className="text-night/50 text-sm">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="text-night/50 text-sm">No orders yet.</p>
      ) : (
        <div className="card divide-y divide-night/10 mb-8">
          {orders.slice(0, 5).map((o) => (
            <div key={o.id} className="p-4 flex items-center justify-between text-sm">
              <div>
                <p className="font-semibold text-night">{o.customer?.name || 'Customer'}</p>
                <p className="text-night/50">
                  {o.items?.map((i: any) => `${i.quantity}× ${i.product?.name || 'Product'}`).join(', ') || 'No items'}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-night">{formatTZS(o.totalPrice || o.total || 0)}</p>
                <span className={`badge ${
                  o.status === 'NEW' ? 'bg-market-100 text-market-600' :
                  o.status === 'CANCELLED' ? 'bg-clay-50 text-clay-600' :
                  'bg-teal-50 text-teal-600'
                }`}>{o.status || 'NEW'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3">
        <Link href="/dashboard/business/products/new" className="btn btn-primary flex items-center justify-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add product
        </Link>
        <Link href="/dashboard/business/orders" className="btn border border-night/15 bg-white hover:bg-night/5 flex items-center justify-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 3h9l3 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
          </svg>
          Orders
        </Link>
        <Link href="/dashboard/business/analytics" className="btn border border-night/15 bg-white hover:bg-night/5 flex items-center justify-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3v18h18" />
            <path d="M7 15l4-4 3 3 5-6" />
          </svg>
          Analytics
        </Link>
      </div>
    </div>
  );
}