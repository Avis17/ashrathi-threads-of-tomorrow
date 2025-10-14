import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from './useProducts';

export const useNewArrivals = () => {
  return useQuery({
    queryKey: ['newArrivals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('is_new_arrival', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as Product[];
    },
  });
};

export const useSignatureProducts = () => {
  return useQuery({
    queryKey: ['signatureProducts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('is_signature', true)
        .order('display_order', { ascending: true })
        .limit(4);

      if (error) throw error;
      return data as unknown as Product[];
    },
  });
};
