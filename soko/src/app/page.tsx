'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useTranslation } from '@/components/LanguageProvider';
import { ProductGridSkeleton } from '@/components/Skeleton';

// Dynamic imports
const ProductCard = dynamic(() => import('@/components/ProductCard'), {
  loading: () => <div className="skeleton h-64 rounded-card" />,
  ssr: false,
});

const HeroProductsBackground = dynamic(() => import('@/components/HeroProductsBackground'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gradient-to-br from-night via-[#3B0A6B] to-market-600" />,
});

export default function HomePage() {
  return (
    <Suspense fallback={<div className="h-screen animate-pulse bg-market-50" />}>
      <HomeContent />
    </Suspense>
  );
}

// Category icons (emoji/icon)
const CATEGORY_ICONS: Record<string, string> = {
  'Agriculture': '🌾',
  'Electronics': '📱',
  'Fashion': '👗',
  'Food & Groceries': '🛒',
  'Beauty': '💄',
  'Home': '🏠',
  'Phones': '📱',
  'Computers': '💻',
  'Accessories': '⌚',
  'Sports': '⚽',
};

const TILE_STYLES = [
  { bg: '#EFF6FF', text: '#1D4ED8' },
  { bg: '#FEF3C7', text: '#B45309' },
  { bg: '#ECFEFF', text: '#0E7490' },
  { bg: '#FFF7ED', text: '#C2410C' },
  { bg: '#F3E8FF', text: '#6D28D9' },
  { bg: '#FCE7F3', text: '#BE185D' },
  { bg: '#E0F2FE', text: '#0369A1' },
  { bg: '#D1FAE5', text: '#047857' },
];

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

  // Get icon for category
  const getCategoryIcon = (name: string) => {
    return CATEGORY_ICONS[name] || '📦';
  };

  return (
    <div>
      {/* Hero Section - Premium */}
      <section className="relative overflow-hidden bg-gradient-to-br from-night via-[#3B0A6B] to-market-600 text-market-50">
        <HeroProductsBackground />
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 relative">
          {/* Tagline */}
          <p className="text-clay font-semibold text-sm uppercase tracking-widest mb-3">
            {t.home.tagline || 'One Search. Every Shop.'}
          </p>
          
          {/* Headline */}
          <h1 className="font-display font-bold text-4xl md:text-6xl max-w-3xl leading-tight">
            {t.home.title || 'Everything you want. One Soko.'}
          </h1>
          
          {/* Subtitle */}
          <p className="text-market-50/70 mt-4 max-w-xl text-lg">
            {t.home.subtitle || 'Find any product from any business, in one place.'}
          </p>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mt-8 max-w-2xl flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                className="w-full rounded-xl px-5 py-3.5 text-ink text-base shadow-lg focus:outline-none focus:ring-2 focus:ring-market-400 transition-shadow focus:shadow-xl bg-white/95 backdrop-blur-sm"
                placeholder={t.home.searchPlaceholder || 'Search — try "Air Force 1" or "sofa"'}
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="px-8 py-3.5 bg-clay text-white font-semibold rounded-xl hover:brightness-110 transition-all shrink-0 shadow-lg"
            >
              Shop now →
            </button>
          </form>

          {/* Quick categories hint */}
          <div className="mt-6 flex gap-4 text-xs text-market-50/50">
            <span>Popular:</span>
            <span className="hover:text-market-50 cursor-pointer">Phones</span>
            <span className="hover:text-market-50 cursor-pointer">Sneakers</span>
            <span className="hover:text-market-50 cursor-pointer">Laptops</span>
            <span className="hover:text-market-50 cursor-pointer">Perfumes</span>
          </div>
        </div>
      </section>

      {/* Categories Section - Premium Grid */}
      {categories.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-night">Shop by Category</h2>
            <Link href="/categories" className="text-sm text-market-500 hover:text-market-600 transition">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((c, i) => {
              const style = TILE_STYLES[i % TILE_STYLES.length];
              const icon = getCategoryIcon(c.name);
              return (
                <button
                  key={c.id}
                  onClick={() => handleCategoryClick(c.slug)}
                  className="group rounded-2xl p-5 text-left transition-all hover:scale-[1.02] active:scale-95 hover:shadow-lg"
                  style={{ backgroundColor: style.bg }}
                >
                  <div className="text-3xl mb-2">{icon}</div>
                  <p className="font-semibold text-sm" style={{ color: style.text }}>
                    {c.name}
                  </p>
                  <p className="text-xs mt-1 opacity-60" style={{ color: style.text }}>
                    {c._count.products + c.children.reduce((sum: number, sub: any) => sum + sub._count.products, 0)} products
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Products Section */}
      <section id="products-section" className="max-w-6xl mx-auto px-4 py-8">
        {/* Category filters */}
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

        {/* Products grid */}
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
                : 'Browse categories to find amazing products'
              }
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-night/50 mb-4">
              {products.length} products found
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