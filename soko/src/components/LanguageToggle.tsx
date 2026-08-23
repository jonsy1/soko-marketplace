'use client';

import { useTranslation } from './LanguageProvider';

export default function LanguageToggle({ className = '' }: { className?: string }) {
  const { lang, setLang } = useTranslation();

  return (
    <div className={`inline-flex rounded-card overflow-hidden border border-market-50/30 text-xs font-semibold ${className}`}>
      <button
        onClick={() => setLang('en')}
        className={`px-2 py-1 ${lang === 'en' ? 'bg-market-400 text-ink' : 'text-market-50/70'}`}
      >
        EN
      </button>
      <button
        onClick={() => setLang('sw')}
        className={`px-2 py-1 ${lang === 'sw' ? 'bg-market-400 text-ink' : 'text-market-50/70'}`}
      >
        SW
      </button>
    </div>
  );
}
