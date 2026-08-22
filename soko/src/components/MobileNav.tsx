'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MobileNav({
  role,
  isLoggedIn,
}: {
  role?: string;
  isLoggedIn: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Menu"
        className="text-market-50 text-2xl leading-none px-1"
      >
        {open ? '✕' : '☰'}
      </button>

      {open && (
        <div className="absolute top-16 left-0 right-0 bg-night text-market-50 border-t border-market-50/10 flex flex-col text-sm font-medium z-50">
          <Link href="/" className="px-4 py-3 hover:bg-white/5" onClick={() => setOpen(false)}>
            Marketplace
          </Link>
          <Link
            href="/categories"
            className="px-4 py-3 hover:bg-white/5"
            onClick={() => setOpen(false)}
          >
            Categories
          </Link>
          {role === 'BUSINESS' && (
            <Link
              href="/dashboard/business"
              className="px-4 py-3 hover:bg-white/5"
              onClick={() => setOpen(false)}
            >
              My Store
            </Link>
          )}
          {role === 'ADMIN' && (
            <Link
              href="/dashboard/admin"
              className="px-4 py-3 hover:bg-white/5"
              onClick={() => setOpen(false)}
            >
              Admin
            </Link>
          )}
          {role === 'CUSTOMER' && (
            <Link
              href="/register-business"
              className="px-4 py-3 hover:bg-white/5"
              onClick={() => setOpen(false)}
            >
              Sell on Soko
            </Link>
          )}
        </div>
      )}
    </div>
  );
}