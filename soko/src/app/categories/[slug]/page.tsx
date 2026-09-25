'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ProductGridSkeleton } from '@/components/Skeleton';
import { FEATURED_MARKETPLACE_ENABLED } from '@/lib/featureFlags';

const ProductCard = dynamic(() => import('@/components/ProductCard'), {
  loading: () => <div className="skeleton h-64 rounded-card" />,
  ssr: false,
});

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [category, setCategory] = useState<any | null>(null);
  const [activeSlug, setActiveSlug] = useState(slug);
  const [products, setProducts] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Find this category (or its parent + siblings) from the already-cached
  // /api/categories response, instead of adding a new endpoint.
  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((all: any[]) => {
        for (const parent of all) {
          if (parent.slug === slug) {
            setCategory(parent);
            return;
          }
          const child = parent.children?.find((c: any) => c.slug === slug);
          if (child) {
            setCategory({ ...parent, matchedChild: child });
            return;
          }
        }
      })
      .catch(() => {});
  }, [slug]);

  useEffect(() => {
    setActiveSlug(slug);
  }, [slug]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products?category=${activeSlug}`)
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [activeSlug]);

  // Featured/promoted products: architecture is ready, but the promotion
  // system isn't live yet, so this simply does nothing while the flag is off.
  useEffect(() => {
    if (!FEATURED_MARKETPLACE_ENABLED) return;
    fetch(`/api/products?category=${activeSlug}&featured=1`)
      .then((r) => r.json())
      .then((data) => setFeaturedProducts(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [activeSlug]);

  const displayName = category?.matchedChild?.name || category?.name || slug;
  const siblings: any[] = category
    ? [
        { name: category.name, slug: category.slug },
        ...(category.children || []).map((c: any) => ({ name: c.name, slug: c.slug })),
      ]
    : [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-5">
        <Link href="/categories" className="text-night/40 hover:text-night/70">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="font-display text-2xl font-bold text-night">{displayName}</h1>
      </div>

      {/* Subcategory chips, when this category has children */}
      {siblings.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
          {siblings.map((s) => (
            <Link
              key={s.slug}
              href={`/categories/${s.slug}`}
              className={`rounded-full text-xs px-4 py-1.5 whitespace-nowrap transition ${
                activeSlug === s.slug
                  ? 'bg-night text-market-50'
                  : 'bg-white border border-night/15 text-night/60 hover:border-night/30'
              }`}
            >
              {s.name}
            </Link>
          ))}
        </div>
      )}

      {/* Featured/promoted section — only renders once the promotion system is live */}
      {FEATURED_MARKETPLACE_ENABLED && featuredProducts.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-night mb-3">Featured in {displayName}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* All products in this category */}
      {loading ? (
        <ProductGridSkeleton count={10} />
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <p className="font-semibold text-night/70 text-lg">No products in {displayName} yet</p>
          <p className="text-sm text-night/50 mt-1">Check back soon, or explore another category.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-night/50 mb-4">{products.length} products in {displayName}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}