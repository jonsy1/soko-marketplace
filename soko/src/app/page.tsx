'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useTranslation } from '@/components/LanguageProvider';
import { ProductGridSkeleton } from '@/components/Skeleton';
import HeroSlider from '@/components/HeroSlider';

// Dynamic imports
const ProductCard = dynamic(() => import('@/components/ProductCard'), {
  loading: () => <div className="skeleton h-64 rounded-card" />,
  ssr: false,
});

export default function HomePage() {
  return (
    <Suspense fallback={<div className="h-screen animate-pulse bg-market-50" />}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(
    searchParams.get('category')
  );
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
        .then((data) => {
          setProducts(Array.isArray(data) ? data : []);
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [q, activeCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      router.push(`/?q=${encodeURIComponent(q.trim())}`);
    }
  };

  const handleCategoryClick = (slug: string) => {
    setActiveCategory(slug);
    router.push(`/?category=${slug}`);
  };

  const handleShopNow = () => {
    if (q.trim()) {
      router.push(`/?q=${encodeURIComponent(q.trim())}`);
    } else {
      document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!isMounted) {
    return <div className="h-screen animate-pulse bg-market-50" />;
  }

  return (
    <div>
      {/* HERO SLIDER */}
      <div className="max-w-6xl mx-auto px-4 pt-4">
        <HeroSlider />
      </div>

      {/* BUYER TOOLS - eye-catching entry point */}
      <section className="max-w-6xl mx-auto px-4 py-6">
        <Link
          href="/buyer-tools"
          className="relative overflow-hidden flex items-center gap-4 bg-gradient-to-r from-night to-night/90 rounded-3xl p-5 group"
        >
          <span className="w-14 h-14 rounded-2xl bg-market-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14.7 6.3a4 4 0 0 0-5.66 5.66L4 17l3 3 5.04-5.04a4 4 0 0 0 5.66-5.66l-2.6-2.6-1.4 1.4-1.4-1.4 1.4-1.4z" />
            </svg>
          </span>
          <div className="flex-1">
            <p className="font-display text-lg font-bold text-white">Buyer Tools</p>
            <p className="text-white/60 text-sm">Compare prices, find shops nearby, and shop smarter</p>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/50 shrink-0">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>
      </section>

      {/* SHOPS NEAR YOU - link to full page */}
      <section className="max-w-6xl mx-auto px-4 py-4">
        <Link
          href="/nearby"
          className="flex items-center gap-3 bg-market-50 border border-night/10 rounded-2xl p-4 hover:bg-market-100 transition"
        >
          <span className="w-11 h-11 rounded-full bg-market-500 text-white flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </span>
          <div className="flex-1">
            <p className="font-semibold text-night text-sm">Shops near you</p>
            <p className="text-night/50 text-xs">See nearby shops on the map</p>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-night/40 shrink-0">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>
      </section>

      {/* PRODUCTS SECTION */}
      <section id="products-section" className="max-w-6xl mx-auto px-4 py-8">
        {/* Category filters - scrollable */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
          <button
            onClick={() => {
              setActiveCategory(null);
              router.push('/');
            }}
            className={`rounded-full text-xs px-5 py-2 whitespace-nowrap transition ${
              !activeCategory
                ? 'bg-night text-market-50'
                : 'bg-white border border-night/15 text-night/60 hover:border-night/30'
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => handleCategoryClick(c.slug)}
              className={`rounded-full text-xs px-5 py-2 whitespace-nowrap transition ${
                activeCategory === c.slug
                  ? 'bg-night text-market-50'
                  : 'bg-white border border-night/15 text-night/60 hover:border-night/30'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Subcategories */}
        {(() => {
          const activeParent = categories.find((c) => c.slug === activeCategory);
          if (!activeParent || activeParent.children.length === 0) return null;
          return (
            <div className="flex gap-2 overflow-x-auto pb-3 -mt-3 mb-6 scrollbar-hide">
              {activeParent.children.map((sub: any) => (
                <button
                  key={sub.id}
                  onClick={() => handleCategoryClick(sub.slug)}
                  className={`rounded-full text-xs px-4 py-1.5 whitespace-nowrap transition ${
                    activeCategory === sub.slug
                      ? 'bg-market-500 text-white'
                      : 'bg-white/80 border border-night/10 text-night/60'
                  }`}
                >
                  {sub.name} ({sub._count.products})
                </button>
              ))}
            </div>
          );
        })()}

        {/* Products Grid */}
        {loading ? (
          <ProductGridSkeleton count={10} />
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="font-semibold text-night/70 text-lg">
              {q || activeCategory ? 'No products found' : 'Start exploring'}
            </p>
            <p className="text-sm text-night/50 mt-1">
              {q || activeCategory
                ? 'Try adjusting your search or filters'
                : 'Browse categories to find amazing products'}
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-night/50 mb-4">
              {products.length} products found
              {q && ` for "${q}"`}
              {activeCategory && ` in ${categories.find(c => c.slug === activeCategory)?.name || ''}`}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.map((p) => (
                <div key={p.id}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}