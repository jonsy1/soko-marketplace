'use client';

import { useEffect, useState } from 'react';

function formatTZS(n: number) {
  return 'TZS ' + Math.round(n).toLocaleString('en-US');
}

const STATUS_STYLE: Record<string, string> = {
  NEW: 'bg-market-100 text-market-600',
  CONFIRMED: 'bg-teal-50 text-teal-600',
  PROCESSING: 'bg-teal-50 text-teal-600',
  READY: 'bg-teal-50 text-teal-600',
  DELIVERED: 'bg-teal-500/10 text-teal-600',
  CANCELLED: 'bg-clay/10 text-clay',
};

export default function BusinessAnalyticsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/business/analytics')
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) return <div className="max-w-6xl mx-auto px-4 py-16 text-night/50">Loading…</div>;
  if (data.error) return <div className="max-w-6xl mx-auto px-4 py-16">{data.error}</div>;

  const maxDayRevenue = Math.max(...data.dailyRevenue.map((d: any) => d.revenue), 1);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold mb-6">Analytics</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-4">
          <p className="text-xs text-night/50 uppercase font-semibold">Revenue (delivered)</p>
          <p className="font-display text-xl font-bold mt-1 text-teal-600">{formatTZS(data.totalRevenue)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-night/50 uppercase font-semibold">Pending revenue</p>
          <p className="font-display text-xl font-bold mt-1">{formatTZS(data.pendingRevenue)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-night/50 uppercase font-semibold">Total orders</p>
          <p className="font-display text-xl font-bold mt-1">{data.totalOrders}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-night/50 uppercase font-semibold">Followers</p>
          <p className="font-display text-xl font-bold mt-1">{data.followerCount}</p>
        </div>
      </div>

      <div className="card p-5 mb-8">
        <h2 className="font-semibold mb-4">Revenue — last 14 days</h2>
        <div className="flex items-end gap-1.5 h-32">
          {data.dailyRevenue.map((d: any) => (
            <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full group relative">
              <div
                className="w-full bg-teal-500 rounded-t hover:bg-teal-600 transition"
                style={{ height: `${Math.max((d.revenue / maxDayRevenue) * 100, d.revenue > 0 ? 4 : 0)}%` }}
                title={`${d.date}: ${formatTZS(d.revenue)} (${d.orders} orders)`}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-night/40 mt-2">
          <span>{data.dailyRevenue[0]?.date.slice(5)}</span>
          <span>{data.dailyRevenue[data.dailyRevenue.length - 1]?.date.slice(5)}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="font-semibold mb-4">Orders by status</h2>
          <div className="space-y-2">
            {Object.entries(data.statusCounts).map(([status, count]: any) => (
              <div key={status} className="flex items-center justify-between text-sm">
                <span className={`badge ${STATUS_STYLE[status]}`}>{status}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold mb-4">Top products</h2>
          {data.topProducts.length === 0 ? (
            <p className="text-night/50 text-sm">No sales yet.</p>
          ) : (
            <div className="space-y-3">
              {data.topProducts.map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-night/50 text-xs">{p.quantity} sold</p>
                  </div>
                  <span className="font-semibold text-teal-600">{formatTZS(p.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}