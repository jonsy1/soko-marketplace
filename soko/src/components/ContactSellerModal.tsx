'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import StarRating from './StarRating';

interface ContactSellerModalProps {
  business: {
    id: string;
    name: string;
    phone: string;
    logoUrl?: string | null;
    description?: string | null;
    isOpen: boolean;
    location: string;
    latitude?: number | null;
    longitude?: number | null;
  };
  distance?: string | null;
  onClose: () => void;
}

function toWhatsAppNumber(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) return `255${digits.slice(1)}`;
  if (digits.startsWith('255')) return digits;
  return digits;
}

export default function ContactSellerModal({ business, distance, onClose }: ContactSellerModalProps) {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const [reviews, setReviews] = useState<any[]>([]);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const waNumber = toWhatsAppNumber(business.phone);
  const directionsUrl =
    business.latitude && business.longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`
      : null;

  const loadReviews = () => {
    setLoadingReviews(true);
    fetch(`/api/reviews?businessId=${business.id}`)
      .then((r) => r.json())
      .then((data) => {
        setReviews(data.reviews || []);
        setAverage(data.average || 0);
        setCount(data.count || 0);
      })
      .finally(() => setLoadingReviews(false));
  };

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business.id]);

  const handleSubmitReview = async () => {
    if (myRating < 1) return;
    setSubmitting(true);
    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: business.id, rating: myRating, comment: myComment }),
      });
      setSubmitted(true);
      setMyComment('');
      loadReviews();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-night/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Photo */}
        <div className="relative">
          {business.logoUrl ? (
            <img src={business.logoUrl} alt={business.name} className="w-full h-48 object-cover" />
          ) : (
            <div className="w-full h-48 bg-market-50 flex items-center justify-center text-market-300">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 9l1.5-5h15L21 9" />
                <path d="M3 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0" />
                <path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9" />
              </svg>
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-night/70 hover:bg-white transition"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-night">{business.name}</h2>
            {!loadingReviews && count > 0 && (
              <span className="flex items-center gap-1 bg-teal-50 text-teal-600 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0">
                <StarRating value={average} size={12} />
                {average.toFixed(1)}
              </span>
            )}
          </div>
          {business.description && (
            <p className="text-sm text-night/50 mt-0.5">{business.description}</p>
          )}

          {/* Pills */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                business.isOpen ? 'bg-teal-50 text-teal-600' : 'bg-clay-50 text-clay-600'
              }`}
            >
              {business.isOpen ? 'Open now' : 'Closed'}
            </span>
            {distance && (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-market-50 text-market-600">
                {distance} away
              </span>
            )}
          </div>

          <p className="text-sm text-night/60 mt-4">
            Contact this shop directly or get directions to visit in person.
          </p>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 mt-5">
            <Link
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl py-3 transition text-sm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20zm4.4-5.8c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5l.4-.4c.1-.1.2-.2.2-.4.1-.1 0-.3 0-.4l-.7-1.6c-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.4c.1.2 1.6 2.5 3.9 3.4.5.2 1 .4 1.3.5.5.2 1 .1 1.4.1.4-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1z" />
              </svg>
              WhatsApp
            </Link>
            <Link
              href={`tel:${business.phone}`}
              className="flex items-center justify-center gap-2 bg-market-500 hover:bg-market-600 text-white font-semibold rounded-xl py-3 transition text-sm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="7" y="2" width="10" height="20" rx="2" />
                <path d="M11 18h2" />
              </svg>
              Call shop
            </Link>
            <Link
              href={`sms:${business.phone}`}
              className="flex items-center justify-center gap-2 border border-night/15 text-night/70 hover:bg-night/5 font-semibold rounded-xl py-3 transition text-sm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16v12H7l-3 3V4z" />
              </svg>
              Text message
            </Link>
            {directionsUrl ? (
              <Link
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-clay-500 hover:bg-clay-600 text-white font-semibold rounded-xl py-3 transition text-sm"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Get directions
              </Link>
            ) : (
              <div />
            )}
          </div>

          {/* Shop location */}
          <div className="mt-5 bg-market-50 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-market-500 shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-night">Shop location</p>
              <p className="text-xs text-night/50">{business.location}</p>
            </div>
          </div>

          {/* Rate this shop */}
          <div className="mt-6 border-t border-night/10 pt-5">
            <p className="font-semibold text-night text-sm mb-2">Rate this shop</p>
            {isLoggedIn ? (
              submitted ? (
                <p className="text-sm text-teal-600">Asante kwa review yako!</p>
              ) : (
                <div>
                  <StarRating value={myRating} interactive size={26} onChange={setMyRating} />
                  <textarea
                    value={myComment}
                    onChange={(e) => setMyComment(e.target.value)}
                    placeholder="Andika maoni yako (si lazima)"
                    rows={2}
                    className="input rounded-xl mt-2 text-sm"
                  />
                  <button
                    onClick={handleSubmitReview}
                    disabled={myRating < 1 || submitting}
                    className="mt-2 bg-market-500 hover:bg-market-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl px-4 py-2 transition"
                  >
                    {submitting ? 'Inatuma…' : 'Tuma review'}
                  </button>
                </div>
              )
            ) : (
              <Link href="/login" className="text-sm text-market-500 hover:underline">
                Ingia ili utoe review
              </Link>
            )}
          </div>

          {/* Existing reviews */}
          {count > 0 && (
            <div className="mt-5 space-y-3">
              {reviews.slice(0, 5).map((r) => (
                <div key={r.id} className="border-t border-night/5 pt-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-night">{r.customer?.name || 'Soko Customer'}</p>
                    <StarRating value={r.rating} size={12} />
                  </div>
                  {r.comment && <p className="text-xs text-night/60 mt-0.5">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}