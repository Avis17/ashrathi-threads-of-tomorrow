import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import { calculateComboPrice } from '@/lib/calculateComboPrice';

interface CartItemWithProduct {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  selected_size: string | null;
  selected_color: string | null;
  products: {
    id: string;
    name: string;
    image_url: string;
    price: number | null;
    product_code: string | null;
    discount_percentage: number | null;
    combo_offers: Array<{ quantity: number; price: number }> | null;
  };
}

export const useCart = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch cart items
  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (
            id,
            name,
            image_url,
            price,
            product_code,
            discount_percentage,
            combo_offers
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      return data as unknown as CartItemWithProduct[];
    },
    enabled: !!user,
  });

  // Add to cart mutation
  const addToCart = useMutation({
    mutationFn: async ({ productId, quantity, size, color }: { productId: string; quantity: number; size?: string; color?: string }) => {
      if (!user) throw new Error('User not authenticated');

      // Check if item with same variant already exists
      const { data: existing } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .eq('selected_size', size || null)
        .eq('selected_color', color || null)
        .maybeSingle();

      if (existing) {
        // Update quantity
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity,
            selected_size: size || null,
            selected_color: color || null,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
      toast({
        title: 'Added to cart',
        description: 'Item has been added to your cart',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update quantity mutation
  const updateQuantity = useMutation({
    mutationFn: async ({ cartItemId, quantity }: { cartItemId: string; quantity: number }) => {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', cartItemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Remove from cart mutation
  const removeFromCart = useMutation({
    mutationFn: async (cartItemId: string) => {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
      toast({
        title: 'Removed from cart',
        description: 'Item has been removed from your cart',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Clear cart mutation
  const clearCart = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
    },
  });

  // Calculate cart total with combo offers and discounts
  // Group items by product_id to apply combos across all variations
  const cartTotal = (() => {
    const groupedByProduct = cartItems.reduce((acc, item) => {
      const productId = item.product_id;
      if (!acc[productId]) {
        acc[productId] = {
          items: [],
          totalQuantity: 0,
          basePrice: item.products?.price || 0,
          discount: item.products?.discount_percentage || 0,
          comboOffers: item.products?.combo_offers || [],
        };
      }
      acc[productId].items.push(item);
      acc[productId].totalQuantity += item.quantity;
      return acc;
    }, {} as Record<string, any>);

    // Calculate total for all products
    return Object.values(groupedByProduct).reduce((total, group: any) => {
      const calculation = calculateComboPrice(
        group.totalQuantity,
        group.basePrice,
        group.comboOffers,
        group.discount
      );
      return total + calculation.finalPrice;
    }, 0);
  })();

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return {
    cartItems,
    isLoading,
    cartTotal,
    cartCount,
    addToCart: addToCart.mutate,
    updateQuantity: updateQuantity.mutate,
    removeFromCart: removeFromCart.mutate,
    clearCart: clearCart.mutate,
  };
};
