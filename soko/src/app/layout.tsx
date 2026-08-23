import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Providers from '@/components/Providers';
import { LanguageProvider } from '@/components/LanguageProvider';

export const metadata: Metadata = {
  title: 'Soko — Find any business, any product, anywhere',
  description:
    'Soko is a marketplace platform where Tanzanian businesses open a digital storefront and customers discover products from every shop in one search.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <LanguageProvider>
            <Navbar />
            <main className="min-h-[calc(100vh-64px)]">{children}</main>
            <footer className="bg-night text-market-50/70 text-sm py-8 mt-16">
              <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between gap-2">
                <span>© {new Date().getFullYear()} Soko Marketplace.</span>
                <span>Built for businesses across Tanzania — one search, every shop.</span>
              </div>
            </footer>
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}
