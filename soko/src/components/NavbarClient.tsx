'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useTranslation } from './LanguageProvider';
import LanguageToggle from './LanguageToggle';
import MobileNav from './MobileNav';

export default function NavbarClient({
  role,
  name,
  isLoggedIn,
}: {
  role?: string;
  name: string | null;
  isLoggedIn: boolean;
}) {
  const { t } = useTranslation();

  return (
    <header className="bg-night text-market-50 sticky top-0 z-40 relative">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <MobileNav role={role} isLoggedIn={isLoggedIn} />
          <Link href="/" className="font-display font-bold text-xl tracking-tight">
            SOKO<span className="text-market-400">.</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-market-400">
            {t.nav.marketplace}
          </Link>
          <Link href="/categories" className="hover:text-market-400">
            {t.nav.categories}
          </Link>
          {role === 'BUSINESS' && (
            <Link href="/dashboard/business" className="hover:text-market-400">
              {t.nav.myStore}
            </Link>
          )}
          {role === 'ADMIN' && (
            <Link href="/dashboard/admin" className="hover:text-market-400">
              {t.nav.admin}
            </Link>
          )}
          {role === 'CUSTOMER' && (
            <Link href="/register-business" className="hover:text-market-400">
              {t.nav.sellOnSoko}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3 text-sm">
          <LanguageToggle className="hidden sm:inline-flex" />
          {isLoggedIn ? (
            <>
              <span className="hidden sm:inline text-market-50/70">
                {t.nav.hi}, {name?.split(' ')[0]}
              </span>
              <button
                onClick={() => signOut({ redirectTo: '/' })}
                className="btn btn-outline !border-market-50/30 !text-market-50"
              >
                {t.nav.signOut}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-outline !border-market-50/30 !text-market-50">
                {t.nav.login}
              </Link>
              <Link href="/register" className="btn btn-secondary">
                {t.nav.signup}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
