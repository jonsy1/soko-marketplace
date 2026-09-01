'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useTranslation } from './LanguageProvider';
import LanguageToggle from './LanguageToggle';
import { useCart } from './CartContext';
import HeaderProductsBackground from './HeaderProductsBackground';

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
  const { count } = useCart();

  return (
    <header className="bg-gradient-to-r from-night via-[#3B0A6B] to-market-600 text-market-50 sticky top-0 z-40 relative overflow-hidden">
      <svg
        className="pointer-events-none absolute -right-6 -top-10 opacity-[0.10] rotate-[-8deg]"
        width="220" height="220" viewBox="0 0 24 24" fill="none" stroke="#FDE68A" strokeWidth="1"
      >
        <circle cx="9" cy="20" r="1.4" />
        <circle cx="17" cy="20" r="1.4" />
        <path d="M3 4h2l2.2 11.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6" />
      </svg>
      <HeaderProductsBackground />
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4 relative">
        <Link href="/" className="font-display font-bold text-xl tracking-tight">
          SOKO<span className="text-market-400">.</span>
        </Link>

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
          <LanguageToggle />
          <Link href="/cart" className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-white/10">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="20" r="1.4" />
              <circle cx="17" cy="20" r="1.4" />
              <path d="M3 4h2l2.2 11.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6" />
            </svg>
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-clay text-white text-[9px] font-bold flex items-center justify-center">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </Link>
          {isLoggedIn ? (
            <>
              <Link
                href="/account"
                className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-white/10"
                title="My Account"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M4.5 20c1.2-4 4-6 7.5-6s6.3 2 7.5 6" />
                </svg>
              </Link>
              <Link href="/account" className="hidden sm:inline text-market-50/70 hover:text-market-50">
                {t.nav.hi}, {name?.split(' ')[0]}
              </Link>
              <button
                onClick={() => signOut({ redirectTo: '/' })}
                className="hidden sm:inline-flex btn btn-outline !border-market-50/30 !text-market-50"
              >
                {t.nav.signOut}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-flex btn btn-outline !border-market-50/30 !text-market-50"
              >
                {t.nav.login}
              </Link>
              <Link href="/register" className="hidden sm:inline-flex btn btn-secondary">
                {t.nav.signup}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}