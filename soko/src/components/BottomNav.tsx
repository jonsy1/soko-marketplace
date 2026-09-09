'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const navItems = [
    {
      path: '/',
      label: 'Home',
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
          <path d="M3 10.5L12 3l9 7.5" />
          <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
        </svg>
      ),
    },
    {
      path: '/categories',
      label: 'Explore',
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
          <circle cx="12" cy="12" r="9" />
          <path d="M14.5 9.5L13 13l-3.5 1.5L11 11l3.5-1.5z" />
        </svg>
      ),
    },
    {
      path: '/dashboard/business/products',
      label: 'Sell',
      isCenter: true,
      icon: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      ),
    },
    {
      path: '/orders',
      label: 'Orders',
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
          <path d="M6 3h9l3 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
          <path d="M9 8h6M9 12h6M9 16h4" />
        </svg>
      ),
    },
    {
      path: '/account',
      label: 'Profile',
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-night/10 shadow-lg">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) =>
          item.isCenter ? (
            <Link
              key={item.path}
              href={item.path}
              className="flex flex-col items-center justify-center -mt-6"
              aria-label={item.label}
            >
              <span className="w-12 h-12 rounded-full bg-market-500 flex items-center justify-center shadow-lg border-4 border-white">
                {item.icon(false)}
              </span>
            </Link>
          ) : (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center gap-0.5 ${
                isActive(item.path) ? 'text-market-500' : 'text-night/40 hover:text-night/60'
              }`}
            >
              {item.icon(isActive(item.path))}
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        )}
      </div>
    </nav>
  );
}