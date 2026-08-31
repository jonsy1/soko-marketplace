/**
 * Launch promotion: every product on Soko is shown with a 20% discount.
 * The seller's entered price is never changed in the database — this
 * only affects what buyers see and what they're actually charged.
 * To end the promotion later, just set DISCOUNT_RATE to 0.
 */
export const DISCOUNT_RATE = 0.2;

export function getDiscountedPrice(price: number): number {
  return Math.round(price * (1 - DISCOUNT_RATE));
}