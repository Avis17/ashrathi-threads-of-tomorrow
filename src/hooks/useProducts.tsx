import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  category: string;
  fabric: string;
  description: string | null;
  image_url: string;
  additional_images: string[];
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  price: number | null;
  quality_tier: 'elite' | 'smart_basics';
  available_sizes: string[];
  available_colors: Array<{ name: string; hex: string; image_url?: string }>;
  discount_percentage: number | null;
  offer_messages: string[];
  combo_offers: Array<{ quantity: number; price: number }>;
}

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('should_remove', false)
        .order('display_order', { ascending: true });

      if (error) throw error;

      // Normalize JSON fields to ensure proper types
      return (data || []).map((row: any) => ({
        ...row,
        additional_images: Array.isArray(row.additional_images) ? row.additional_images : [],
        available_sizes: Array.isArray(row.available_sizes) ? row.available_sizes : [],
        available_colors: Array.isArray(row.available_colors) ? row.available_colors : [],
        offer_messages: Array.isArray(row.offer_messages) ? row.offer_messages : [],
        combo_offers: Array.isArray(row.combo_offers) ? row.combo_offers : [],
      })) as Product[];
    },
  });
};
