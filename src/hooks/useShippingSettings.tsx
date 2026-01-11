import { useQuery } from '@tanstack/react-query';

export interface ShippingZone {
  id: string;
  zone_name: string;
  states: string[];
  base_rate: number;
  per_kg_rate: number;
  is_active: boolean;
}

export interface ShippingSettings {
  config: {
    minOrderValue: number;
    minItemsForFreeDelivery: number;
  };
  zones: Array<{
    name: string;
    states: string[];
    charge: number;
  }>;
}

export const useShippingSettings = () => {
  return useQuery({
    queryKey: ['shipping-settings'],
    queryFn: async (): Promise<ShippingSettings | null> => {
      // Return null since shipping is not used in B2B
      return null;
    },
  });
};
