import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Maximize, ShoppingCart, Plus, Minus, Check, Shield, Award, Sparkles } from "lucide-react";
import ImageZoomDialog from "@/components/ImageZoomDialog";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Model showcase images
import heroModelWoman1 from "@/assets/hero-model-woman-1.jpg";
import heroModelMan1 from "@/assets/hero-model-man-1.jpg";
import heroModelKid1 from "@/assets/hero-model-kid-1.jpg";
import heroModelWoman2 from "@/assets/hero-model-woman-2.jpg";
import heroModelMan2 from "@/assets/hero-model-man-2.jpg";
import heroModelKid2 from "@/assets/hero-model-kid-2.jpg";
import heroModelWoman3 from "@/assets/hero-model-woman-3.jpg";
import heroModelMan3 from "@/assets/hero-model-man-3.jpg";
import heroModelKid3 from "@/assets/hero-model-kid-3.jpg";
import heroModelWoman4 from "@/assets/hero-model-woman-4.jpg";

// Leggings collection images
import leggingsActive from "@/assets/leggings-active-78.jpg";
import leggingsAnkle from "@/assets/leggings-ankle-length.jpg";
import leggingsCotton from "@/assets/leggings-cotton-lycra.jpg";
import leggingsStraight from "@/assets/leggings-straight-fit.jpg";

const PLACEHOLDER_IMAGE = '/placeholder.svg';

const modelShowcaseImages = [
  { src: heroModelWoman1, alt: "Women's Fashion Collection", category: "Women" },
  { src: heroModelMan1, alt: "Men's Fashion Collection", category: "Men" },
  { src: heroModelKid1, alt: "Kids' Fashion Collection", category: "Kids" },
  { src: heroModelWoman2, alt: "Women's Premium Loungewear", category: "Women" },
  { src: heroModelMan2, alt: "Men's Active Wear", category: "Men" },
  { src: heroModelKid2, alt: "Kids' Colorful Outfits", category: "Kids" },
  { src: heroModelWoman3, alt: "Women's Trendy Styles", category: "Women" },
  { src: heroModelMan3, alt: "Men's Casual Collection", category: "Men" },
  { src: heroModelKid3, alt: "Kids' Comfortable Wear", category: "Kids" },
  { src: heroModelWoman4, alt: "Women's Casual Comfort", category: "Women" },
];

const leggingsCollection = [
  { 
    src: leggingsActive, 
    alt: "High-Rise 7/8 Length Active Leggings",
    title: "High-Rise 7/8 Length Active",
    description: "Perfect for workouts, yoga & active lifestyle",
    link: "/size-chart/womens-leggings"
  },
  { 
    src: leggingsStraight, 
    alt: "Straight Fit Leggings",
    title: "Straight Fit",
    description: "Relaxed fit for ultimate comfort",
    link: "/size-chart/womens-leggings"
  },
  { 
    src: leggingsCotton, 
    alt: "Everyday Cotton Lycra Leggings",
    title: "Everyday Cotton Lycra",
    description: "Daily comfort & premium loungewear",
    link: "/size-chart/womens-leggings"
  },
  { 
    src: leggingsAnkle, 
    alt: "High-Rise Ankle Length Leggings",
    title: "High-Rise Ankle Length",
    description: "Elegant everyday wear & office casual",
    link: "/size-chart/womens-leggings"
  },
];

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
    <div className="mb-2 inline-flex relative">
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
          🎁 {message}
        </Badge>
      ))}
      <span className="invisible text-xs font-semibold px-3 py-1">
        🎁 {messages[currentIndex] || messages[0]}
      </span>
    </div>
  );
};

