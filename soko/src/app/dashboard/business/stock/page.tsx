'use client';

import { useEffect, useState } from 'react';

function formatTZS(n: number) {
  return 'TZS ' + Math.round(n).toLocaleString('en-US');
}

export default function StockLedgerPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  function load() {
    Promise.all([
      fetch('/api/products?mine=true').then((r) => r.json()),
      fetch('/api/business/stock').then((r) => r.json()),
    ]).then(([p, s]) => {
      setProducts(Array.isArray(p) ? p : []);
      setEntries(Array.isArray(s) ? s : []);
      setLoading(false);
    });
  }

  useEffect(load, []);

  async function addStock(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!productId) {
      setError('Please choose a product.');
      return;
    }
    setSaving(true);
    const res = await fetch('/api/business/stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity, costPrice, note }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || 'Could not add stock.');
      return;
    }
    setSuccess('Stock added.');
    setQuantity('');
    setCostPrice('');
    setNote('');
    load();
  }

  const lowStock = products.filter((p) => p.quantity <= 3);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold mb-1">Stock Ledger</h1>
      <p className="text-night/50 text-sm mb-6">Record every restock so Soko can track your profit automatically.</p>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="bg-clay/10 text-clay text-sm rounded-card px-4 py-3 mb-6">
          <p className="font-semibold mb-1">⚠️ Low or out of stock</p>
          <p>{lowStock.map((p) => `${p.name} (${p.quantity})`).join(', ')}</p>
        </div>
      )}

      {/* Add stock form */}
      <form onSubmit={addStock} className="card p-5 space-y-4 mb-8">
        <h2 className="font-semibold">Add stock (restock)</h2>
        {error && <div className="text-sm bg-clay/10 text-clay px-3 py-2 rounded-card">{error}</div>}
        {success && <div className="text-sm bg-teal-50 text-teal-600 px-3 py-2 rounded-card">{success}</div>}
        <div>
          <label className="label">Product</label>
          <select className="input" value={productId} onChange={(e) => setProductId(e.target.value)} required>
            <option value="">Select a product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (current stock: {p.quantity})
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Quantity purchased</label>
            <input
              type="number"
              min={1}
              className="input"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Cost per unit (TZS)</label>
            <input
              type="number"
              min={0}
              className="input"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <label className="label">Note (optional)</label>
          <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. supplier name" />
        </div>
        <button className="btn btn-primary w-full" disabled={saving}>
          {saving ? 'Saving…' : '+ Add stock entry'}
        </button>
      </form>

      {/* Current stock overview */}
      <h2 className="font-semibold mb-3">Current stock</h2>
      {loading ? (
        <p className="text-night/50 text-sm mb-8">Loading…</p>
      ) : (
        <div className="card divide-y divide-night/10 mb-8">
          {products.map((p) => (
            <div key={p.id} className="p-3 flex items-center justify-between text-sm">
              <span className="font-medium">{p.name}</span>
              <div className="flex items-center gap-4 text-night/50">
                <span>Cost: {p.costPrice ? formatTZS(p.costPrice) : '—'}</span>
                <span>Sell: {formatTZS(p.price)}</span>
                <span className={p.quantity <= 3 ? 'text-clay font-semibold' : 'font-semibold'}>
                  Stock: {p.quantity}
                </span>
              </div>
            </div>
          ))}
          {products.length === 0 && <p className="p-4 text-night/50 text-sm">No products yet.</p>}
        </div>
      )}

      {/* Ledger history */}
      <h2 className="font-semibold mb-3">Purchase history</h2>
      <div className="card divide-y divide-night/10">
        {entries.map((e) => (
          <div key={e.id} className="p-3 text-sm flex items-center justify-between">
            <div>
              <p className="font-medium">{e.product.name}</p>
              <p className="text-night/50 text-xs">
                {new Date(e.createdAt).toLocaleDateString()} · +{e.quantity} units @ {formatTZS(e.costPrice)}
                {e.note ? ` · ${e.note}` : ''}
              </p>
            </div>
            <span className="font-semibold">{formatTZS(e.costPrice * e.quantity)}</span>
          </div>
        ))}
        {entries.length === 0 && !loading && (
          <p className="p-4 text-night/50 text-sm">No stock entries yet — add your first restock above.</p>
        )}
      </div>
    </div>
  );
}