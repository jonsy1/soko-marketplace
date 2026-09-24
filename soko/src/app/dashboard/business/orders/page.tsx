'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatOrderNumber } from '@/lib/pricing';

function formatTZS(n: number) {
  return 'TZS ' + Math.round(n).toLocaleString('en-US');
}

const STATUS_TABS = ['ALL', 'NEW', 'CONFIRMED', 'PROCESSING', 'READY', 'DELIVERED', 'CANCELLED'];

const STATUS_STYLE: Record<string, string> = {
  NEW: 'bg-market-100 text-market-600',
  CONFIRMED: 'bg-teal-50 text-teal-600',
  PROCESSING: 'bg-teal-50 text-teal-600',
  READY: 'bg-teal-50 text-teal-600',
  DELIVERED: 'bg-teal-500/10 text-teal-600',
  CANCELLED: 'bg-clay/10 text-clay',
};

const PAYMENT_STYLE: Record<string, string> = {
  PENDING: 'bg-market-100 text-market-600',
  PAID: 'bg-teal-500/10 text-teal-600',
  FAILED: 'bg-clay/10 text-clay',
  REFUNDED: 'bg-clay/10 text-clay',
  CASH_ON_DELIVERY: 'bg-night/5 text-night/60',
};

// The single correct next action(s) for a seller, given the order's current status.
const NEXT_ACTIONS: Record<string, { label: string; status: string }[]> = {
  NEW: [
    { label: 'Confirm order', status: 'CONFIRMED' },
    { label: 'Reject', status: 'CANCELLED' },
  ],
  CONFIRMED: [{ label: 'Start processing', status: 'PROCESSING' }],
  PROCESSING: [{ label: 'Mark as ready', status: 'READY' }],
  READY: [{ label: 'Mark as delivered', status: 'DELIVERED' }],
  DELIVERED: [],
  CANCELLED: [],
};

const CANCEL_REASONS = [
  'Product out of stock',
  'Customer unreachable',
  'Pricing error',
  'Delivery problem',
  'Other',
];

export default function BusinessOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);

  function loadCounts() {
    fetch('/api/orders?counts=1')
      .then((r) => r.json())
      .then(setCounts)
      .catch(() => {});
  }

  function loadOrders() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter !== 'ALL') params.set('status', filter);
    if (search.trim()) {
      // A search that looks like an order number (#SK-..., digits) searches
      // orderNumber; otherwise it searches customer name and product name.
      const digits = search.replace(/\D/g, '');
      if (search.toUpperCase().includes('SK') || (digits && digits === search.trim())) {
        params.set('orderNumber', search);
      } else {
        params.set('customer', search);
      }
    }
    fetch(`/api/orders?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }

  useEffect(loadCounts, []);
  useEffect(loadOrders, [filter, search]);

  async function updateStatus(orderId: string, status: string, cancellationReason?: string) {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, cancellationReason }),
    });
    loadOrders();
    loadCounts();
  }

  function confirmCancel() {
    if (!cancelTarget) return;
    updateStatus(cancelTarget, 'CANCELLED', cancelReason);
    setCancelTarget(null);
    setCancelReason(CANCEL_REASONS[0]);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold mb-6">Orders</h1>

      <input
        type="text"
        placeholder="Search by customer, product, or order number..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input w-full mb-4"
      />

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`btn text-xs px-3 py-1.5 whitespace-nowrap ${
              filter === s ? 'btn-secondary' : 'btn-outline'
            }`}
          >
            {s} {counts[s] !== undefined ? `(${counts[s]})` : ''}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-night/50 text-sm">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="text-night/50 text-sm">No orders here.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/dashboard/business/orders/${o.id}`}
                    className="font-mono text-xs text-market-600 hover:underline"
                  >
                    {formatOrderNumber(o.orderNumber)}
                  </Link>
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
                  <div className="flex gap-1 justify-end mt-1 flex-wrap">
                    <span className={`badge ${STATUS_STYLE[o.status]}`}>{o.status}</span>
                    <span className={`badge ${PAYMENT_STYLE[o.paymentStatus]}`}>
                      {o.paymentStatus.replaceAll('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {NEXT_ACTIONS[o.status]?.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {NEXT_ACTIONS[o.status].map((action) =>
                    action.status === 'CANCELLED' ? (
                      <button
                        key={action.status}
                        onClick={() => setCancelTarget(o.id)}
                        className="btn btn-outline text-xs"
                      >
                        {action.label}
                      </button>
                    ) : (
                      <button
                        key={action.status}
                        onClick={() => updateStatus(o.id, action.status)}
                        className="btn btn-secondary text-xs"
                      >
                        {action.label}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {cancelTarget && (
        <div className="fixed inset-0 bg-night/40 flex items-center justify-center z-50 p-4">
          <div className="card p-6 max-w-sm w-full">
            <h2 className="font-semibold mb-3">Why are you cancelling this order?</h2>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="input w-full mb-4"
            >
              {CANCEL_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <div className="flex gap-2 justify-end">
              <button className="btn btn-outline text-xs" onClick={() => setCancelTarget(null)}>
                Back
              </button>
              <button className="btn btn-secondary text-xs" onClick={confirmCancel}>
                Confirm cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}