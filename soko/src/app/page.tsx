'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const [q, setQ] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(
    searchParams.get('category')
  );
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (activeCategory) params.set('category', activeCategory);
    const t = setTimeout(() => {
      fetch(`/api/products?${params.toString()}`)
        .then((r) => r.json())
        .then((data) => setProducts(Array.isArray(data) ? data : []))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [q, activeCategory]);

  return (
    <div>
      <section className="bg-night text-market-50">
        <div className="max-w-6xl mx-auto px-4 py-14 md:py-20">
          <p className="text-market-400 font-semibold text-sm uppercase tracking-wide mb-3">
            One search. Every shop.
          </p>
          <h1 className="font-display font-bold text-3xl md:text-5xl max-w-2xl leading-tight">
            Find any product from any business, in one place.
          </h1>
          <p className="text-market-50/70 mt-4 max-w-xl">
            Soko connects you to registered businesses across Tanzania — compare prices,
            find sellers near you, and order directly. No shop is hidden in a WhatsApp status again.
          </p>
          <div className="mt-8 max-w-xl">
            <input
              className="w-full rounded-card px-4 py-3 text-ink text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-market-400"
              placeholder='Search — try "Air Force 1" or "sofa"'
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          <button
            onClick={() => setActiveCategory(null)}
            className={`btn text-xs px-3 py-1.5 whitespace-nowrap ${
              !activeCategory ? 'btn-secondary' : 'btn-outline'
            }`}
          >
            All categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.slug)}
              className={`btn text-xs px-3 py-1.5 whitespace-nowrap ${
                activeCategory === c.slug ? 'btn-secondary' : 'btn-outline'
              }`}
            >
              {c.name} ({c._count.products})
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-night/50 text-sm">Searching…</p>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-semibold text-night/70">No products found.</p>
            <p className="text-sm text-night/50 mt-1">
              Try a different search, or be the first to list this product —{' '}
              <a href="/register-business" className="text-teal-500 font-semibold">
                open your storefront
              </a>
              .
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-night/50 mb-4">{products.length} products found</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
