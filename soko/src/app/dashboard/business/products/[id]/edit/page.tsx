'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { upload } from '@vercel/blob/client';
import { compressImage } from '@/lib/compressImage';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then(setCategories);
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((p) => {
        setForm({
          name: p.name,
          description: p.description || '',
          price: p.price,
          quantity: p.quantity,
          imageUrl: p.imageUrl || '',
          categoryId: p.categoryId || '',
        });
        setImagePreview(p.imageUrl || '');
      });
  }, [id]);

  function removeImage() {
    setForm((f: any) => ({ ...f, imageUrl: '' }));
    setImagePreview('');
  }

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
      setForm((f: any) => ({ ...f, imageUrl: blob.url }));
    } catch {
      setError('Could not upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'Could not save changes.');
      return;
    }
    router.push('/dashboard/business/products');
    router.refresh();
  }

  if (!form) return <div className="max-w-lg mx-auto px-4 py-10 text-night/50">Loading…</div>;

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold mb-6">Edit product</h1>
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
          <label className="label">Product photo (up to 10MB)</label>
          <input
            type="file"
            accept="image/*"
            className="input"
            onChange={handleImageChange}
            disabled={uploading}
          />
          {imagePreview && (
            <div>
              <div className="relative mt-3 inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="rounded-card border border-night/10 max-h-48 object-cover"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-night/40 rounded-card flex items-center justify-center text-white text-xs font-semibold">
                    Uploading…
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={removeImage}
                className="btn btn-outline !text-clay !border-clay/30 text-xs mt-2 block"
              >
                Remove photo
              </button>
            </div>
          )}
        </div>
        <button className="btn btn-primary w-full" disabled={loading || uploading}>
          {loading ? 'Saving…' : uploading ? 'Uploading photo…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}