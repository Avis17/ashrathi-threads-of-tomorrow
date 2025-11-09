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
  selected_for_checkout: boolean;
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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as CartItemWithProduct[];
    },
    enabled: !!user,
  });

  // Toggle single item selection
  const toggleItemSelection = useMutation({
    mutationFn: async (itemId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      // Get current selection state
      const { data: item } = await supabase
        .from('cart_items')
        .select('selected_for_checkout')
        .eq('id', itemId)
        .single();
      
      // Toggle it
      const { error } = await supabase
        .from('cart_items')
        .update({ selected_for_checkout: !item?.selected_for_checkout })
        .eq('id', itemId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
    },
  });

  // Select/deselect all items
  const toggleAllSelection = useMutation({
    mutationFn: async (selectAll: boolean) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('cart_items')
        .update({ selected_for_checkout: selectAll })
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
    },
  });

  // Get selected items and their calculations
  const selectedCartItems = cartItems?.filter(item => item.selected_for_checkout) || [];
  
  const selectedCartTotal = (() => {
    if (!selectedCartItems.length) return 0;

    // Group selected items by product_id to apply combo offers
    const groupedByProduct = selectedCartItems.reduce((acc, item) => {
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

    // Calculate total for each product group
    let total = 0;
    Object.values(groupedByProduct).forEach((group: any) => {
      const calculation = calculateComboPrice(
        group.totalQuantity,
        group.basePrice,
        group.comboOffers,
        group.discount
      );
      total += calculation.finalPrice;
    });

    return total;
  })();

  // Add to cart mutation
  const addToCart = useMutation({
    mutationFn: async ({ productId, quantity, size, color }: { productId: string; quantity: number; size?: string; color?: string }) => {
      if (!user) throw new Error('User not authenticated');

      // Validate stock if size and color are provided
      if (size && color) {
        const { data: inventory } = await supabase
          .from('product_inventory')
          .select('available_quantity')
          .eq('product_id', productId)
          .eq('size', size)
          .eq('color', color)
          .single();
        
        if (!inventory || inventory.available_quantity < quantity) {
          throw new Error('INSUFFICIENT_STOCK');
        }
      }

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
        // Update quantity in cart
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id);

        if (error) throw error;

        // Update reserved quantity in inventory
        if (size && color) {
          const { error: invError } = await supabase.rpc('reserve_inventory', {
            p_product_id: productId,
            p_size: size,
            p_color: color,
            p_quantity: quantity
          });

          if (invError) throw invError;
        }
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

        // Reserve inventory
        if (size && color) {
          const { error: invError } = await supabase.rpc('reserve_inventory', {
            p_product_id: productId,
            p_size: size,
            p_color: color,
            p_quantity: quantity
          });

          if (invError) throw invError;
        }
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
      if (error.message === 'INSUFFICIENT_STOCK') {
        toast({
          title: 'Out of Stock',
          description: 'The selected item is no longer available in the requested quantity.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    },
  });

  // Update quantity mutation
  const updateQuantity = useMutation({
    mutationFn: async ({ cartItemId, quantity }: { cartItemId: string; quantity: number }) => {
      // Get current cart item
      const { data: cartItem } = await supabase
        .from('cart_items')
        .select('*, product_id, selected_size, selected_color')
        .eq('id', cartItemId)
        .single();

      if (!cartItem) throw new Error('Cart item not found');

      const oldQuantity = cartItem.quantity;
      const quantityDiff = quantity - oldQuantity;

      // Update cart quantity
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', cartItemId);

      if (error) throw error;

      // Update reserved quantity in inventory
      if (cartItem.selected_size && cartItem.selected_color) {
        if (quantityDiff > 0) {
          // Reserving more
          const { error: invError } = await supabase.rpc('reserve_inventory', {
            p_product_id: cartItem.product_id,
            p_size: cartItem.selected_size,
            p_color: cartItem.selected_color,
            p_quantity: quantityDiff
          });
          if (invError) throw invError;
        } else if (quantityDiff < 0) {
          // Releasing some
          const { error: invError } = await supabase.rpc('release_inventory', {
            p_product_id: cartItem.product_id,
            p_size: cartItem.selected_size,
            p_color: cartItem.selected_color,
            p_quantity: Math.abs(quantityDiff)
          });
          if (invError) throw invError;
        }
      }
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
      // Get cart item details before deleting
      const { data: cartItem } = await supabase
        .from('cart_items')
        .select('*, product_id, selected_size, selected_color')
        .eq('id', cartItemId)
        .single();

      if (!cartItem) throw new Error('Cart item not found');

      // Delete cart item
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;

      // Release reserved inventory
      if (cartItem.selected_size && cartItem.selected_color) {
        const { error: invError } = await supabase.rpc('release_inventory', {
          p_product_id: cartItem.product_id,
          p_size: cartItem.selected_size,
          p_color: cartItem.selected_color,
          p_quantity: cartItem.quantity
        });

        if (invError) throw invError;
      }
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

      // Get all cart items to release reserved inventory
      const { data: cartItems } = await supabase
        .from('cart_items')
        .select('*, product_id, selected_size, selected_color')
        .eq('user_id', user.id);

      // Release all reserved inventory
      if (cartItems) {
        for (const item of cartItems) {
          if (item.selected_size && item.selected_color) {
            await supabase.rpc('release_inventory', {
              p_product_id: item.product_id,
              p_size: item.selected_size,
              p_color: item.selected_color,
              p_quantity: item.quantity
            });
          }
        }
      }

      // Delete cart items
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

  // Clear only selected items mutation
  const clearSelectedItems = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      // Get selected items from database
      const { data: itemsToDelete } = await supabase
        .from('cart_items')
        .select('*, product_id, selected_size, selected_color')
        .eq('user_id', user.id)
        .eq('selected_for_checkout', true);
      
      if (!itemsToDelete || itemsToDelete.length === 0) return;

      // Release inventory for selected items
      for (const item of itemsToDelete) {
        if (item.selected_size && item.selected_color) {
          await supabase.rpc('release_inventory', {
            p_product_id: item.product_id,
            p_size: item.selected_size,
            p_color: item.selected_color,
            p_quantity: item.quantity
          });
        }
      }

      // Delete only selected items
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('selected_for_checkout', true);

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
    selectedCartItems,
    selectedCartTotal,
    toggleItemSelection: toggleItemSelection.mutate,
    toggleAllSelection: toggleAllSelection.mutate,
    addToCart: addToCart.mutate,
    updateQuantity: updateQuantity.mutate,
    removeFromCart: removeFromCart.mutate,
    clearCart: clearCart.mutate,
    clearSelectedItems: clearSelectedItems.mutate,
  };
};
