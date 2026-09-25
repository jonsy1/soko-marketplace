'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import ContactSellerModal from '@/components/ContactSellerModal';

const NearbyShopsMap = dynamic(() => import('@/components/NearbyShopsMap'), { ssr: false });

export default function NearbyShopsPage() {
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
    fetch('/api/businesses?nearby=1')
      .then((r) => r.json())
      .then((data) => setShops(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

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

  const distanceValueOf = (shop: any) => {
    if (!userLocation || !shop.latitude || !shop.longitude) return Infinity;
    const R = 6371;
    const dLat = ((shop.latitude - userLocation.lat) * Math.PI) / 180;
    const dLon = ((shop.longitude - userLocation.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((userLocation.lat * Math.PI) / 180) *
        Math.cos((shop.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const avgRating = (shop: any) => (shop.reviewCount > 0 ? shop.avgRating : null);

  const sortedShops = [...shops].sort((a, b) => distanceValueOf(a) - distanceValueOf(b));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-5">
        <Link href="/" className="text-night/40 hover:text-night/70">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="font-display text-2xl font-bold text-night">Shops near you</h1>
      </div>

      {loading || !userLocation ? (
        <div className="h-72 rounded-2xl bg-market-50 animate-pulse mb-6" />
      ) : (
        <div className="relative mb-6">
          <div className="h-80 rounded-2xl overflow-hidden border border-night/10">
            <NearbyShopsMap
              shops={shops.filter((s) => s.latitude && s.longitude)}
              center={userLocation}
              onSelect={(id: string) => {
                const shop = shops.find((s) => s.id === id);
                if (shop) setSelectedShop(shop);
              }}
            />
          </div>
          <span className="absolute top-3 left-3 bg-white shadow px-3 py-1.5 rounded-full text-xs font-semibold text-night z-[400]">
            {shops.length} shops nearby
          </span>
        </div>
      )}

      <div className="space-y-3">
        {sortedShops.length === 0 && !loading ? (
          <p className="text-sm text-night/50 text-center py-8">No shops found yet.</p>
        ) : (
          sortedShops.map((shop) => (
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
                  {distanceOf(shop) && <span>· {distanceOf(shop)} away</span>}
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-night/30 shrink-0">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          ))
        )}
      </div>

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
    </div>
  );
}