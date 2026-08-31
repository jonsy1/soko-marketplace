'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useCart } from './CartContext';
import { getDisplayOriginalPrice, DISCOUNT_RATE } from '@/lib/pricing';

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
  const [heartPop, setHeartPop] = useState(false);
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetch(`/api/products/${product.id}/like`)
      .then((r) => r.json())
      .then((data) => {
        setLiked(data.liked);
        setLikeCount(data.likeCount);
      })
      .catch(() => {});
  }, [product.id]);

  function handleMouseMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -10, y: px * 12 });
  }

  function resetTilt() {
    setTilt({ x: 0, y: 0 });
  }

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
      if (data.liked) {
        setHeartPop(true);
        setTimeout(() => setHeartPop(false), 500);
      }
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

  function handleLocateShop(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const { latitude, longitude } = product.business || {};
    if (!latitude || !longitude) return;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, '_blank');
  }

  return (
    <div className="perspective-1000">
      <Link
        ref={cardRef}
        href={`/products/${product.id}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={resetTilt}
        style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
        className="tilt-3d card overflow-hidden group relative block"
      >
        <div className="aspect-square bg-market-100 flex items-center justify-center overflow-hidden relative">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
              className="object-cover group-hover:scale-105 transition duration-300"
            />
          ) : (
            <span className="text-market-600 font-display text-3xl font-bold opacity-40">
              {product.name?.[0]?.toUpperCase()}
            </span>
          )}
          <button
            onClick={toggleLike}
            disabled={loading}
            className="press-3d absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:scale-110 transition"
          >
            <span className={`${liked ? 'text-clay' : 'text-night/30'} ${heartPop ? 'animate-heart-pop' : ''}`}>
              {liked ? '❤️' : '🤍'}
            </span>
          </button>
        </div>
        <div className="p-3">
          <p className="font-semibold text-sm truncate">{product.name}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-teal-600 font-bold text-sm">{formatTZS(product.price)}</span>
            <span className="text-night/35 text-xs line-through">{formatTZS(getDisplayOriginalPrice(product.price))}</span>
            <span className="badge bg-clay/10 text-clay text-[10px]">-{DISCOUNT_RATE * 100}%</span>
          </div>
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
            className={`press-3d w-full mt-2 text-xs font-semibold rounded-card py-1.5 transition ${
              added
                ? 'bg-teal-50 text-teal-600 animate-pop-3d'
                : product.quantity < 1
                ? 'bg-night/5 text-night/30'
                : 'bg-night text-white hover:bg-night/90'
            }`}
          >
            {added ? '✓ Added' : product.quantity < 1 ? 'Out of stock' : '+ Add to cart'}
          </button>
          {product.business?.latitude && product.business?.longitude && (
            <button
              onClick={handleLocateShop}
              className="press-3d w-full mt-1.5 text-xs font-semibold rounded-card py-1.5 border border-teal-500/40 text-teal-600 hover:bg-teal-50 transition"
            >
              📍 Locate shop
            </button>
          )}
        </div>
      </Link>
    </div>
  );
}