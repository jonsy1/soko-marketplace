'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { useTranslation } from '@/components/LanguageProvider';

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const { t } = useTranslation();
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
    const timer = setTimeout(() => {
      fetch(`/api/products?${params.toString()}`)
        .then((r) => r.json())
        .then((data) => setProducts(Array.isArray(data) ? data : []))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [q, activeCategory]);

  return (
    <div>
      <section className="bg-night text-market-50">
        <div className="max-w-6xl mx-auto px-4 py-14 md:py-20">
          <p className="text-market-400 font-semibold text-sm uppercase tracking-wide mb-3">
            {t.home.tagline}
          </p>
          <h1 className="font-display font-bold text-3xl md:text-5xl max-w-2xl leading-tight">
            {t.home.title}
          </h1>
          <p className="text-market-50/70 mt-4 max-w-xl">{t.home.subtitle}</p>
          <div className="mt-8 max-w-xl">
            <input
              className="w-full rounded-card px-4 py-3 text-ink text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-market-400"
              placeholder={t.home.searchPlaceholder}
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
            {t.home.allCategories}
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.slug)}
              className={`btn text-xs px-3 py-1.5 whitespace-nowrap ${
                activeCategory === c.slug ? 'btn-secondary' : 'btn-outline'
              }`}
            >
              {c.name} (
              {c._count.products +
                c.children.reduce((sum: number, sub: any) => sum + sub._count.products, 0)}
              )
            </button>
          ))}
        </div>

        {(() => {
          const activeParent = categories.find((c) => c.slug === activeCategory);
          if (!activeParent || activeParent.children.length === 0) return null;
          return (
            <div className="flex gap-2 overflow-x-auto pb-2 -mt-4 mb-6">
              {activeParent.children.map((sub: any) => (
                <button
                  key={sub.id}
                  onClick={() => setActiveCategory(sub.slug)}
                  className={`btn text-xs px-3 py-1 whitespace-nowrap ${
                    activeCategory === sub.slug
                      ? 'bg-night text-market-50'
                      : 'border border-night/15 text-night/60'
                  }`}
                >
                  {sub.name} ({sub._count.products})
                </button>
              ))}
            </div>
          );
        })()}

        {loading ? (
          <p className="text-night/50 text-sm">{t.home.searching}</p>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-semibold text-night/70">{t.home.noResultsTitle}</p>
            <p className="text-sm text-night/50 mt-1">
              {t.home.noResultsBody}{' '}
              <a href="/register-business" className="text-teal-500 font-semibold">
                {t.home.openStorefront}
              </a>
              .
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-night/50 mb-4">
              {products.length} {t.home.productsFound}
            </p>
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
