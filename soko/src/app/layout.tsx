import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Providers from '@/components/Providers';
import { LanguageProvider } from '@/components/LanguageProvider';
import RegisterSW from '@/components/RegisterSW';
import BottomNav from '@/components/BottomNav';
import PushNotifications from '@/components/PushNotifications';
import Footer from '@/components/Footer'; // ← Tutaunda hii

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
  return (
    <html lang="en">
      <body>
        <Providers>
          <LanguageProvider>
            <RegisterSW />
            <PushNotifications />
            <Navbar />
            <main className="min-h-[calc(100vh-64px)] pb-16 md:pb-0">{children}</main>
            <Footer /> {/* ← Component mpya */}
            <BottomNav />
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}