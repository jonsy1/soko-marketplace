'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ContactSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  businessName: string;
}

interface SellerDetails {
  id: string;
  name: string;
  phone: string;
  location: string;
  slug: string;
  offersDelivery: boolean;
  status: string;
  latitude?: number | null;
  longitude?: number | null;
}

export default function ContactSellerModal({
  isOpen,
  onClose,
  businessId,
  businessName,
}: ContactSellerModalProps) {
  const [sellerDetails, setSellerDetails] = useState<SellerDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !businessId) return;

    const fetchSellerDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/business/${businessId}`);
        if (!res.ok) {
          throw new Error('Failed to load seller details');
        }
        const data = await res.json();
        setSellerDetails(data);
      } catch (err: any) {
        setError(err.message || 'Could not load seller information');
        console.error('Error fetching seller details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerDetails();
  }, [isOpen, businessId]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-night/10 p-4 flex items-center justify-between">
            <h2 className="font-semibold text-night">Contact Seller</h2>
            <button
              onClick={onClose}
              className="text-night/60 hover:text-night text-2xl leading-none"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin">⏳</div>
                <p className="text-night/60 text-sm mt-2">Loading seller info...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 text-sm">❌ {error}</p>
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 bg-night text-white rounded-lg hover:bg-market-500 transition"
                >
                  Close
                </button>
              </div>
            ) : sellerDetails ? (
              <div className="space-y-4">
                {/* Seller Info Card */}
                <div className="bg-market-50 rounded-xl p-4 space-y-3">
                  <div>
                    <p className="text-xs text-night/60 uppercase tracking-wide font-medium">Shop Name</p>
                    <p className="font-semibold text-night text-lg">{sellerDetails.name}</p>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    {sellerDetails.status === 'VERIFIED' && (
                      <span className="badge bg-teal-50 text-teal-600 text-xs">✓ Verified</span>
                    )}
                    {sellerDetails.status === 'PENDING' && (
                      <span className="badge bg-yellow-50 text-yellow-600 text-xs">⏳ New Seller</span>
                    )}
                    {sellerDetails.offersDelivery && (
                      <span className="badge bg-blue-50 text-blue-600 text-xs">🚚 Offers Delivery</span>
                    )}
                  </div>
                </div>

                {/* Contact Details */}
                <div className="space-y-3">
                  {/* Phone */}
                  <div className="flex items-start gap-3">
                    <span className="text-lg">📞</span>
                    <div>
                      <p className="text-xs text-night/60 uppercase tracking-wide font-medium">Phone</p>
                      <a
                        href={`tel:${sellerDetails.phone}`}
                        className="text-market-500 hover:text-market-600 font-medium transition"
                      >
                        {sellerDetails.phone}
                      </a>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-3">
                    <span className="text-lg">📍</span>
                    <div>
                      <p className="text-xs text-night/60 uppercase tracking-wide font-medium">Location</p>
                      <p className="text-night/80 font-medium">{sellerDetails.location}</p>
                    </div>
                  </div>

                  {/* Coordinates (if available) */}
                  {sellerDetails.latitude && sellerDetails.longitude && (
                    <div className="flex items-start gap-3">
                      <span className="text-lg">🗺️</span>
                      <div>
                        <p className="text-xs text-night/60 uppercase tracking-wide font-medium">Coordinates</p>
                        <p className="text-night/80 font-mono text-sm">
                          {sellerDetails.latitude.toFixed(4)}, {sellerDetails.longitude.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-4 border-t border-night/10">
                  {/* Call Button */}
                  <a
                    href={`tel:${sellerDetails.phone}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-night text-white rounded-lg hover:bg-market-500 transition font-medium"
                  >
                    📞 Call Now
                  </a>

                  {/* Message Button */}
                  <Link
                    href={`/business/${sellerDetails.slug}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-market-50 text-market-600 rounded-lg hover:bg-market-100 transition font-medium border border-market-200"
                  >
                    💬 Send Message
                  </Link>

                  {/* View Shop Button */}
                  <Link
                    href={`/business/${sellerDetails.slug}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-night/5 text-night rounded-lg hover:bg-night/10 transition font-medium border border-night/10"
                  >
                    🏪 View Shop →
                  </Link>

                  {/* Google Maps (if coordinates available) */}
                  {sellerDetails.latitude && sellerDetails.longitude && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${sellerDetails.latitude},${sellerDetails.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 text-market-500 rounded-lg hover:text-market-600 transition font-medium text-sm"
                    >
                      🗺️ Get Directions
                    </a>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
