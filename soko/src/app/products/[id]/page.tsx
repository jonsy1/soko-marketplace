'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useTranslation } from '@/components/LanguageProvider';
import { useCart } from '@/components/CartContext';

function formatTZS(n: number) {
  return 'TZS ' + Math.round(n).toLocaleString('en-US');
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useTranslation();
  const { addItem } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [delivery, setDelivery] = useState('CUSTOMER_PICKUP');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [placing, setPlacing] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then(setProduct);
  }, [id]);

  async function placeOrder() {
    setError('');
    setSuccess('');
    if (!session?.user) {
      router.push('/login');
      return;
    }
    setPlacing(true);
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: id, quantity, deliveryOption: delivery, note }),
    });
    const data = await res.json();
    setPlacing(false);
    if (!res.ok) {
      setError(data.error || 'Could not place order.');
      return;
    }
    setSuccess(t.product.orderSuccess);
  }

  function handleAddToCart() {
    if (!session?.user) {
      router.push('/login');
      return;
    }
    addItem(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl || null,
        maxQuantity: product.quantity,
        businessId: product.business.id,
        businessName: product.business.name,
      },
      quantity
    );
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  }

  if (!product) return <div className="max-w-5xl mx-auto px-4 py-16 text-night/50">{t.product.loading}</div>;
  if (product.error) return <div className="max-w-5xl mx-auto px-4 py-16">{t.product.notFound}</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10">
      <div className="aspect-square bg-market-100 rounded-card overflow-hidden relative flex items-center justify-center">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            className="object-cover"
          />
        ) : (
          <span className="text-market-600 font-display text-6xl font-bold opacity-40">
            {product.name?.[0]?.toUpperCase()}
          </span>
        )}
      </div>

      <div>
        <Link href={`/business/${product.business.slug}`} className="text-sm text-teal-600 font-semibold">
          {product.business.name} · {product.business.location}
        </Link>
        {product.business.latitude && product.business.longitude && (
          
            href={`https://www.google.com/maps/dir/?api=1&destination=${product.business.latitude},${product.business.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-3 inline-flex items-center gap-1 text-sm font-semibold border border-teal-500/40 text-teal-600 rounded-full px-3 py-1 hover:bg-teal-50 transition"
          >
            📍 Locate shop
          </a>
        )}
        <h1 className="font-display text-2xl font-bold mt-2">{product.name}</h1>
        <p className="text-teal-600 font-bold text-2xl mt-2">{formatTZS(product.price)}</p>
        {product.category && (
          <span className="badge bg-market-100 text-market-600 mt-2">{product.category.name}</span>
        )}
        <p className="text-night/70 text-sm mt-4 whitespace-pre-line">
          {product.description || t.product.noDescription}
        </p>
        <p className="text-sm text-night/50 mt-2">
          {product.quantity > 0 ? `${product.quantity} ${t.product.inStock}` : t.product.outOfStock}
        </p>

        <div className="card p-5 mt-6 space-y-4">
          <h2 className="font-semibold">{t.product.placeOrder}</h2>
          {error && <div className="text-sm bg-clay/10 text-clay px-3 py-2 rounded-card">{error}</div>}
          {success && (
            <div className="text-sm bg-teal-50 text-teal-600 px-3 py-2 rounded-card">{success}</div>
          )}
          {!success && (
            <>
              <div>
                <label className="label">{t.product.quantity}</label>
                <input
                  type="number"
                  min={1}
                  max={product.quantity || 1}
                  className="input"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
              <div>
                <label className="label">{t.product.deliveryOption}</label>
                <select className="input" value={delivery} onChange={(e) => setDelivery(e.target.value)}>
                  {product.business.offersDelivery && (
                    <option value="SELLER_DELIVERY">{t.product.sellerDelivery}</option>
                  )}
                  <option value="CUSTOMER_PICKUP">{t.product.pickup}</option>
                  <option value="MEET_DIRECTLY">{t.product.meetDirectly}</option>
                </select>
              </div>
              <div>
                <label className="label">{t.product.noteOptional}</label>
                <textarea
                  className="input"
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t.product.notePlaceholder}
                />
              </div>
              <button
                className="btn btn-primary w-full"
                disabled={placing || product.quantity < 1}
                onClick={placeOrder}
              >
                {placing
                  ? t.product.placing
                  : product.quantity < 1
                  ? t.product.outOfStock
                  : `${t.product.order} · ${formatTZS(product.price * quantity)}`}
              </button>
              <button
                className={`btn w-full border ${
                  addedToCart
                    ? 'border-teal-500 bg-teal-50 text-teal-600'
                    : 'border-night/15 bg-white hover:bg-night/5'
                }`}
                disabled={product.quantity < 1}
                onClick={handleAddToCart}
              >
                {addedToCart ? `✓ ${t.product.addedToCart}` : `🛒 ${t.product.addToCart}`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}