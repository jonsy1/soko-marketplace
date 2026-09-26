'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function estimateForDelivery(distanceKm: number | null) {
  if (distanceKm === null) return 'Estimate unavailable — shop location not set';
  if (distanceKm < 3) return '30 - 60 minutes (typical for this distance)';
  if (distanceKm < 8) return '1 - 2 hours (typical for this distance)';
  if (distanceKm < 20) return '2 - 4 hours (typical for this distance)';
  return 'Same day, depending on the seller (long distance)';
}

export default function DeliveryEstimatorPage() {
  const [query, setQuery] = useState('');
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [deliveryOption, setDeliveryOption] = useState<'CUSTOMER_PICKUP' | 'SELLER_DELIVERY' | 'MEET_DIRECTLY'>(
    'CUSTOMER_PICKUP'
  );
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setBusinesses([]);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      fetch(`/api/businesses?nearby=1`)
        .then((r) => r.json())
        .then((data) => {
          const filtered = (Array.isArray(data) ? data : []).filter((b: any) =>
            b.name.toLowerCase().includes(query.trim().toLowerCase())
          );
          setBusinesses(filtered.slice(0, 8));
        })
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const distanceKm =
    selected && userLocation && selected.latitude && selected.longitude
      ? haversineKm(userLocation.lat, userLocation.lng, selected.latitude, selected.longitude)
      : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-2 mb-5">
        <Link href="/buyer-tools" className="text-night/40 hover:text-night/70">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="font-display text-2xl font-bold text-night">Delivery Estimator</h1>
      </div>
      <p className="text-night/50 text-sm mb-6">
        Estimates are approximate, based on typical delivery times for the distance involved — not live tracking.
      </p>

      <div className="card p-5 mb-5">
        <label className="label mb-2">Search for a shop</label>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
          }}
          placeholder="Type a shop name..."
          className="input w-full"
        />

        {loading && <p className="text-xs text-night/40 mt-2">Searching...</p>}

        {!selected && businesses.length > 0 && (
          <div className="mt-3 space-y-1">
            {businesses.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  setSelected(b);
                  setQuery(b.name);
                  setBusinesses([]);
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-market-50 transition text-sm"
              >
                <span className="font-medium">{b.name}</span>
                <span className="text-night/40 text-xs ml-2">{b.location}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            {selected.logoUrl ? (
              <img src={selected.logoUrl} alt={selected.name} className="w-12 h-12 rounded-xl object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-market-50 flex items-center justify-center text-market-300">🏪</div>
            )}
            <div>
              <p className="font-semibold text-night">{selected.name}</p>
              <p className="text-xs text-night/50">{selected.location}</p>
            </div>
          </div>

          <label className="label mb-2">Delivery method</label>
          <div className="flex flex-col gap-2 mb-5">
            <button
              onClick={() => setDeliveryOption('CUSTOMER_PICKUP')}
              className={`text-left px-4 py-3 rounded-xl border text-sm transition ${
                deliveryOption === 'CUSTOMER_PICKUP' ? 'border-market-500 bg-market-50' : 'border-night/10'
              }`}
            >
              Customer pickup
            </button>
            <button
              onClick={() => setDeliveryOption('SELLER_DELIVERY')}
              className={`text-left px-4 py-3 rounded-xl border text-sm transition ${
                deliveryOption === 'SELLER_DELIVERY' ? 'border-market-500 bg-market-50' : 'border-night/10'
              }`}
            >
              Seller delivery
            </button>
            <button
              onClick={() => setDeliveryOption('MEET_DIRECTLY')}
              className={`text-left px-4 py-3 rounded-xl border text-sm transition ${
                deliveryOption === 'MEET_DIRECTLY' ? 'border-market-500 bg-market-50' : 'border-night/10'
              }`}
            >
              Meet directly
            </button>
          </div>

          <div className="bg-market-50 rounded-2xl p-4">
            <p className="text-xs text-night/50 font-semibold uppercase mb-1">Estimated time</p>
            {deliveryOption === 'CUSTOMER_PICKUP' && (
              <p className="text-sm text-night">
                Ready whenever the shop is open — visit anytime to collect your order.
              </p>
            )}
            {deliveryOption === 'SELLER_DELIVERY' && (
              <>
                <p className="text-sm text-night">{estimateForDelivery(distanceKm)}</p>
                {distanceKm !== null && (
                  <p className="text-xs text-night/40 mt-1">Approx. {distanceKm.toFixed(1)} km from you</p>
                )}
              </>
            )}
            {deliveryOption === 'MEET_DIRECTLY' && (
              <p className="text-sm text-night">
                Time depends on what you and the seller agree on after placing the order.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}