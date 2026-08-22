'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then(setCategories);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold mb-6">Browse categories</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {categories.map((c) => (
          <Link key={c.id} href={`/?category=${c.slug}`} className="card p-5 hover:shadow-md transition">
            <p className="font-semibold">{c.name}</p>
            <p className="text-sm text-night/50 mt-1">{c._count.products} products</p>
          </Link>
        ))}
        {categories.length === 0 && (
          <p className="text-night/50 text-sm">No categories yet.</p>
        )}
      </div>
    </div>
  );
}
