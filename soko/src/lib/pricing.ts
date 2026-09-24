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

/**
 * Profit calculation for a single order item.
 * Returns null if costPrice was not recorded at time of sale —
 * callers must show "unavailable" rather than treating null as 0.
 */
export function calculateItemProfit(item: {
  price: number;
  costPrice?: number | null;
  quantity: number;
}): number | null {
  if (item.costPrice === null || item.costPrice === undefined) return null;
  return (item.price - item.costPrice) * item.quantity;
}

/**
 * Profit calculation across a list of order items (e.g. one order, or
 * every item across many orders for a dashboard period).
 *
 * hasFullCostData is false if ANY item is missing costPrice — in that
 * case `profit` is still the sum of the items that DO have cost data,
 * so callers should label it "Estimated profit" rather than "Profit".
 */
export function calculateOrdersProfit(
  items: { price: number; costPrice?: number | null; quantity: number }[]
): { profit: number; hasFullCostData: boolean; itemsMissingCost: number } {
  let profit = 0;
  let itemsMissingCost = 0;

  for (const item of items) {
    const itemProfit = calculateItemProfit(item);
    if (itemProfit === null) {
      itemsMissingCost++;
    } else {
      profit += itemProfit;
    }
  }

  return {
    profit,
    hasFullCostData: itemsMissingCost === 0,
    itemsMissingCost,
  };
}

/**
 * Human-readable order number, e.g. orderNumber 10024 -> "#SK-10024"
 */
export function formatOrderNumber(orderNumber: number): string {
  return `#SK-${orderNumber.toString().padStart(5, '0')}`;
}