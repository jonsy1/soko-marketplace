'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    imageUrl: '',
    categoryId: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then(setCategories);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'Could not add product.');
      return;
    }
    router.push('/dashboard/business/products');
    router.refresh();
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold mb-6">Add a product</h1>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        {error && <div className="text-sm bg-clay/10 text-clay px-3 py-2 rounded-card">{error}</div>}
        <div>
          <label className="label">Product name</label>
          <input
            className="input"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea
            className="input"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Price (TZS)</label>
            <input
              type="number"
              min={0}
              className="input"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Quantity available</label>
            <input
              type="number"
              min={0}
              className="input"
              required
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="label">Category</label>
          <select
            className="input"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          >
            <option value="">No category</option>
            {categories.map((c) =>
              c.children.length > 0 ? (
                <optgroup key={c.id} label={c.name}>
                  {c.children.map((sub: any) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </optgroup>
              ) : (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              )
            )}
          </select>
        </div>
        <div>
          <label className="label">Image URL</label>
          <input
            className="input"
            placeholder="https://…"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          />
        </div>
        <button className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Saving…' : 'Add product'}
        </button>
      </form>
    </div>
  );
}
