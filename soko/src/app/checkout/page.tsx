'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCart } from '@/components/CartContext';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState('PICKUP');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  // If not logged in, redirect to login
  useEffect(() => {
    if (!session) {
      router.push('/login?return=/checkout');
    }
  }, [session, router]);

  // If cart is empty, redirect to home
  useEffect(() => {
    if (items.length === 0 && session) {
      router.push('/');
    }
  }, [items, session, router]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    setLoading(true);
    setError('');

    try {
      // Send each item as a separate order (or combine if same business)
      for (const item of items) {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: item.productId,
            quantity: item.quantity,
            deliveryOption: deliveryMethod,
            note: note || undefined,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to place order');
        }
      }

      clearCart();
      router.push('/orders');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <p className="text-night/60">Redirecting to login...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🛒</div>
        <h1 className="text-2xl font-bold text-night">Your cart is empty</h1>
        <p className="text-night/50 mt-2">Add some products before checking out.</p>
        <Link href="/" className="inline-block mt-6 px-6 py-3 bg-night text-white rounded-xl">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-night mb-6">Checkout</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: Form */}
        <div>
          {/* Delivery Method */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-night/60 mb-2">Delivery Method</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDeliveryMethod('PICKUP')}
                className={`p-4 rounded-xl border-2 text-center transition ${
                  deliveryMethod === 'PICKUP'
                    ? 'border-market-500 bg-market-50'
                    : 'border-night/15 hover:border-night/30'
                }`}
              >
                <span className="text-2xl block">📦</span>
                <span className="text-sm font-medium">Pickup</span>
              </button>
              <button
                onClick={() => setDeliveryMethod('DELIVERY')}
                className={`p-4 rounded-xl border-2 text-center transition ${
                  deliveryMethod === 'DELIVERY'
                    ? 'border-market-500 bg-market-50'
                    : 'border-night/15 hover:border-night/30'
                }`}
              >
                <span className="text-2xl block">🚚</span>
                <span className="text-sm font-medium">Delivery</span>
              </button>
            </div>
          </div>

          {/* Address (only for delivery) */}
          {deliveryMethod === 'DELIVERY' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-night/60 mb-1">Delivery Address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your full delivery address..."
                className="w-full rounded-xl px-4 py-3 border border-night/15 focus:border-market-500 focus:ring-1 focus:ring-market-500 outline-none transition resize-none"
                rows={3}
                required
              />
            </div>
          )}

          {/* Note */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-night/60 mb-1">Order Note (Optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any special instructions..."
              className="w-full rounded-xl px-4 py-3 border border-night/15 focus:border-market-500 focus:ring-1 focus:ring-market-500 outline-none transition"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handlePlaceOrder}
            disabled={loading || (deliveryMethod === 'DELIVERY' && !address.trim())}
            className="w-full py-3 bg-night text-white rounded-xl font-semibold hover:bg-market-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>

        {/* Right: Order Summary */}
        <div className="bg-market-50 rounded-2xl p-6 h-fit">
          <h2 className="font-semibold text-night mb-4">Order Summary</h2>

          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-lg">
                  📦
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-night">{item.name}</p>
                  <p className="text-xs text-night/40">
                    {item.quantity} × TZS {Number(item.price).toLocaleString()}
                  </p>
                </div>
                <p className="font-semibold text-night text-sm">
                  TZS {Number(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-night/10 mt-4 pt-4">
            <div className="flex justify-between">
              <span className="text-night/60">Subtotal</span>
              <span className="font-semibold">TZS {Number(total).toLocaleString()}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-night/60">Delivery</span>
              <span className="text-night/60">TZS 0</span>
            </div>
            <div className="flex justify-between mt-3 pt-3 border-t border-night/10">
              <span className="font-bold text-night">Total</span>
              <span className="font-bold text-night text-lg">TZS {Number(total).toLocaleString()}</span>
            </div>
          </div>

          <Link href="/cart" className="block text-center text-sm text-night/40 hover:text-night/60 transition mt-4">
            ← Back to Cart
          </Link>
        </div>
      </div>
    </div>
  );
}