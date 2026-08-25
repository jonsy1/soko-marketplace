'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState('');
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

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Image is too large. Please choose one under 2MB.');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setForm((f: any) => ({ ...f, imageUrl: result }));
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
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
          <label