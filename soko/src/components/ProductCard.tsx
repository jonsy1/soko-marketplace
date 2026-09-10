'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from './CartContext';
import ContactSellerModal from './ContactSellerModal';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string | null;
    quantity?: number;
    category?: { name: string; slug: string } | null;
    business?: {
      id: string;
      name: string;
      slug: string;
      location?: string | null;
      latitude?: number | null;
      longitude?: number | null;
      phone?: string | null;
      logoUrl?: string | null;
      description?: string | null;
      isOpen?: boolean;
      reviews?: { rating: number }[];
    } | null;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [isWishlist, setIsWishlist] = useState(false);
  const [distance, setDistance] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [showContact, setShowContact] = useState(false);

  const reviews = product.business?.reviews || [];
  const reviewCount = reviews.length;
  const avgRating = reviewCount > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : 0;

  // Get user location
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {},
      { enableHighAccuracy: true }
    );
  }, []);

  // Calculate distance
  useEffect(() => {
    if (!userLocation || !product.business?.latitude || !product.business?.longitude) return;

    const R = 6371;
    const lat1 = userLocation.lat;
    const lon1 = userLocation.lng;
    const lat2 = product.business.latitude;
    const lon2 = product.business.longitude;

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;

    if (d < 1) {
      setDistance(`${Math.round(d * 1000)} m`);
    } else {
      setDistance(`${d.toFixed(1)} km`);
    }
  }, [userLocation, product.business]);

  const handleAddToCart = () => {
    const businessId = product.business?.id || 'unknown';
    const businessName = product.business?.name || 'Soko Seller';
    const maxQuantity = product.quantity || 99;

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl || null,
      maxQuantity: maxQuantity,
      businessId: businessId,
      businessName: businessName,
    }, 1);

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

        {/* Wishlist button */}
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
        {/* Business name + rating */}
        {product.business && (
          <div className="flex items-center justify-between gap-2">
            <Link
              href={`/business/${product.business.slug}`}
              className="text-[10px] text-market-500 uppercase tracking-wider font-medium hover:underline transition truncate"
            >
              {product.business.name}
            </Link>
            {reviewCount > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] text-night/50 shrink-0">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1">
                  <path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 16.9l-6.2 3.4 1.6-6.8L2.2 8.9l6.9-.6L12 2z" />
                </svg>
                {avgRating.toFixed(1)} ({reviewCount})
              </span>
            )}
          </div>
        )}

        {/* Product name */}
        <Link href={`/product/${product.id}`}>
          <h3 className="font-medium text-sm text-night line-clamp-1 hover:text-market-500 transition">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center justify-between mt-1.5">
          <p className="font-bold text-clay-500 text-base">
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

        {/* Contact Seller */}
        {product.business?.phone && (
          <button
            onClick={() => setShowContact(true)}
            className="mt-2 w-full flex items-center justify-center gap-2 text-xs font-semibold text-white bg-market-500 hover:bg-market-600 transition py-2 rounded-xl"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            {distance ? `Contact seller · ${distance} away` : 'Contact seller'}
          </button>
        )}
      </div>

      {/* Contact Seller Modal */}
      {showContact && product.business?.phone && (
        <ContactSellerModal
          business={{
            id: product.business.id,
            name: product.business.name,
            phone: product.business.phone,
            logoUrl: product.business.logoUrl,
            description: product.business.description,
            isOpen: product.business.isOpen ?? true,
            location: product.business.location || '',
            latitude: product.business.latitude,
            longitude: product.business.longitude,
          }}
          distance={distance}
          onClose={() => setShowContact(false)}
        />
      )}
    </div>
  );
}