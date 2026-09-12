'use client';

import { SessionProvider } from 'next-auth/react';
import { CartProvider } from './CartContext';
import { UserLocationProvider } from './UserLocationContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        <UserLocationProvider>{children}</UserLocationProvider>
      </CartProvider>
    </SessionProvider>
  );
}