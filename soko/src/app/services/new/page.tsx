'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { upload } from '@vercel/blob/client';
import { compressImage } from '@/lib/compressImage';

const MAX_DESC = 300;

export default function NewListingPage() {
  const { status } = useSession();
  const [categories, setCategories] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: '',
    category: '',
    description: '',
    phone: '',
    location: '',
    website: '',
    bannerUrl: '',
  });
  const [bannerPreview, setBannerPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch('/api/listings?categories=1')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setCategories(d);
      })
      .catch(() => {});
  }, []);

  async function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('Picha ni kubwa mno. Chagua iliyo chini ya MB 10.');
      return;
    }

    setError('');
    setBannerPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const blob = await upload(compressed.name, compressed, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });
      setForm((f) => ({ ...f, bannerUrl: blob.url }));
    } catch {
      setError('Picha haikupakiwa. Jaribu tena.');
      setBannerPreview('');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Andika jina la kampuni.');
      return;
    }
    if (!form.category) {
      setError('Chagua kategoria.');
      return;
    }
    if (form.description.trim().length < 10) {
      setError('Andika maelezo mafupi ya huduma zako.');
      return;
    }
    if (!form.phone.trim()) {
      setError('Weka namba ya WhatsApp.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        data = {};
      }
      if (!res.ok) {
        setError(data.error || 'Tangazo halikutumwa. Jaribu tena.');
      } else {
        setDone(true);
      }
    } catch {
      setError('Tangazo halikutumwa. Angalia mtandao wako na ujaribu tena.');
    }
    setSubmitting(false);
  }

  if (status === 'loading') {
    return <div className="max-w-md mx-auto px-4 py-16 text-night/50">…</div>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold mb-2">Tangaza kampuni yako</h1>
        <p className="text-night/60 text-sm mb-6">
          Ingia kwanza ili utangaze kampuni yako kwenye Soko. Ukimaliza utarudi hapa.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/login?callbackUrl=/services/new" className="btn btn-primary">
            Ingia
          </Link>
          <Link href="/register" className="btn btn-outline">
            Fungua akaunti
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="font-display text-2xl font-bold mb-2">Imewasilishwa</h1>
        <p className="text-night/60 text-sm mb-6">
          Tutaikagua ndani ya masaa 24, na tutakutumia barua pepe tangazo likikubaliwa.
        </p>
        <Link href="/" className="btn btn-primary">
          Rudi Soko
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 pb-24">
      <h1 className="font-display text-2xl font-bold text-night mb-1">Tangaza kampuni yako</h1>
      <p className="text-night/60 text-sm mb-6">
        Jaza maelezo haya machache. Tutayakagua kabla hayajaonekana kwa wateja.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="text-sm bg-clay-50 text-clay-600 px-3 py-2 rounded-card">{error}</div>
        )}

        {/* Banner */}
        <div>
          <label className="label text-night font-semibold">Picha ya banner (hiari)</label>
          <p className="text-xs text-night/50 mb-3">Picha moja inayotangaza kampuni yako.</p>
          <label
            htmlFor="banner-photo"
            className="relative flex w-full h-40 items-center justify-center rounded-2xl border-2 border-dashed border-night/15 bg-white overflow-hidden cursor-pointer hover:border-market-400 transition"
          >
            {bannerPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
            ) : (
              <span className="flex flex-col items-center gap-1 text-market-500">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span className="text-xs font-medium">Ongeza picha</span>
              </span>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-night/40 flex items-center justify-center text-white text-xs font-semibold">
                Inapakiwa…
              </div>
            )}
            <input
              id="banner-photo"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBannerChange}
              disabled={uploading}
            />
          </label>
        </div>

        {/* Name */}
        <div>
          <label className="label text-night font-semibold">Jina la kampuni</label>
          <input
            className="input rounded-xl"
            value={form.name}
            maxLength={80}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        {/* Category */}
        <div>
          <label className="label text-night font-semibold">Aina ya huduma</label>
          <select
            className="input rounded-xl"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="">Chagua</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="label text-night font-semibold">Maelezo mafupi</label>
          <textarea
            className="input rounded-xl"
            rows={4}
            value={form.description}
            maxLength={MAX_DESC}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Mfano: Tunapiga picha za harusi na bidhaa. Tunapatikana Dar es Salaam."
          />
          <p className="text-xs text-night/40 mt-1 text-right">
            {form.description.length} / {MAX_DESC}
          </p>
        </div>

        {/* Phone */}
        <div>
          <label className="label text-night font-semibold">Namba ya WhatsApp</label>
          <input
            type="tel"
            className="input rounded-xl"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="0712345678"
          />
        </div>

        {/* Optional details */}
        <details className="rounded-xl border border-night/10 bg-white px-4 py-3">
          <summary className="text-sm font-semibold text-night cursor-pointer">
            Maelezo zaidi (hiari)
          </summary>
          <div className="space-y-4 mt-4">
            <div>
              <label className="label text-night font-semibold">Eneo</label>
              <input
                className="input rounded-xl"
                value={form.location}
                maxLength={80}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Mfano: Kariakoo, Dar es Salaam"
              />
            </div>
            <div>
              <label className="label text-night font-semibold">Tovuti au Instagram</label>
              <input
                className="input rounded-xl"
                value={form.website}
                maxLength={200}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="Mfano: instagram.com/kampuni_yako"
              />
            </div>
          </div>
        </details>

        <button
          className="w-full bg-market-500 hover:bg-market-600 text-white font-semibold rounded-xl py-3.5 transition disabled:opacity-60"
          disabled={submitting || uploading}
        >
          {submitting ? 'Inatuma…' : uploading ? 'Picha inapakiwa…' : 'Tuma tangazo'}
        </button>

        <p className="text-xs text-night/40 text-center">
          Soko haihakiki huduma za kampuni zilizotangazwa. Wateja wanashauriwa kuthibitisha wenyewe.
        </p>
      </form>
    </div>
  );
}