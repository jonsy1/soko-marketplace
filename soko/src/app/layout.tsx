'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Providers from '@/components/Providers';
import { LanguageProvider } from '@/components/LanguageProvider';
import RegisterSW from '@/components/RegisterSW';
import BottomNav from '@/components/BottomNav';
import PushNotifications from '@/components/PushNotifications';

export const metadata: Metadata = {
  title: 'Soko — Find any business, any product, anywhere',
  description:
    'Soko is a marketplace platform where Tanzanian businesses open a digital storefront and customers discover products from every shop in one search.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Soko',
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0E2A2F',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <html lang="en">
      <body>
        <Providers>
          <LanguageProvider>
            <RegisterSW />
            <PushNotifications />
            <Navbar />
            <main className="min-h-[calc(100vh-64px)] pb-16 md:pb-0">{children}</main>

            {/* Footer mpya yenye hamburger menu */}
            <footer className="bg-night text-market-50/70 text-sm py-8 mt-16 border-t border-market-50/10">
              <div className="max-w-6xl mx-auto px-4">
                {/* Mstari wa juu: brand na hamburger kwenye simu */}
                <div className="flex items-center justify-between">
                  <span>© {new Date().getFullYear()} Soko Marketplace.</span>

                  {/* Hamburger menu — inaonekana kwenye simu tu */}
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden flex flex-col gap-1.5 p-1.5 hover:bg-white/5 rounded-lg transition"
                    aria-label="Toggle menu"
                  >
                    <span className={`block w-5 h-0.5 bg-market-50/70 transition ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                    <span className={`block w-5 h-0.5 bg-market-50/70 transition ${isMenuOpen ? 'opacity-0' : ''}`} />
                    <span className={`block w-5 h-0.5 bg-market-50/70 transition ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                  </button>

                  {/* Viungo vya desktop */}
                  <div className="hidden md:flex gap-6 text-market-50/60">
                    <Link href="/terms" className="hover:text-market-400 transition">Terms</Link>
                    <Link href="/privacy" className="hover:text-market-400 transition">Privacy</Link>
                    <Link href="/about" className="hover:text-market-400 transition">About</Link>
                    <Link href="/contact" className="hover:text-market-400 transition">Contact</Link>
                  </div>
                </div>

                {/* Menyu inayojifungua kwenye simu */}
                {isMenuOpen && (
                  <div className="md:hidden mt-3 pt-3 border-t border-market-50/10 flex flex-col gap-2 text-market-50/60">
                    <Link href="/terms" className="hover:text-market-400 transition" onClick={() => setIsMenuOpen(false)}>
                      Terms of Service
                    </Link>
                    <Link href="/privacy" className="hover:text-market-400 transition" onClick={() => setIsMenuOpen(false)}>
                      Privacy Policy
                    </Link>
                    <Link href="/about" className="hover:text-market-400 transition" onClick={() => setIsMenuOpen(false)}>
                      About Us
                    </Link>
                    <Link href="/contact" className="hover:text-market-400 transition" onClick={() => setIsMenuOpen(false)}>
                      Contact Us
                    </Link>
                  </div>
                )}
              </div>
            </footer>

            <BottomNav />
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}