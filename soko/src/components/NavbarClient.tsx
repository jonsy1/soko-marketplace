'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { useTranslation } from './LanguageProvider';
import { useCart } from './CartContext';

// Dynamic import kwa LanguageToggle
const LanguageToggle = dynamic(() => import('./LanguageToggle'), {
  ssr: false,
  loading: () => <div className="w-9 h-9 rounded-full bg-white/10 animate-pulse" />,
});

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Funga menyu baada ya kubonyeza kiungo
  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-gradient-to-r from-night via-[#3B0A6B] to-market-600 text-market-50 sticky top-0 z-40 relative overflow-hidden">
      {/* SVG ya background - imefichwa kwenye simu kwa performance */}
      <svg
        className="pointer-events-none absolute -right-6 -top-10 opacity-[0.10] rotate-[-8deg] hidden sm:block"
        width="220" height="220" viewBox="0 0 24 24" fill="none" stroke="#FDE68A" strokeWidth="1"
      >
        <circle cx="9" cy="20" r="1.4" />
        <circle cx="17" cy="20" r="1.4" />
        <path d="M3 4h2l2.2 11.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6" />
      </svg>

      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4 relative">
        {/* Logo */}
        <Link href="/" className="font-display font-bold text-xl tracking-tight shrink-0">
          SOKO<span className="text-market-400">.</span>
        </Link>

        {/* Navigation ya Desktop */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-market-400 transition-colors">
            {t.nav.marketplace}
          </Link>
          <Link href="/categories" className="hover:text-market-400 transition-colors">
            {t.nav.categories}
          </Link>
          {role === 'BUSINESS' && (
            <Link href="/dashboard/business" className="hover:text-market-400 transition-colors">
              {t.nav.myStore}
            </Link>
          )}
          {role === 'ADMIN' && (
            <Link href="/dashboard/admin" className="hover:text-market-400 transition-colors">
              {t.nav.admin}
            </Link>
          )}
          {role === 'CUSTOMER' && (
            <Link href="/register-business" className="hover:text-market-400 transition-colors">
              {t.nav.sellOnSoko}
            </Link>
          )}
        </nav>

        {/* Right side - icons na hamburger */}
        <div className="flex items-center gap-2">
          {/* Language Toggle - inaonekana desktop na simu */}
          <LanguageToggle />

          {/* Cart Icon - inaonekana desktop na simu */}
          <Link
            href="/cart"
            className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-white/10 transition-colors shrink-0"
            aria-label="Cart"
          >
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

          {/* Desktop: My Account & Logout */}
          {isLoggedIn ? (
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/account"
                className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-white/10 transition-colors shrink-0"
                aria-label="My Account"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M4.5 20c1.2-4 4-6 7.5-6s6.3 2 7.5 6" />
                </svg>
              </Link>
              <span className="hidden lg:inline text-market-50/70 text-sm">
                {t.nav.hi}, {name?.split(' ')[0]}
              </span>
              <button
                onClick={() => signOut({ redirectTo: '/' })}
                className="hidden lg:inline-flex btn btn-outline !border-market-50/30 !text-market-50 hover:bg-white/10 transition-colors text-xs"
              >
                {t.nav.signOut}
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/login"
                className="btn btn-outline !border-market-50/30 !text-market-50 hover:bg-white/10 transition-colors text-xs"
              >
                {t.nav.login}
              </Link>
              <Link href="/register" className="btn btn-secondary hover:brightness-110 transition-colors text-xs">
                {t.nav.signup}
              </Link>
            </div>
          )}

          {/* Hamburger Menu - inaonekana kwenye simu tu */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden flex flex-col gap-1.5 p-1.5 hover:bg-white/10 rounded-lg transition shrink-0"
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-market-50 transition duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-market-50 transition duration-300 ${isMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-market-50 transition duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu - inajifungua chini ya navbar */}
      <div className={`
        md:hidden bg-gradient-to-b from-[#3B0A6B] to-night border-t border-market-50/10
        transition-all duration-300 overflow-hidden
        ${isMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}
      `}>
        <div className="px-4 py-4 flex flex-col gap-2">
          {/* Navigation links for mobile */}
          <Link href="/" className="py-2 hover:text-market-400 transition" onClick={handleLinkClick}>
            {t.nav.marketplace}
          </Link>
          <Link href="/categories" className="py-2 hover:text-market-400 transition" onClick={handleLinkClick}>
            {t.nav.categories}
          </Link>
          {role === 'BUSINESS' && (
            <Link href="/dashboard/business" className="py-2 hover:text-market-400 transition" onClick={handleLinkClick}>
              {t.nav.myStore}
            </Link>
          )}
          {role === 'ADMIN' && (
            <Link href="/dashboard/admin" className="py-2 hover:text-market-400 transition" onClick={handleLinkClick}>
              {t.nav.admin}
            </Link>
          )}
          {role === 'CUSTOMER' && (
            <Link href="/register-business" className="py-2 hover:text-market-400 transition" onClick={handleLinkClick}>
              {t.nav.sellOnSoko}
            </Link>
          )}

          <div className="border-t border-market-50/10 my-2"></div>

          {/* Cart (mobile) */}
          <Link href="/cart" className="py-2 hover:text-market-400 transition flex items-center gap-2" onClick={handleLinkClick}>
            🛒 Cart
            {count > 0 && (
              <span className="bg-clay text-white text-xs px-2 py-0.5 rounded-full">
                {count}
              </span>
            )}
          </Link>

          {/* My Account / Login / Register (mobile) */}
          {isLoggedIn ? (
            <>
              <Link href="/account" className="py-2 hover:text-market-400 transition flex items-center gap-2" onClick={handleLinkClick}>
                👤 {t.nav.hi}, {name?.split(' ')[0]}
              </Link>
              <button
                onClick={() => {
                  handleLinkClick();
                  signOut({ redirectTo: '/' });
                }}
                className="py-2 text-left hover:text-market-400 transition flex items-center gap-2"
              >
                🚪 {t.nav.signOut}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="py-2 hover:text-market-400 transition" onClick={handleLinkClick}>
                {t.nav.login}
              </Link>
              <Link href="/register" className="py-2 hover:text-market-400 transition" onClick={handleLinkClick}>
                {t.nav.signup}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}