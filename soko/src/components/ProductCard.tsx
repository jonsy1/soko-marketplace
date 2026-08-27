'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useCart } from './CartContext';

function formatTZS(n: number) {
  return 'TZS ' + Math.round(n).toLocaleString('en-US');
}

export default function ProductCard({ product }: { product: any }) {
  const { data: session } = useSession();
  const { addItem } = useCart();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${product.id}/like`)
      .then((r) => r.json())
      .then((data) => {
        setLiked(data.liked);
        setLikeCount(data.likeCount);
      })
      .catch(() => {});
  }, [product.id]);

  async function toggleLike(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!session) {
      window.location.href = '/login';
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/products/${product.id}/like`, { method: 'POST' });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setLiked(data.liked);
      setLikeCount((c) => (data.liked ? c + 1 : c - 1));
    }
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (product.quantity < 1) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl || null,
      maxQuantity: product.quantity,
      businessId: product.business?.id,
      businessName: product.business?.name || '',
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <Link
      href={`/products/${product.id}`}
      className="card overflow-hidden hover:shadow-md transition group relative"
    >
      <div className="aspect-square bg-market-100 flex items-center justify-center overflow-hidden relative">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition"
          />
        ) : (
          <span className="text-market-600 font-display text-3xl font-bold opacity-40">
            {product.name?.[0]?.toUpperCase()}
          </span>
        )}
        <button
          onClick={toggleLike}
          disabled={loading}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:scale-110 transition"
        >
          <span className={liked ? 'text-clay' : 'text-night/30'}>
            {liked ? '❤️' : '🤍'}
          </span>
        </button>
      </div>
      <div className="p-3">
        <p className="font-semibold text-sm truncate">{product.name}</p>
        <p className="text-teal-600 font-bold text-sm mt-0.5">{formatTZS(product.price)}</p>
        <div className="flex items-center justify-between mt-2 text-xs text-night/50">
          <span className="truncate">{product.business?.name}</span>
          <span className="truncate">{product.business?.location}</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          {product.business?.status === 'VERIFIED' && (
            <span className="badge bg-teal-50 text-teal-600">✓ Verified seller</span>
          )}
          {likeCount > 0 && (
            <span className="text-xs text-night/40 ml-auto">{likeCount} ❤️</span>
          )}
        </div>
        <button
          onClick={handleAddToCart}
          disabled={product.quantity < 1}
          className={`w-full mt-2 text-xs font-semibold rounded-card py-1.5 transition ${
            added
              ? 'bg-teal-50 text-teal-600'
              : product.quantity < 1
              ? 'bg-night/5 text-night/30'
              : 'bg-night text-white hover:bg-night/90'
          }`}
        >
          {added ? '✓ Added' : product.quantity < 1 ? 'Out of stock' : '+ Add to cart'}
        </button>
      </div>
    </Link>
  );
}