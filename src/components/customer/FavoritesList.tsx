import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { Product } from '@/hooks/useProducts';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Sparkles, PackageCheck, Shirt, Calendar, Tag, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import noDataImage from '@/assets/no-data.png';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';

const OfferMessageCycle = ({ messages }: { messages: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (messages.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="mb-3 inline-flex relative">
      {messages.map((message, index) => (
        <Badge
          key={index}
          className={`absolute whitespace-nowrap bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg transition-all duration-700 ${
            index === currentIndex 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-75'
          }`}
          style={{
            animation: index === currentIndex ? 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1)' : 'none'
          }}
        >
          🎁 Combo Offer: {message}
        </Badge>
      ))}
      {/* Invisible spacer to maintain layout */}
      <span className="invisible text-xs font-semibold px-3 py-1">
        🎁 Combo Offer: {messages[currentIndex] || messages[0]}
      </span>
    </div>
  );
};

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

  // Fetch last purchase dates for favorite products
  const { data: lastPurchases = {} } = useQuery({
    queryKey: ['last-purchases', favorites, user?.id],
    queryFn: async () => {
      if (!user?.id || favorites.length === 0) return {};
      
      const { data, error } = await supabase
        .from('order_items')
        .select('product_id, created_at, orders!inner(user_id)')
        .eq('orders.user_id', user.id)
        .in('product_id', favorites)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Create a map of product_id to last purchase date
      const purchaseMap: Record<string, string> = {};
      data.forEach((item: any) => {
        if (!purchaseMap[item.product_id]) {
          purchaseMap[item.product_id] = item.created_at;
        }
      });
      
      return purchaseMap;
    },
    enabled: !!user?.id && favorites.length > 0,
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {favoriteProducts.map((product) => {
          const discountedPrice = product.price && product.discount_percentage
            ? product.price * (1 - product.discount_percentage / 100)
            : product.price;
          
          const lastPurchaseDate = lastPurchases[product.id];
          const hasOffers = product.offer_messages && product.offer_messages.length > 0;

          return (
            <Card 
              key={product.id} 
              className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-2 hover:border-primary/50 relative bg-gradient-to-br from-card via-card to-muted/20"
            >
              {/* Animated gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              {/* Heart button */}
              <div className="absolute top-4 right-4 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(product.id);
                  }}
                  className="bg-white/95 backdrop-blur-md hover:bg-white shadow-xl hover:scale-110 transition-all duration-300 rounded-full"
                >
                  <Heart className="h-5 w-5 fill-red-500 text-red-500 animate-pulse" />
                </Button>
              </div>

              {/* Product Image */}
              <div 
                className="h-72 bg-gradient-to-br from-muted/50 to-muted relative cursor-pointer overflow-hidden"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* Category Badge */}
                <Badge className="absolute top-4 left-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white border-0 shadow-lg backdrop-blur-sm">
                  <Tag className="h-3 w-3 mr-1" />
                  {product.category}
                </Badge>
                
                {/* Discount Badge */}
                {product.discount_percentage > 0 && (
                  <Badge className="absolute bottom-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-xl backdrop-blur-sm animate-pulse">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    {product.discount_percentage}% OFF
                  </Badge>
                )}
                
                {/* Last Purchased Badge */}
                {lastPurchaseDate && (
                  <Badge className="absolute bottom-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg backdrop-blur-sm">
                    <PackageCheck className="h-3 w-3 mr-1" />
                    Purchased
                  </Badge>
                )}
              </div>

              <CardContent className="p-6 space-y-4 relative">
                {/* Offer Messages */}
                {hasOffers && (
                  <div className="mb-2">
                    <OfferMessageCycle messages={product.offer_messages} />
                  </div>
                )}

                {/* Product Name */}
                <div>
                  <h3 
                    className="font-bold text-xl line-clamp-2 cursor-pointer hover:text-primary transition-colors leading-tight mb-2"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    {product.name}
                  </h3>
                  
                  {product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  )}
                </div>

                <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />

                {/* Product Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Fabric Info */}
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200/50 dark:border-blue-800/30">
                    <Shirt className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-0.5">Fabric</p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold line-clamp-1">{product.fabric}</p>
                    </div>
                  </div>

                  {/* Last Purchase Info */}
                  {lastPurchaseDate ? (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200/50 dark:border-green-800/30">
                      <Calendar className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-green-900 dark:text-green-100 mb-0.5">Last Bought</p>
                        <p className="text-xs text-green-700 dark:text-green-300 font-semibold line-clamp-1">
                          {format(new Date(lastPurchaseDate), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200/50 dark:border-purple-800/30">
                      <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-purple-900 dark:text-purple-100 mb-0.5">Status</p>
                        <p className="text-xs text-purple-700 dark:text-purple-300 font-semibold line-clamp-1">Try it now!</p>
                      </div>
                    </div>
                  )}
                </div>

                <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />

                {/* Price Section */}
                <div className="flex items-center justify-between">
                  {product.price ? (
                    <div className="space-y-1">
                      {product.discount_percentage > 0 ? (
                        <>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                              ₹{Math.round(discountedPrice!).toLocaleString()}
                            </span>
                            <span className="text-base text-muted-foreground line-through">
                              ₹{product.price.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                            <TrendingDown className="h-3 w-3" />
                            You save ₹{(product.price - discountedPrice!).toFixed(0)}
                          </p>
                        </>
                      ) : (
                        <span className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                          ₹{product.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">Contact for Price</span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300 text-white font-semibold"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="hover:bg-primary/10 hover:border-primary transition-all duration-300 group/btn"
                  >
                    <Sparkles className="h-4 w-4 group-hover/btn:rotate-12 transition-transform" />
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