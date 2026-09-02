'use client';

import { useState, useEffect, useRef } from 'react';

interface LocateShopProps {
  businessId: string;
  businessName: string;
  latitude: number | null;
  longitude: number | null;
  location?: string | null;
}

export default function LocateShop({
  businessId,
  businessName,
  latitude,
  longitude,
  location
}: LocateShopProps) {
  const [distance, setDistance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shopLocation, setShopLocation] = useState<{lat: number; lng: number} | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletLoaded = useRef(false);

  // Set shop location
  useEffect(() => {
    if (latitude && longitude) {
      setShopLocation({ lat: latitude, lng: longitude });
    }
  }, [latitude, longitude]);

  // Get user location and calculate distance
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLoc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(userLoc);
      },
      () => {
        // Silent fail - user might deny location
      },
      { enableHighAccuracy: true }
    );
  }, []);

  // Load Leaflet map
  useEffect(() => {
    if (!shopLocation || !mapRef.current || leafletLoaded.current) return;

    const loadLeaflet = async () => {
      try {
        const L = await import('leaflet');
        await import('leaflet/dist/leaflet.css');

        // Fix marker icon
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        const map = L.map(mapRef.current).setView([shopLocation.lat, shopLocation.lng], 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap',
          maxZoom: 19,
        }).addTo(map);

        L.marker([shopLocation.lat, shopLocation.lng])
          .addTo(map)
          .bindPopup(`📍 ${businessName}`)
          .openPopup();

        if (userLocation) {
          L.marker([userLocation.lat, userLocation.lng])
            .addTo(map)
            .bindPopup('You are here')
            .openPopup();

          L.circle([userLocation.lat, userLocation.lng], {
            radius: 500,
            color: '#2F6B52',
            fillColor: '#2F6B52',
            fillOpacity: 0.1,
          }).addTo(map);

          const bounds = L.latLngBounds(
            [userLocation.lat, userLocation.lng],
            [shopLocation.lat, shopLocation.lng]
          );
          map.fitBounds(bounds, { padding: [50, 50] });
        }

        leafletLoaded.current = true;

        return () => {
          map.remove();
          leafletLoaded.current = false;
        };
      } catch (err) {
        console.error('Leaflet error:', err);
        setError('Could not load map');
      }
    };

    loadLeaflet();
  }, [shopLocation, userLocation, businessName]);

  // Calculate distance
  useEffect(() => {
    if (userLocation && shopLocation) {
      const dist = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        shopLocation.lat,
        shopLocation.lng
      );
      setDistance(dist);
    }
  }, [userLocation, shopLocation]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): string => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;

    if (d < 1) {
      return `${Math.round(d * 1000)} m`;
    }
    return `${d.toFixed(1)} km`;
  };

  const handleLocateShop = () => {
    if (!shopLocation) {
      setError('Shop location not available');
      return;
    }

    setLoading(true);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${shopLocation.lat},${shopLocation.lng}`;
    window.open(url, '_blank');
    setLoading(false);
  };

  if (!latitude || !longitude) {
    return null;
  }

  return (
    <div className="mt-3 p-3 bg-white rounded-xl border border-night/5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">📍</span>
          <div>
            <p className="text-sm font-medium text-night">{businessName}</p>
            {distance && (
              <p className="text-xs text-market-500 font-medium">{distance} away</p>
            )}
          </div>
        </div>
        <button
          onClick={handleLocateShop}
          disabled={loading || !shopLocation}
          className="px-4 py-1.5 bg-night text-white rounded-lg text-sm font-medium hover:bg-market-500 transition disabled:opacity-50"
        >
          {loading ? '...' : 'Locate Shop →'}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}

      <div
        ref={mapRef}
        className="mt-2 h-32 rounded-lg overflow-hidden bg-market-50"
        style={{ display: shopLocation ? 'block' : 'none' }}
      />

      {!shopLocation && (
        <div className="mt-2 h-32 rounded-lg bg-market-50 flex items-center justify-center text-night/30 text-sm">
          Loading location...
        </div>
      )}

      <p className="text-[10px] text-night/30 mt-1 text-center">
        Map data © OpenStreetMap
      </p>
    </div>
  );
}