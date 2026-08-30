'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslation } from './LanguageProvider';
import { useCart } from './CartContext';

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}
function GridIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function ReceiptIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12v18l-2.5-1.5L13 21l-2.5-1.5L8 21l-2-1.5V3Z" />
      <path d="M9 8h6M9 12h6" />
    </svg>
  );
}
function ShopIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9.5 5.5 4h13L20 9.5" />
      <path d="M4 9.5a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0" />
      <path d="M5 9.5V20h14V9.5" />
      <path d="M10 20v-5.5a2 2 0 0 1 4 0V20" />
    </svg>
  );
}
function CartIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="17" cy="20" r="1.4" />
      <path d="M3 4h2l2.2 11.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6" />
    </svg>
  );
}

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useTranslation();
  const { count } = useCart();
  const role = (session?.user as any)?.role as string | undefined;
  const isLoggedIn = !!session?.user;
  const shopHref =
    role === 'ADMIN'
      ? '/dashboard/admin'
      : role === 'BUSINESS'
      ? '/dashboard/business'
      : '/account';

  function guardedNav(e: React.MouseEvent, href: string) {
    if (!isLoggedIn) {
      e.preventDefault();
      router.push(`/login?callbackUrl=${encodeURIComponent(href)}`);
    }
  }

  const tabs = [
    { href: '/', label: t.nav.home, icon: HomeIcon, guarded: false },
    { href: '/categories', label: t.nav.categories, icon: GridIcon, guarded: false },
    { href: '/cart', label: t.nav.cart, icon: CartIcon, guarded: false, badge: count },
    { href: '/orders', label: t.nav.orders, icon: ReceiptIcon, guarded: true },
    { href: shopHref, label: t.nav.myShop, icon: ShopIcon, guarded: true },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-night to-[#3B0A6B] border-t border-white/10 shadow-[0_-4px_16px_rgba(0,0,0,0.25)] overflow-hidden">
      <svg
        className="pointer-events-none absolute -left-8 -top-6 opacity-[0.08]"
        width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="#FDE68A" strokeWidth="1"
      >
        <circle cx="9" cy="20" r="1.4" />
        <circle cx="17" cy="20" r="1.4" />
        <path d="M3 4h2l2.2 11.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6" />
      </svg>
      <div className="grid grid-cols-5">
        {tabs.map((tab) => {
          const active =
            tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href.split('?')[0]);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.label}
              href={tab.guarded && !isLoggedIn ? '/login' : tab.href}
              onClick={(e) => tab.guarded && guardedNav(e, tab.href)}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-semibold transition ${
                active ? 'text-clay' : 'text-white/50'
              }`}
            >
              <span
                className={`relative flex items-center justify-center w-9 h-9 rounded-full transition ${
                  active ? 'bg-clay/15' : ''
                }`}
              >
                <Icon active={active} />
                {!!tab.badge && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-clay text-white text-[9px] font-bold flex items-center justify-center">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
              </span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}