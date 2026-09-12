/**
 * Marketing display: every product shows a "was" price that is higher
 * than what the seller actually charges, making the seller's own price
 * look like a discount. The seller's entered price is NEVER changed —
 * it is always exactly what the buyer is charged, UNLESS the seller has
 * set a real discountPercent on the product (see below).
 */
export const DISCOUNT_RATE = 0.05;

export function getDisplayOriginalPrice(price: number): number {
  return Math.round(price / (1 - DISCOUNT_RATE));
}

/**
 * Real seller-controlled discount. If a product has discountPercent set,
 * this is the actual price charged to the buyer at checkout — it REPLACES
 * the synthetic 5% marketing display above (a product never shows both).
 */
export function getEffectivePrice(price: number, discountPercent?: number | null): number {
  if (!discountPercent || discountPercent <= 0) return price;
  return Math.round(price * (1 - discountPercent / 100));
}

export function hasRealDiscount(discountPercent?: number | null): boolean {
  return !!discountPercent && discountPercent > 0;
}