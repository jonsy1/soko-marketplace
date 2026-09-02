'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from './CartContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { count } = useCart();

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/categories', label: 'Categories', icon: '📂' },
    { path: '/search', label: 'Search', icon: '🔍' },
    { path: '/cart', label: 'Cart', icon: '🛒', badge: count > 0 ? count : undefined },
    { path: '/account', label: 'My Shop', icon: '👤' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-night/10 shadow-lg">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center justify-center gap-0.5 relative ${
              isActive(item.path)
                ? 'text-market-500'
                : 'text-night/40 hover:text-night/60'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
            
            {/* Badge for Cart */}
            {item.badge && (
              <span className="absolute -top-1 -right-3 min-w-[18px] h-[18px] rounded-full bg-clay text-white text-[10px] font-bold flex items-center justify-center px-1">
                {item.badge > 9 ? '9+' : item.badge}
              </span>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}