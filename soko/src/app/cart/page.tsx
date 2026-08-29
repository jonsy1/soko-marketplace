
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useCart } from '@/components/CartContext';
import { useTranslation } from '@/components/LanguageProvider';

function formatTZS(n: number) {
  return 'TZS ' + Math.round(n).toLocaleString('en-US');
}

export default function CartPage() {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const { items, updateQuantity, removeItem, clearCart, ready } = useCart();
  const [delivery, setDelivery] = useState('CUSTOMER_PICKUP');
  const [note, setNote] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const businessCount = new Set(items.map((i) => i.businessId)).size;

  async function checkout() {
    setError('');
    setPlacing(true);
    const res = await fetch('/api/orders/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        deliveryOption: delivery,
        note,
      }),
    });
    const data = await res.json();
    setPlacing(false);
    if (!res.ok) {
      setError(data.error || 'Could not place order.');
      return;
    }
    clearCart();
    setSuccess(t.cart.checkoutSuccess);
  }

  if (!ready) return <div className="max-w-3xl mx-auto px-4 py-16 text-night/50">{t.product.loading}</div>;

  if (!session?.user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-night/60 mb-4">{t.cart.loginPrompt}</p>
        <Link href="/login?callbackUrl=/cart" className="btn btn-primary">
          {t.auth.logIn}
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-sm bg-teal-50 text-teal-600 px-4 py-3 rounded-card mb-4">{success}</div>
        <Link href="/orders" className="btn btn-primary">
          {t.ordersPage.title}
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-night/50 mb-4">{t.cart.empty}</p>
        <Link href="/" className="btn btn-primary">
          {t.cart.browse}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold mb-6">{t.cart.title}</h1>

      {error && <div className="text-sm bg-clay/10 text-clay px-3 py-2 rounded-card mb-4">{error}</div>}
      {businessCount > 1 && (
        <div className="text-xs text-night/50 bg-market-50 px-3 py-2 rounded-card mb-4">
          {t.cart.fromMultipleSellers}
        </div>
      )}

      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <div key={item.productId} className="card p-3 flex items-center gap-3">
            <div className="w-16 h-16 rounded-card bg-market-100 flex items-center justify-center overflow-hidden shrink-0 relative">
              {item.imageUrl ? (
                <Image src={item.imageUrl} alt={item.name} fill sizes="64px" className="object-cover" />
              ) : (
                <span className="text-market-600 font-display text-xl font-bold opacity-40">
                  {item.name?.[0]?.toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{item.name}</p>
              <p className="text-xs text-night/50 truncate">{item.businessName}</p>
              <p className="text-teal-600 font-bold text-sm mt-0.5">{formatTZS(item.price)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                className="w-7 h-7 rounded-full border border-night/15 flex items-center justify-center text-sm hover:bg-night/5"
              >
                −
              </button>
              <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                disabled={item.quantity >= item.maxQuantity}
                className="w-7 h-7 rounded-full border border-night/15 flex items-center justify-center text-sm hover:bg-night/5 disabled:opacity-30"
              >
                +
              </button>
            </div>
            <button
              onClick={() => removeItem(item.productId)}
              className="text-clay text-xs font-semibold ml-1"
            >
              {t.cart.remove}
            </button>
          </div>
        ))}
      </div>

      <div className="card p-5 space-y-4">
        <div>
          <label className="label">{t.product.deliveryOption}</label>
          <select className="input" value={delivery} onChange={(e) => setDelivery(e.target.value)}>
            <option value="CUSTOMER_PICKUP">{t.product.pickup}</option>
            <option value="SELLER_DELIVERY">{t.product.sellerDelivery}</option>
            <option value="MEET_DIRECTLY">{t.product.meetDirectly}</option>
          </select>
        </div>
        <div>
          <label className="label">{t.product.noteOptional}</label>
          <textarea
            className="input"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t.product.notePlaceholder}
          />
        </div>
        <div className="flex items-center justify-between font-semibold">
          <span>{t.cart.subtotal}</span>
          <span className="text-teal-600">{formatTZS(subtotal)}</span>
        </div>
        <button className="btn btn-primary w-full" disabled={placing} onClick={checkout}>
          {placing ? t.cart.placingOrders : `${t.cart.checkout} · ${formatTZS(subtotal)}`}
        </button>
      </div>
    </div>
  );
}