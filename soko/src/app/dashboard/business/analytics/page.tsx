
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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

const PERIOD_LABELS: Record<string, string> = {
  day: 'Today',
  week: 'This week',
  month: 'This month',
  year: 'This year',
};

export default function BusinessAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [period, setPeriod] = useState('day');
  const [closing, setClosing] = useState<any>(null);
  const [closingLoading, setClosingLoading] = useState(true);

  useEffect(() => {
    fetch('/api/business/analytics')
      .then((r) => r.json())
      .then(setData);
  }, []);

  useEffect(() => {
    setClosingLoading(true);
    fetch(`/api/business/closing?period=${period}`)
      .then((r) => r.json())
      .then((d) => {
        setClosing(d);
        setClosingLoading(false);
      });
  }, [period]);

  if (!data) return <div className="max-w-6xl mx-auto px-4 py-16 text-night/50">Loading…</div>;
  if (data.error) return <div className="max-w-6xl mx-auto px-4 py-16">{data.error}</div>;

  const maxDayRevenue = Math.max(...data.dailyRevenue.map((d: any) => d.revenue), 1);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Analytics</h1>
        <Link href="/dashboard/business/stock" className="btn border border-night/15 bg-white hover:bg-night/5">
          📒 Stock ledger
        </Link>
      </div>

      {/* Sales closing */}
      <div className="card p-5 mb-8">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="font-semibold">Sales closing</h2>
          <div className="flex gap-1">
            {Object.keys(PERIOD_LABELS).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold transition ${
                  period === p ? 'bg-night text-white' : 'bg-night/5 text-night/60 hover:bg-night/10'
                }`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>
        {closingLoading ? (
          <p className="text-night/50 text-sm">Loading…</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-night/50 uppercase font-semibold">Revenue</p>
                <p className="font-display text-lg font-bold mt-1">{formatTZS(closing.revenue)}</p>
              </div>
              <div>
                <p className="text-xs text-night/50 uppercase font-semibold">Cost</p>
                <p className="font-display text-lg font-bold mt-1">{formatTZS(closing.cost)}</p>
              </div>
              <div>
                <p className="text-xs text-night/50 uppercase font-semibold">Profit</p>
                <p className={`font-display text-lg font-bold mt-1 ${closing.profit >= 0 ? 'text-teal-600' : 'text-clay'}`}>
                  {formatTZS(closing.profit)}
                </p>
              </div>
              <div>
                <p className="text-xs text-night/50 uppercase font-semibold">Units sold</p>
                <p className="font-display text-lg font-bold mt-1">{closing.unitsSold}</p>
              </div>
            </div>
            {closing.hasIncompleteCostData && (
              <p className="text-xs text-night/40 mt-3">
                Some sales don't have a purchase cost recorded yet, so profit here may be understated. Add cost prices in the Stock Ledger.
              </p>
            )}
          </>
        )}
      </div>

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