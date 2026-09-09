'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { upload } from '@vercel/blob/client';
import { compressImage } from '@/lib/compressImage';

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    costPrice: '',
    quantity: '',
    imageUrl: '',
    categoryId: '',
  });
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then(setCategories);
  }, []);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('Image is too large. Please choose one under 10MB.');
      return;
    }

    setError('');
    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const blob = await upload(compressed.name, compressed, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });
      setForm((f) => ({ ...f, imageUrl: blob.url }));
    } catch {
      setError('Could not upload image. Please try again.');
      setImagePreview('');
    } finally {
      setUploading(false);
    }
  }

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
    <div className="max-w-lg mx-auto px-4 py-8 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-night">List an item</h1>
        <button
          type="button"
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-night/5 hover:bg-night/10 flex items-center justify-center text-night/60 transition"
          aria-label="Close"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="text-sm bg-clay-50 text-clay-600 px-3 py-2 rounded-card">{error}</div>
        )}

        {/* Photo */}
        <div>
          <label className="label text-night font-semibold">Add photo</label>
          <p className="text-xs text-night/50 mb-3">One photo per listing</p>
          <label
            htmlFor="product-photo"
            className="relative flex w-32 h-32 items-center justify-center rounded-2xl border-2 border-dashed border-night/15 bg-white overflow-hidden cursor-pointer hover:border-market-400 transition"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="flex flex-col items-center gap-1 text-market-500">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span className="text-xs font-medium">Add photo</span>
              </span>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-night/40 flex items-center justify-center text-white text-xs font-semibold">
                Uploading…
              </div>
            )}
            <input
              id="product-photo"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
              disabled={uploading}
            />
          </label>
        </div>

        {/* Name */}
        <div>
          <label className="label text-night font-semibold">Product name</label>
          <input
            className="input rounded-xl"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        {/* Description */}
        <div>
          <label className="label text-night font-semibold">Description</label>
          <textarea
            className="input rounded-xl"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {/* Price */}
        <div>
          <label className="label text-night font-semibold">Price</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-night/40 text-sm font-medium">
              TZS
            </span>
            <input
              type="number"
              min={0}
              className="input rounded-xl pl-14 text-lg font-semibold text-clay-500"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label text-night font-semibold">Purchase cost</label>
            <input
              type="number"
              min={0}
              className="input rounded-xl"
              value={form.costPrice}
              onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="label text-night font-semibold">Quantity</label>
            <input
              type="number"
              min={0}
              className="input rounded-xl"
              required
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="label text-night font-semibold">Category</label>
          <select
            className="input rounded-xl"
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

        <div className="bg-teal-50 text-teal-600 text-sm rounded-xl px-4 py-3 flex items-start gap-2">
          <span>✅</span>
          <span>Buyers trust listings with clear photos and full details. Fill in as much as you can.</span>
        </div>

        <button
          className="w-full bg-market-500 hover:bg-market-600 text-white font-semibold rounded-xl py-3.5 transition disabled:opacity-60"
          disabled={loading || uploading}
        >
          {loading ? 'Saving…' : uploading ? 'Uploading photo…' : 'Publish listing'}
        </button>
      </form>
    </div>
  );
}