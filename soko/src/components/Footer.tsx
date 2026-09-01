'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <footer className="bg-night text-market-50/70 text-sm py-8 mt-16 border-t border-market-50/10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between">
          <span>© {new Date().getFullYear()} Soko Marketplace.</span>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden flex flex-col gap-1.5 p-1.5 hover:bg-white/5 rounded-lg transition"
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-market-50/70 transition ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-market-50/70 transition ${isMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-market-50/70 transition ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>

          <div className="hidden md:flex gap-6 text-market-50/60">
            <Link href="/terms" className="hover:text-market-400 transition">Terms</Link>
            <Link href="/privacy" className="hover:text-market-400 transition">Privacy</Link>
            <Link href="/about" className="hover:text-market-400 transition">About</Link>
            <Link href="/contact" className="hover:text-market-400 transition">Contact</Link>
          </div>
        </div>

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
  );
}