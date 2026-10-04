'use client';

import Link from 'next/link';

// Soko WhatsApp number in international format, no + and no spaces.
const SOKO_WHATSAPP = '255675588091';

const PROMOTIONS = [
  {
    key: 'BOOST',
    name: 'Boost',
    price: 'TZS 2,000',
    duration: 'for 3 days',
    description:
      'Your product is shown near the top of the marketplace. Boosted products take turns, so each one gets its share of top spots.',
    waName: 'Boost (TZS 2,000 for 3 days)',
  },
  {
    key: 'FEATURED',
    name: 'Featured',
    price: 'TZS 10,000',
    duration: 'for 7 days',
    description:
      'Your product can appear on the big banner at the top of the homepage. Banner spots are limited, so featured products take turns.',
    waName: 'Featured (TZS 10,000 for 7 days)',
  },
];

function buildWhatsAppLink(message: string) {
  const base = SOKO_WHATSAPP ? 'https://wa.me/' + SOKO_WHATSAPP : 'https://wa.me/';
  return base + '?text=' + encodeURIComponent(message);
}

export default function BillingPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold mb-2">Promote your products</h1>
      <p className="text-night/50 text-sm mb-8">
        Pay only when you want more buyers to see a product. No monthly plan, no commitment.
      </p>

      <div className="grid md:grid-cols-2 gap-5">
        {PROMOTIONS.map((promo) => {
          const message = 'Hi Soko, I would like to request ' + promo.waName + ' for one of my products.';
          return (
            <div key={promo.key} className="card p-6 flex flex-col">
              <h2 className="font-display text-xl font-bold text-night">{promo.name}</h2>
              <p className="font-display text-2xl font-bold text-market-600 mt-1">{promo.price}</p>
              <p className="text-sm text-night/50 mb-4">{promo.duration}</p>
              <p className="text-sm text-night/70 mb-6 flex-1">{promo.description}</p>
              <Link
                href={buildWhatsAppLink(message)}
                target="_blank"
                className="btn btn-primary w-full text-center"
              >
                Request on WhatsApp
              </Link>
            </div>
          );
        })}
      </div>

      <div className="card p-5 mt-6">
        <h3 className="font-semibold text-night text-sm mb-2">How it works</h3>
        <ol className="text-sm text-night/70 space-y-1 list-decimal list-inside">
          <li>Tap Request on WhatsApp and tell us which product you want to promote.</li>
          <li>We reply with payment instructions (M-Pesa, Tigo Pesa or Airtel Money).</li>
          <li>After payment is confirmed, we set up your promotion.</li>
        </ol>
      </div>

      <p className="text-xs text-night/40 mt-6">
        Your free tools stay free: dashboard, analytics, low-stock alerts and customer reviews.
      </p>
    </div>
  );
}