import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/hooks/useProducts';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Heart, Minus, Plus, ShoppingCart, ZoomIn, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ImageZoomDialog from '@/components/ImageZoomDialog';
import { Skeleton } from '@/components/ui/skeleton';

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
    <div className="mb-4 inline-flex relative">
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

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { toggleFavorite, isFavorite } = useFavorites(user?.id);

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string>('');

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data as unknown as Product;
    },
  });

  const { data: inventoryData } = useQuery({
    queryKey: ['product-inventory', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_inventory')
        .select('*')
        .eq('product_id', id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const [stockStatus, setStockStatus] = useState<{
    available: boolean;
    quantity: number;
    message: string;
  }>({ available: true, quantity: 0, message: '' });

  // Set initial image when product loads
  useEffect(() => {
    if (product?.image_url) {
      setCurrentImage(product.image_url);
    }
  }, [product?.image_url]);

  // Update displayed image when color is selected
  useEffect(() => {
    if (selectedColor && product?.available_colors) {
      const colorData = product.available_colors.find(c => c.name === selectedColor);
      if (colorData?.image_url) {
        setCurrentImage(colorData.image_url);
      } else {
        setCurrentImage(product.image_url);
      }
    } else if (product?.image_url) {
      setCurrentImage(product.image_url);
    }
  }, [selectedColor, product]);

  // Update stock status when size/color changes
  useEffect(() => {
    if (!selectedSize || !selectedColor || !inventoryData) {
      setStockStatus({ available: true, quantity: 0, message: '' });
      return;
    }

    const inventory = inventoryData.find(
      inv => inv.size === selectedSize && inv.color === selectedColor
    );

    if (!inventory || inventory.available_quantity === 0) {
      setStockStatus({
        available: false,
        quantity: 0,
        message: "🔴 Currently out of stock. We'll restock soon!"
      });
    } else if (inventory.available_quantity < 10) {
      setStockStatus({
        available: true,
        quantity: inventory.available_quantity,
        message: `⚠️ Only ${inventory.available_quantity} left in stock!`
      });
    } else {
      setStockStatus({
        available: true,
        quantity: inventory.available_quantity,
        message: `✅ In stock (${inventory.available_quantity} available)`
      });
    }
  }, [selectedSize, selectedColor, inventoryData]);

  const { data: similarProducts = [] } = useQuery({
    queryKey: ['similar-products', product?.category],
    queryFn: async () => {
      if (!product?.category) return [];
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', product.category)
        .eq('is_active', true)
        .neq('id', id)
        .limit(8);
      
      if (error) throw error;
      return data as unknown as Product[];
    },
    enabled: !!product?.category,
  });

  const handleAddToCart = () => {
    if (!user) {
      toast({ title: 'Please login to add items to cart', variant: 'destructive' });
      return;
    }
    if (!product) return;

    if (product.available_sizes.length > 0 && !selectedSize) {
      toast({ title: 'Please select a size', variant: 'destructive' });
      return;
    }
    if (product.available_colors.length > 0 && !selectedColor) {
      toast({ title: 'Please select a color', variant: 'destructive' });
      return;
    }

    if (!stockStatus.available) {
      toast({ 
        title: 'Out of Stock', 
        description: 'This combination is currently unavailable. Please select a different size or color.',
        variant: 'destructive' 
      });
      return;
    }

    if (quantity > stockStatus.quantity) {
      toast({ 
        title: 'Insufficient Stock', 
        description: `Only ${stockStatus.quantity} pieces available for this combination.`,
        variant: 'destructive' 
      });
      return;
    }

    addToCart({
      productId: product.id,
      quantity,
      size: selectedSize,
      color: selectedColor
    });
  };

  const handleFavoriteToggle = () => {
    if (!user) {
      toast({ title: 'Please login to add favorites', variant: 'destructive' });
      return;
    }
    if (product) {
      toggleFavorite(product.id);
    }
  };

  // Build display images based on selected color
  const allImages = product 
    ? [currentImage, product.image_url, ...product.additional_images]
        .filter(Boolean)
        .filter((img, index, self) => self.indexOf(img) === index) // Remove duplicates
    : [];
  const discountedPrice = product?.price && product?.discount_percentage 
    ? product.price * (1 - product.discount_percentage / 100)
    : product?.price;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-96 w-full mb-6" />
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Button onClick={() => navigate('/products')}>Back to Products</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/5">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Image Carousel */}
          <Card className="p-6 backdrop-blur-sm bg-card/50">
            <Carousel className="w-full">
              <CarouselContent>
                {allImages.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="relative aspect-square rounded-lg overflow-hidden group">
                      <img
                        src={image}
                        alt={`${product.name} - ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <button
                        onClick={() => setZoomImage(image)}
                        className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                      >
                        <ZoomIn className="h-5 w-5" />
                      </button>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {allImages.length > 1 && (
                <>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </>
              )}
            </Carousel>
          </Card>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold">{product.name}</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleFavoriteToggle}
                  className="hover:scale-110 transition-transform"
                >
                  <Heart className={`h-6 w-6 ${isFavorite(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
              </div>

              {product.offer_messages && product.offer_messages.length > 0 && (
                <OfferMessageCycle messages={product.offer_messages} />
              )}
            </div>

            {/* Price */}
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              {product.price && (
                <div className="space-y-2">
                  {product.discount_percentage > 0 ? (
                    <>
                      <div className="flex items-baseline gap-3">
                        <span className="text-4xl font-bold text-primary">
                          ₹{discountedPrice?.toFixed(2)}
                        </span>
                        <span className="text-xl text-muted-foreground line-through">
                          ₹{product.price.toFixed(2)}
                        </span>
                      </div>
                      <Badge variant="destructive" className="text-sm">
                        {product.discount_percentage}% OFF
                      </Badge>
                      <p className="text-sm text-green-600 font-medium">
                        You save ₹{(product.price - (discountedPrice || 0)).toFixed(2)}
                      </p>
                    </>
                  ) : (
                    <span className="text-4xl font-bold text-primary">
                      ₹{product.price.toFixed(2)}
                    </span>
                  )}
                </div>
              )}
            </Card>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Size Selection */}
            {product.available_sizes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Select Size</h3>
                <div className="flex flex-wrap gap-2">
                  {product.available_sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? 'default' : 'outline'}
                      onClick={() => setSelectedSize(size)}
                      className="min-w-[60px]"
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.available_colors.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Select Color</h3>
                <div className="flex flex-wrap gap-3">
                  {product.available_colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`relative flex flex-col items-center gap-2 p-2 rounded-lg border-2 transition-all hover:scale-105 ${
                        selectedColor === color.name ? 'border-primary shadow-lg' : 'border-border'
                      }`}
                    >
                      <div
                        className="w-10 h-10 rounded-full border-2 border-border"
                        style={{ backgroundColor: color.hex }}
                      />
                      {color.image_url && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full overflow-hidden border-2 border-background shadow-sm">
                          <img src={color.image_url} alt={color.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <span className="text-xs font-medium">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Status */}
            {selectedSize && selectedColor && (
              <div className={`p-3 rounded-lg border ${
                stockStatus.available 
                  ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900'
                  : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900'
              }`}>
                <p className={`text-sm font-medium ${
                  stockStatus.available ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                }`}>
                  {stockStatus.message}
                </p>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={!stockStatus.available || (stockStatus.quantity > 0 && quantity >= stockStatus.quantity)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Add to Cart */}
            <Button
              onClick={handleAddToCart}
              className="w-full py-6 text-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Similar Products</h2>
            <div className="relative">
              <style>{`
                @keyframes scroll {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(-50%); }
                }
                .animate-scroll {
                  animation: scroll 30s linear infinite;
                }
                .animate-scroll:hover {
                  animation-play-state: paused;
                }
              `}</style>
              <div className="overflow-hidden">
                <div className="flex gap-4 animate-scroll">
                  {[...similarProducts, ...similarProducts].map((similar, index) => {
                    const similarDiscountedPrice = similar.price && similar.discount_percentage
                      ? similar.price * (1 - similar.discount_percentage / 100)
                      : similar.price;
                    
                    return (
                      <Card
                        key={`${similar.id}-${index}`}
                        className="flex-shrink-0 w-64 overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105"
                        onClick={() => navigate(`/product/${similar.id}`)}
                      >
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={similar.image_url}
                            alt={similar.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold line-clamp-1 mb-2">{similar.name}</h3>
                          {similar.price && (
                            <div className="space-y-1">
                              {similar.discount_percentage > 0 ? (
                                <>
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold text-primary">
                                      ₹{similarDiscountedPrice?.toFixed(2)}
                                    </span>
                                    <span className="text-sm text-muted-foreground line-through">
                                      ₹{similar.price.toFixed(2)}
                                    </span>
                                  </div>
                                  <Badge variant="destructive" className="text-xs">
                                    {similar.discount_percentage}% OFF
                                  </Badge>
                                </>
                              ) : (
                                <span className="text-lg font-bold text-primary">
                                  ₹{similar.price.toFixed(2)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ImageZoomDialog
        imageSrc={zoomImage || ''}
        imageAlt={product.name}
        isOpen={!!zoomImage}
        onClose={() => setZoomImage(null)}
      />
    </div>
  );
}
