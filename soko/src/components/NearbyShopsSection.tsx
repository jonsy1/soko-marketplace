'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import ContactSellerModal from './ContactSellerModal';

const NearbyShopsMap = dynamic(() => import('./NearbyShopsMap'), { ssr: false });

interface Category {
  id: string;
  name: string;
  slug: string;
  children: any[];
}

interface NearbyShopsSectionProps {
  categories: Category[];
}

export default function NearbyShopsSection({ categories }: NearbyShopsSectionProps) {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedShop, setSelectedShop] = useState<any | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setUserLocation({ lat: -6.7924, lng: 39.2083 });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUserLocation({ lat: -6.7924, lng: 39.2083 }),
      { enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('nearby', '1');
    if (activeCategory) params.set('category', activeCategory);
    fetch(`/api/businesses?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setShops(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  const distanceOf = (shop: any) => {
    if (!userLocation || !shop.latitude || !shop.longitude) return null;
    const R = 6371;
    const dLat = ((shop.latitude - userLocation.lat) * Math.PI) / 180;
    const dLon = ((shop.longitude - userLocation.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((userLocation.lat * Math.PI) / 180) *
        Math.cos((shop.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`;
  };

  const avgRating = (shop: any) => {
    const reviews = shop.reviews || [];
    if (!reviews.length) return null;
    return reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length;
  };

  const openShop = (id: string) => {
    const shop = shops.find((s) => s.id === id);
    if (shop) setSelectedShop(shop);
  };

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-night">Shops near you</h2>
        <div className="flex bg-market-50 rounded-full p-1 gap-1">
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition ${
              viewMode === 'map' ? 'bg-market-500 text-white' : 'text-night/60'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Map
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition ${
              viewMode === 'list' ? 'bg-market-500 text-white' : 'text-night/60'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
            </svg>
            List
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        <button
          onClick={() => setActiveCategory(null)}
          className={`rounded-full text-xs px-4 py-1.5 whitespace-nowrap transition ${
            !activeCategory ? 'bg-night text-market-50' : 'bg-white border border-night/15 text-night/60'
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.slug)}
            className={`rounded-full text-xs px-4 py-1.5 whitespace-nowrap transition ${
              activeCategory === c.slug ? 'bg-night text-market-50' : 'bg-white border border-night/15 text-night/60'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {loading || !userLocation ? (
        <div className="h-64 rounded-2xl bg-market-50 animate-pulse" />
      ) : viewMode === 'map' ? (
        <div className="relative">
          <div className="h-72 rounded-2xl overflow-hidden border border-night/10">
            <NearbyShopsMap
              shops={shops.filter((s) => s.latitude && s.longitude)}
              center={userLocation}
              onSelect={openShop}
            />
          </div>
          <span className="absolute top-3 left-3 bg-white shadow px-3 py-1.5 rounded-full text-xs font-semibold text-night z-[400]">
            {shops.length} matching shops
          </span>
        </div>
      ) : (
        <div className="space-y-3">
          {shops.length === 0 ? (
            <p className="text-sm text-night/50 text-center py-8">No shops found in this category yet.</p>
          ) : (
            shops.map((shop) => (
              <button
                key={shop.id}
                onClick={() => setSelectedShop(shop)}
                className="w-full flex items-center gap-3 bg-white border border-night/5 hover:border-night/15 hover:shadow-md rounded-2xl p-3 transition text-left"
              >
                {shop.logoUrl ? (
                  <img src={shop.logoUrl} alt={shop.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-market-50 flex items-center justify-center text-market-300 shrink-0">
                    🏪
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-night truncate">{shop.name}</p>
                  {shop.description && (
                    <p className="text-xs text-night/50 truncate">{shop.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1 text-xs text-night/50">
                    {avgRating(shop) !== null && (
                      <span className="flex items-center gap-0.5 text-amber-500 font-medium">
                        ★ {avgRating(shop)!.toFixed(1)}
                      </span>
                    )}
                    {distanceOf(shop) && <span>· {distanceOf(shop)}</span>}
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-night/30 shrink-0">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            ))
          )}
        </div>
      )}

      {selectedShop && (
        <ContactSellerModal
          business={{
            id: selectedShop.id,
            name: selectedShop.name,
            phone: selectedShop.phone,
            logoUrl: selectedShop.logoUrl,
            description: selectedShop.description,
            isOpen: selectedShop.isOpen ?? true,
            location: selectedShop.location || '',
            latitude: selectedShop.latitude,
            longitude: selectedShop.longitude,
          }}
          distance={distanceOf(selectedShop)}
          onClose={() => setSelectedShop(null)}
        />
      )}
    </section>
  );
}