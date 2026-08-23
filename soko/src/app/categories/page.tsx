'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/components/LanguageProvider';

export default function CategoriesPage() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then(setCategories);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold mb-6">{t.categories.title}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((c) => {
          const total =
            c._count.products +
            c.children.reduce((sum: number, sub: any) => sum + sub._count.products, 0);
          return (
            <div key={c.id} className="card p-5">
              <Link href={`/?category=${c.slug}`} className="block hover:text-teal-600">
                <p className="font-semibold">{c.name}</p>
                <p className="text-sm text-night/50 mt-1">
                  {total} {t.categories.products}
                </p>
              </Link>
              {c.children.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {c.children.map((sub: any) => (
                    <Link
                      key={sub.id}
                      href={`/?category=${sub.slug}`}
                      className="text-xs px-2 py-1 rounded-full border border-night/15 text-night/60 hover:border-teal-400 hover:text-teal-600"
                    >
                      {sub.name} ({sub._count.products})
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {categories.length === 0 && (
          <p className="text-night/50 text-sm">{t.categories.none}</p>
        )}
      </div>
    </div>
  );
}
