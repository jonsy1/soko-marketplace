'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useTranslation } from '@/components/LanguageProvider';
import { ProductGridSkeleton } from '@/components/Skeleton';
import HeroSlider from '@/components/HeroSlider';
import NearbyShopsSection from '@/components/NearbyShopsSection';

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

// Category icons - SVG line icons (badala ya emoji)
function CategoryIcon({ name }: { name: string }) {
  const p = {
    width: '24',
    height: '24',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.8',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (name) {
    case 'Fashion':
      return (
        <svg {...p}>
          <path d="M12 3a2 2 0 1 1 2 2c0 .9-.8 1.5-1.6 1.9L12 7.2V9" />
          <path d="M12 9L4 14.5A2 2 0 0 0 5 18h14a2 2 0 0 0 1-3.5L12 9z" />
        </svg>
      );
    case 'Electronics':
    case 'Phones':
      return (
        <svg {...p}>
          <rect x="7" y="2" width="10" height="20" rx="2" />
          <path d="M11 18h2" />
        </svg>
      );
    case 'Home':
      return (
        <svg {...p}>
          <path d="M3 10.5L12 3l9 7.5" />
          <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
        </svg>
      );
    case 'Beauty':
      return (
        <svg {...p}>
          <path d="M9 2h6" />
          <path d="M10 2v4l-2 2v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V8l-2-2V2" />
        </svg>
      );
    case 'Food & Groceries':
      return (
        <svg {...p}>
          <circle cx="9" cy="20" r="1.4" />
          <circle cx="17" cy="20" r="1.4" />
          <path d="M3 4h2l2.2 11.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6" />
        </svg>
      );
    case 'Computers':
      return (
        <svg {...p}>
          <rect x="3" y="4" width="18" height="12" rx="1" />
          <path d="M2 20h20" />
        </svg>
      );
    case 'Accessories':
    case 'Watches':
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="6" />
          <path d="M12 9v3l2 2" />
          <path d="M9 3h6M9 21h6" />
        </svg>
      );
    case 'Sports':
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3v18M3 12h18" />
        </svg>
      );
    case 'Women':
    case 'Men':
      return (
        <svg {...p}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M4.5 20c1.2-4 4-6 7.5-6s6.3 2 7.5 6" />
        </svg>
      );
    case 'Kids':
      return (
        <svg {...p}>
          <circle cx="12" cy="7" r="3" />
          <path d="M6 20c0-3.5 2.5-6 6-6s6 2.5 6 6" />
        </svg>
      );
    case 'Health':
      return (
        <svg {...p}>
          <rect x="4" y="4" width="16" height="16" rx="3" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      );
    case 'Automotive':
      return (
        <svg {...p}>
          <path d="M3 13l2-5a2 2 0 0 1 2-1h10a2 2 0 0 1 2 1l2 5" />
          <rect x="2" y="13" width="20" height="5" rx="1.5" />
          <circle cx="7" cy="18" r="1.5" />
          <circle cx="17" cy="18" r="1.5" />
        </svg>
      );
    case 'Books':
      return (
        <svg {...p}>
          <path d="M4 4.5A2.5 2.5 0 0 1 6.5 3H12v18H6.5A2.5 2.5 0 0 1 4 18.5v-14z" />
          <path d="M20 4.5A2.5 2.5 0 0 0 17.5 3H12v18h5.5a2.5 2.5 0 0 0 2.5-2.5v-14z" />
        </svg>
      );
    case 'Music':
      return (
        <svg {...p}>
          <circle cx="6" cy="18" r="2.5" />
          <circle cx="16" cy="16" r="2.5" />
          <path d="M8.5 18V5l10-2v13" />
        </svg>
      );
    case 'Toys':
      return (
        <svg {...p}>
          <path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5L12 3z" />
        </svg>
      );
    case 'Garden':
      return (
        <svg {...p}>
          <path d="M5 21c0-8 5-15 14-15-1 9-6 14-14 15z" />
          <path d="M5 21c2-4 5-7 9-9" />
        </svg>
      );
    case 'Pets':
      return (
        <svg {...p}>
          <circle cx="7" cy="9" r="1.6" />
          <circle cx="12" cy="7" r="1.6" />
          <circle cx="17" cy="9" r="1.6" />
          <path d="M12 12c-3 0-5.5 2-5.5 4.5S8.5 20 12 20s5.5-1 5.5-3.5S15 12 12 12z" />
        </svg>
      );
    case 'Office':
      return (
        <svg {...p}>
          <path d="M8 3h8v14a3 3 0 0 1-6 0V6" />
        </svg>
      );
    case 'Tools':
    case 'Services':
      return (
        <svg {...p}>
          <path d="M14.7 6.3a4 4 0 0 0-5.66 5.66L4 17l3 3 5.04-5.04a4 4 0 0 0 5.66-5.66l-2.6-2.6-1.4 1.4-1.4-1.4 1.4-1.4z" />
        </svg>
      );
    case 'Bags':
      return (
        <svg {...p}>
          <path d="M6 8h12l1 12H5L6 8z" />
          <path d="M9 8V6a3 3 0 0 1 6 0v2" />
        </svg>
      );
    case 'Shoes':
      return (
        <svg {...p}>
          <path d="M3 16c0-2 1.5-3 3-3h2l3-3 4 1c2 .5 4 2 6 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </svg>
      );
    case 'Jewelry':
      return (
        <svg {...p}>
          <path d="M6 9l6-6 6 6-6 11z" />
          <path d="M6 9h12" />
        </svg>
      );
    case 'Agriculture':
      return (
        <svg {...p}>
          <path d="M12 21V9" />
          <path d="M9 12c0-2 1-4 3-5m0 5c0-2-1-4-3-5" />
          <path d="M15 16c0-2 1-4 3-5m-3 5c0-2-1-4 3-5" />
        </svg>
      );
    default:
      return (
        <svg {...p}>
          <path d="M21 8l-9-5-9 5 9 5 9-5z" />
          <path d="M3 8v8l9 5 9-5V8" />
          <path d="M12 13v8" />
        </svg>
      );
  }
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

      {/* CATEGORIES SECTION - horizontal scroll, kama pichani */}
      {categories.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-night">Categories</h2>
            <Link href="/categories" className="text-sm text-market-500 hover:text-market-600 transition font-medium">
              View All →
            </Link>
          </div>

          {/* Horizontal scroll row */}
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
            {categories.slice(0, 12).map((c) => {
              const productCount = c._count.products + c.children.reduce((sum: number, sub: any) => sum + sub._count.products, 0);

              return (
                <button
                  key={c.id}
                  onClick={() => handleCategoryClick(c.slug)}
                  className="group shrink-0 w-20 snap-start flex flex-col items-center text-center"
                >
                  <div className="w-14 h-14 rounded-full bg-market-50 text-market-500 flex items-center justify-center group-hover:bg-market-100 group-hover:scale-105 transition-all duration-300">
                    <CategoryIcon name={c.name} />
                  </div>
                  <p className="font-medium text-xs text-night mt-2 truncate w-full">
                    {c.name}
                  </p>
                  <p className="text-[10px] text-night/40">
                    {productCount} items
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* SHOPS NEAR YOU - ramani/list */}
      <NearbyShopsSection categories={categories} />

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