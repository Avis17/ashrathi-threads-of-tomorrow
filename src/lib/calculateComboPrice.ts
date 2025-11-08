interface ComboOffer {
  quantity: number;
  price: number;
}

interface PriceBreakdownItem {
  type: 'combo' | 'regular';
  quantity: number;
  price: number;
  comboDetails?: ComboOffer;
}

export interface PriceCalculation {
  finalPrice: number;
  breakdown: PriceBreakdownItem[];
  savings: number;
  originalPrice: number;
}

/**
 * Calculate the optimal price for a given quantity using combo offers
 * Uses a greedy algorithm to apply the largest beneficial combos first
 * 
 * @param quantity - Number of items to calculate price for
 * @param regularPrice - Regular price per item
 * @param comboOffers - Array of combo offers [{ quantity, price }]
 * @param discountPercentage - Optional discount percentage to apply to regular price
 * @returns PriceCalculation with final price, breakdown, and savings
 */
export function calculateComboPrice(
  quantity: number,
  regularPrice: number,
  comboOffers: ComboOffer[] | null | undefined,
  discountPercentage: number = 0
): PriceCalculation {
  // Apply discount to regular price first
  const discountedRegularPrice = discountPercentage > 0 
    ? regularPrice * (1 - discountPercentage / 100) 
    : regularPrice;

  // If no combos or quantity is 1, return regular pricing
  if (!comboOffers || comboOffers.length === 0 || quantity === 1) {
    const finalPrice = discountedRegularPrice * quantity;
    return {
      finalPrice,
      breakdown: [{
        type: 'regular',
        quantity,
        price: finalPrice,
      }],
      savings: discountPercentage > 0 ? (regularPrice - discountedRegularPrice) * quantity : 0,
      originalPrice: regularPrice * quantity,
    };
  }

  // Sort combos by quantity (descending) for greedy algorithm
  const sortedCombos = [...comboOffers].sort((a, b) => b.quantity - a.quantity);

  let remainingQuantity = quantity;
  let totalPrice = 0;
  const breakdown: PriceBreakdownItem[] = [];

  // Greedy approach: Apply largest combos first
  for (const combo of sortedCombos) {
    while (remainingQuantity >= combo.quantity) {
      // Only apply combo if it's actually cheaper than regular price
      const regularCost = discountedRegularPrice * combo.quantity;
      if (combo.price < regularCost) {
        totalPrice += combo.price;
        remainingQuantity -= combo.quantity;
        breakdown.push({
          type: 'combo',
          quantity: combo.quantity,
          price: combo.price,
          comboDetails: combo,
        });
      } else {
        // Combo isn't beneficial, skip it
        break;
      }
    }
  }

  // Add remaining pieces at regular price
  if (remainingQuantity > 0) {
    const remainingCost = discountedRegularPrice * remainingQuantity;
    totalPrice += remainingCost;
    breakdown.push({
      type: 'regular',
      quantity: remainingQuantity,
      price: remainingCost,
    });
  }

  const originalPrice = regularPrice * quantity;
  const savings = originalPrice - totalPrice;

  return {
    finalPrice: totalPrice,
    breakdown,
    savings,
    originalPrice,
  };
}
