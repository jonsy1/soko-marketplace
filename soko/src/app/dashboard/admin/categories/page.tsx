'use client';

import { useEffect, useState } from 'react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  function load() {
    fetch('/api/categories')
      .then((r) => r.json())
      .then(setCategories);
  }

  useEffect(load, []);

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim()) return;
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Could not add category.');
      return;
    }
    setName('');
    load();
  }

  async function remove(id: string) {
    if (!confirm('Delete this category? Products in it will become uncategorized.')) return;
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold mb-6">Categories</h1>

      <form onSubmit={addCategory} className="flex gap-2 mb-6">
        <input
          className="input"
          placeholder="New category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="btn btn-primary whitespace-nowrap">Add</button>
      </form>
      {error && <div className="text-sm bg-clay/10 text-clay px-3 py-2 rounded-card mb-4">{error}</div>}

      <div className="card divide-y divide-night/10">
        {categories.map((c) => (
          <div key={c.id} className="p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold">{c.name}</p>
              <p className="text-sm text-night/50">{c._count.products} products</p>
            </div>
            <button onClick={() => remove(c.id)} className="btn btn-outline !text-clay !border-clay/30 text-xs">
              Delete
            </button>
          </div>
        ))}
        {categories.length === 0 && <p className="p-4 text-sm text-night/50">No categories yet.</p>}
      </div>
    </div>
  );
}
