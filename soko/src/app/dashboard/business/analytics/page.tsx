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

      {/* Store health */}
      <div className="card p-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Store health</h2>
          <span className={`font-display text-lg font-bold ${data.storeHealth.percent >= 80 ? 'text-teal-600' : 'text-clay'}`}>
            {data.storeHealth.percent}%
          </span>
        </div>
        <div className="w-full bg-night/5 rounded-full h-2 mb-4">
          <div
            className={`h-2 rounded-full ${data.storeHealth.percent >= 80 ? 'bg-teal-500' : 'bg-clay'}`}
            style={{ width: `${data.storeHealth.percent}%` }}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {data.storeHealth.checks.map((c: any) => (
            <div key={c.key} className="flex items-center gap-2 text-sm">
              <span className={c.done ? 'text-teal-600' : 'text-night/30'}>{c.done ? '✓' : '○'}</span>
              <span className={c.done ? 'text-night' : 'text-night/50'}>{c.label}</span>
            </div>
          ))}
        </div>
        {data.storeHealth.percent < 100 && (
          <Link href="/dashboard/business/settings" className="btn btn-outline text-xs mt-4 inline-block">
            Complete store
          </Link>
        )}
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
                <p className="text-xs text-night/50 uppercase font-semibold">
                  {closing.hasIncompleteCostData ? 'Estimated profit' : 'Profit'}
                </p>
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

      <div className="grid md:grid-cols-2 gap-6 mb-8">
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
                  <div className="text-right">
                    <p className="font-semibold text-teal-600">{formatTZS(p.revenue)}</p>
                    <p className="text-night/40 text-[11px]">
                      {p.hasFullCostData ? 'profit' : 'est. profit'} {formatTZS(p.profit)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reviews & reputation */}
      <div className="card p-5 mb-8">
        <h2 className="font-semibold mb-4">Reviews & reputation</h2>
        {data.reviewSummary.count === 0 ? (
          <p className="text-night/50 text-sm">You haven't received any reviews yet.</p>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <span className="font-display text-2xl font-bold text-night">
                {data.reviewSummary.average.toFixed(1)} ★
              </span>
              <span className="text-night/50 text-sm">
                {data.reviewSummary.count} review{data.reviewSummary.count === 1 ? '' : 's'}
              </span>
            </div>
            <div className="space-y-3">
              {data.reviewSummary.recent.map((r: any) => (
                <div key={r.id} className="border-t border-night/5 pt-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{r.customer?.name || 'Soko Customer'}</p>
                    <span className="text-xs text-market-600 font-semibold">{r.rating} ★</span>
                  </div>
                  {r.comment && <p className="text-xs text-night/60 mt-0.5">{r.comment}</p>}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Customer insights */}
      <div className="card p-5 mb-8">
        <h2 className="font-semibold mb-4">Customer insights</h2>
        {data.customerInsights.totalCustomers === 0 ? (
          <p className="text-night/50 text-sm">Customers will appear here after your first completed order.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-night/50 uppercase font-semibold">Customers</p>
              <p className="font-display text-lg font-bold mt-1">{data.customerInsights.totalCustomers}</p>
            </div>
            <div>
              <p className="text-xs text-night/50 uppercase font-semibold">New (30 days)</p>
              <p className="font-display text-lg font-bold mt-1">{data.customerInsights.newCustomersThisMonth}</p>
            </div>
            <div>
              <p className="text-xs text-night/50 uppercase font-semibold">Returning</p>
              <p className="font-display text-lg font-bold mt-1">
                {data.customerInsights.returningCustomers}
                <span className="text-xs text-night/40 font-normal ml-1">
                  ({data.customerInsights.repeatPurchaseRate}%)
                </span>
              </p>
            </div>
            <div>
              <p className="text-xs text-night/50 uppercase font-semibold">Avg. order value</p>
              <p className="font-display text-lg font-bold mt-1">{formatTZS(data.customerInsights.averageOrderValue)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Low stock intelligence */}
      {data.lowStock.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold mb-4">Low stock</h2>
          <div className="space-y-3">
            {data.lowStock.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between text-sm border-b border-night/5 last:border-0 pb-3 last:pb-0">
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-night/50 text-xs">{p.quantity} units left</p>
                </div>
                <div className="text-right text-xs">
                  {p.estimatedDaysRemaining !== null ? (
                    <>
                      <p className="text-night/50">{p.avgDailySales} sold/day</p>
                      <p className={`font-semibold ${p.estimatedDaysRemaining <= 3 ? 'text-clay' : 'text-night'}`}>
                        ~{p.estimatedDaysRemaining} day{p.estimatedDaysRemaining === 1 ? '' : 's'} remaining
                      </p>
                    </>
                  ) : (
                    <p className="text-night/40">Not enough sales history to estimate.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Link href="/dashboard/business/stock" className="btn btn-outline text-xs mt-4 inline-block">
            View stock
          </Link>
        </div>
      )}
    </div>
  );
}