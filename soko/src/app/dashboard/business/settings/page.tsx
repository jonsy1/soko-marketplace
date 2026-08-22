'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function BusinessSettingsPage() {
  const { data: session } = useSession();
  const [businessId, setBusinessId] = useState('');
  const [form, setForm] = useState<any>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    fetch('/api/orders')
      .then(() => {}) // noop, keeps lint happy about session dependency
      .catch(() => {});
  }, [session]);

  useEffect(() => {
    fetch(`/api/businesses/me`)
      .then((r) => r.json())
      .then((b) => {
        if (b?.id) {
          setBusinessId(b.id);
          setForm({
            name: b.name,
            description: b.description || '',
            location: b.location,
            phone: b.phone,
            offersDelivery: b.offersDelivery,
            logoUrl: b.logoUrl || '',
          });
        }
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    await fetch(`/api/businesses/${businessId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setLoading(false);
    setSaved(true);
  }

  if (!form) return <div className="max-w-lg mx-auto px-4 py-10 text-night/50">Loading…</div>;

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold mb-6">Store settings</h1>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        {saved && (
          <div className="text-sm bg-teal-50 text-teal-600 px-3 py-2 rounded-card">Saved.</div>
        )}
        <div>
          <label className="label">Business name</label>
          <input
            className="input"
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
        <div>
          <label className="label">Location</label>
          <input
            className="input"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Phone / WhatsApp</label>
          <input
            className="input"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Logo URL</label>
          <input
            className="input"
            value={form.logoUrl}
            onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
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
          {loading ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
