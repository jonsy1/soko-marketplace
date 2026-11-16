
import Link from 'next/link';

const CARDS = [
  {
    href: '/buyer-tools',
    title: 'Buyer Tools',
    text: 'Price alerts and delivery estimates',
    button: 'Explore',
    bg: 'from-[#E4EEFF] to-[#CFE0FF]',
    badge: 'bg-market-500',
    btn: 'bg-market-500',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8h12l1 12H5L6 8z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </svg>
    ),
  },
  {
    href: '/nearby',
    title: 'Shops Near You',
    text: 'Find nearby shops on the map',
    button: 'Find shops',
    bg: 'from-[#DDF7EE] to-[#BFEEDC]',
    badge: 'bg-teal-500',
    btn: 'bg-teal-600',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    href: '/services',
    title: 'Huduma za Kampuni',
    text: 'Discover company services',
    button: 'Learn more',
    bg: 'from-[#FFE9DF] to-[#FFD3BF]',
    badge: 'bg-clay-500',
    btn: 'bg-clay-500',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
        <path d="M3 13h18" />
      </svg>
    ),
  },
];

export default function HomeShortcuts() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-3">
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        {CARDS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className={`flex flex-col rounded-xl p-2.5 md:p-4 bg-gradient-to-br ${c.bg} border border-night/5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition`}
          >
            <span className={`w-8 h-8 md:w-10 md:h-10 rounded-lg ${c.badge} text-white flex items-center justify-center shrink-0`}>
              {c.icon}
            </span>
            <p className="font-display font-bold text-night text-[12px] md:text-base leading-tight mt-2">
              {c.title}
            </p>
            <p className="text-night/60 text-[9px] md:text-xs leading-snug mt-0.5 flex-1 line-clamp-2">{c.text}</p>
            <span className={`inline-flex items-center justify-center gap-1 self-start mt-2 px-2.5 py-1 rounded-full text-white text-[9px] md:text-xs font-semibold ${c.btn}`}>
              {c.button}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}