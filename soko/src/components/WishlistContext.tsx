'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

type WishlistContextType = {
  wishlistIds: Set<string>;
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  ready: boolean;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user) {
      setWishlistIds(new Set());
      setReady(true);
      return;
    }
    fetch('/api/wishlist')
      .then((r) => r.json())
      .then((items) => {
        if (Array.isArray(items)) {
          setWishlistIds(new Set(items.map((i: any) => i.product.id)));
        }
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, [session, status]);

  const isWishlisted = useCallback((productId: string) => wishlistIds.has(productId), [wishlistIds]);

  const toggleWishlist = useCallback(
    async (productId: string) => {
      if (!session?.user) return;
      const currentlyIn = wishlistIds.has(productId);

      // Optimistic update - update the UI immediately, before the request resolves.
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (currentlyIn) next.delete(productId);
        else next.add(productId);
        return next;
      });

      try {
        if (currentlyIn) {
          await fetch(`/api/wishlist?productId=${productId}`, { method: 'DELETE' });
        } else {
          await fetch('/api/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId }),
          });
        }
      } catch {
        // Revert on failure.
        setWishlistIds((prev) => {
          const next = new Set(prev);
          if (currentlyIn) next.add(productId);
          else next.delete(productId);
          return next;
        });
      }
    },
    [session, wishlistIds]
  );

  return (
    <WishlistContext.Provider value={{ wishlistIds, isWishlisted, toggleWishlist, ready }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}