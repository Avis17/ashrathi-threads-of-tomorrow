import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ShippingZone } from '@/lib/shippingConstants';

interface ShippingSettings {
  zoneCharges: Record<ShippingZone, number>;
  config: {
    minOrderValue: number;
    minItemsForFreeDelivery: number;
  };
  zones: Array<{
    name: ShippingZone;
    states: string[];
    charge: number;
  }>;
}

export const useShippingSettings = () => {
  return useQuery<ShippingSettings>({
    queryKey: ['shipping-settings'],
    queryFn: async () => {
      // Fetch shipping zones
      const { data: zonesData, error: zonesError } = await supabase
        .from('shipping_settings')
        .select('*')
        .order('zone_name');

      if (zonesError) throw zonesError;

      // Fetch shipping config
      const { data: configData, error: configError } = await supabase
        .from('shipping_config')
        .select('*')
        .single();

      if (configError) throw configError;

      // Transform data
      const zoneCharges: Record<ShippingZone, number> = {} as Record<ShippingZone, number>;
      const zones: Array<{ name: ShippingZone; states: string[]; charge: number }> = [];

      zonesData?.forEach((zone: any) => {
        const zoneName = zone.zone_name as ShippingZone;
        zoneCharges[zoneName] = zone.charge_amount;
        zones.push({
          name: zoneName,
          states: zone.states,
          charge: zone.charge_amount,
        });
      });

      return {
        zoneCharges,
        config: {
          minOrderValue: configData.min_order_value,
          minItemsForFreeDelivery: configData.min_items_for_free_delivery,
        },
        zones,
      };
    },
  });
};
