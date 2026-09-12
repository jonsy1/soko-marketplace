'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import OrderProgress from '@/components/OrderProgress';

function formatTZS(n: number) {
  return 'TZS ' + Math.round(n).toLocaleString('en-US');
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setOrder(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load this order.');
        setLoading(false);
      });
  }, [id, session]);

  async function handleCancel() {
    setCancelling(true);
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CANCELLED' }),
    });
    const data = await res.json();
    setCancelling(false);
    if (res.ok) setOrder(data);
  }

  if (!session?.user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-night">Please Login</h1>
        <Link href="/login" className="inline-block mt-6 px-6 py-3 bg-night text-white rounded-xl hover:bg-market-500 transition">
          Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return <div className="max-w-2xl mx-auto px-4 py-16 text-night/50">Loading…</div>;
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-xl font-bold text-night">{error || 'Order not found.'}</h1>
        <Link href="/orders" className="inline-block mt-6 text-market-500 font-semibold">
          ← Back to my orders
        </Link>
      </div>
    );
  }

  const isCustomer = (session.user as any).id === order.customer?.id;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24">
      <Link href="/orders" className="text-sm text-market-500 font-semibold">← Back to my orders</Link>

      <div className="bg-white rounded-2xl border border-night/5 p-5 mt-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="font-semibold text-night">Order #{order.id.slice(0, 8)}</p>
            <p className="text-xs text-night/40">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              order.status === 'CANCELLED' ? 'bg-clay-50 text-clay-600' : 'bg-teal-50 text-teal-600'
            }`}
          >
            {order.status}
          </span>
        </div>

        <OrderProgress status={order.status} />

        {/* Seller info */}
        <div className="mt-5 pt-4 border-t border-night/5">
          <p className="text-xs text-night/40 uppercase font-semibold mb-1">Sold by</p>
          <Link href={`/business/${order.business.slug}`} className="text-market-500 font-semibold text-sm hover:underline">
            {order.business.name}
          </Link>
          <p className="text-xs text-night/50 mt-0.5">{order.business.location}</p>
        </div>

        {/* Items */}
        <div className="mt-5 pt-4 border-t border-night/5 space-y-3">
          {order.items?.map((item: any) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-market-50 flex items-center justify-center shrink-0">
                {item.product?.imageUrl ? (
                  <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl">📦</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-night truncate">{item.product?.name || 'Product'}</p>
                <p className="text-xs text-night/40">
                  {item.quantity} × {formatTZS(item.price)}
                </p>
              </div>
              <p className="text-sm font-semibold text-night shrink-0">{formatTZS(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-night/5 flex items-center justify-between">
          <p className="text-night/60 text-sm">Total</p>
          <p className="font-bold text-night text-lg">{formatTZS(order.totalPrice)}</p>
        </div>

        {order.note && (
          <div className="mt-4 pt-4 border-t border-night/5">
            <p className="text-xs text-night/40 uppercase font-semibold mb-1">Note</p>
            <p className="text-sm text-night/70">{order.note}</p>
          </div>
        )}

        {isCustomer && order.status === 'NEW' && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="mt-5 w-full border border-clay-500/30 text-clay-600 hover:bg-clay-50 text-sm font-semibold rounded-xl py-3 transition"
          >
            {cancelling ? 'Cancelling…' : 'Cancel order'}
          </button>
        )}
      </div>
    </div>
  );
}