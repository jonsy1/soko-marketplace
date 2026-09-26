'use client';

import { SessionProvider } from 'next-auth/react';
import { CartProvider } from './CartContext';
import { UserLocationProvider } from './UserLocationContext';
import { WishlistProvider } from './WishlistContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        <UserLocationProvider>
          <WishlistProvider>{children}</WishlistProvider>
        </UserLocationProvider>
      </CartProvider>
    </SessionProvider>
  );
}