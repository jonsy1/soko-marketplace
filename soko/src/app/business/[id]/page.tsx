'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';

export default function BusinessPage() {
  const { id } = useParams<{ id: string }>();
  const [business, setBusiness] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/businesses/${id}`)
      .then((r) => r.json())
      .then(setBusiness);
  }, [id]);

  if (!business) return <div className="max-w-6xl mx-auto px-4 py-16 text-night/50">Loading…</div>;
  if (business.error) return <div className="max-w-6xl mx-auto px-4 py-16">Business not found.</div>;

  return (
    <div>
      <div className="bg-white border-b border-night/10">
        <div className="max-w-6xl mx-auto px-4 py-8 flex items-center gap-4">
          <div className="w-16 h-16 rounded-card bg-market-100 flex items-center justify-center font-display text-2xl font-bold text-market-600 overflow-hidden shrink-0">
            {business.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={business.logoUrl} alt={business.name} className="w-full h-full object-cover" />
            ) : (
              business.name?.[0]?.toUpperCase()
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-bold">{business.name}</h1>
              {business.status === 'VERIFIED' && (
                <span className="badge bg-teal-50 text-teal-600">✓ Verified</span>
              )}
              {business.status === 'PENDING' && (
                <span className="badge bg-market-100 text-market-600">New seller</span>
              )}
            </div>
            <p className="text-sm text-night/50 mt-1">
              📍 {business.location} · 📞 {business.phone}
              {business.offersDelivery && ' · 🚚 Delivery available'}
            </p>
            {business.description && (
              <p className="text-sm text-night/70 mt-2 max-w-xl">{business.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="font-semibold mb-4">{business.products.length} products</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {business.products.map((p: any) => (
            <ProductCard key={p.id} product={{ ...p, business }} />
          ))}
        </div>
        {business.products.length === 0 && (
          <p className="text-night/50 text-sm">This business hasn&apos;t listed any products yet.</p>
        )}
      </div>
    </div>
  );
}
