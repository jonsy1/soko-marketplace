'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function RegisterBusinessPage() {
  const router = useRouter();
  const { data: session, update, status } = useSession();
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
      <h1 className="font-display text-2xl font-bold mb-1">Open your storefront</h1>
      <p className="text-night/60 text-sm mb-6">
        Register your business to list products and start receiving orders from customers
        searching the Soko marketplace.
      </p>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        {error && <div className="text-sm bg-clay/10 text-clay px-3 py-2 rounded-card">{error}</div>}
        <div>
          <label className="label">Business name</label>
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
            placeholder="What do you sell?"
          />
        </div>
        <div>
          <label className="label">Location</label>
          <input
            className="input"
            required
            placeholder="e.g. Kariakoo, Dar es Salaam"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Phone / WhatsApp</label>
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
          I offer delivery to customers
        </label>
        <button className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Creating storefront…' : 'Create my storefront'}
        </button>
      </form>
    </div>
  );
}
