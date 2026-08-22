'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

function formatTZS(n: number) {
  return 'TZS ' + Math.round(n).toLocaleString('en-US');
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [delivery, setDelivery] = useState('CUSTOMER_PICKUP');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [placing, setPlacing] = useState(false);

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
    setSuccess('Order placed! The seller will contact you to arrange delivery or pickup.');
  }

  if (!product) return <div className="max-w-5xl mx-auto px-4 py-16 text-night/50">Loading…</div>;
  if (product.error) return <div className="max-w-5xl mx-auto px-4 py-16">Product not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10">
      <div className="aspect-square bg-market-100 rounded-card overflow-hidden flex items-center justify-center">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
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
        <h1 className="font-display text-2xl font-bold mt-2">{product.name}</h1>
        <p className="text-teal-600 font-bold text-2xl mt-2">{formatTZS(product.price)}</p>
        {product.category && (
          <span className="badge bg-market-100 text-market-600 mt-2">{product.category.name}</span>
        )}
        <p className="text-night/70 text-sm mt-4 whitespace-pre-line">
          {product.description || 'No description provided.'}
        </p>
        <p className="text-sm text-night/50 mt-2">
          {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
        </p>

        <div className="card p-5 mt-6 space-y-4">
          <h2 className="font-semibold">Place an order</h2>
          {error && <div className="text-sm bg-clay/10 text-clay px-3 py-2 rounded-card">{error}</div>}
          {success && (
            <div className="text-sm bg-teal-50 text-teal-600 px-3 py-2 rounded-card">{success}</div>
          )}
          {!success && (
            <>
              <div>
                <label className="label">Quantity</label>
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
                <label className="label">Delivery option</label>
                <select className="input" value={delivery} onChange={(e) => setDelivery(e.target.value)}>
                  {product.business.offersDelivery && (
                    <option value="SELLER_DELIVERY">Seller delivery</option>
                  )}
                  <option value="CUSTOMER_PICKUP">Pickup from seller</option>
                  <option value="MEET_DIRECTLY">Meet directly to exchange</option>
                </select>
              </div>
              <div>
                <label className="label">Note to seller (optional)</label>
                <textarea
                  className="input"
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Preferred time, color, size, etc."
                />
              </div>
              <button
                className="btn btn-primary w-full"
                disabled={placing || product.quantity < 1}
                onClick={placeOrder}
              >
                {placing
                  ? 'Placing order…'
                  : product.quantity < 1
                  ? 'Out of stock'
                  : `Order · ${formatTZS(product.price * quantity)}`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
