/**
 * Marketing display: every product shows a "was" price that is higher
 * than what the seller actually charges, making the seller's own price
 * look like a discount. The seller's entered price is NEVER changed —
 * it is always exactly what the buyer is charged.
 */
export const DISCOUNT_RATE = 0.05;

export function getDisplayOriginalPrice(price: number): number {
  return Math.round(price / (1 - DISCOUNT_RATE));
}