'use client';

import { useTranslation } from './LanguageProvider';

export default function LanguageToggle({ className = '' }: { className?: string }) {
  const { lang, setLang } = useTranslation();

  return (
    <div className={`inline-flex rounded-card overflow-hidden border border-night/15 text-xs font-semibold ${className}`}>
      <button
        onClick={() => setLang('en')}
        className={`px-2 py-1 transition ${
          lang === 'en' ? 'bg-market-500 text-white' : 'bg-white text-night/50 hover:text-night/70'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLang('sw')}
        className={`px-2 py-1 transition ${
          lang === 'sw' ? 'bg-market-500 text-white' : 'bg-white text-night/50 hover:text-night/70'
        }`}
      >
        SW
      </button>
    </div>
  );
}