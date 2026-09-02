'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/components/CartContext';
import LocateShop from '@/components/LocateShop';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const productId = params?.id as string;

  useEffect(() => {
    if (!productId) return;
    fetch(`/api/products/${productId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Product not found');
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setProduct(null);
      });
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      maxQuantity: product.quantity || 99,
      businessId: product.business?.id || 'unknown',
      businessName: product.business?.name || 'Soko Seller',
    }, qty);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 3000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      maxQuantity: product.quantity || 99,
      businessId: product.business?.id || 'unknown',
      businessName: product.business?.name || 'Soko Seller',
    }, qty);
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-night/10 rounded mb-6"></div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-night/10 rounded-2xl"></div>
            <div className="space-y-4">
              <div className="h-8 w-3/4 bg-night/10 rounded"></div>
              <div className="h-4 w-1/2 bg-night/10 rounded"></div>
              <div className="h-10 w-1/3 bg-night/10 rounded"></div>
              <div className="h-4 w-full bg-night/10 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-night">Product Not Found</h1>
        <p className="text-night/50 mt-2">The product you are looking for does not exist.</p>
        <Link href="/" className="inline-block mt-6 px-6 py-3 bg-night text-white rounded-xl font-semibold hover:bg-market-500 transition">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <nav className="text-sm text-night/50 mb-6">
        <Link href="/" className="hover:text-market-500">Home</Link>
        <span className="mx-2">/</span>
        {product.category && (
          <>
            <Link href={`/category/${product.category.slug}`} className="hover:text-market-500">
              {product.category.name}
            </Link>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-night">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-market-50">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl bg-market-100 text-market-300">
                📦
              </div>
            )}
          </div>

          {/* Locate Shop - Bolt Style */}
          {product.business && (
            <LocateShop
              businessId={product.business.id}
              businessName={product.business.name}
              latitude={product.business.latitude || null}
              longitude={product.business.longitude || null}
              location={product.business.location}
            />
          )}
        </div>

        <div>
          {product.business && (
            <p className="text-sm text-market-500 font-medium">
              {product.business.name}
              {product.business.location && (
                <span className="text-night/40 ml-2">• {product.business.location}</span>
              )}
            </p>
          )}

          <h1 className="text-2xl md:text-3xl font-bold text-night mt-2">{product.name}</h1>

          <div className="flex items-center gap-3 mt-3">
            <p className="text-2xl font-bold text-night">
              TZS {Number(product.price).toLocaleString()}
            </p>
            {product.quantity > 0 ? (
              <span className="text-sm text-green-600 font-medium">In Stock</span>
            ) : (
              <span className="text-sm text-red-500 font-medium">Out of Stock</span>
            )}
          </div>

          {product.description && (
            <p className="text-night/70 text-sm mt-4 leading-relaxed">{product.description}</p>
          )}

          {product.business && (
            <div className="mt-4 p-3 bg-market-50 rounded-xl">
              <p className="text-xs text-night/60">
                {product.business.offersDelivery ? '🚚 Delivery available' : '📦 Pickup available'}
              </p>
            </div>
          )}

          <div className="mt-6">
            <label className="text-sm font-medium text-night/60">Quantity</label>
            <div className="flex items-center gap-3 mt-1">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-10 h-10 rounded-xl border border-night/15 flex items-center justify-center hover:bg-market-50 transition"
                disabled={qty <= 1}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14" />
                </svg>
              </button>
              <span className="w-12 text-center font-semibold text-lg">{qty}</span>
              <button
                onClick={() => setQty(Math.min(product.quantity || 99, qty + 1))}
                className="w-10 h-10 rounded-xl border border-night/15 flex items-center justify-center hover:bg-market-50 transition"
                disabled={qty >= (product.quantity || 99)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5v14" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              onClick={handleAddToCart}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition ${
                isAdded ? 'bg-green-500 text-white' : 'border-2 border-night text-night hover:bg-night/5'
              }`}
              disabled={product.quantity <= 0}
            >
              {isAdded ? '✅ Added' : '🛒 Add to Cart'}
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 px-6 py-3 bg-night text-white rounded-xl font-semibold hover:bg-market-500 transition"
              disabled={product.quantity <= 0}
            >
              Buy Now →
            </button>
          </div>

          <button onClick={() => router.back()} className="mt-6 text-sm text-night/40 hover:text-night/70 transition">
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}