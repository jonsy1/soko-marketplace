'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { useTranslation } from '@/components/LanguageProvider';

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}

const TILE_STYLES = [
  { bg: '#EFF6FF', text: '#1D4ED8' },
  { bg: '#FEF3C7', text: '#B45309' },
  { bg: '#ECFEFF', text: '#0E7490' },
  { bg: '#FFF7ED', text: '#C2410C' },
];

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
      <section className="relative overflow-hidden bg-gradient-to-br from-night via-[#3B0A6B] to-market-600 text-market-50">
        <svg
          className="pointer-events-none absolute -right-16 top-1/2 -translate-y-1/2 opacity-[0.12] hidden sm:block"
          width="420" height="420" viewBox="0 0 24 24" fill="none" stroke="#FDE68A" strokeWidth="0.6"
        >
          <circle cx="9" cy="20" r="1.4" />
          <circle cx="17" cy="20" r="1.4" />
          <path d="M3 4h2l2.2 11.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6" />
        </svg>
        <div className="max-w-6xl mx-auto px-4 py-14 md:py-20 relative">
          <p className="text-clay font-semibold text-sm uppercase tracking-wide mb-3">
            {t.home.tagline}
          </p>
          <h1 className="font-display font-bold text-3xl md:text-5xl max-w-2xl leading-tight">
            {t.home.title}
          </h1>
          <p className="text-market-50/70 mt-4 max-w-xl">{t.home.subtitle}</p>
          <div className="mt-8 max-w-xl flex flex-col sm:flex-row gap-3">
            <input
              className="flex-1 rounded-card px-4 py-3 text-ink text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-market-400"
              placeholder={t.home.searchPlaceholder}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button className="btn bg-clay text-white font-semibold px-6 hover:brightness-110 shrink-0">
              {t.home.allCategories === 'All categories' ? 'Shop now' : t.home.allCategories} →
            </button>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {categories.slice(0, 4).map((c, i) => {
              const style = TILE_STYLES[i % TILE_STYLES.length];
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.slug)}
                  className="rounded-card p-4 text-left hover:shadow-md transition"
                  style={{ backgroundColor: style.bg }}
                >
                  <p className="font-semibold text-sm" style={{ color: style.text }}>
                    {c.name}
                  </p>
                  <p className="text-xs mt-1" style={{ color: style.text }}>
                    View →
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          <button
            onClick={() => setActiveCategory(null)}
            className={`rounded-full text-xs px-4 py-1.5 whitespace-nowrap transition ${
              !activeCategory
                ? 'bg-market-500 text-white'
                : 'bg-white border border-night/15 text-night/60'
            }`}
          >
            {t.home.allCategories}
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.slug)}
              className={`rounded-full text-xs px-4 py-1.5 whitespace-nowrap transition ${
                activeCategory === c.slug
                  ? 'bg-market-500 text-white'
                  : 'bg-white border border-night/15 text-night/60'
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
              <Link href="/register-business" className="text-teal-500 font-semibold">
                {t.home.openStorefront}
              </Link>
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