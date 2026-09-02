'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from './CartContext';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string | null;
    category?: { name: string; slug: string } | null;
    business?: { name: string; slug: string } | null;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [isWishlist, setIsWishlist] = useState(false);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl || undefined,
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-night/5 hover:border-night/15 hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Product Image */}
      <Link href={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-market-50">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl bg-market-100 text-market-300">
            📦
          </div>
        )}

        {/* Quick action buttons (visible on hover) */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => setIsWishlist(!isWishlist)}
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition"
            aria-label="Wishlist"
          >
            <span className="text-lg">{isWishlist ? '❤️' : '🤍'}</span>
          </button>
        </div>

        {/* Category badge */}
        {product.category && (
          <span className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm text-night/70 text-[10px] font-medium px-2 py-0.5 rounded-full">
            {product.category.name}
          </span>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-3">
        {/* Business name */}
        {product.business && (
          <p className="text-[10px] text-night/40 uppercase tracking-wider font-medium">
            {product.business.name}
          </p>
        )}

        {/* Product name */}
        <Link href={`/product/${product.id}`}>
          <h3 className="font-medium text-sm text-night line-clamp-1 hover:text-market-500 transition">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center justify-between mt-1.5">
          <p className="font-bold text-night text-base">
            TZS {Number(product.price).toLocaleString()}
          </p>

          {/* Add to Cart button */}
          <button
            onClick={handleAddToCart}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              isAdded
                ? 'bg-green-500 text-white'
                : 'bg-night text-white hover:bg-market-500'
            }`}
            aria-label="Add to cart"
          >
            {isAdded ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="20" r="1.4" />
                <circle cx="17" cy="20" r="1.4" />
                <path d="M3 4h2l2.2 11.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}