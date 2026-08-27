'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  maxQuantity: number;
  businessId: string;
  businessName: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  count: number;
  ready: boolean;
};

const CartContext = createContext<CartContextType | null>(null);
const STORAGE_KEY = 'soko_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, ready]);

  function addItem(item: Omit<CartItem, 'quantity'>, qty = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        const newQty = Math.min(existing.quantity + qty, item.maxQuantity);
        return prev.map((i) => (i.productId === item.productId ? { ...i, quantity: newQty } : i));
      }
      return [...prev, { ...item, quantity: Math.min(qty, item.maxQuantity) }];
    });
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  function updateQuantity(productId: string, qty: number) {
    if (qty < 1) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity: Math.min(qty, i.maxQuantity) } : i))
    );
  }

  function clearCart() {
    setItems([]);
  }

  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, count, ready }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}