import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { Product } from '@/hooks/useProducts';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { Skeleton } from '@/components/ui/skeleton';
import noDataImage from '@/assets/no-data.png';

export const FavoritesList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { favorites, toggleFavorite, isLoading: favoritesLoading } = useFavorites(user?.id);

  const { data: favoriteProducts = [], isLoading } = useQuery({
    queryKey: ['favorite-products', favorites],
    queryFn: async () => {
      if (favorites.length === 0) return [];
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('id', favorites)
        .eq('is_active', true);
      
      if (error) throw error;
      return data as unknown as Product[];
    },
    enabled: favorites.length > 0,
  });

  const handleAddToCart = (product: Product) => {
    addToCart({ productId: product.id, quantity: 1 });
  };

  if (isLoading || favoritesLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-64 w-full" />
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (favoriteProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 blur-3xl rounded-full" />
          <img 
            src={noDataImage} 
            alt="No favorites" 
            className="relative w-64 h-64 object-contain opacity-80"
          />
        </div>
        <div className="text-center space-y-4 max-w-md">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            Your Wishlist is Empty
          </h3>
          <p className="text-muted-foreground text-lg">
            Start adding products you love to your favorites and they'll appear here
          </p>
          <Button 
            onClick={() => navigate('/products')}
            size="lg"
            className="mt-6 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:opacity-90 shadow-lg"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Discover Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            My Wishlist
          </h2>
          <p className="text-muted-foreground">
            {favoriteProducts.length} {favoriteProducts.length === 1 ? 'item' : 'items'} you love
          </p>
        </div>
        <Sparkles className="h-8 w-8 text-pink-500 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {favoriteProducts.map((product) => {
          const discountedPrice = product.price && product.discount_percentage
            ? product.price * (1 - product.discount_percentage / 100)
            : product.price;

          return (
            <Card 
              key={product.id} 
              className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50 relative"
            >
              <div className="absolute top-3 right-3 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(product.id);
                  }}
                  className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg hover:scale-110 transition-transform"
                >
                  <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                </Button>
              </div>

              <div 
                className="h-64 bg-gradient-to-br from-muted/50 to-muted relative cursor-pointer overflow-hidden"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <Badge className="absolute top-3 left-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0">
                  {product.category}
                </Badge>
                {product.discount_percentage > 0 && (
                  <Badge className="absolute bottom-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
                    {product.discount_percentage}% OFF
                  </Badge>
                )}
              </div>

              <CardContent className="p-5 space-y-3">
                <h3 
                  className="font-semibold text-lg line-clamp-1 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  {product.name}
                </h3>
                
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center justify-between pt-2">
                  {product.price ? (
                    <div className="space-y-1">
                      {product.discount_percentage > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-primary">
                            ₹{Math.round(discountedPrice!).toLocaleString()}
                          </span>
                          <span className="text-sm text-muted-foreground line-through">
                            ₹{product.price.toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-2xl font-bold text-primary">
                          ₹{product.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">Contact for Price</span>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-md"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="hover:bg-primary/10 hover:border-primary transition-colors"
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};