import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useFavorites = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['favorites', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('user_favorites')
        .select('product_id')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data.map(f => f.product_id);
    },
    enabled: !!userId,
  });

  const addFavoriteMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!userId) throw new Error('User not authenticated');
      const { error } = await supabase
        .from('user_favorites')
        .insert({ user_id: userId, product_id: productId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', userId] });
      toast({ title: 'Added to favorites' });
    },
    onError: () => {
      toast({ title: 'Failed to add to favorites', variant: 'destructive' });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!userId) throw new Error('User not authenticated');
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', userId] });
      toast({ title: 'Removed from favorites' });
    },
    onError: () => {
      toast({ title: 'Failed to remove from favorites', variant: 'destructive' });
    },
  });

  const toggleFavorite = (productId: string) => {
    if (favorites.includes(productId)) {
      removeFavoriteMutation.mutate(productId);
    } else {
      addFavoriteMutation.mutate(productId);
    }
  };

  const isFavorite = (productId: string) => favorites.includes(productId);

  return {
    favorites,
    isLoading,
    toggleFavorite,
    isFavorite,
  };
};
