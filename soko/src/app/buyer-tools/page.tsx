'use client';

import Link from 'next/link';

const TOOLS = [
  {
    href: '/nearby',
    title: 'Nearby Sellers',
    description: 'Find shops close to you on the map',
    color: 'bg-market-500',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    available: true,
  },
  {
    href: '/buyer-tools/compare',
    title: 'Compare Prices',
    description: 'See the same product from different sellers',
    color: 'bg-teal-500',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3v18h18" />
        <path d="M7 15l4-4 3 3 5-6" />
      </svg>
    ),
    available: false,
  },
  {
    href: '/buyer-tools/wishlist',
    title: 'Wishlist & Price Alerts',
    description: 'Save products and get notified on price drops',
    color: 'bg-clay-500',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
      </svg>
    ),
    available: false,
  },
  {
    href: '/buyer-tools/delivery-estimator',
    title: 'Delivery Estimator',
    description: 'See estimated delivery or pickup time before ordering',
    color: 'bg-market-600',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="6" width="15" height="12" rx="1" />
        <path d="M16 10h4l3 3v5h-7" />
        <circle cx="5.5" cy="18.5" r="1.5" />
        <circle cx="17.5" cy="18.5" r="1.5" />
      </svg>
    ),
    available: true,
  },
];

export default function BuyerToolsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-night mb-1">Buyer Tools</h1>
      <p className="text-night/50 text-sm mb-8">Everything to help you shop smarter on Soko.</p>

      <div className="grid sm:grid-cols-2 gap-4">
        {TOOLS.map((tool) =>
          tool.available ? (
            <Link
              key={tool.href}
              href={tool.href}
              className="card p-5 flex items-start gap-4 hover:shadow-md transition"
            >
              <span className={`w-12 h-12 rounded-2xl ${tool.color} text-white flex items-center justify-center shrink-0`}>
                {tool.icon}
              </span>
              <div>
                <p className="font-semibold text-night">{tool.title}</p>
                <p className="text-sm text-night/50 mt-0.5">{tool.description}</p>
              </div>
            </Link>
          ) : (
            <div key={tool.href} className="card p-5 flex items-start gap-4 opacity-50">
              <span className={`w-12 h-12 rounded-2xl ${tool.color} text-white flex items-center justify-center shrink-0`}>
                {tool.icon}
              </span>
              <div>
                <p className="font-semibold text-night">{tool.title}</p>
                <p className="text-sm text-night/50 mt-0.5">{tool.description}</p>
                <span className="inline-block mt-2 text-[10px] font-semibold uppercase tracking-wide text-night/40 bg-night/5 px-2 py-0.5 rounded-full">
                  Coming soon
                </span>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}