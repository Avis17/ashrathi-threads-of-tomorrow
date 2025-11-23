import { STATE_CODE_MAP, ShippingZone } from './shippingConstants';

interface DeliveryChargeParams {
  state: string;
  orderAmount: number;
  itemCount: number;
  zoneCharges: Record<ShippingZone, number>;
  config: { minOrderValue: number; minItemsForFreeDelivery: number };
}

interface DeliveryChargeResult {
  charge: number;
  isFree: boolean;
  reason?: string;
  zone?: ShippingZone;
}

export function calculateDeliveryCharge(params: DeliveryChargeParams): DeliveryChargeResult {
  const { state, orderAmount, itemCount, zoneCharges, config } = params;

  // Check if order qualifies for free delivery
  if (orderAmount >= config.minOrderValue) {
    return {
      charge: 0,
      isFree: true,
      reason: `Order ≥ ₹${config.minOrderValue}`,
    };
  }

  if (itemCount >= config.minItemsForFreeDelivery) {
    return {
      charge: 0,
      isFree: true,
      reason: `${itemCount} items`,
    };
  }

  // Get state code
  const stateCode = STATE_CODE_MAP[state];
  if (!stateCode) {
    // Fallback to highest zone if state not found
    return {
      charge: zoneCharges.ZONE_D,
      isFree: false,
      zone: 'ZONE_D',
    };
  }

  // Determine zone based on state code
  let zone: ShippingZone = 'ZONE_D'; // Default to highest charge
  
  if (['TN', 'PY'].includes(stateCode)) {
    zone = 'LOCAL';
  } else if (['KA', 'KL', 'AP', 'TS'].includes(stateCode)) {
    zone = 'ZONE_A';
  } else if (['MH', 'DL', 'WB', 'GJ'].includes(stateCode)) {
    zone = 'ZONE_B';
  } else if (['RJ', 'UP', 'HR', 'PB', 'MP', 'CG', 'BR', 'OR', 'JK', 'HP', 'UK'].includes(stateCode)) {
    zone = 'ZONE_C';
  } else if (['AS', 'AR', 'MN', 'ML', 'MZ', 'NL', 'SK', 'TR', 'AN', 'LD'].includes(stateCode)) {
    zone = 'ZONE_D';
  }

  return {
    charge: zoneCharges[zone],
    isFree: false,
    zone,
  };
}
