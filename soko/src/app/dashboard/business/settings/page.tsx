'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function BusinessSettingsPage() {
  const { data: session } = useSession();
  const [businessId, setBusinessId] = useState('');
  const [form, setForm] = useState<any>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState('');

  useEffect(() => {
    if (!session?.user) return;
    fetch('/api/orders')
      .then(() => {})
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
            latitude: b.latitude || null,
            longitude: b.longitude || null,
            phone: b.phone,
            offersDelivery: b.offersDelivery,
            logoUrl: b.logoUrl || '',
            isOpen: b.isOpen,
          });
        }
      });
  }, []);

  function useMyLocation() {
    setLocateError('');
    if (!navigator.geolocation) {
      setLocateError('Your browser does not support location.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f: any) => ({
          ...f,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }));
        setLocating(false);
      },
      () => {
        setLocateError('Could not get your location. Please allow location access.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

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

        <div className="bg-market-50 rounded-card p-4 border border-night/10">
          <label className="label mb-2">Shop pin (for "Get Directions")</label>
          <button
            type="button"
            onClick={useMyLocation}
            disabled={locating}
            className="btn border border-night/15 bg-white hover:bg-night/5 w-full"
          >
            {locating ? 'Locating…' : '📍 Use my current location'}
          </button>
          {locateError && (
            <p className="text-xs text-clay mt-2">{locateError}</p>
          )}
          {form.latitude && form.longitude && (
            <p className="text-xs text-teal-600 mt-2">
              ✓ Location pin set ({form.latitude.toFixed(5)}, {form.longitude.toFixed(5)})
            </p>
          )}
          <p className="text-xs text-night/50 mt-2">
            Stand at your shop when you tap this, so customers can navigate straight to you.
          </p>
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

        <div className={`rounded-card p-4 border ${form.isOpen ? 'bg-market-50 border-night/10' : 'bg-clay/5 border-clay/20'}`}>
          <label className="label mb-1">Shop status</label>
          <p className="text-xs text-night/50 mb-3">
            {form.isOpen
              ? 'Your shop is visible to customers. Close it if you need to stop selling on Soko for a while — customers won\'t see your shop or products until you reopen it.'
              : 'Your shop is closed and hidden from customers. Reopen it whenever you\'re ready to sell again.'}
          </p>
          <button
            type="button"
            onClick={async () => {
              const next = !form.isOpen;
              setForm((f: any) => ({ ...f, isOpen: next }));
              await fetch(`/api/businesses/${businessId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isOpen: next }),
              });
            }}
            className={form.isOpen ? 'btn btn-outline !text-clay !border-clay/30 w-full' : 'btn btn-primary w-full'}
          >
            {form.isOpen ? 'Temporarily close my shop' : 'Reopen my shop'}
          </button>
        </div>

        <button className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}