const Products = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [selectedTier, setSelectedTier] = useState<'elite' | 'smart_basics'>('elite');
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedVariants, setSelectedVariants] = useState<Record<string, { size?: string; color?: string }>>({});
  const [displayImages, setDisplayImages] = useState<Record<string, string>>({});
  const { data: products = [], isLoading, error, refetch } = useProducts();

  // Fetch inventory data for all products
  const productIds = products.map(p => p.id);
  const { data: inventoryData = [] } = useQuery({
    queryKey: ['products-inventory', productIds],
    queryFn: async () => {
      if (productIds.length === 0) return [];
      const { data, error } = await supabase
        .from('product_inventory')
        .select('*')
        .in('product_id', productIds)
        .gt('available_quantity', 0);
      
      if (error) throw error;
      return data || [];
    },
    enabled: productIds.length > 0,
  });

  // Helper function: Get inventory for a specific product
  const getInventoryForProduct = (productId: string) => {
    return inventoryData.filter(inv => inv.product_id === productId);
  };

  // Helper function: Get available colors based on selected size
  const getAvailableColors = (productId: string, selectedSize?: string) => {
    const inventory = getInventoryForProduct(productId);
    if (!selectedSize) {
      // Show all colors that have ANY size available
      return [...new Set(inventory.map(inv => inv.color))];
    }
    // Show only colors available for this specific size
    return inventory
      .filter(inv => inv.size === selectedSize)
      .map(inv => inv.color);
  };

  // Helper function: Get available sizes based on selected color
  const getAvailableSizes = (productId: string, selectedColor?: string) => {
    const inventory = getInventoryForProduct(productId);
    if (!selectedColor) {
      // Show all sizes that have ANY color available
      return [...new Set(inventory.map(inv => inv.size))];
    }
    // Show only sizes available for this specific color
    return inventory
      .filter(inv => inv.color === selectedColor)
      .map(inv => inv.size);
  };

  const handleQuantityChange = (productId: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + delta),
    }));
  };

  const handleSizeSelect = (productId: string, size: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], size },
    }));
  };

  const handleColorSelect = async (productId: string, color: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], color },
    }));

    // Check if color image exists, generate if missing
    const product = filteredProducts.find(p => p.id === productId);
    const colorData = product?.available_colors?.find(
      c => c.name.toLowerCase() === color.toLowerCase()
    );

    if (product && (!colorData || !colorData.image_url)) {
      setDisplayImages(prev => ({ ...prev, [productId]: product.image_url }));
      
      try {
        const { data, error } = await supabase.functions.invoke('product-color-image', {
          body: { 
            productId, 
            colorName: color, 
            colorHex: colorData?.hex 
          }
        });

        if (!error && data?.imageUrl) {
          setDisplayImages(prev => ({ ...prev, [productId]: data.imageUrl }));
          refetch();
        }
      } catch (e) {
        console.error('Failed to generate color image:', e);
        toast({
          title: "Image generation failed",
          description: "Using default image",
          variant: "destructive"
        });
      }
    }
  };

  // Update display images when color selection changes
  useEffect(() => {
    if (!products) return;
    
    const newDisplayImages: Record<string, string> = {};
    products.forEach(product => {
      const selectedColor = selectedVariants[product.id]?.color;
      if (selectedColor && product.available_colors) {
        // Case-insensitive color matching
        const colorData = product.available_colors.find(
          c => c.name.toLowerCase() === selectedColor.toLowerCase()
        );
        // Use color-specific image if available, otherwise use main product image
        newDisplayImages[product.id] = colorData?.image_url || product.image_url;
        
        // Debug log (remove after testing)
        if (selectedColor && !colorData?.image_url) {
          console.log(`No image_url for color "${selectedColor}" in product "${product.name}"`);
        }
      } else {
        // No color selected, use main product image
        newDisplayImages[product.id] = product.image_url;
      }
    });
    setDisplayImages(newDisplayImages);
  }, [selectedVariants, products]);

  const handleAddToCart = async (product: any) => {
    if (!user) {
      toast({
        title: "Please login first",
        description: "You need to be logged in to add items to cart",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    const selectedVariant = selectedVariants[product.id];
    if (product.available_sizes?.length > 0 && !selectedVariant?.size) {
      toast({
        title: "Please select a size",
        description: "Choose a size before adding to cart",
        variant: "destructive",
      });
      return;
    }
    if (product.available_colors?.length > 0 && !selectedVariant?.color) {
      toast({
        title: "Please select a color",
        description: "Choose a color before adding to cart",
        variant: "destructive",
      });
      return;
    }

    // Check inventory availability for the selected combination
    const inventory = inventoryData.find(
      inv => inv.product_id === product.id 
          && inv.size === selectedVariant?.size
          && inv.color === selectedVariant?.color
    );

    const quantity = quantities[product.id] || 1;
    
    if (!inventory || inventory.available_quantity < quantity) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${inventory?.available_quantity || 0} pieces available for this combination`,
        variant: "destructive",
      });
      return;
    }

    addToCart({
      productId: product.id,
      quantity,
      size: selectedVariant?.size,
      color: selectedVariant?.color
    });

    setQuantities((prev) => ({ ...prev, [product.id]: 1 }));
    setSelectedVariants((prev) => ({ ...prev, [product.id]: {} }));
  };

  // Filter products based on tier and category
  const filteredProducts = products.filter((product) => {
    const matchesTier = product.quality_tier === selectedTier;
    const matchesCategory = activeCategory === "All" || product.category === activeCategory;
    return matchesTier && matchesCategory;
  });

  // Get unique categories from filtered products
  const categories = ["All", ...Array.from(new Set(filteredProducts.map(p => p.category)))];

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <p className="text-center text-destructive">Failed to load products. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Trust-Building Hero Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="text-center max-w-4xl mx-auto space-y-3 md:space-y-4">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Your Trust, Our Priority
            </h1>
            <p className="text-sm md:text-base lg:text-lg text-muted-foreground leading-relaxed px-4">
              We believe in radical transparency. Choose the quality that fits your needs—no hidden compromises, just honest value.
            </p>
            <div className="flex flex-wrap justify-center gap-3 md:gap-6 pt-2 md:pt-4">
              <div className="flex items-center gap-1.5 md:gap-2">
                <Shield className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
                <span className="text-xs md:text-sm font-medium">Quality Assured</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2">
                <Award className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
                <span className="text-xs md:text-sm font-medium">Transparent Pricing</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2">
                <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
                <span className="text-xs md:text-sm font-medium">Customer First</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Model Showcase Carousel */}
      <div className="container mx-auto px-4 py-12">
        <Carousel
          opts={{ align: "start", loop: true }}
          plugins={[Autoplay({ delay: 3000 })]}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {modelShowcaseImages.map((image, index) => (
              <CarouselItem key={index} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                <Card className="overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-0 relative aspect-[3/4]">
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <Badge className="mb-2">{image.category}</Badge>
                      <p className="text-white font-semibold">{image.alt}</p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>
      </div>

      {/* Women's Leggings Collection Showcase */}
      <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-purple-950/20 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Women's Leggings Collection
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover your perfect fit from our range of premium leggings designed for every lifestyle
            </p>
          </div>
          
          <Carousel
            opts={{ align: "start", loop: true }}
            plugins={[Autoplay({ delay: 4000 })]}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {leggingsCollection.map((legging, index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <Link to={legging.link}>
                    <Card className="overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-purple-200 dark:hover:border-purple-800">
                      <CardContent className="p-0 relative">
                        <div className="aspect-[3/4] relative overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20">
                          <img
                            src={legging.src}
                            alt={legging.alt}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 md:p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                          <Badge className="mb-2 bg-gradient-to-r from-purple-500 to-pink-500 border-0">
                            Premium Leggings
                          </Badge>
                          <h3 className="text-white font-bold text-base md:text-lg mb-1">
                            {legging.title}
                          </h3>
                          <p className="text-white/90 text-xs md:text-sm">
                            {legging.description}
                          </p>
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="mt-3 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-white text-purple-600 hover:bg-purple-50"
                          >
                            View Size Chart →
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
          
          <div className="text-center mt-8">
            <Link to="/size-chart/womens-leggings">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                📏 Interactive Size Chart & Calculator
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Two-Tier Tab System */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={selectedTier} onValueChange={(value) => setSelectedTier(value as 'elite' | 'smart_basics')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-auto p-1 md:p-2 bg-muted/50 gap-1">
            <TabsTrigger 
              value="elite" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white py-2 md:py-4 px-2 md:px-6 text-left"
            >
              <div className="flex flex-col gap-0.5 md:gap-1">
                <div className="flex items-center gap-1 md:gap-2 font-bold text-sm md:text-lg">
                  <span className="text-base md:text-xl">💎</span>
                  <span className="leading-tight">Elite Collection</span>
                </div>
                <p className="text-[10px] md:text-xs opacity-80 font-normal hidden sm:block">Premium quality • Higher GSM</p>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="smart_basics"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white py-2 md:py-4 px-2 md:px-6 text-left"
            >
              <div className="flex flex-col gap-0.5 md:gap-1">
                <div className="flex items-center gap-1 md:gap-2 font-bold text-sm md:text-lg">
                  <span className="text-base md:text-xl">🌿</span>
                  <span className="leading-tight">Smart Basics</span>
                </div>
                <p className="text-[10px] md:text-xs opacity-80 font-normal hidden sm:block">Everyday comfort • Smart value</p>
              </div>
            </TabsTrigger>
          </TabsList>

          {/* Elite Collection Tab */}
          <TabsContent value="elite" className="mt-8">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg p-4 md:p-6 mb-6 md:mb-8 border border-amber-200 dark:border-amber-900">
              <h2 className="text-lg md:text-2xl font-bold mb-2 text-amber-900 dark:text-amber-100">Premium Craftsmanship, Lasting Quality</h2>
              <p className="text-sm md:text-base text-amber-800 dark:text-amber-200 mb-3 md:mb-4">
                Experience the finest fabrics with superior stitching, higher GSM for durability, and designer-level finishing.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 text-xs md:text-sm">
                <div className="flex items-center gap-1.5 md:gap-2">
                  <Check className="h-3 w-3 md:h-4 md:w-4 text-amber-600 flex-shrink-0" />
                  <span className="font-medium">Higher GSM</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <Check className="h-3 w-3 md:h-4 md:w-4 text-amber-600 flex-shrink-0" />
                  <span className="font-medium">Designer Finish</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <Check className="h-3 w-3 md:h-4 md:w-4 text-amber-600 flex-shrink-0" />
                  <span className="font-medium">Superior Stitch</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <Check className="h-3 w-3 md:h-4 md:w-4 text-amber-600 flex-shrink-0" />
                  <span className="font-medium">Durability</span>
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "outline"}
                  onClick={() => setActiveCategory(category)}
                  className="whitespace-nowrap text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 flex-shrink-0"
                  size="sm"
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-[500px]" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">No products found in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                <Card 
                  key={product.id} 
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 border-amber-200/50"
                >
                  <CardContent className="p-0">
                    <div className="relative aspect-square group">
                      <img
                        src={displayImages[product.id] || product.image_url || PLACEHOLDER_IMAGE}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImage({ 
                            src: displayImages[product.id] || product.image_url, 
                            alt: product.name 
                          });
                        }}
                      >
                        <Maximize className="h-4 w-4" />
                      </Button>
                        <Badge className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                          ✨ Premium Quality
                        </Badge>
                      </div>

                      <div className="p-4 space-y-3">
                        {product.offer_messages && product.offer_messages.length > 0 && (
                          <OfferMessageCycle messages={product.offer_messages} />
                        )}

                        <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
                        {product.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                        )}

                        {product.price && (
                          <div className="flex items-baseline gap-2">
                            {product.discount_percentage && product.discount_percentage > 0 ? (
                              <>
                                <span className="text-2xl font-bold text-amber-600">
                                  ₹{(product.price * (1 - product.discount_percentage / 100)).toFixed(2)}
                                </span>
                                <span className="text-sm text-muted-foreground line-through">₹{product.price}</span>
                                <Badge variant="destructive" className="ml-auto">{product.discount_percentage}% OFF</Badge>
                              </>
                            ) : (
                              <span className="text-2xl font-bold text-amber-600">₹{product.price}</span>
                            )}
                          </div>
                        )}

                        {/* Size Selection */}
                        {product.available_sizes && product.available_sizes.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Size</Label>
                            <RadioGroup
                              value={selectedVariants[product.id]?.size || ""}
                              onValueChange={(value) => handleSizeSelect(product.id, value)}
                              className="flex flex-wrap gap-2"
                            >
                              {product.available_sizes.map((size: string) => {
                                const availableSizes = getAvailableSizes(product.id, selectedVariants[product.id]?.color);
                                const isAvailable = availableSizes.includes(size);
                                
                                return (
                                  <div key={size} className="flex items-center">
                                    <RadioGroupItem 
                                      value={size} 
                                      id={`${product.id}-size-${size}`} 
                                      className="sr-only" 
                                      disabled={!isAvailable}
                                    />
                                    <Label
                                      htmlFor={`${product.id}-size-${size}`}
                                      className={`px-3 py-1.5 rounded-md border-2 text-sm font-medium transition-all ${
                                        !isAvailable 
                                          ? "opacity-40 cursor-not-allowed line-through border-muted-foreground/30" 
                                          : selectedVariants[product.id]?.size === size
                                          ? "border-amber-500 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 cursor-pointer"
                                          : "border-border hover:border-amber-300 cursor-pointer"
                                      }`}
                                      title={!isAvailable ? "Not available in selected color" : ""}
                                    >
                                      {size}
                                    </Label>
                                  </div>
                                );
                              })}
                            </RadioGroup>
                          </div>
                        )}

                        {/* Color Selection */}
                        {product.available_colors && product.available_colors.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Color</Label>
                            <RadioGroup
                              value={selectedVariants[product.id]?.color || ""}
                              onValueChange={(value) => handleColorSelect(product.id, value)}
                              className="flex flex-wrap gap-2"
                            >
                              {product.available_colors.map((color: { name: string; hex: string }) => {
                                const availableColors = getAvailableColors(product.id, selectedVariants[product.id]?.size);
                                const isAvailable = availableColors.includes(color.name);
                                
                                return (
                                  <div key={color.name} className="flex items-center">
                                    <RadioGroupItem 
                                      value={color.name} 
                                      id={`${product.id}-color-${color.name}`} 
                                      className="sr-only"
                                      disabled={!isAvailable}
                                    />
                                    <Label
                                      htmlFor={`${product.id}-color-${color.name}`}
                                      className={`px-3 py-1.5 rounded-md border-2 text-sm font-medium transition-all flex items-center gap-2 ${
                                        !isAvailable
                                          ? "opacity-40 cursor-not-allowed border-muted-foreground/30"
                                          : selectedVariants[product.id]?.color === color.name
                                          ? "border-amber-500 bg-amber-50 dark:bg-amber-950 cursor-pointer"
                                          : "border-border hover:border-amber-300 cursor-pointer"
                                      }`}
                                      title={!isAvailable ? "Not available in selected size" : ""}
                                    >
                                      <span
                                        className="w-4 h-4 rounded-full border border-border"
                                        style={{ backgroundColor: color.hex }}
                                      />
                                      {color.name}
                                      {!isAvailable && <span className="text-xs ml-1">✕</span>}
                                    </Label>
                                  </div>
                                );
                              })}
                            </RadioGroup>
                          </div>
                        )}

                        {/* Quantity and Add to Cart */}
                        <div className="flex items-center gap-2 pt-2">
                          <div className="flex items-center border rounded-md">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleQuantityChange(product.id, -1)}
                              disabled={quantities[product.id] === 1}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-12 text-center font-medium">{quantities[product.id] || 1}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleQuantityChange(product.id, 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button
                            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                            onClick={() => handleAddToCart(product)}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Smart Basics Tab */}
          <TabsContent value="smart_basics" className="mt-8">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-4 md:p-6 mb-6 md:mb-8 border border-green-200 dark:border-green-900">
              <h2 className="text-lg md:text-2xl font-bold mb-2 text-green-900 dark:text-green-100">Everyday Comfort, Smart Value</h2>
              <p className="text-sm md:text-base text-green-800 dark:text-green-200 mb-3 md:mb-4">
                Quality fabrics at economical prices, perfect for daily wear. Smart choices without compromising comfort.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 text-xs md:text-sm">
                <div className="flex items-center gap-1.5 md:gap-2">
                  <Check className="h-3 w-3 md:h-4 md:w-4 text-green-600 flex-shrink-0" />
                  <span className="font-medium">Economical</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <Check className="h-3 w-3 md:h-4 md:w-4 text-green-600 flex-shrink-0" />
                  <span className="font-medium">Comfortable</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <Check className="h-3 w-3 md:h-4 md:w-4 text-green-600 flex-shrink-0" />
                  <span className="font-medium">Daily Wear</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <Check className="h-3 w-3 md:h-4 md:w-4 text-green-600 flex-shrink-0" />
                  <span className="font-medium">Great Value</span>
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "outline"}
                  onClick={() => setActiveCategory(category)}
                  className="whitespace-nowrap text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 flex-shrink-0"
                  size="sm"
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-[500px]" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">No products found in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                <Card 
                  key={product.id} 
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 border-green-200/50"
                >
                  <CardContent className="p-0">
                    <div className="relative aspect-square group">
                      <img
                        src={displayImages[product.id] || product.image_url || PLACEHOLDER_IMAGE}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImage({ src: displayImages[product.id] || product.image_url, alt: product.name });
                        }}
                      >
                        <Maximize className="h-4 w-4" />
                      </Button>
                        <Badge className="absolute top-2 left-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                          💚 Smart Value
                        </Badge>
                      </div>

                      <div className="p-4 space-y-3">
                        {product.offer_messages && product.offer_messages.length > 0 && (
                          <OfferMessageCycle messages={product.offer_messages} />
                        )}

                        <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
                        {product.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                        )}

                        {product.price && (
                          <div className="flex items-baseline gap-2">
                            {product.discount_percentage && product.discount_percentage > 0 ? (
                              <>
                                <span className="text-2xl font-bold text-green-600">
                                  ₹{(product.price * (1 - product.discount_percentage / 100)).toFixed(2)}
                                </span>
                                <span className="text-sm text-muted-foreground line-through">₹{product.price}</span>
                                <Badge variant="destructive" className="ml-auto">{product.discount_percentage}% OFF</Badge>
                              </>
                            ) : (
                              <span className="text-2xl font-bold text-green-600">₹{product.price}</span>
                            )}
                          </div>
                        )}

                        {/* Size Selection */}
                        {product.available_sizes && product.available_sizes.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Size</Label>
                            <RadioGroup
                              value={selectedVariants[product.id]?.size || ""}
                              onValueChange={(value) => handleSizeSelect(product.id, value)}
                              className="flex flex-wrap gap-2"
                            >
                              {product.available_sizes.map((size: string) => {
                                const availableSizes = getAvailableSizes(product.id, selectedVariants[product.id]?.color);
                                const isAvailable = availableSizes.includes(size);
                                
                                return (
                                  <div key={size} className="flex items-center">
                                    <RadioGroupItem 
                                      value={size} 
                                      id={`${product.id}-size-${size}`} 
                                      className="sr-only"
                                      disabled={!isAvailable}
                                    />
                                    <Label
                                      htmlFor={`${product.id}-size-${size}`}
                                      className={`px-3 py-1.5 rounded-md border-2 text-sm font-medium transition-all ${
                                        !isAvailable
                                          ? "opacity-40 cursor-not-allowed line-through border-muted-foreground/30"
                                          : selectedVariants[product.id]?.size === size
                                          ? "border-green-500 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 cursor-pointer"
                                          : "border-border hover:border-green-300 cursor-pointer"
                                      }`}
                                      title={!isAvailable ? "Not available in selected color" : ""}
                                    >
                                      {size}
                                    </Label>
                                  </div>
                                );
                              })}
                            </RadioGroup>
                          </div>
                        )}

                        {/* Color Selection */}
                        {product.available_colors && product.available_colors.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Color</Label>
                            <RadioGroup
                              value={selectedVariants[product.id]?.color || ""}
                              onValueChange={(value) => handleColorSelect(product.id, value)}
                              className="flex flex-wrap gap-2"
                            >
                              {product.available_colors.map((color: { name: string; hex: string }) => {
                                const availableColors = getAvailableColors(product.id, selectedVariants[product.id]?.size);
                                const isAvailable = availableColors.includes(color.name);
                                
                                return (
                                  <div key={color.name} className="flex items-center">
                                    <RadioGroupItem 
                                      value={color.name} 
                                      id={`${product.id}-color-${color.name}`} 
                                      className="sr-only"
                                      disabled={!isAvailable}
                                    />
                                    <Label
                                      htmlFor={`${product.id}-color-${color.name}`}
                                      className={`px-3 py-1.5 rounded-md border-2 text-sm font-medium transition-all flex items-center gap-2 ${
                                        !isAvailable
                                          ? "opacity-40 cursor-not-allowed border-muted-foreground/30"
                                          : selectedVariants[product.id]?.color === color.name
                                          ? "border-green-500 bg-green-50 dark:bg-green-950 cursor-pointer"
                                          : "border-border hover:border-green-300 cursor-pointer"
                                      }`}
                                      title={!isAvailable ? "Not available in selected size" : ""}
                                    >
                                      <span
                                        className="w-4 h-4 rounded-full border border-border"
                                        style={{ backgroundColor: color.hex }}
                                      />
                                      {color.name}
                                      {!isAvailable && <span className="text-xs ml-1">✕</span>}
                                    </Label>
                                  </div>
                                );
                              })}
                            </RadioGroup>
                          </div>
                        )}

                        {/* Quantity and Add to Cart */}
                        <div className="flex items-center gap-2 pt-2">
                          <div className="flex items-center border rounded-md">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleQuantityChange(product.id, -1)}
                              disabled={quantities[product.id] === 1}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-12 text-center font-medium">{quantities[product.id] || 1}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleQuantityChange(product.id, 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button
                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                            onClick={() => handleAddToCart(product)}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Trust Promise Section */}
      <div className="bg-muted/30 py-12 mt-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold">Our Quality Promise</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Unlike others, we don't sell low-quality products at premium prices. Our transparent tier system lets you choose what matters to you. 
              Whether you choose Elite Collection for premium durability or Smart Basics for everyday value, you always know exactly what you're getting.
            </p>
            <div className="pt-4">
              <p className="text-sm text-muted-foreground italic">
                "No deception. No false promises. Just honest quality at honest prices."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Manufacturing CTA */}
      <div className="container mx-auto px-4 py-12">
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-2">Need Custom Manufacturing?</h3>
            <p className="text-muted-foreground mb-4">
              Bulk orders, custom designs, or special requirements? We're here to help!
            </p>
            <Button asChild size="lg">
              <Link to="/contact">Contact Us Today</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <ImageZoomDialog
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageSrc={selectedImage?.src || ""}
        imageAlt={selectedImage?.alt || ""}
      />
    </div>
  );
};

export default Products;
