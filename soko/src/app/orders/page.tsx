'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useTranslation } from '@/components/LanguageProvider';

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

export default function MyOrdersPage() {
  const { data: session, status } = useSession();
  const { t } = useTranslation();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, [status]);

  if (status === 'loading') {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-night/50">…</div>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold mb-2">{t.ordersPage.title}</h1>
        <p className="text-night/60 text-sm mb-6">{t.ordersPage.loginPrompt}</p>
        <Link href="/login?callbackUrl=/orders" className="btn btn-primary">
          {t.ordersPage.logIn}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold mb-6">{t.ordersPage.title}</h1>

      {loading ? (
        <p className="text-night/50 text-sm">…</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-night/60 text-sm mb-4">{t.ordersPage.none}</p>
          <Link href="/" className="text-teal-600 font-semibold text-sm">
            {t.ordersPage.browse} →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{o.business?.name}</p>
                  <p className="text-sm text-night/50">
                    {o.items.map((i: any) => `${i.quantity}× ${i.product.name}`).join(', ')}
                  </p>
                  <p className="text-xs text-night/40 mt-1">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold">{formatTZS(o.totalPrice)}</p>
                  <span className={`badge ${STATUS_STYLE[o.status]}`}>{o.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
