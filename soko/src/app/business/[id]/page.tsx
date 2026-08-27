'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ProductCard from '@/components/ProductCard';
import { useTranslation } from '@/components/LanguageProvider';

export default function BusinessPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [business, setBusiness] = useState<any>(null);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/businesses/${id}`)
      .then((r) => r.json())
      .then(setBusiness);

    fetch(`/api/businesses/${id}/follow`)
      .then((r) => r.json())
      .then((data) => {
        setFollowing(data.following);
        setFollowerCount(data.followerCount);
      });
  }, [id]);

  async function toggleFollow() {
    if (!session) {
      window.location.href = '/login';
      return;
    }
    setFollowLoading(true);
    const res = await fetch(`/api/businesses/${id}/follow`, { method: 'POST' });
    const data = await res.json();
    setFollowLoading(false);
    if (res.ok) {
      setFollowing(data.following);
      setFollowerCount((c) => (data.following ? c + 1 : c - 1));
    }
  }

  async function messageSeller() {
    if (!session) {
      window.location.href = '/login';
      return;
    }
    setMessageLoading(true);
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId: id }),
    });
    const data = await res.json();
    setMessageLoading(false);
    if (res.ok) {
      router.push(`/messages/${data.id}`);
    } else {
      alert(data.error || 'Could not start conversation.');
    }
  }

  if (!business) return <div className="max-w-6xl mx-auto px-4 py-16 text-night/50">Loading…</div>;
  if (business.error) return <div className="max-w-6xl mx-auto px-4 py-16">Business not found.</div>;

  const hasPin = business.latitude && business.longitude;
  const mapEmbedUrl = hasPin
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${business.longitude - 0.006}%2C${business.latitude - 0.006}%2C${business.longitude + 0.006}%2C${business.latitude + 0.006}&marker=${business.latitude}%2C${business.longitude}`
    : '';
  const directionsUrl = hasPin
    ? `https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`
    : '';

  const isOwner = (session?.user as any)?.id === business.ownerId;
  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  return (
    <div>
      {(business.status === 'SUSPENDED' || !business.isOpen) && (isOwner || isAdmin) && (
        <div className="bg-clay/10 text-clay text-sm text-center py-2 px-4">
          {business.status === 'SUSPENDED'
            ? 'This shop has been suspended by an admin. It is hidden from customers until reinstated.'
            : 'This shop is temporarily closed. It is hidden from customers until you reopen it.'}
        </div>
      )}
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
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-bold">{business.name}</h1>
              {business.status === 'VERIFIED' && (
                <span className="badge bg-teal-50 text-teal-600">✓ {t.business.verified}</span>
              )}
              {business.status === 'PENDING' && (
                <span className="badge bg-market-100 text-market-600">{t.business.newSeller}</span>
              )}
            </div>
            <p className="text-sm text-night/50 mt-1">
              📍 {business.location} · 📞 {business.phone}
              {business.offersDelivery && ` · 🚚 ${t.business.deliveryAvailable}`}
            </p>
            {business.description && (
              <p className="text-sm text-night/70 mt-2 max-w-xl">{business.description}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
              <button
                onClick={messageSeller}
                disabled={messageLoading}
                className="btn border border-night/15 bg-white hover:bg-night/5"
              >
                Message
              </button>
              <button
                onClick={toggleFollow}
                disabled={followLoading}
                className={
                  following
                    ? 'btn border border-night/15 bg-white hover:bg-night/5'
                    : 'btn btn-primary'
                }
              >
                {following ? 'Following' : '+ Follow'}
              </button>
            </div>
            <span className="text-xs text-night/50">{followerCount} followers</span>
          </div>
        </div>

        {hasPin ? (
          <div className="max-w-6xl mx-auto px-4 pb-6">
            <div className="rounded-card overflow-hidden border border-night/10">
              <iframe title="Shop location" src={mapEmbedUrl} className="w-full h-48" style={{ border: 0 }} loading="lazy"></iframe>
            </div>
            <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary w-full mt-3 justify-center">Get Directions to this shop</a>
          </div>
        ) : null}
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="font-semibold mb-4">
          {business.products.length} {t.business.products}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {business.products.map((p: any) => (
            <ProductCard key={p.id} product={{ ...p, business }} />
          ))}
        </div>
        {business.products.length === 0 && (
          <p className="text-night/50 text-sm">{t.business.noProducts}</p>
        )}
      </div>
    </div>
  );
}