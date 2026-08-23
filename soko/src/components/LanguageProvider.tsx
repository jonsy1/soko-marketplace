'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { translations, type Lang } from '@/lib/translations';

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: typeof translations['en'];
  mounted: boolean;
};

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem('soko-lang');
    if (saved === 'sw' || saved === 'en') {
      setLangState(saved);
    }
    setMounted(true);
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    window.localStorage.setItem('soko-lang', l);
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang], mounted }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useTranslation must be used within LanguageProvider');
  return ctx;
}
