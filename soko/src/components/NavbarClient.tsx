'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { useTranslation } from './LanguageProvider';
import { useCart } from './CartContext';

const LanguageToggle = dynamic(() => import('./LanguageToggle'), {
  ssr: false,
  loading: () => <div className="w-9 h-9 rounded-full bg-night/5 animate-pulse" />,
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
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  return (
    <header className="bg-white text-night sticky top-0 z-40 border-b border-night/10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3 relative">
        {/* Logo */}
        <Link href="/" className="font-display font-bold text-xl tracking-tight shrink-0 text-night">
          SOKO<span className="text-market-500">.</span>
        </Link>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex flex-1 max-w-md relative">
          <form onSubmit={handleSearchSubmit} className="w-full">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full px-4 py-2 text-sm bg-market-50 text-night placeholder-night/40 border border-night/10 focus:outline-none focus:ring-2 focus:ring-market-400 focus:bg-white transition"
            />
          </form>
        </div>

        {/* Navigation ya Desktop */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-night/70">
          <Link href="/" className="hover:text-market-500 transition-colors">
            {t.nav.marketplace}
          </Link>
          <Link href="/categories" className="hover:text-market-500 transition-colors">
            {t.nav.categories}
          </Link>
          {role === 'BUSINESS' && (
            <Link href="/dashboard/business" className="hover:text-market-500 transition-colors">
              {t.nav.myStore}
            </Link>
          )}
          {role === 'ADMIN' && (
            <Link href="/dashboard/admin" className="hover:text-market-500 transition-colors">
              {t.nav.admin}
            </Link>
          )}
          {role === 'CUSTOMER' && (
            <Link href="/register-business" className="hover:text-market-500 transition-colors">
              {t.nav.sellOnSoko}
            </Link>
          )}
        </nav>

        {/* Right side - icons na hamburger */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-full text-night/60 hover:bg-night/5 transition-colors shrink-0"
            aria-label="Search"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>

          <LanguageToggle />

          <Link
            href="/cart"
            className="relative flex items-center justify-center w-9 h-9 rounded-full text-night/60 hover:bg-night/5 transition-colors shrink-0"
            aria-label="Cart"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="20" r="1.4" />
              <circle cx="17" cy="20" r="1.4" />
              <path d="M3 4h2l2.2 11.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6" />
            </svg>
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-clay-500 text-white text-[9px] font-bold flex items-center justify-center">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </Link>

          {isLoggedIn ? (
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/account"
                className="flex items-center justify-center w-9 h-9 rounded-full text-night/60 hover:bg-night/5 transition-colors shrink-0"
                aria-label="My Account"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M4.5 20c1.2-4 4-6 7.5-6s6.3 2 7.5 6" />
                </svg>
              </Link>
              <span className="hidden lg:inline text-night/50 text-sm">
                {t.nav.hi}, {name?.split(' ')[0]}
              </span>
              <button
                onClick={() => signOut({ redirectTo: '/' })}
                className="hidden lg:inline-flex btn btn-outline !border-night/15 !text-night/70 hover:bg-night/5 transition-colors text-xs"
              >
                {t.nav.signOut}
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/login"
                className="btn btn-outline !border-night/15 !text-night/70 hover:bg-night/5 transition-colors text-xs"
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
            onClick={() => setIsMenuOpen(true)}
            className="md:hidden flex flex-col gap-1.5 p-1.5 hover:bg-night/5 rounded-lg transition shrink-0"
            aria-label="Toggle menu"
          >
            <span className="block w-5 h-0.5 bg-night" />
            <span className="block w-5 h-0.5 bg-night" />
            <span className="block w-5 h-0.5 bg-night" />
          </button>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white/98 backdrop-blur-lg flex items-start justify-center pt-20 px-4">
          <div ref={searchRef} className="w-full max-w-md">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                ref={inputRef}
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl px-5 py-4 text-lg bg-market-50 text-night placeholder-night/40 border border-night/10 focus:outline-none focus:ring-2 focus:ring-market-400 focus:bg-white transition"
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-night/40 hover:text-night transition"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </form>
            <p className="text-night/30 text-xs text-center mt-4">
              Search for products, brands, and categories
            </p>
          </div>
        </div>
      )}

      {/* Backdrop for the slide-in drawer */}
      <div
        onClick={() => setIsMenuOpen(false)}
        className={`md:hidden fixed inset-0 z-40 bg-night/50 backdrop-blur-sm transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Mobile Menu - slide-in drawer from the right */}
      <div
        className={`md:hidden fixed top-0 right-0 z-50 h-full w-[82%] max-w-xs bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-night/10 bg-market-50">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-market-500 text-white flex items-center justify-center font-display font-bold">
                {name?.[0]?.toUpperCase() || 'S'}
              </span>
              <div>
                <p className="text-xs text-night/50">{t.nav.hi}</p>
                <p className="font-semibold text-night text-sm leading-tight">{name?.split(' ')[0]}</p>
              </div>
            </div>
          ) : (
            <span className="font-display font-bold text-lg">
              SOKO<span className="text-market-500">.</span>
            </span>
          )}
          <button
            onClick={() => setIsMenuOpen(false)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-night/50 hover:bg-white/70 transition"
            aria-label="Close menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Drawer body — scrollable */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <nav className="flex flex-col gap-0.5">
            <Link href="/" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-market-50 transition text-night font-medium">
              <span className="w-9 h-9 rounded-full bg-market-100 text-market-600 flex items-center justify-center shrink-0">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 10.5L12 3l9 7.5" /><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" /></svg>
              </span>
              {t.nav.marketplace}
            </Link>
            <Link href="/categories" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-market-50 transition text-night font-medium">
              <span className="w-9 h-9 rounded-full bg-market-100 text-market-600 flex items-center justify-center shrink-0">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M14.5 9.5L13 13l-3.5 1.5L11 11l3.5-1.5z" /></svg>
              </span>
              {t.nav.categories}
            </Link>
            {role === 'BUSINESS' && (
              <Link href="/dashboard/business" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-market-50 transition text-night font-medium">
                <span className="w-9 h-9 rounded-full bg-market-100 text-market-600 flex items-center justify-center shrink-0">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l1.5-5h15L21 9" /><path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9" /></svg>
                </span>
                {t.nav.myStore}
              </Link>
            )}
            {role === 'ADMIN' && (
              <Link href="/dashboard/admin" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-market-50 transition text-night font-medium">
                <span className="w-9 h-9 rounded-full bg-market-100 text-market-600 flex items-center justify-center shrink-0">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3 6 6 1-4.5 4.5L18 20l-6-3-6 3 1.5-6.5L3 9l6-1z" /></svg>
                </span>
                {t.nav.admin}
              </Link>
            )}
            {role === 'CUSTOMER' && (
              <Link href="/register-business" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-market-50 transition text-night font-medium">
                <span className="w-9 h-9 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                </span>
                {t.nav.sellOnSoko}
              </Link>
            )}

            <Link href="/cart" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-market-50 transition text-night font-medium">
              <span className="w-9 h-9 rounded-full bg-market-100 text-market-600 flex items-center justify-center shrink-0 relative">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="20" r="1.4" /><circle cx="17" cy="20" r="1.4" /><path d="M3 4h2l2.2 11.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6" /></svg>
              </span>
              Cart
              {count > 0 && (
                <span className="ml-auto bg-clay-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{count}</span>
              )}
            </Link>

            {isLoggedIn && (
              <Link href="/account" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-market-50 transition text-night font-medium">
                <span className="w-9 h-9 rounded-full bg-market-100 text-market-600 flex items-center justify-center shrink-0">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="3.5" /><path d="M4.5 20c1.2-4 4-6 7.5-6s6.3 2 7.5 6" /></svg>
                </span>
                My Account
              </Link>
            )}
          </nav>

          <div className="border-t border-night/10 my-3" />

          <div className="flex flex-col gap-0.5">
            <Link href="/terms" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-night/5 transition text-night/60 text-sm">
              <span className="w-7 h-7 flex items-center justify-center shrink-0">📜</span>
              Terms of Service
            </Link>
            <Link href="/privacy" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-night/5 transition text-night/60 text-sm">
              <span className="w-7 h-7 flex items-center justify-center shrink-0">🔒</span>
              Privacy Policy
            </Link>
            <Link href="/about" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-night/5 transition text-night/60 text-sm">
              <span className="w-7 h-7 flex items-center justify-center shrink-0">ℹ️</span>
              About Us
            </Link>
            <Link href="/contact" onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-night/5 transition text-night/60 text-sm">
              <span className="w-7 h-7 flex items-center justify-center shrink-0">📧</span>
              Contact Us
            </Link>
          </div>
        </div>

        {/* Drawer footer — auth actions */}
        <div className="border-t border-night/10 p-4">
          {isLoggedIn ? (
            <button
              onClick={() => {
                handleLinkClick();
                signOut({ redirectTo: '/' });
              }}
              className="btn btn-outline w-full !border-night/15 !text-night/70"
            >
              {t.nav.signOut}
            </button>
          ) : (
            <div className="flex gap-2">
              <Link href="/login" onClick={handleLinkClick} className="btn btn-outline flex-1 !border-night/15 !text-night/70 text-center">
                {t.nav.login}
              </Link>
              <Link href="/register" onClick={handleLinkClick} className="btn btn-secondary flex-1 text-center">
                {t.nav.signup}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}