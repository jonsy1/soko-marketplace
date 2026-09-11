'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// @ts-ignore - fix ya kawaida ya Leaflet + Next.js (icons)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Shop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface NearbyShopsMapProps {
  shops: Shop[];
  center: { lat: number; lng: number };
  onSelect: (id: string) => void;
}

export default function NearbyShopsMap({ shops, center, onSelect }: NearbyShopsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    mapInstance.current = L.map(mapRef.current).setView([center.lat, center.lng], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapInstance.current);

    L.circleMarker([center.lat, center.lng], {
      radius: 7,
      color: '#2F6FED',
      fillColor: '#2F6FED',
      fillOpacity: 1,
    }).addTo(mapInstance.current);

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = shops.map((shop) => {
      const marker = L.marker([shop.latitude, shop.longitude]).addTo(mapInstance.current!);
      marker.bindTooltip(shop.name, { direction: 'top' });
      marker.on('click', () => onSelect(shop.id));
      return marker;
    });
  }, [shops, onSelect]);

  return <div ref={mapRef} className="w-full h-full rounded-2xl" />;
}