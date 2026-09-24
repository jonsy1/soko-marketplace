'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import OrderProgress from '@/components/OrderProgress';
import { formatOrderNumber, calculateOrdersProfit } from '@/lib/pricing';

function formatTZS(n: number) {
  return 'TZS ' + Math.round(n).toLocaleString('en-US');
}

const PAYMENT_OPTIONS = ['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CASH_ON_DELIVERY'];

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

export default function BusinessOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);

  function load() {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setOrder(data);
        setLoading(false);
      });
  }

  useEffect(load, [id]);

  async function updateStatus(status: string, cancellationReason?: string) {
    await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, cancellationReason }),
    });
    load();
  }

  async function updatePaymentStatus(paymentStatus: string) {
    await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentStatus }),
    });
    load();
  }

  function confirmCancel() {
    updateStatus('CANCELLED', cancelReason);
    setShowCancelForm(false);
  }

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-10 text-night/50 text-sm">Loading…</div>;
  if (!order || order.error)
    return <div className="max-w-3xl mx-auto px-4 py-10 text-night/50 text-sm">Order not found.</div>;

  const profitInfo = calculateOrdersProfit(order.items);
  const subtotal = order.items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button onClick={() => router.back()} className="text-sm text-night/50 mb-4 hover:underline">
        ← Back to orders
      </button>

      <div className="card p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="font-mono text-sm text-market-600">{formatOrderNumber(order.orderNumber)}</p>
            <p className="text-xs text-night/40">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <span className="badge bg-market-100 text-market-600">{order.status}</span>
        </div>

        <OrderProgress status={order.status} />

        {/* Status-based next actions */}
        {NEXT_ACTIONS[order.status]?.length > 0 && (
          <div className="flex gap-2 mt-4 flex-wrap">
            {NEXT_ACTIONS[order.status].map((action) =>
              action.status === 'CANCELLED' ? (
                <button
                  key={action.status}
                  onClick={() => setShowCancelForm(true)}
                  className="btn btn-outline text-xs"
                >
                  {action.label}
                </button>
              ) : (
                <button
                  key={action.status}
                  onClick={() => updateStatus(action.status)}
                  className="btn btn-secondary text-xs"
                >
                  {action.label}
                </button>
              )
            )}
          </div>
        )}

        {order.status === 'CANCELLED' && order.cancellationReason && (
          <p className="text-sm text-clay mt-3">Cancellation reason: {order.cancellationReason}</p>
        )}

        <hr className="my-5 border-night/10" />

        {/* Customer */}
        <h2 className="font-semibold mb-2">Customer</h2>
        <p className="text-sm">{order.customer.name}</p>
        <p className="text-sm text-night/50 mb-1">📞 {order.customer.phone || 'no phone on file'}</p>
        {order.customerHistory && (
          <p className="text-xs text-night/40">
            {order.customerHistory.previousOrders > 0
              ? `Returning customer — ${order.customerHistory.previousOrders} previous order${
                  order.customerHistory.previousOrders > 1 ? 's' : ''
                }, ${formatTZS(order.customerHistory.totalSpent)} total spent`
              : 'First order with your shop'}
          </p>
        )}

        <hr className="my-5 border-night/10" />

        {/* Products */}
        <h2 className="font-semibold mb-2">Products</h2>
        <div className="space-y-2">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.quantity}× {item.product.name}
              </span>
              <span>{formatTZS(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <hr className="my-5 border-night/10" />

        {/* Totals */}
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-night/50">Subtotal</span>
            <span>{formatTZS(subtotal)}</span>
          </div>
          <div className="flex justify-between font-bold text-base mt-1">
            <span>Total</span>
            <span>{formatTZS(order.totalPrice)}</span>
          </div>
          <div className="flex justify-between text-night/50">
            <span>{profitInfo.hasFullCostData ? 'Profit' : 'Estimated profit'}</span>
            <span>
              {formatTZS(profitInfo.profit)}
              {!profitInfo.hasFullCostData && (
                <span className="text-xs text-clay ml-1">
                  (missing cost data for {profitInfo.itemsMissingCost} item
                  {profitInfo.itemsMissingCost > 1 ? 's' : ''})
                </span>
              )}
            </span>
          </div>
        </div>

        <hr className="my-5 border-night/10" />

        {/* Delivery + note */}
        <p className="text-sm">
          <span className="text-night/50">Delivery: </span>
          {order.deliveryOption.replaceAll('_', ' ').toLowerCase()}
        </p>
        {order.note && (
          <p className="text-sm mt-1">
            <span className="text-night/50">Customer note: </span>"{order.note}"
          </p>
        )}

        <hr className="my-5 border-night/10" />

        {/* Payment status */}
        <h2 className="font-semibold mb-2">Payment</h2>
        <select
          value={order.paymentStatus}
          onChange={(e) => updatePaymentStatus(e.target.value)}
          className="input w-full max-w-xs"
        >
          {PAYMENT_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p.replaceAll('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      {showCancelForm && (
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
              <button className="btn btn-outline text-xs" onClick={() => setShowCancelForm(false)}>
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