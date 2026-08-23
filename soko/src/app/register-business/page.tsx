'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslation } from '@/components/LanguageProvider';

export default function RegisterBusinessPage() {
  const router = useRouter();
  const { data: session, update, status } = useSession();
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: '',
    description: '',
    location: '',
    phone: '',
    offersDelivery: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (status === 'unauthenticated') {
    router.push('/login');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch('/api/businesses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'Could not create business.');
      return;
    }
    await update({ role: 'BUSINESS' });
    router.push('/dashboard/business');
    router.refresh();
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <h1 className="font-display text-2xl font-bold mb-1">{t.business.openStorefrontTitle}</h1>
      <p className="text-night/60 text-sm mb-6">{t.business.openStorefrontSubtitle}</p>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        {error && <div className="text-sm bg-clay/10 text-clay px-3 py-2 rounded-card">{error}</div>}
        <div>
          <label className="label">{t.business.businessName}</label>
          <input
            className="input"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="label">{t.business.description}</label>
          <textarea
            className="input"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder={t.business.descriptionPlaceholder}
          />
        </div>
        <div>
          <label className="label">{t.business.location}</label>
          <input
            className="input"
            required
            placeholder={t.business.locationPlaceholder}
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </div>
        <div>
          <label className="label">{t.business.phone}</label>
          <input
            className="input"
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.offersDelivery}
            onChange={(e) => setForm({ ...form, offersDelivery: e.target.checked })}
          />
          {t.business.offersDelivery}
        </label>
        <button className="btn btn-primary w-full" disabled={loading}>
          {loading ? t.business.creating : t.business.create}
        </button>
      </form>
    </div>
  );
}
