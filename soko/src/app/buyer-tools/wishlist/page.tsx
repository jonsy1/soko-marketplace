'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

function formatTZS(n: number) {
  return 'TZS ' + Math.round(n).toLocaleString('en-US');
}

export default function WishlistPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    fetch('/api/wishlist')
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function remove(productId: string) {
    await fetch(`/api/wishlist?productId=${productId}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-2 mb-5">
        <Link href="/buyer-tools" className="text-night/40 hover:text-night/70">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="font-display text-2xl font-bold text-night">Wishlist</h1>
      </div>

      {loading ? (
        <p className="text-night/50 text-sm">Loading...</p>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">❤️</div>
          <p className="font-semibold text-night/70">Your wishlist is empty</p>
          <p className="text-sm text-night/50 mt-1">Tap the heart icon on any product to save it here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="card p-4 flex items-center gap-4">
              {item.product.imageUrl ? (
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-market-100 flex items-center justify-center text-market-500 font-bold shrink-0">
                  {item.product.name[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.product.id}`} className="font-semibold text-night hover:text-market-500 truncate block">
                  {item.product.name}
                </Link>
                <p className="text-xs text-night/50">{item.business?.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-semibold text-market-600">{formatTZS(item.currentPrice)}</span>
                  {item.priceDropped && (
                    <span className="text-xs text-clay-500 line-through">{formatTZS(item.priceAtSave)}</span>
                  )}
                  {item.priceDropped && (
                    <span className="badge bg-teal-50 text-teal-600 text-[10px]">Price dropped!</span>
                  )}
                  {!item.inStock && <span className="badge bg-night/5 text-night/50 text-[10px]">Out of stock</span>}
                </div>
              </div>
              <button
                onClick={() => remove(item.product.id)}
                aria-label="Remove from wishlist"
                className="w-8 h-8 rounded-full flex items-center justify-center text-night/30 hover:text-clay-500 hover:bg-clay-50 transition shrink-0"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}