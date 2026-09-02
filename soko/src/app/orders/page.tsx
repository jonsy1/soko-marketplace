'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function OrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session]);

  if (!session) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-night">Please Login</h1>
        <p className="text-night/50 mt-2">You need to be logged in to view your orders.</p>
        <Link href="/login" className="inline-block mt-6 px-6 py-3 bg-night text-white rounded-xl hover:bg-market-500 transition">
          Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-night/10 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">📦</div>
        <h1 className="text-2xl font-bold text-night">No Orders Yet</h1>
        <p className="text-night/50 mt-2">Start shopping to see your orders here.</p>
        <Link href="/" className="inline-block mt-6 px-6 py-3 bg-night text-white rounded-xl hover:bg-market-500 transition">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <h1 className="text-2xl font-bold text-night mb-6">My Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-2xl border border-night/5 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-night">Order #{order.id.slice(0, 8)}</p>
                <p className="text-xs text-night/40">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                order.status === 'NEW' ? 'bg-yellow-100 text-yellow-700' :
                order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-700' :
                order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                'bg-red-100 text-red-700'
              }`}>
                {order.status}
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-market-50 rounded-lg flex items-center justify-center text-lg">📦</div>
                  <div>
                    <p className="text-sm font-medium text-night">{item.product?.name || 'Product'}</p>
                    <p className="text-xs text-night/40">{item.quantity} × TZS {Number(item.price).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-night/5 flex items-center justify-between">
              <p className="font-bold text-night">Total: TZS {Number(order.totalPrice || order.total).toLocaleString()}</p>
              <Link href={`/orders/${order.id}`} className="text-sm text-market-500 hover:text-market-600 transition">
                View Details →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}