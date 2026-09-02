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

// Category icons
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
  'Women': '👩',
  'Men': '👨',
  'Kids': '🧒',
  'Health': '💊',
  'Automotive': '🚗',
  'Books': '📚',
  'Music': '🎵',
  'Toys': '🧸',
  'Garden': '🌿',
  'Pets': '🐾',
  'Office': '📎',
  'Tools': '🔧',
  'Bags': '👜',
  'Shoes': '👟',
  'Watches': '⌚',
  'Jewelry': '💍',
};

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

  const getCategoryIcon = (name: string) => {
    return CATEGORY_ICONS[name] || '📦';
  };

  return (
    <div>
      {/* HERO SLIDER */}
      <div className="max-w-6xl mx-auto px-4 pt-4">
        <HeroSlider />
      </div>

      {/* CATEGORIES SECTION - KIKUU STYLE */}
      {categories.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-night">Categories</h2>
            <Link href="/categories" className="text-sm text-market-500 hover:text-market-600 transition font-medium">
              View All →
            </Link>
          </div>
          
          {/* Category Grid - 2 columns on mobile, 4 on tablet, 6 on desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(0, 12).map((c, i) => {
              const icon = getCategoryIcon(c.name);
              const productCount = c._count.products + c.children.reduce((sum: number, sub: any) => sum + sub._count.products, 0);
              
              return (
                <button
                  key={c.id}
                  onClick={() => handleCategoryClick(c.slug)}
                  className="group relative overflow-hidden rounded-2xl p-4 text-center transition-all hover:scale-[1.03] active:scale-95 bg-white border border-night/5 hover:shadow-lg hover:border-market-200"
                >
                  {/* Icon with bounce effect */}
                  <div className="text-4xl mb-2 group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300">
                    {icon}
                  </div>
                  
                  {/* Category Name */}
                  <p className="font-medium text-sm text-night truncate">
                    {c.name}
                  </p>
                  
                  {/* Product Count */}
                  <p className="text-xs text-night/40 mt-0.5">
                    {productCount} items
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      )}

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
                : 'Browse categories to find amazing products'
              }
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