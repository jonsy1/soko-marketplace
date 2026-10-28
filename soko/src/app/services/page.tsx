'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Listing {
  id: string;
  name: string;
  category: string;
  description: string;
  phone: string;
  location: string | null;
  website: string | null;
  bannerUrl: string | null;
}

export default function ServicesPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [query, setQuery] = useState('');
  const [searchText, setSearchText] = useState('');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/listings?categories=1')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setCategories(d);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (activeCategory) params.set('category', activeCategory);
    if (query) params.set('q', query);

    fetch('/api/listings?' + params.toString())
      .then((r) => r.json())
      .then((d) => {
        setListings(Array.isArray(d) ? d : []);
      })
      .catch(() => {
        setListings([]);
        setError('Imeshindwa kupakia. Jaribu tena.');
      })
      .finally(() => setLoading(false));
  }, [activeCategory, query]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setQuery(searchText.trim());
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-24">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-night">Huduma za kampuni</h1>
          <p className="text-night/60 text-sm mt-1">
            Pata kampuni zinazotoa huduma: picha, usafirishaji, ujenzi, uchapishaji na zaidi.
          </p>
        </div>
        <Link href="/services/new" className="btn btn-primary">
          Tangaza kampuni yako
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          className="input flex-1"
          placeholder="Tafuta huduma au kampuni..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <button type="submit" className="btn btn-outline">
          Tafuta
        </button>
      </form>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
        <button
          type="button"
          onClick={() => setActiveCategory('')}
          className={
            !activeCategory
              ? 'rounded-full text-xs px-5 py-2 whitespace-nowrap bg-night text-market-50'
              : 'rounded-full text-xs px-5 py-2 whitespace-nowrap bg-white border border-night/15 text-night/60'
          }
        >
          Zote
        </button>
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setActiveCategory(c)}
            className={
              activeCategory === c
                ? 'rounded-full text-xs px-5 py-2 whitespace-nowrap bg-night text-market-50'
                : 'rounded-full text-xs px-5 py-2 whitespace-nowrap bg-white border border-night/15 text-night/60'
            }
          >
            {c}
          </button>
        ))}
      </div>

      {error && <p className="text-clay-500 text-sm mb-4">{error}</p>}

      {loading ? (
        <p className="text-night/50 text-sm">Inapakia...</p>
      ) : listings.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🏢</div>
          <p className="font-semibold text-night/70 text-lg">
            {query || activeCategory ? 'Hakuna kampuni iliyopatikana' : 'Bado hakuna kampuni'}
          </p>
          <p className="text-sm text-night/50 mt-1 mb-6">
            {query || activeCategory
              ? 'Jaribu neno lingine au kategoria nyingine.'
              : 'Kuwa wa kwanza kutangaza kampuni yako kwenye Soko.'}
          </p>
          <Link href="/services/new" className="btn btn-primary">
            Tangaza kampuni yako
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((item) => {
            const waMessage =
              'Habari ' + item.name + ', nimekuona kwenye Soko. Naomba kujua zaidi kuhusu huduma zenu.';
            const waLink = 'https://wa.me/' + item.phone + '?text=' + encodeURIComponent(waMessage);
            const hasWebsite = !!item.website && /^https?:\/\//i.test(item.website);
            return (
              <div key={item.id} className="card overflow-hidden flex flex-col">
                <div className="w-full h-36 bg-market-100 flex items-center justify-center overflow-hidden">
                  {item.bannerUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.bannerUrl}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-market-600 font-display text-4xl font-bold opacity-40">
                      {item.name[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <span className="badge bg-market-100 text-market-600 self-start">{item.category}</span>
                  <h2 className="font-semibold text-night mt-2">{item.name}</h2>
                  {item.location && <p className="text-xs text-night/50 mt-0.5">{item.location}</p>}
                  <p className="text-sm text-night/70 mt-2 flex-1 whitespace-pre-line">{item.description}</p>
                  <div className="flex gap-2 mt-4">
                    <Link href={waLink} target="_blank" className="btn btn-primary flex-1 text-center text-sm">
                      Wasiliana
                    </Link>
                    {hasWebsite && (
                      <Link
                        href={item.website as string}
                        target="_blank"
                        className="btn btn-outline text-sm"
                      >
                        Tovuti
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-night/40 text-center mt-10">
        Soko haihakiki huduma za kampuni zilizotangazwa. Thibitisha wewe mwenyewe kabla ya kulipa.
      </p>
    </div>
  );
}