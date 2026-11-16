'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useTranslation } from '@/components/LanguageProvider';
import { ProductGridSkeleton } from '@/components/Skeleton';
import HeroSlider from '@/components/HeroSlider';
import HomeShortcuts from '@/components/HomeShortcuts';

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

  // Search and category come straight from the URL, so they update
  // every time the address changes (Navbar search, category buttons, back button).
  const q = searchParams.get('q') || '';
  const activeCategory = searchParams.get('category');

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
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
    setNextCursor(null);
    setTotal(null);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (activeCategory) params.set('category', activeCategory);

    const timer = setTimeout(() => {
      fetch(`/api/products?${params.toString()}`)
        .then(async (r) => {
          const cursor = r.headers.get('X-Next-Cursor');
          const totalHeader = r.headers.get('X-Total-Count');
          const data = await r.json();
          setProducts(Array.isArray(data) ? data : []);
          setNextCursor(cursor);
          setTotal(totalHeader ? parseInt(totalHeader, 10) : null);
        })
        .catch(() => setProducts([]))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [q, activeCategory]);

  // "View more": loads the next batch of products and adds it to the list.
  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (activeCategory) params.set('category', activeCategory);
      params.set('before', nextCursor);

      const r = await fetch(`/api/products?${params.toString()}`);
      const cursor = r.headers.get('X-Next-Cursor');
      const data = await r.json();
      const more: any[] = Array.isArray(data) ? data : [];

      setProducts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...more.filter((p) => !seen.has(p.id))];
      });
      setNextCursor(cursor);
    } catch {
      // Keep what is already on screen. The button stays so the person can try again.
    } finally {
      setLoadingMore(false);
    }
  };

  const handleCategoryClick = (slug: string) => {
    router.push(`/?category=${slug}`);
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

      {/* SHORTCUT CARDS: Buyer Tools, Shops Near You, Company Services */}
      <HomeShortcuts />

      {/* PRODUCTS SECTION */}
      <section id="products-section" className="max-w-6xl mx-auto px-4 py-8">
        {/* Category filters - scrollable */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
          <button
            onClick={() => router.push('/')}
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
              {total !== null ? total : products.length} products found
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

            {nextCursor && (
              <div className="text-center mt-8">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="btn btn-outline px-8 disabled:opacity-60"
                >
                  {loadingMore ? 'Loading...' : 'View more'}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}