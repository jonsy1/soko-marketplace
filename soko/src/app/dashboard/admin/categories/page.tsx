'use client';

import { useEffect, useState } from 'react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
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
      body: JSON.stringify({ name, parentId: parentId || undefined }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Could not add category.');
      return;
    }
    setName('');
    setParentId('');
    load();
  }

  async function remove(id: string) {
    if (
      !confirm(
        'Delete this category? Its products will become uncategorized, and any subcategories will move to top level.'
      )
    )
      return;
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold mb-1">Categories</h1>
      <p className="text-night/60 text-sm mb-6">
        Create top-level categories (e.g. Real Estate), then add subcategories under them (e.g.
        Apartments, Land, Houses) so products stay organized and don&apos;t mix together.
      </p>

      <form onSubmit={addCategory} className="card p-4 mb-6 space-y-3">
        <div>
          <label className="label">New category name</label>
          <input
            className="input"
            placeholder="e.g. Real Estate, or Apartments"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Parent category (optional — leave blank for a top-level category)</label>
          <select className="input" value={parentId} onChange={(e) => setParentId(e.target.value)}>
            <option value="">— None (top-level category) —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary">Add category</button>
      </form>
      {error && <div className="text-sm bg-clay/10 text-clay px-3 py-2 rounded-card mb-4">{error}</div>}

      <div className="space-y-3">
        {categories.map((c) => (
          <div key={c.id} className="card">
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="text-sm text-night/50">{c._count.products} products directly in this category</p>
              </div>
              <button onClick={() => remove(c.id)} className="btn btn-outline !text-clay !border-clay/30 text-xs">
                Delete
              </button>
            </div>
            {c.children.length > 0 && (
              <div className="border-t border-night/10 divide-y divide-night/10">
                {c.children.map((sub: any) => (
                  <div key={sub.id} className="pl-8 pr-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">↳ {sub.name}</p>
                      <p className="text-xs text-night/50">{sub._count.products} products</p>
                    </div>
                    <button
                      onClick={() => remove(sub.id)}
                      className="btn btn-outline !text-clay !border-clay/30 text-xs"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {categories.length === 0 && <p className="text-sm text-night/50">No categories yet.</p>}
      </div>
    </div>
  );
}
